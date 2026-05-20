-- Supabase Migration: Enquiries & Lead Management
-- Handles public website contact forms, WhatsApp tracking, and lead inbox statuses.

create type public.enquiry_status as enum ('new', 'contacted', 'resolved', 'archived');

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  hostel_branch_id uuid references public.hostel_branches(id) on delete set null,
  
  -- Submitter details
  full_name text not null check (char_length(trim(full_name)) >= 2),
  email extensions.citext,
  phone text,
  message text not null,
  
  -- Tracking
  status public.enquiry_status not null default 'new',
  source text not null default 'website_form', -- e.g., 'website_form', 'whatsapp_click'
  assigned_to uuid references auth.users(id) on delete set null,
  notes text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  
  constraint enquiries_contact_info_check check (
    email is not null or phone is not null
  )
);

create index if not exists enquiries_org_status_idx on public.enquiries (organization_id, status);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

-- Trigger for updated_at
create trigger set_enquiries_updated_at
  before update on public.enquiries
  for each row
  execute function private.set_updated_at();

-- RLS Policies
alter table public.enquiries enable row level security;
alter table public.enquiries force row level security;

-- Public can insert enquiries (unauthenticated submissions)
-- NOTE: In a real multi-tenant scenario with custom domains, the frontend passes the organization_id.
drop policy if exists "enquiries_insert_public" on public.enquiries;
create policy "enquiries_insert_public"
  on public.enquiries
  for insert
  to public
  with check (true);

-- Admins can read enquiries for their organization
drop policy if exists "enquiries_select_admins" on public.enquiries;
create policy "enquiries_select_admins"
  on public.enquiries
  for select
  to authenticated
  using (
    (select private.is_superadmin()) 
    or (select private.is_org_admin(organization_id))
  );

-- Admins can update enquiries for their organization
drop policy if exists "enquiries_update_admins" on public.enquiries;
create policy "enquiries_update_admins"
  on public.enquiries
  for update
  to authenticated
  using (
    (select private.is_superadmin()) 
    or (select private.is_org_admin(organization_id))
  )
  with check (
    (select private.is_superadmin()) 
    or (select private.is_org_admin(organization_id))
  );

-- Admins can delete enquiries for their organization
drop policy if exists "enquiries_delete_admins" on public.enquiries;
create policy "enquiries_delete_admins"
  on public.enquiries
  for delete
  to authenticated
  using (
    (select private.is_superadmin()) 
    or (select private.is_org_admin(organization_id))
  );

grant select, insert, update, delete on public.enquiries to authenticated;
grant insert on public.enquiries to anon;
