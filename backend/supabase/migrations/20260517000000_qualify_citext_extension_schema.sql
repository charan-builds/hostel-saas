create schema if not exists extensions;
create extension if not exists "citext" with schema extensions;
alter extension "citext" set schema extensions;

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
    where o.slug = p_organization_slug::extensions.citext
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
    p_organization_slug::extensions.citext,
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
    p_hostel_slug::extensions.citext,
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
    p_admin_email::extensions.citext,
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

create or replace function public.create_student_with_assignment(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text default null,
  p_phone text default null,
  p_date_of_birth date default null,
  p_gender text default null,
  p_admission_date date default current_date,
  p_guardian_info jsonb default '{}'::jsonb,
  p_emergency_contact jsonb default '{}'::jsonb,
  p_metadata jsonb default '{}'::jsonb,
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
  v_student_id uuid;
  v_student_code text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Student management permission is required' using errcode = '42501';
  end if;

  if (p_room_id is null) <> (p_bed_id is null) then
    raise exception 'Room and bed must be assigned together'
      using errcode = '23514';
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
    raise exception 'Bed does not belong to the selected room and branch'
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
    date_of_birth,
    gender,
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
    p_first_name,
    p_last_name,
    nullif(p_email, '')::extensions.citext,
    nullif(p_phone, ''),
    p_date_of_birth,
    p_gender,
    coalesce(p_admission_date, current_date),
    p_guardian_info,
    p_emergency_contact,
    p_metadata,
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
    'student.create',
    'students',
    v_student_id,
    jsonb_build_object(
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
