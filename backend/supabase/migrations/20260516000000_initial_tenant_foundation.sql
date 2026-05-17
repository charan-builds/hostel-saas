create extension if not exists "pgcrypto";
create schema if not exists extensions;
create extension if not exists "citext" with schema extensions;
alter extension "citext" set schema extensions;

create schema if not exists private;

do $$
begin
  create type public.app_role as enum ('superadmin', 'admin', 'student');
exception
  when duplicate_object then null;
end $$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug extensions.citext not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint organizations_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);

create unique index if not exists organizations_slug_unique_active
  on public.organizations (slug)
  where deleted_at is null;

create index if not exists organizations_status_active_idx
  on public.organizations (status)
  where deleted_at is null;

create table if not exists public.hostel_branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug extensions.citext not null,
  code text,
  timezone text not null default 'UTC',
  address jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint hostel_branches_id_org_unique unique (id, organization_id),
  constraint hostel_branches_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);

create unique index if not exists hostel_branches_org_slug_unique_active
  on public.hostel_branches (organization_id, slug)
  where deleted_at is null;

create index if not exists hostel_branches_org_status_idx
  on public.hostel_branches (organization_id, status)
  where deleted_at is null;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  role public.app_role not null default 'student',
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  email extensions.citext not null,
  phone text,
  avatar_url text,
  locale text not null default 'en',
  is_active boolean not null default true,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint user_profiles_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint user_profiles_superadmin_tenant_scope check (
    (role = 'superadmin' and organization_id is null and hostel_branch_id is null)
    or
    (role <> 'superadmin' and organization_id is not null)
  ),
  constraint user_profiles_student_branch_required check (
    role <> 'student' or hostel_branch_id is not null
  ),
  constraint user_profiles_email_format check (
    email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  )
);

create unique index if not exists user_profiles_email_unique_active
  on public.user_profiles (email)
  where deleted_at is null;

create index if not exists user_profiles_org_role_active_idx
  on public.user_profiles (organization_id, role)
  where deleted_at is null and is_active = true;

create index if not exists user_profiles_branch_role_active_idx
  on public.user_profiles (hostel_branch_id, role)
  where deleted_at is null and is_active = true;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
  before update on public.organizations
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_hostel_branches_updated_at on public.hostel_branches;
create trigger set_hostel_branches_updated_at
  before update on public.hostel_branches
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function private.set_updated_at();

create or replace function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select up.role
  from public.user_profiles up
  where up.id = (select auth.uid())
    and up.deleted_at is null
    and up.is_active = true
  limit 1;
$$;

create or replace function private.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select up.organization_id
  from public.user_profiles up
  where up.id = (select auth.uid())
    and up.deleted_at is null
    and up.is_active = true
  limit 1;
$$;

create or replace function private.current_hostel_branch_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select up.hostel_branch_id
  from public.user_profiles up
  where up.id = (select auth.uid())
    and up.deleted_at is null
    and up.is_active = true
  limit 1;
$$;

create or replace function private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_user_role()) = 'superadmin'::public.app_role, false);
$$;

create or replace function private.is_org_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.current_user_role()) = 'admin'::public.app_role
    and (select private.current_organization_id()) = target_organization_id,
    false
  );
$$;

create or replace function private.can_access_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.is_superadmin())
    or (select private.current_organization_id()) = target_organization_id,
    false
  );
$$;

alter table public.organizations enable row level security;
alter table public.hostel_branches enable row level security;
alter table public.user_profiles enable row level security;

alter table public.organizations force row level security;
alter table public.hostel_branches force row level security;
alter table public.user_profiles force row level security;

drop policy if exists "organizations_select_tenant_members" on public.organizations;
create policy "organizations_select_tenant_members"
  on public.organizations
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_organization(id))
  );

drop policy if exists "organizations_insert_superadmins" on public.organizations;
create policy "organizations_insert_superadmins"
  on public.organizations
  for insert
  to authenticated
  with check ((select private.is_superadmin()));

drop policy if exists "organizations_update_superadmins_or_admins" on public.organizations;
create policy "organizations_update_superadmins_or_admins"
  on public.organizations
  for update
  to authenticated
  using (
    deleted_at is null
    and ((select private.is_superadmin()) or (select private.is_org_admin(id)))
  )
  with check (
    (select private.is_superadmin()) or (select private.is_org_admin(id))
  );

drop policy if exists "hostel_branches_select_tenant_members" on public.hostel_branches;
create policy "hostel_branches_select_tenant_members"
  on public.hostel_branches
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_organization(organization_id))
  );

drop policy if exists "hostel_branches_insert_admins" on public.hostel_branches;
create policy "hostel_branches_insert_admins"
  on public.hostel_branches
  for insert
  to authenticated
  with check (
    (select private.is_superadmin()) or (select private.is_org_admin(organization_id))
  );

drop policy if exists "hostel_branches_update_admins" on public.hostel_branches;
create policy "hostel_branches_update_admins"
  on public.hostel_branches
  for update
  to authenticated
  using (
    deleted_at is null
    and ((select private.is_superadmin()) or (select private.is_org_admin(organization_id)))
  )
  with check (
    (select private.is_superadmin()) or (select private.is_org_admin(organization_id))
  );

drop policy if exists "user_profiles_select_scoped" on public.user_profiles;
create policy "user_profiles_select_scoped"
  on public.user_profiles
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      id = (select auth.uid())
      or (select private.is_superadmin())
      or (
        (select private.current_user_role()) = 'admin'::public.app_role
        and organization_id = (select private.current_organization_id())
      )
    )
  );

drop policy if exists "user_profiles_insert_admins" on public.user_profiles;
create policy "user_profiles_insert_admins"
  on public.user_profiles
  for insert
  to authenticated
  with check (
    (select private.is_superadmin())
    or (
      (select private.is_org_admin(organization_id))
      and role <> 'superadmin'::public.app_role
    )
  );

drop policy if exists "user_profiles_update_admins" on public.user_profiles;
create policy "user_profiles_update_admins"
  on public.user_profiles
  for update
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_superadmin())
      or (
        (select private.is_org_admin(organization_id))
        and role <> 'superadmin'::public.app_role
      )
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      (select private.is_org_admin(organization_id))
      and role <> 'superadmin'::public.app_role
    )
  );

revoke all on public.organizations from anon;
revoke all on public.hostel_branches from anon;
revoke all on public.user_profiles from anon;

grant select, insert, update on public.organizations to authenticated;
grant select, insert, update on public.hostel_branches to authenticated;
grant select, insert, update on public.user_profiles to authenticated;

grant all on public.organizations to service_role;
grant all on public.hostel_branches to service_role;
grant all on public.user_profiles to service_role;

revoke all on schema private from anon;
grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;
