-- Supabase Migration: ERP Foundation
-- Core operational tables for running the hostel (Rooms, Beds, Tenants, Fees).

create type public.room_type as enum ('ac', 'non_ac');
create type public.bed_status as enum ('available', 'occupied', 'maintenance');
create type public.tenant_status as enum ('active', 'past', 'evicted');
create type public.fee_status as enum ('pending', 'paid', 'overdue', 'cancelled');

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_branch_id uuid not null references public.hostel_branches(id) on delete restrict,
  room_number text not null,
  floor_number integer not null default 1,
  room_type public.room_type not null default 'non_ac',
  capacity integer not null check (capacity > 0),
  base_price numeric(10, 2) not null check (base_price >= 0),
  notes text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  
  constraint rooms_branch_number_unique unique (hostel_branch_id, room_number)
);

create index if not exists rooms_branch_idx on public.rooms (hostel_branch_id) where deleted_at is null;

-- Trigger for updated_at
create trigger set_rooms_updated_at
  before update on public.rooms
  for each row
  execute function private.set_updated_at();

-- Beds
create table if not exists public.beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  bed_identifier text not null, -- e.g., "A", "B", "1", "2"
  status public.bed_status not null default 'available',
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  
  constraint beds_room_identifier_unique unique (room_id, bed_identifier)
);

create index if not exists beds_room_idx on public.beds (room_id) where deleted_at is null;

create trigger set_beds_updated_at
  before update on public.beds
  for each row
  execute function private.set_updated_at();

-- Tenants (Students/Professionals staying in the hostel)
-- A tenant is a profile in user_profiles, but this table tracks their stay specifics
create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete restrict,
  bed_id uuid references public.beds(id) on delete restrict,
  
  status public.tenant_status not null default 'active',
  check_in_date date not null default current_date,
  check_out_date date,
  agreed_monthly_rent numeric(10, 2) not null check (agreed_monthly_rent >= 0),
  security_deposit numeric(10, 2) not null default 0,
  
  emergency_contact_name text,
  emergency_contact_phone text,
  id_proof_url text, -- link to storage
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists stays_user_idx on public.stays (user_id) where deleted_at is null;
create index if not exists stays_bed_idx on public.stays (bed_id) where deleted_at is null and status = 'active';

create trigger set_stays_updated_at
  before update on public.stays
  for each row
  execute function private.set_updated_at();

-- Fee Payments
create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references public.stays(id) on delete restrict,
  
  amount numeric(10, 2) not null check (amount > 0),
  due_date date not null,
  paid_date date,
  status public.fee_status not null default 'pending',
  payment_method text, -- e.g., 'cash', 'upi', 'bank_transfer'
  transaction_id text,
  receipt_url text,
  
  month_for text not null, -- e.g., '2026-05'
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists fee_payments_stay_idx on public.fee_payments (stay_id) where deleted_at is null;
create index if not exists fee_payments_status_idx on public.fee_payments (status) where deleted_at is null;

create trigger set_fee_payments_updated_at
  before update on public.fee_payments
  for each row
  execute function private.set_updated_at();

-- RLS Policies (Base rules: Admins have full access to their branch's operational data. Students can read their own stays/fees.)

alter table public.rooms enable row level security;
alter table public.beds enable row level security;
alter table public.stays enable row level security;
alter table public.fee_payments enable row level security;

-- (Simplified Policies for MVP. In production, these join through hostel_branch_id / organization_id)
create policy "Admins can manage rooms"
  on public.rooms to authenticated
  using ( (select private.current_user_role()) in ('superadmin', 'admin') );

create policy "Admins can manage beds"
  on public.beds to authenticated
  using ( (select private.current_user_role()) in ('superadmin', 'admin') );

create policy "Admins can manage stays"
  on public.stays to authenticated
  using ( (select private.current_user_role()) in ('superadmin', 'admin') );
  
create policy "Students can view their own stays"
  on public.stays for select to authenticated
  using ( user_id = auth.uid() );

create policy "Admins can manage fee_payments"
  on public.fee_payments to authenticated
  using ( (select private.current_user_role()) in ('superadmin', 'admin') );

create policy "Students can view their own fee_payments"
  on public.fee_payments for select to authenticated
  using ( stay_id in (select id from public.stays where user_id = auth.uid()) );
