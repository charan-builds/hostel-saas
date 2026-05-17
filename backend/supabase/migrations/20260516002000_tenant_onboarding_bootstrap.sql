do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'saas_product'
      and e.enumlabel = 'inventory'
  )
  and not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'saas_product'
      and e.enumlabel = 'inventory_erp'
  ) then
    alter type public.saas_product rename value 'inventory' to 'inventory_erp';
  end if;
end $$;

create table if not exists public.tenant_role_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  app public.saas_product not null default 'hostel_erp',
  role public.app_role not null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  description text,
  permissions text[] not null default '{}'::text[],
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint tenant_role_definitions_no_superadmin check (
    role <> 'superadmin'::public.app_role
  )
);

create unique index if not exists tenant_role_definitions_org_app_role_unique_active
  on public.tenant_role_definitions (organization_id, app, role)
  where deleted_at is null;

create table if not exists public.tenant_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  key text not null check (key ~ '^[a-z][a-z0-9_]{1,80}$'),
  value jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint tenant_settings_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists tenant_settings_org_app_branch_key_unique_active
  on public.tenant_settings (
    organization_id,
    app,
    coalesce(hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    key
  )
  where deleted_at is null;

create index if not exists tenant_settings_org_app_idx
  on public.tenant_settings (organization_id, app)
  where deleted_at is null;

drop trigger if exists set_tenant_role_definitions_updated_at on public.tenant_role_definitions;
create trigger set_tenant_role_definitions_updated_at
  before update on public.tenant_role_definitions
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_tenant_settings_updated_at on public.tenant_settings;
create trigger set_tenant_settings_updated_at
  before update on public.tenant_settings
  for each row
  execute function private.set_updated_at();

create or replace function public.bootstrap_tenant(
  p_actor_user_id uuid,
  p_admin_user_id uuid,
  p_admin_email text,
  p_admin_full_name text,
  p_organization_name text,
  p_organization_slug text,
  p_product public.saas_product,
  p_hostel_name text,
  p_hostel_slug text,
  p_timezone text default 'UTC',
  p_address jsonb default '{}'::jsonb,
  p_settings jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_membership_id uuid;
  v_branch_id uuid;
  v_organization_id uuid;
begin
  if exists (
    select 1
    from public.organizations o
    where o.slug = p_organization_slug::citext
      and o.deleted_at is null
  ) then
    raise exception 'Active organization slug already exists: %', p_organization_slug
      using errcode = '23505';
  end if;

  insert into public.organizations (
    name,
    slug,
    metadata,
    created_by,
    updated_by
  )
  values (
    p_organization_name,
    p_organization_slug::citext,
    jsonb_build_object(
      'bootstrap_product', p_product,
      'bootstrap_source', 'superadmin_onboarding'
    ),
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_organization_id;

  insert into public.hostel_branches (
    organization_id,
    name,
    slug,
    timezone,
    address,
    metadata,
    created_by,
    updated_by
  )
  values (
    v_organization_id,
    p_hostel_name,
    p_hostel_slug::citext,
    p_timezone,
    p_address,
    jsonb_build_object(
      'bootstrap_product', p_product,
      'is_default_branch', true
    ),
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_branch_id;

  insert into public.user_profiles (
    id,
    organization_id,
    hostel_branch_id,
    role,
    full_name,
    email,
    is_active,
    metadata,
    created_by,
    updated_by
  )
  values (
    p_admin_user_id,
    v_organization_id,
    null,
    'admin'::public.app_role,
    p_admin_full_name,
    p_admin_email::citext,
    true,
    jsonb_build_object(
      'created_by_bootstrap', true,
      'bootstrap_product', p_product
    ),
    p_actor_user_id,
    p_actor_user_id
  );

  insert into public.tenant_memberships (
    user_id,
    organization_id,
    hostel_branch_id,
    app,
    role,
    status,
    accepted_at,
    created_by,
    updated_by
  )
  values (
    p_admin_user_id,
    v_organization_id,
    null,
    p_product,
    'admin'::public.app_role,
    'active'::public.membership_status,
    now(),
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_admin_membership_id;

  insert into public.tenant_role_definitions (
    organization_id,
    app,
    role,
    name,
    description,
    permissions,
    is_system,
    created_by,
    updated_by
  )
  values
    (
      v_organization_id,
      p_product,
      'admin'::public.app_role,
      'Tenant Admin',
      'Organization-level administrator for this SaaS product.',
      array[
        'tenant:read',
        'tenant:update',
        'membership:read',
        'membership:manage',
        'branch:read',
        'branch:manage',
        'room:read',
        'room:manage',
        'student:read',
        'student:manage',
        'student:document:upload',
        'billing:read',
        'billing:manage',
        'payment:record',
        'notification:read',
        'notification:manage',
        'notice:read',
        'notice:manage',
        'leave:read',
        'leave:request',
        'leave:manage',
        'attendance:read',
        'attendance:manage',
        'gatepass:read',
        'gatepass:request',
        'gatepass:manage',
        'analytics:read',
        'report:export',
        'audit:read',
        'student:self:read',
        'student:self:update'
      ],
      true,
      p_actor_user_id,
      p_actor_user_id
    ),
    (
      v_organization_id,
      p_product,
      'student'::public.app_role,
      'Student',
      'Branch-scoped student access.',
      array[
        'tenant:read',
        'branch:read',
        'notification:read',
        'notice:read',
        'leave:read',
        'leave:request',
        'attendance:read',
        'gatepass:read',
        'gatepass:request',
        'student:self:read',
        'student:self:update'
      ],
      true,
      p_actor_user_id,
      p_actor_user_id
    );

  insert into public.tenant_settings (
    organization_id,
    hostel_branch_id,
    app,
    key,
    value,
    is_system,
    created_by,
    updated_by
  )
  values
    (
      v_organization_id,
      null,
      p_product,
      'tenant_defaults',
      jsonb_build_object(
        'timezone', p_timezone,
        'default_branch_id', v_branch_id,
        'currency', coalesce(p_settings ->> 'currency', 'INR'),
        'locale', coalesce(p_settings ->> 'locale', 'en')
      ),
      true,
      p_actor_user_id,
      p_actor_user_id
    ),
    (
      v_organization_id,
      v_branch_id,
      p_product,
      'hostel_defaults',
      jsonb_build_object(
        'room_numbering', 'floor-room',
        'fee_cycle', 'monthly',
        'attendance_mode', 'daily',
        'quiet_hours_start', '22:00',
        'quiet_hours_end', '06:00'
      ) || coalesce(p_settings -> 'hostel_defaults', '{}'::jsonb),
      true,
      p_actor_user_id,
      p_actor_user_id
    ),
    (
      v_organization_id,
      v_branch_id,
      p_product,
      'security_defaults',
      jsonb_build_object(
        'require_active_membership', true,
        'audit_admin_actions', true,
        'rls_required', true
      ),
      true,
      p_actor_user_id,
      p_actor_user_id
    );

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
    v_organization_id,
    v_branch_id,
    p_product,
    'tenant.bootstrap',
    'organizations',
    v_organization_id,
    jsonb_build_object(
      'admin_user_id', p_admin_user_id,
      'admin_membership_id', v_admin_membership_id,
      'default_branch_id', v_branch_id
    )
  );

  return jsonb_build_object(
    'organizationId', v_organization_id,
    'hostelBranchId', v_branch_id,
    'adminUserId', p_admin_user_id,
    'adminMembershipId', v_admin_membership_id,
    'product', p_product
  );
end;
$$;

alter table public.tenant_role_definitions enable row level security;
alter table public.tenant_settings enable row level security;

alter table public.tenant_role_definitions force row level security;
alter table public.tenant_settings force row level security;

drop policy if exists "tenant_role_definitions_select_scoped" on public.tenant_role_definitions;
create policy "tenant_role_definitions_select_scoped"
  on public.tenant_role_definitions
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_organization(organization_id))
  );

drop policy if exists "tenant_role_definitions_manage_admins" on public.tenant_role_definitions;
create policy "tenant_role_definitions_manage_admins"
  on public.tenant_role_definitions
  for all
  to authenticated
  using (
    deleted_at is null
    and ((select private.is_superadmin()) or (select private.is_org_admin(organization_id)))
  )
  with check (
    (select private.is_superadmin()) or (select private.is_org_admin(organization_id))
  );

drop policy if exists "tenant_settings_select_scoped" on public.tenant_settings;
create policy "tenant_settings_select_scoped"
  on public.tenant_settings
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_organization(organization_id))
  );

drop policy if exists "tenant_settings_manage_admins" on public.tenant_settings;
create policy "tenant_settings_manage_admins"
  on public.tenant_settings
  for all
  to authenticated
  using (
    deleted_at is null
    and ((select private.is_superadmin()) or (select private.is_org_admin(organization_id)))
  )
  with check (
    (select private.is_superadmin()) or (select private.is_org_admin(organization_id))
  );

revoke all on public.tenant_role_definitions from anon;
revoke all on public.tenant_settings from anon;
revoke all on function public.bootstrap_tenant(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  public.saas_product,
  text,
  text,
  text,
  jsonb,
  jsonb
) from anon, authenticated;

grant select, insert, update on public.tenant_role_definitions to authenticated;
grant select, insert, update on public.tenant_settings to authenticated;
grant all on public.tenant_role_definitions to service_role;
grant all on public.tenant_settings to service_role;
grant execute on function public.bootstrap_tenant(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  public.saas_product,
  text,
  text,
  text,
  jsonb,
  jsonb
) to service_role;
