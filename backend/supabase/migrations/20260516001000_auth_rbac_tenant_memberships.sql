do $$
begin
  create type public.saas_product as enum (
    'hostel_erp',
    'clothing_shop_erp',
    'gym_erp',
    'inventory_erp'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.membership_status as enum (
    'active',
    'invited',
    'suspended',
    'revoked'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  role public.app_role not null,
  status public.membership_status not null default 'active',
  scope jsonb not null default '{}'::jsonb,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint tenant_memberships_role_tenant_scoped check (
    role <> 'superadmin'::public.app_role
  ),
  constraint tenant_memberships_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists tenant_memberships_user_org_app_branch_unique_active
  on public.tenant_memberships (
    user_id,
    organization_id,
    app,
    coalesce(hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where deleted_at is null and status in ('active', 'invited');

create index if not exists tenant_memberships_user_status_idx
  on public.tenant_memberships (user_id, status)
  where deleted_at is null;

create index if not exists tenant_memberships_org_app_role_idx
  on public.tenant_memberships (organization_id, app, role)
  where deleted_at is null and status = 'active';

create index if not exists tenant_memberships_branch_app_role_idx
  on public.tenant_memberships (hostel_branch_id, app, role)
  where deleted_at is null and status = 'active';

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  action text not null check (char_length(trim(action)) between 3 and 160),
  entity_table text,
  entity_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete set null
);

create index if not exists audit_logs_org_created_idx
  on public.audit_logs (organization_id, created_at desc);

create index if not exists audit_logs_actor_created_idx
  on public.audit_logs (actor_user_id, created_at desc);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_table, entity_id)
  where entity_table is not null and entity_id is not null;

drop trigger if exists set_tenant_memberships_updated_at on public.tenant_memberships;
create trigger set_tenant_memberships_updated_at
  before update on public.tenant_memberships
  for each row
  execute function private.set_updated_at();

create or replace function private.has_active_membership(
  target_organization_id uuid,
  target_hostel_branch_id uuid default null,
  target_app public.saas_product default null,
  allowed_roles public.app_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = (select auth.uid())
      and tm.organization_id = target_organization_id
      and tm.deleted_at is null
      and tm.status = 'active'::public.membership_status
      and (target_app is null or tm.app = target_app)
      and (allowed_roles is null or tm.role = any(allowed_roles))
      and (
        target_hostel_branch_id is null
        or tm.hostel_branch_id is null
        or tm.hostel_branch_id = target_hostel_branch_id
      )
  );
$$;

create or replace function private.is_org_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.is_superadmin())
    or exists (
      select 1
      from public.tenant_memberships tm
      where tm.user_id = (select auth.uid())
        and tm.organization_id = target_organization_id
        and tm.role = 'admin'::public.app_role
        and tm.status = 'active'::public.membership_status
        and tm.deleted_at is null
    )
    or (
      (select private.current_user_role()) = 'admin'::public.app_role
      and (select private.current_organization_id()) = target_organization_id
    ),
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
    or exists (
      select 1
      from public.tenant_memberships tm
      where tm.user_id = (select auth.uid())
        and tm.organization_id = target_organization_id
        and tm.status = 'active'::public.membership_status
        and tm.deleted_at is null
    )
    or (select private.current_organization_id()) = target_organization_id,
    false
  );
$$;

create or replace function private.can_access_hostel_branch(
  target_organization_id uuid,
  target_hostel_branch_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.is_superadmin())
    or (select private.is_org_admin(target_organization_id))
    or exists (
      select 1
      from public.tenant_memberships tm
      where tm.user_id = (select auth.uid())
        and tm.organization_id = target_organization_id
        and tm.status = 'active'::public.membership_status
        and tm.deleted_at is null
        and (
          tm.hostel_branch_id is null
          or tm.hostel_branch_id = target_hostel_branch_id
        )
    ),
    false
  );
$$;

alter table public.tenant_memberships enable row level security;
alter table public.audit_logs enable row level security;

alter table public.tenant_memberships force row level security;
alter table public.audit_logs force row level security;

drop policy if exists "tenant_memberships_select_scoped" on public.tenant_memberships;
create policy "tenant_memberships_select_scoped"
  on public.tenant_memberships
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_superadmin())
      or (select private.is_org_admin(organization_id))
    )
  );

drop policy if exists "tenant_memberships_insert_admins" on public.tenant_memberships;
create policy "tenant_memberships_insert_admins"
  on public.tenant_memberships
  for insert
  to authenticated
  with check (
    role <> 'superadmin'::public.app_role
    and (
      (select private.is_superadmin())
      or (select private.is_org_admin(organization_id))
    )
  );

drop policy if exists "tenant_memberships_update_admins" on public.tenant_memberships;
create policy "tenant_memberships_update_admins"
  on public.tenant_memberships
  for update
  to authenticated
  using (
    deleted_at is null
    and role <> 'superadmin'::public.app_role
    and (
      (select private.is_superadmin())
      or (select private.is_org_admin(organization_id))
    )
  )
  with check (
    role <> 'superadmin'::public.app_role
    and (
      (select private.is_superadmin())
      or (select private.is_org_admin(organization_id))
    )
  );

drop policy if exists "audit_logs_insert_self" on public.audit_logs;
create policy "audit_logs_insert_self"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    actor_user_id = (select auth.uid())
    and (
      organization_id is null
      or (select private.can_access_organization(organization_id))
    )
  );

drop policy if exists "audit_logs_select_admins" on public.audit_logs;
create policy "audit_logs_select_admins"
  on public.audit_logs
  for select
  to authenticated
  using (
    (select private.is_superadmin())
    or (
      organization_id is not null
      and (select private.is_org_admin(organization_id))
    )
  );

revoke all on public.tenant_memberships from anon;
revoke all on public.audit_logs from anon;

grant select, insert, update on public.tenant_memberships to authenticated;
grant select, insert on public.audit_logs to authenticated;

grant all on public.tenant_memberships to service_role;
grant all on public.audit_logs to service_role;

grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;
