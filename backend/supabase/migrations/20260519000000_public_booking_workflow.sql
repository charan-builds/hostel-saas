-- Public booking workflow foundation.
-- Public visitors never receive direct table grants. Server-side route handlers
-- write through the service role after validation, while tenant admins use RLS.

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  booking_code text not null default (
    'BK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  room_id uuid,
  room_template_id uuid,
  room_category_id uuid,
  room_type text,
  requested_bed_count integer not null default 1 check (requested_bed_count between 1 and 20),
  first_name text not null check (char_length(trim(first_name)) between 1 and 80),
  last_name text not null check (char_length(trim(last_name)) between 1 and 80),
  email extensions.citext,
  phone text not null check (char_length(trim(phone)) between 8 and 32),
  guardian_name text,
  guardian_phone text,
  move_in_date date,
  expected_stay_months integer check (expected_stay_months is null or expected_stay_months between 1 and 120),
  message text,
  source text not null default 'public_website' check (char_length(trim(source)) between 2 and 80),
  status text not null default 'pending' check (
    status in ('pending', 'contacted', 'approved', 'rejected', 'expired', 'converted', 'cancelled')
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  advance_required boolean not null default false,
  advance_amount_cents bigint not null default 0 check (advance_amount_cents >= 0),
  advance_currency_code text not null default 'INR' check (advance_currency_code ~ '^[A-Z]{3}$'),
  advance_refundable boolean not null default true,
  cashfree_order_id text,
  cashfree_payment_session_id text,
  converted_student_id uuid,
  assigned_to uuid references public.user_profiles(id) on delete set null,
  last_contacted_at timestamptz,
  expires_at timestamptz,
  public_access_token_hash text not null,
  public_access_expires_at timestamptz not null default (now() + interval '14 days'),
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint booking_requests_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint booking_requests_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint booking_requests_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint booking_requests_room_template_fk
    foreign key (room_template_id, organization_id, hostel_branch_id)
    references public.room_templates (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint booking_requests_room_category_fk
    foreign key (room_category_id, organization_id, hostel_branch_id)
    references public.room_categories (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint booking_requests_converted_student_fk
    foreign key (converted_student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint booking_requests_email_format check (
    email is null
    or email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ),
  constraint booking_requests_advance_consistency check (
    advance_required = false or advance_amount_cents > 0
  )
);

create unique index if not exists booking_requests_org_branch_code_unique
  on public.booking_requests (organization_id, hostel_branch_id, booking_code);

create unique index if not exists booking_requests_active_phone_unique
  on public.booking_requests (organization_id, hostel_branch_id, phone)
  where deleted_at is null
    and status in ('pending', 'contacted', 'approved');

create index if not exists booking_requests_org_branch_status_created_idx
  on public.booking_requests (organization_id, hostel_branch_id, status, created_at desc)
  where deleted_at is null;

create index if not exists booking_requests_public_token_idx
  on public.booking_requests (public_access_token_hash)
  where deleted_at is null;

create index if not exists booking_requests_cashfree_order_idx
  on public.booking_requests (cashfree_order_id)
  where deleted_at is null and cashfree_order_id is not null;

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  booking_request_id uuid not null,
  from_status text,
  to_status text not null check (
    to_status in ('pending', 'contacted', 'approved', 'rejected', 'expired', 'converted', 'cancelled')
  ),
  actor_user_id uuid references auth.users(id) on delete set null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint booking_status_history_booking_fk
    foreign key (booking_request_id, organization_id, hostel_branch_id)
    references public.booking_requests (id, organization_id, hostel_branch_id)
    on delete restrict
);

create index if not exists booking_status_history_booking_created_idx
  on public.booking_status_history (booking_request_id, created_at desc);

create index if not exists booking_status_history_org_branch_created_idx
  on public.booking_status_history (organization_id, hostel_branch_id, created_at desc);

create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  booking_request_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  payment_method text not null default 'cashfree',
  provider text not null default 'cashfree',
  provider_reference text,
  provider_event_id text,
  idempotency_key text,
  cashfree_order_id text,
  cashfree_payment_session_id text,
  status text not null default 'pending' check (
    status in ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')
  ),
  refundable boolean not null default true,
  received_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint booking_payments_booking_fk
    foreign key (booking_request_id, organization_id, hostel_branch_id)
    references public.booking_requests (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists booking_payments_cashfree_order_unique_active
  on public.booking_payments (cashfree_order_id)
  where deleted_at is null and cashfree_order_id is not null;

create unique index if not exists booking_payments_provider_event_unique_active
  on public.booking_payments (provider, provider_event_id)
  where deleted_at is null and provider_event_id is not null;

create unique index if not exists booking_payments_idempotency_unique_active
  on public.booking_payments (provider, idempotency_key)
  where deleted_at is null and idempotency_key is not null;

create unique index if not exists booking_payments_one_pending_cashfree
  on public.booking_payments (booking_request_id)
  where deleted_at is null
    and provider = 'cashfree'
    and status = 'pending';

create index if not exists booking_payments_booking_created_idx
  on public.booking_payments (booking_request_id, created_at desc)
  where deleted_at is null;

create table if not exists public.booking_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  booking_request_id uuid not null,
  note_type text not null default 'internal' check (note_type in ('internal', 'follow_up', 'public_contact')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint booking_notes_booking_fk
    foreign key (booking_request_id, organization_id, hostel_branch_id)
    references public.booking_requests (id, organization_id, hostel_branch_id)
    on delete restrict
);

create index if not exists booking_notes_booking_created_idx
  on public.booking_notes (booking_request_id, created_at desc)
  where deleted_at is null;

drop trigger if exists set_booking_requests_updated_at on public.booking_requests;
create trigger set_booking_requests_updated_at
  before update on public.booking_requests
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_booking_payments_updated_at on public.booking_payments;
create trigger set_booking_payments_updated_at
  before update on public.booking_payments
  for each row
  execute function private.set_updated_at();

create or replace function private.capture_booking_status_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.booking_status_history (
      organization_id,
      hostel_branch_id,
      booking_request_id,
      from_status,
      to_status,
      actor_user_id,
      metadata
    )
    values (
      new.organization_id,
      new.hostel_branch_id,
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      coalesce(new.updated_by, new.created_by),
      jsonb_build_object('source', 'status_trigger')
    );
  end if;

  return new;
end;
$$;

drop trigger if exists capture_booking_status_history on public.booking_requests;
create trigger capture_booking_status_history
  after insert or update of status on public.booking_requests
  for each row
  execute function private.capture_booking_status_history();

create or replace function public.convert_booking_to_student(
  p_actor_user_id uuid,
  p_booking_request_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_room_id uuid default null,
  p_bed_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
  v_booking public.booking_requests%rowtype;
  v_student_code text;
  v_student_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Booking conversion permission is required' using errcode = '42501';
  end if;

  select *
    into v_booking
  from public.booking_requests br
  where br.id = p_booking_request_id
    and br.organization_id = p_organization_id
    and br.hostel_branch_id = p_hostel_branch_id
    and br.deleted_at is null
  for update;

  if not found then
    raise exception 'Booking request was not found' using errcode = '02000';
  end if;

  if v_booking.status = 'converted' then
    raise exception 'Booking request is already converted' using errcode = '23505';
  end if;

  if v_booking.status not in ('approved', 'contacted', 'pending') then
    raise exception 'Only active booking requests can be converted' using errcode = '23514';
  end if;

  if (p_room_id is null) <> (p_bed_id is null) then
    raise exception 'Room and bed must be assigned together' using errcode = '23514';
  end if;

  if p_bed_id is not null and not exists (
    select 1
    from public.room_beds rb
    where rb.id = p_bed_id
      and rb.room_id = p_room_id
      and rb.organization_id = p_organization_id
      and rb.hostel_branch_id = p_hostel_branch_id
      and rb.status = 'available'
      and rb.deleted_at is null
  ) then
    raise exception 'Selected bed is not available in this booking branch'
      using errcode = '23503';
  end if;

  insert into public.students (
    organization_id,
    hostel_branch_id,
    student_code,
    first_name,
    last_name,
    email,
    phone,
    admission_date,
    guardian_info,
    emergency_contact,
    metadata,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    private.next_student_code(p_organization_id, p_hostel_branch_id),
    v_booking.first_name,
    v_booking.last_name,
    v_booking.email,
    v_booking.phone,
    coalesce(v_booking.move_in_date, current_date),
    jsonb_build_object(
      'name', coalesce(v_booking.guardian_name, ''),
      'phone', coalesce(v_booking.guardian_phone, '')
    ),
    jsonb_build_object(
      'name', '',
      'phone', v_booking.phone
    ),
    jsonb_build_object(
      'booking_request_id', v_booking.id,
      'booking_code', v_booking.booking_code,
      'source', 'booking_conversion'
    ),
    p_actor_user_id,
    p_actor_user_id
  )
  returning id, student_code into v_student_id, v_student_code;

  if p_bed_id is not null then
    insert into public.student_room_assignments (
      organization_id,
      hostel_branch_id,
      student_id,
      room_id,
      bed_id,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      v_student_id,
      p_room_id,
      p_bed_id,
      p_actor_user_id,
      p_actor_user_id
    )
    returning id into v_assignment_id;
  end if;

  update public.booking_requests
    set status = 'converted',
        converted_student_id = v_student_id,
        updated_by = p_actor_user_id,
        metadata = metadata || jsonb_build_object(
          'converted_student_id', v_student_id,
          'converted_at', now()
        )
  where id = v_booking.id;

  insert into public.audit_logs (
    actor_user_id,
    organization_id,
    hostel_branch_id,
    app,
    action,
    entity_table,
    entity_id,
    metadata
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'booking.convert',
    'booking_requests',
    v_booking.id,
    jsonb_build_object(
      'student_id', v_student_id,
      'student_code', v_student_code,
      'assignment_id', v_assignment_id,
      'room_id', p_room_id,
      'bed_id', p_bed_id
    )
  );

  return jsonb_build_object(
    'studentId', v_student_id,
    'studentCode', v_student_code,
    'assignmentId', v_assignment_id
  );
end;
$$;

alter table public.booking_requests enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.booking_payments enable row level security;
alter table public.booking_notes enable row level security;

alter table public.booking_requests force row level security;
alter table public.booking_status_history force row level security;
alter table public.booking_payments force row level security;
alter table public.booking_notes force row level security;

drop policy if exists "booking_requests_admin_select" on public.booking_requests;
create policy "booking_requests_admin_select"
  on public.booking_requests
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  );

drop policy if exists "booking_requests_admin_manage" on public.booking_requests;
create policy "booking_requests_admin_manage"
  on public.booking_requests
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "booking_status_history_admin_select" on public.booking_status_history;
create policy "booking_status_history_admin_select"
  on public.booking_status_history
  for select
  to authenticated
  using ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "booking_payments_admin_select" on public.booking_payments;
create policy "booking_payments_admin_select"
  on public.booking_payments
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  );

drop policy if exists "booking_payments_admin_manage" on public.booking_payments;
create policy "booking_payments_admin_manage"
  on public.booking_payments
  for update
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "booking_notes_admin_select" on public.booking_notes;
create policy "booking_notes_admin_select"
  on public.booking_notes
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  );

drop policy if exists "booking_notes_admin_manage" on public.booking_notes;
create policy "booking_notes_admin_manage"
  on public.booking_notes
  for insert
  to authenticated
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

revoke all on public.booking_requests from anon;
revoke all on public.booking_status_history from anon;
revoke all on public.booking_payments from anon;
revoke all on public.booking_notes from anon;
revoke all on function public.convert_booking_to_student(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) from anon;

grant select, insert, update on public.booking_requests to authenticated;
grant select on public.booking_status_history to authenticated;
grant select, update on public.booking_payments to authenticated;
grant select, insert on public.booking_notes to authenticated;

grant all on public.booking_requests to service_role;
grant all on public.booking_status_history to service_role;
grant all on public.booking_payments to service_role;
grant all on public.booking_notes to service_role;

grant usage on schema private to authenticated;

grant execute on function public.convert_booking_to_student(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'booking:read',
        'booking:manage'
      ]
    ) as new_permission(permission)
  )
where role = 'admin'::public.app_role
  and deleted_at is null;
