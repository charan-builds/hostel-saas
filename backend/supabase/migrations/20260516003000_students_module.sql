create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  room_code text not null check (char_length(trim(room_code)) between 1 and 40),
  name text not null check (char_length(trim(name)) between 1 and 120),
  floor text,
  capacity integer not null check (capacity > 0 and capacity <= 100),
  status text not null default 'active' check (status in ('active', 'maintenance', 'inactive')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint rooms_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint rooms_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists rooms_org_branch_code_unique_active
  on public.rooms (organization_id, hostel_branch_id, room_code)
  where deleted_at is null;

create index if not exists rooms_org_branch_status_idx
  on public.rooms (organization_id, hostel_branch_id, status)
  where deleted_at is null;

create table if not exists public.room_beds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  room_id uuid not null,
  bed_code text not null check (char_length(trim(bed_code)) between 1 and 40),
  status text not null default 'available' check (status in ('available', 'maintenance', 'inactive')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint room_beds_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint room_beds_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists room_beds_room_code_unique_active
  on public.room_beds (organization_id, hostel_branch_id, room_id, bed_code)
  where deleted_at is null;

create index if not exists room_beds_org_branch_status_idx
  on public.room_beds (organization_id, hostel_branch_id, status)
  where deleted_at is null;

create table if not exists public.student_code_counters (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  next_value bigint not null default 1 check (next_value > 0),
  updated_at timestamptz not null default now(),
  primary key (organization_id, hostel_branch_id),
  constraint student_code_counters_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  student_code text not null,
  first_name text not null check (char_length(trim(first_name)) between 1 and 80),
  last_name text not null check (char_length(trim(last_name)) between 1 and 80),
  email citext,
  phone text,
  date_of_birth date,
  gender text check (gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  admission_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  guardian_info jsonb not null default '{}'::jsonb,
  emergency_contact jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint students_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint students_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint students_email_format check (
    email is null
    or email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  )
);

create unique index if not exists students_org_branch_code_unique_active
  on public.students (organization_id, hostel_branch_id, student_code)
  where deleted_at is null;

create index if not exists students_org_branch_status_idx
  on public.students (organization_id, hostel_branch_id, status)
  where deleted_at is null;

create index if not exists students_search_idx
  on public.students (organization_id, hostel_branch_id, lower(first_name), lower(last_name))
  where deleted_at is null;

create table if not exists public.student_room_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  room_id uuid not null,
  bed_id uuid not null,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint student_room_assignments_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint student_room_assignments_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint student_room_assignments_bed_fk
    foreign key (bed_id, organization_id, hostel_branch_id)
    references public.room_beds (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint student_room_assignments_date_order check (
    end_date is null or end_date >= start_date
  )
);

create unique index if not exists student_room_assignments_one_active_student
  on public.student_room_assignments (student_id)
  where deleted_at is null and status = 'active' and end_date is null;

create unique index if not exists student_room_assignments_one_active_bed
  on public.student_room_assignments (bed_id)
  where deleted_at is null and status = 'active' and end_date is null;

create index if not exists student_room_assignments_org_branch_idx
  on public.student_room_assignments (organization_id, hostel_branch_id, status)
  where deleted_at is null;

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  document_type text not null check (document_type in ('id_proof', 'address_proof', 'guardian_id', 'medical', 'other')),
  file_name text not null check (char_length(trim(file_name)) between 1 and 255),
  storage_bucket text not null default 'student-documents',
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes > 0),
  status text not null default 'pending' check (status in ('pending', 'uploaded', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint student_documents_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists student_documents_storage_path_unique_active
  on public.student_documents (storage_bucket, storage_path)
  where deleted_at is null;

create index if not exists student_documents_student_idx
  on public.student_documents (student_id, document_type)
  where deleted_at is null;

create or replace function private.is_student_admin(
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
    or (select private.has_active_membership(
      target_organization_id,
      target_hostel_branch_id,
      'hostel_erp'::public.saas_product,
      array['admin'::public.app_role]
    )),
    false
  );
$$;

create or replace function private.next_student_code(
  target_organization_id uuid,
  target_hostel_branch_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next_value bigint;
begin
  insert into public.student_code_counters (
    organization_id,
    hostel_branch_id,
    next_value
  )
  values (
    target_organization_id,
    target_hostel_branch_id,
    2
  )
  on conflict (organization_id, hostel_branch_id)
  do update
    set next_value = public.student_code_counters.next_value + 1,
        updated_at = now()
  returning next_value - 1 into v_next_value;

  return 'STU-' || lpad(v_next_value::text, 6, '0');
end;
$$;

create or replace function private.set_student_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.student_code is null or trim(new.student_code) = '' then
    new.student_code = private.next_student_code(new.organization_id, new.hostel_branch_id);
  end if;

  return new;
end;
$$;

create or replace function private.enforce_room_bed_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_capacity integer;
  v_existing_beds integer;
begin
  select r.capacity
    into v_capacity
  from public.rooms r
  where r.id = new.room_id
    and r.organization_id = new.organization_id
    and r.hostel_branch_id = new.hostel_branch_id
    and r.deleted_at is null;

  if v_capacity is null then
    raise exception 'Room was not found for bed capacity check'
      using errcode = '23503';
  end if;

  select count(*)::integer
    into v_existing_beds
  from public.room_beds rb
  where rb.room_id = new.room_id
    and rb.organization_id = new.organization_id
    and rb.hostel_branch_id = new.hostel_branch_id
    and rb.deleted_at is null
    and (tg_op = 'INSERT' or rb.id <> new.id);

  if v_existing_beds >= v_capacity then
    raise exception 'Room bed capacity exceeded'
      using errcode = '23514';
  end if;

  return new;
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
    nullif(p_email, '')::citext,
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

create or replace function public.assign_student_bed(
  p_actor_user_id uuid,
  p_student_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_room_id uuid,
  p_bed_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Student management permission is required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and s.organization_id = p_organization_id
      and s.hostel_branch_id = p_hostel_branch_id
      and s.deleted_at is null
  ) then
    raise exception 'Student was not found in this tenant branch'
      using errcode = '23503';
  end if;

  if not exists (
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

  update public.student_room_assignments
    set status = 'completed',
        end_date = current_date,
        updated_by = p_actor_user_id
  where student_id = p_student_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and status = 'active'
    and end_date is null
    and deleted_at is null
    and bed_id <> p_bed_id;

  select sra.id
    into v_assignment_id
  from public.student_room_assignments sra
  where sra.student_id = p_student_id
    and sra.bed_id = p_bed_id
    and sra.status = 'active'
    and sra.end_date is null
    and sra.deleted_at is null
  limit 1;

  if v_assignment_id is null then
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
      p_student_id,
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
    'student.assign_bed',
    'students',
    p_student_id,
    jsonb_build_object(
      'assignment_id', v_assignment_id,
      'room_id', p_room_id,
      'bed_id', p_bed_id
    )
  );

  return jsonb_build_object('assignmentId', v_assignment_id);
end;
$$;

create or replace function public.soft_delete_student(
  p_actor_user_id uuid,
  p_student_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Student management permission is required' using errcode = '42501';
  end if;

  update public.students
    set deleted_at = coalesce(deleted_at, now()),
        status = 'inactive',
        updated_by = p_actor_user_id
  where id = p_student_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and deleted_at is null;

  if not found then
    raise exception 'Student was not found'
      using errcode = '02000';
  end if;

  update public.student_room_assignments
    set status = 'completed',
        end_date = coalesce(end_date, current_date),
        deleted_at = coalesce(deleted_at, now()),
        updated_by = p_actor_user_id
  where student_id = p_student_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and deleted_at is null;

  insert into public.audit_logs (
    actor_user_id,
    organization_id,
    hostel_branch_id,
    app,
    action,
    entity_table,
    entity_id
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'student.soft_delete',
    'students',
    p_student_id
  );

  return jsonb_build_object('studentId', p_student_id);
end;
$$;

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
  before update on public.rooms
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_room_beds_updated_at on public.room_beds;
create trigger set_room_beds_updated_at
  before update on public.room_beds
  for each row
  execute function private.set_updated_at();

drop trigger if exists enforce_room_bed_capacity on public.room_beds;
create trigger enforce_room_bed_capacity
  before insert or update of room_id, organization_id, hostel_branch_id, deleted_at
  on public.room_beds
  for each row
  execute function private.enforce_room_bed_capacity();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
  before update on public.students
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_student_code on public.students;
create trigger set_student_code
  before insert on public.students
  for each row
  execute function private.set_student_code();

drop trigger if exists set_student_room_assignments_updated_at on public.student_room_assignments;
create trigger set_student_room_assignments_updated_at
  before update on public.student_room_assignments
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_student_documents_updated_at on public.student_documents;
create trigger set_student_documents_updated_at
  before update on public.student_documents
  for each row
  execute function private.set_updated_at();

alter table public.rooms enable row level security;
alter table public.room_beds enable row level security;
alter table public.student_code_counters enable row level security;
alter table public.students enable row level security;
alter table public.student_room_assignments enable row level security;
alter table public.student_documents enable row level security;

alter table public.rooms force row level security;
alter table public.room_beds force row level security;
alter table public.student_code_counters force row level security;
alter table public.students force row level security;
alter table public.student_room_assignments force row level security;
alter table public.student_documents force row level security;

drop policy if exists "rooms_select_branch_members" on public.rooms;
create policy "rooms_select_branch_members"
  on public.rooms
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_hostel_branch(organization_id, hostel_branch_id))
  );

drop policy if exists "rooms_manage_student_admins" on public.rooms;
create policy "rooms_manage_student_admins"
  on public.rooms
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "room_beds_select_branch_members" on public.room_beds;
create policy "room_beds_select_branch_members"
  on public.room_beds
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_hostel_branch(organization_id, hostel_branch_id))
  );

drop policy if exists "room_beds_manage_student_admins" on public.room_beds;
create policy "room_beds_manage_student_admins"
  on public.room_beds
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "students_select_admin_or_self" on public.students;
create policy "students_select_admin_or_self"
  on public.students
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_student_admin(organization_id, hostel_branch_id))
      or user_profile_id = (select auth.uid())
    )
  );

drop policy if exists "students_manage_student_admins" on public.students;
create policy "students_manage_student_admins"
  on public.students
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "student_room_assignments_select_admin_or_self" on public.student_room_assignments;
create policy "student_room_assignments_select_admin_or_self"
  on public.student_room_assignments
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_student_admin(organization_id, hostel_branch_id))
      or exists (
        select 1
        from public.students s
        where s.id = student_id
          and s.user_profile_id = (select auth.uid())
          and s.deleted_at is null
      )
    )
  );

drop policy if exists "student_room_assignments_manage_student_admins" on public.student_room_assignments;
create policy "student_room_assignments_manage_student_admins"
  on public.student_room_assignments
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "student_documents_select_admin_or_self" on public.student_documents;
create policy "student_documents_select_admin_or_self"
  on public.student_documents
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_student_admin(organization_id, hostel_branch_id))
      or exists (
        select 1
        from public.students s
        where s.id = student_id
          and s.user_profile_id = (select auth.uid())
          and s.deleted_at is null
      )
    )
  );

drop policy if exists "student_documents_manage_student_admins" on public.student_documents;
create policy "student_documents_manage_student_admins"
  on public.student_documents
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "student_code_counters_no_direct_access" on public.student_code_counters;
create policy "student_code_counters_no_direct_access"
  on public.student_code_counters
  for all
  to authenticated
  using (false)
  with check (false);

revoke all on public.rooms from anon;
revoke all on public.room_beds from anon;
revoke all on public.student_code_counters from anon;
revoke all on public.students from anon;
revoke all on public.student_room_assignments from anon;
revoke all on public.student_documents from anon;

grant select, insert, update on public.rooms to authenticated;
grant select, insert, update on public.room_beds to authenticated;
grant select, insert, update on public.students to authenticated;
grant select, insert, update on public.student_room_assignments to authenticated;
grant select, insert, update on public.student_documents to authenticated;

grant all on public.rooms to service_role;
grant all on public.room_beds to service_role;
grant all on public.student_code_counters to service_role;
grant all on public.students to service_role;
grant all on public.student_room_assignments to service_role;
grant all on public.student_documents to service_role;

grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

grant execute on function public.create_student_with_assignment(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  date,
  text,
  date,
  jsonb,
  jsonb,
  jsonb,
  uuid,
  uuid
) to authenticated;

grant execute on function public.assign_student_bed(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;

grant execute on function public.soft_delete_student(
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
        'room:read',
        'room:manage',
        'student:read',
        'student:manage',
        'student:document:upload'
      ]
    ) as new_permission(permission)
  )
where role = 'admin'::public.app_role
  and deleted_at is null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'student-documents',
  'student-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;
