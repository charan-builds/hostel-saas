create table if not exists public.student_leave_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  leave_type text not null default 'personal' check (
    leave_type in ('home_visit', 'medical', 'emergency', 'personal', 'academic', 'other')
  ),
  reason text not null check (char_length(trim(reason)) between 1 and 1000),
  destination_address text,
  contact_phone text,
  starts_at timestamptz not null,
  expected_return_at timestamptz not null,
  actual_return_at timestamptz,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'cancelled', 'checked_out', 'returned', 'overdue')
  ),
  approval_notes text,
  rejection_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint student_leave_requests_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint student_leave_requests_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint student_leave_requests_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint student_leave_requests_date_order check (expected_return_at > starts_at),
  constraint student_leave_requests_actual_return_order check (
    actual_return_at is null or actual_return_at >= starts_at
  )
);

create index if not exists student_leave_requests_org_branch_status_idx
  on public.student_leave_requests (organization_id, hostel_branch_id, status, starts_at desc)
  where deleted_at is null;

create index if not exists student_leave_requests_student_idx
  on public.student_leave_requests (student_id, created_at desc)
  where deleted_at is null;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  room_id uuid,
  bed_id uuid,
  assignment_id uuid,
  attendance_date date not null,
  status text not null default 'present' check (
    status in ('present', 'absent', 'on_leave', 'late', 'excused')
  ),
  source text not null default 'manual' check (
    source in ('manual', 'qr', 'biometric', 'import', 'system')
  ),
  checked_at timestamptz not null default now(),
  marked_by uuid references auth.users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint attendance_records_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint attendance_records_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint attendance_records_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint attendance_records_bed_fk
    foreign key (bed_id, organization_id, hostel_branch_id)
    references public.room_beds (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint attendance_records_assignment_fk
    foreign key (assignment_id, organization_id, hostel_branch_id)
    references public.student_room_assignments (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists attendance_records_student_day_unique_active
  on public.attendance_records (organization_id, hostel_branch_id, student_id, attendance_date)
  where deleted_at is null;

create index if not exists attendance_records_org_branch_day_status_idx
  on public.attendance_records (organization_id, hostel_branch_id, attendance_date desc, status)
  where deleted_at is null;

create table if not exists public.gate_passes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  leave_request_id uuid,
  purpose text not null check (char_length(trim(purpose)) between 1 and 500),
  destination text,
  contact_phone text,
  expected_exit_at timestamptz not null,
  expected_return_at timestamptz not null,
  actual_exit_at timestamptz,
  actual_return_at timestamptz,
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'rejected', 'checked_out', 'checked_in', 'expired', 'cancelled')
  ),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  guard_out_by uuid references auth.users(id) on delete set null,
  guard_in_by uuid references auth.users(id) on delete set null,
  late_entry boolean not null default false,
  late_minutes integer not null default 0 check (late_minutes >= 0),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint gate_passes_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint gate_passes_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint gate_passes_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint gate_passes_leave_fk
    foreign key (leave_request_id, organization_id, hostel_branch_id)
    references public.student_leave_requests (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint gate_passes_expected_order check (expected_return_at > expected_exit_at),
  constraint gate_passes_actual_order check (
    actual_exit_at is null or actual_return_at is null or actual_return_at >= actual_exit_at
  )
);

create index if not exists gate_passes_org_branch_status_idx
  on public.gate_passes (organization_id, hostel_branch_id, status, expected_exit_at desc)
  where deleted_at is null;

create index if not exists gate_passes_student_idx
  on public.gate_passes (student_id, created_at desc)
  where deleted_at is null;

create table if not exists public.gate_pass_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  gate_pass_id uuid not null,
  event_type text not null check (
    event_type in ('requested', 'approved', 'rejected', 'checked_out', 'checked_in', 'late_entry', 'cancelled', 'expired')
  ),
  event_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint gate_pass_events_gate_pass_fk
    foreign key (gate_pass_id, organization_id, hostel_branch_id)
    references public.gate_passes (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint gate_pass_events_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists gate_pass_events_pass_idx
  on public.gate_pass_events (gate_pass_id, event_at desc);

create table if not exists public.visitor_passes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid,
  visitor_name text not null check (char_length(trim(visitor_name)) between 1 and 120),
  visitor_phone text,
  relationship text,
  visit_reason text not null check (char_length(trim(visit_reason)) between 1 and 500),
  scheduled_at timestamptz not null default now(),
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled')
  ),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint visitor_passes_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint visitor_passes_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint visitor_passes_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint visitor_passes_checkout_order check (
    checked_in_at is null or checked_out_at is null or checked_out_at >= checked_in_at
  )
);

create index if not exists visitor_passes_org_branch_status_idx
  on public.visitor_passes (organization_id, hostel_branch_id, status, scheduled_at desc)
  where deleted_at is null;

create table if not exists public.visitor_pass_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  visitor_pass_id uuid not null,
  event_type text not null check (
    event_type in ('requested', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled')
  ),
  event_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint visitor_pass_events_visitor_pass_fk
    foreign key (visitor_pass_id, organization_id, hostel_branch_id)
    references public.visitor_passes (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint visitor_pass_events_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists visitor_pass_events_pass_idx
  on public.visitor_pass_events (visitor_pass_id, event_at desc);

create table if not exists public.student_presence_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  job_type text not null check (
    job_type in ('leave_overdue_scan', 'attendance_daily_rollup', 'gate_pass_expiry', 'biometric_import', 'qr_sync')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  scheduled_for timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint student_presence_jobs_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists student_presence_jobs_due_idx
  on public.student_presence_jobs (status, scheduled_for, attempts)
  where deleted_at is null;

create or replace function private.is_presence_admin(
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

create or replace function private.is_student_self(
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and s.user_profile_id = (select auth.uid())
      and s.deleted_at is null
  );
$$;

create or replace function public.review_leave_request(
  p_actor_user_id uuid,
  p_leave_request_id uuid,
  p_decision text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leave public.student_leave_requests%rowtype;
  v_status text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Unsupported leave decision' using errcode = '23514';
  end if;

  select *
    into v_leave
  from public.student_leave_requests
  where id = p_leave_request_id
    and deleted_at is null
  for update;

  if v_leave.id is null then
    raise exception 'Leave request was not found' using errcode = '02000';
  end if;

  if not (select private.is_presence_admin(v_leave.organization_id, v_leave.hostel_branch_id)) then
    raise exception 'Leave management permission is required' using errcode = '42501';
  end if;

  if v_leave.status <> 'pending' then
    raise exception 'Only pending leave requests can be reviewed' using errcode = '23514';
  end if;

  v_status := p_decision;

  update public.student_leave_requests
    set status = v_status,
        approval_notes = case when v_status = 'approved' then nullif(trim(coalesce(p_notes, '')), '') else approval_notes end,
        rejection_reason = case when v_status = 'rejected' then nullif(trim(coalesce(p_notes, '')), '') else rejection_reason end,
        reviewed_by = p_actor_user_id,
        reviewed_at = now(),
        updated_by = p_actor_user_id
  where id = p_leave_request_id;

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
    v_leave.organization_id,
    v_leave.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'leave.' || v_status,
    'student_leave_requests',
    p_leave_request_id,
    jsonb_build_object('notes', p_notes)
  );

  return jsonb_build_object(
    'leaveRequestId', p_leave_request_id,
    'status', v_status
  );
end;
$$;

create or replace function public.upsert_daily_attendance(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_student_id uuid,
  p_attendance_date date,
  p_status text,
  p_source text default 'manual',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment public.student_room_assignments%rowtype;
  v_record_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_presence_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Attendance management permission is required' using errcode = '42501';
  end if;

  if p_status not in ('present', 'absent', 'on_leave', 'late', 'excused') then
    raise exception 'Unsupported attendance status' using errcode = '23514';
  end if;

  if p_source not in ('manual', 'qr', 'biometric', 'import', 'system') then
    raise exception 'Unsupported attendance source' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and s.organization_id = p_organization_id
      and s.hostel_branch_id = p_hostel_branch_id
      and s.status = 'active'
      and s.deleted_at is null
  ) then
    raise exception 'Student was not found in this tenant branch' using errcode = '23503';
  end if;

  select *
    into v_assignment
  from public.student_room_assignments sra
  where sra.student_id = p_student_id
    and sra.organization_id = p_organization_id
    and sra.hostel_branch_id = p_hostel_branch_id
    and sra.status = 'active'
    and sra.end_date is null
    and sra.deleted_at is null
  order by sra.created_at desc
  limit 1;

  insert into public.attendance_records (
    organization_id,
    hostel_branch_id,
    student_id,
    room_id,
    bed_id,
    assignment_id,
    attendance_date,
    status,
    source,
    checked_at,
    marked_by,
    notes,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    p_student_id,
    v_assignment.room_id,
    v_assignment.bed_id,
    v_assignment.id,
    p_attendance_date,
    p_status,
    p_source,
    now(),
    p_actor_user_id,
    nullif(trim(coalesce(p_notes, '')), ''),
    p_actor_user_id,
    p_actor_user_id
  )
  on conflict (organization_id, hostel_branch_id, student_id, attendance_date)
  where deleted_at is null
  do update
    set room_id = excluded.room_id,
        bed_id = excluded.bed_id,
        assignment_id = excluded.assignment_id,
        status = excluded.status,
        source = excluded.source,
        checked_at = excluded.checked_at,
        marked_by = excluded.marked_by,
        notes = excluded.notes,
        updated_by = excluded.updated_by
  returning id into v_record_id;

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
    'attendance.mark',
    'attendance_records',
    v_record_id,
    jsonb_build_object(
      'student_id', p_student_id,
      'attendance_date', p_attendance_date,
      'status', p_status,
      'source', p_source
    )
  );

  return jsonb_build_object('attendanceRecordId', v_record_id);
end;
$$;

create or replace function public.record_leave_request_event(
  p_actor_user_id uuid,
  p_leave_request_id uuid,
  p_event_type text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leave public.student_leave_requests%rowtype;
  v_status text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_leave
  from public.student_leave_requests
  where id = p_leave_request_id
    and deleted_at is null
  for update;

  if v_leave.id is null then
    raise exception 'Leave request was not found' using errcode = '02000';
  end if;

  if not (select private.is_presence_admin(v_leave.organization_id, v_leave.hostel_branch_id)) then
    raise exception 'Leave management permission is required' using errcode = '42501';
  end if;

  if p_event_type not in ('cancelled', 'checked_out', 'returned', 'overdue') then
    raise exception 'Unsupported leave event' using errcode = '23514';
  end if;

  if p_event_type = 'checked_out' and v_leave.status <> 'approved' then
    raise exception 'Only approved leave can be checked out' using errcode = '23514';
  end if;

  if p_event_type = 'returned' and v_leave.status not in ('approved', 'checked_out', 'overdue') then
    raise exception 'Leave is not returnable' using errcode = '23514';
  end if;

  if p_event_type = 'overdue' and v_leave.status not in ('approved', 'checked_out') then
    raise exception 'Leave cannot be marked overdue' using errcode = '23514';
  end if;

  if p_event_type = 'cancelled' and v_leave.status not in ('pending', 'approved') then
    raise exception 'Leave cannot be cancelled in this state' using errcode = '23514';
  end if;

  v_status := p_event_type;

  update public.student_leave_requests
    set status = v_status,
        actual_return_at = case when v_status = 'returned' then now() else actual_return_at end,
        approval_notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), approval_notes),
        updated_by = p_actor_user_id
  where id = p_leave_request_id;

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
    v_leave.organization_id,
    v_leave.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'leave.' || v_status,
    'student_leave_requests',
    p_leave_request_id,
    jsonb_build_object('notes', p_notes)
  );

  return jsonb_build_object(
    'leaveRequestId', p_leave_request_id,
    'eventType', p_event_type,
    'status', v_status
  );
end;
$$;

create or replace function public.record_gate_pass_event(
  p_actor_user_id uuid,
  p_gate_pass_id uuid,
  p_event_type text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_type text;
  v_gate_pass public.gate_passes%rowtype;
  v_late_minutes integer := 0;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_gate_pass
  from public.gate_passes
  where id = p_gate_pass_id
    and deleted_at is null
  for update;

  if v_gate_pass.id is null then
    raise exception 'Gate pass was not found' using errcode = '02000';
  end if;

  if not (select private.is_presence_admin(v_gate_pass.organization_id, v_gate_pass.hostel_branch_id)) then
    raise exception 'Gate pass management permission is required' using errcode = '42501';
  end if;

  if p_event_type not in ('approved', 'rejected', 'checked_out', 'checked_in', 'cancelled', 'expired') then
    raise exception 'Unsupported gate pass event' using errcode = '23514';
  end if;

  v_event_type := p_event_type;

  if v_event_type = 'approved' and v_gate_pass.status <> 'requested' then
    raise exception 'Only requested gate passes can be approved' using errcode = '23514';
  end if;

  if v_event_type = 'checked_out' and v_gate_pass.status not in ('approved', 'requested') then
    raise exception 'Gate pass is not ready for checkout' using errcode = '23514';
  end if;

  if v_event_type = 'checked_in' and v_gate_pass.status <> 'checked_out' then
    raise exception 'Gate pass is not checked out' using errcode = '23514';
  end if;

  if v_event_type = 'checked_in' and now() > v_gate_pass.expected_return_at then
    v_late_minutes := ceil(extract(epoch from (now() - v_gate_pass.expected_return_at)) / 60.0)::integer;
  end if;

  update public.gate_passes
    set status = case
          when v_event_type = 'approved' then 'approved'
          when v_event_type = 'rejected' then 'rejected'
          when v_event_type = 'checked_out' then 'checked_out'
          when v_event_type = 'checked_in' then 'checked_in'
          when v_event_type = 'cancelled' then 'cancelled'
          when v_event_type = 'expired' then 'expired'
          else status
        end,
        approved_by = case when v_event_type = 'approved' then p_actor_user_id else approved_by end,
        approved_at = case when v_event_type = 'approved' then now() else approved_at end,
        guard_out_by = case when v_event_type = 'checked_out' then p_actor_user_id else guard_out_by end,
        guard_in_by = case when v_event_type = 'checked_in' then p_actor_user_id else guard_in_by end,
        actual_exit_at = case when v_event_type = 'checked_out' then now() else actual_exit_at end,
        actual_return_at = case when v_event_type = 'checked_in' then now() else actual_return_at end,
        late_entry = case when v_event_type = 'checked_in' then v_late_minutes > 0 else late_entry end,
        late_minutes = case when v_event_type = 'checked_in' then v_late_minutes else late_minutes end,
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
        updated_by = p_actor_user_id
  where id = p_gate_pass_id;

  insert into public.gate_pass_events (
    organization_id,
    hostel_branch_id,
    gate_pass_id,
    event_type,
    actor_user_id,
    notes,
    metadata
  )
  values (
    v_gate_pass.organization_id,
    v_gate_pass.hostel_branch_id,
    p_gate_pass_id,
    v_event_type,
    p_actor_user_id,
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object('late_minutes', v_late_minutes)
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
    v_gate_pass.organization_id,
    v_gate_pass.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'gate_pass.' || v_event_type,
    'gate_passes',
    p_gate_pass_id,
    jsonb_build_object('notes', p_notes, 'late_minutes', v_late_minutes)
  );

  return jsonb_build_object(
    'gatePassId', p_gate_pass_id,
    'eventType', v_event_type,
    'lateMinutes', v_late_minutes
  );
end;
$$;

create or replace function public.record_visitor_pass_event(
  p_actor_user_id uuid,
  p_visitor_pass_id uuid,
  p_event_type text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_visitor_pass public.visitor_passes%rowtype;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_visitor_pass
  from public.visitor_passes
  where id = p_visitor_pass_id
    and deleted_at is null
  for update;

  if v_visitor_pass.id is null then
    raise exception 'Visitor pass was not found' using errcode = '02000';
  end if;

  if not (select private.is_presence_admin(v_visitor_pass.organization_id, v_visitor_pass.hostel_branch_id)) then
    raise exception 'Visitor pass management permission is required' using errcode = '42501';
  end if;

  if p_event_type not in ('approved', 'rejected', 'checked_in', 'checked_out', 'cancelled') then
    raise exception 'Unsupported visitor pass event' using errcode = '23514';
  end if;

  if p_event_type in ('approved', 'rejected') and v_visitor_pass.status <> 'requested' then
    raise exception 'Only requested visitor passes can be reviewed' using errcode = '23514';
  end if;

  if p_event_type = 'checked_in' and v_visitor_pass.status <> 'approved' then
    raise exception 'Visitor pass is not approved for check-in' using errcode = '23514';
  end if;

  if p_event_type = 'checked_out' and v_visitor_pass.status <> 'checked_in' then
    raise exception 'Visitor pass is not checked in' using errcode = '23514';
  end if;

  if p_event_type = 'cancelled' and v_visitor_pass.status not in ('requested', 'approved') then
    raise exception 'Visitor pass cannot be cancelled in this state' using errcode = '23514';
  end if;

  update public.visitor_passes
    set status = p_event_type,
        approved_by = case when p_event_type = 'approved' then p_actor_user_id else approved_by end,
        approved_at = case when p_event_type = 'approved' then now() else approved_at end,
        checked_in_at = case when p_event_type = 'checked_in' then now() else checked_in_at end,
        checked_out_at = case when p_event_type = 'checked_out' then now() else checked_out_at end,
        notes = coalesce(nullif(trim(coalesce(p_notes, '')), ''), notes),
        updated_by = p_actor_user_id
  where id = p_visitor_pass_id;

  insert into public.visitor_pass_events (
    organization_id,
    hostel_branch_id,
    visitor_pass_id,
    event_type,
    actor_user_id,
    notes
  )
  values (
    v_visitor_pass.organization_id,
    v_visitor_pass.hostel_branch_id,
    p_visitor_pass_id,
    p_event_type,
    p_actor_user_id,
    nullif(trim(coalesce(p_notes, '')), '')
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
    v_visitor_pass.organization_id,
    v_visitor_pass.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'visitor_pass.' || p_event_type,
    'visitor_passes',
    p_visitor_pass_id,
    jsonb_build_object('notes', p_notes)
  );

  return jsonb_build_object(
    'visitorPassId', p_visitor_pass_id,
    'eventType', p_event_type,
    'status', p_event_type
  );
end;
$$;

drop trigger if exists set_student_leave_requests_updated_at on public.student_leave_requests;
create trigger set_student_leave_requests_updated_at
  before update on public.student_leave_requests
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_attendance_records_updated_at on public.attendance_records;
create trigger set_attendance_records_updated_at
  before update on public.attendance_records
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_gate_passes_updated_at on public.gate_passes;
create trigger set_gate_passes_updated_at
  before update on public.gate_passes
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_visitor_passes_updated_at on public.visitor_passes;
create trigger set_visitor_passes_updated_at
  before update on public.visitor_passes
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_student_presence_jobs_updated_at on public.student_presence_jobs;
create trigger set_student_presence_jobs_updated_at
  before update on public.student_presence_jobs
  for each row
  execute function private.set_updated_at();

alter table public.student_leave_requests enable row level security;
alter table public.attendance_records enable row level security;
alter table public.gate_passes enable row level security;
alter table public.gate_pass_events enable row level security;
alter table public.visitor_passes enable row level security;
alter table public.visitor_pass_events enable row level security;
alter table public.student_presence_jobs enable row level security;

alter table public.student_leave_requests force row level security;
alter table public.attendance_records force row level security;
alter table public.gate_passes force row level security;
alter table public.gate_pass_events force row level security;
alter table public.visitor_passes force row level security;
alter table public.visitor_pass_events force row level security;
alter table public.student_presence_jobs force row level security;

drop policy if exists "student_leave_requests_select_admin_or_self" on public.student_leave_requests;
create policy "student_leave_requests_select_admin_or_self"
  on public.student_leave_requests
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_presence_admin(organization_id, hostel_branch_id))
      or (select private.is_student_self(student_id))
    )
  );

drop policy if exists "student_leave_requests_insert_admin_or_self" on public.student_leave_requests;
create policy "student_leave_requests_insert_admin_or_self"
  on public.student_leave_requests
  for insert
  to authenticated
  with check (
    (select private.is_presence_admin(organization_id, hostel_branch_id))
    or (select private.is_student_self(student_id))
  );

drop policy if exists "student_leave_requests_update_admins" on public.student_leave_requests;
create policy "student_leave_requests_update_admins"
  on public.student_leave_requests
  for update
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "attendance_records_select_admin_or_self" on public.attendance_records;
create policy "attendance_records_select_admin_or_self"
  on public.attendance_records
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_presence_admin(organization_id, hostel_branch_id))
      or (select private.is_student_self(student_id))
    )
  );

drop policy if exists "attendance_records_manage_admins" on public.attendance_records;
create policy "attendance_records_manage_admins"
  on public.attendance_records
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "gate_passes_select_admin_or_self" on public.gate_passes;
create policy "gate_passes_select_admin_or_self"
  on public.gate_passes
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_presence_admin(organization_id, hostel_branch_id))
      or (select private.is_student_self(student_id))
    )
  );

drop policy if exists "gate_passes_insert_admin_or_self" on public.gate_passes;
create policy "gate_passes_insert_admin_or_self"
  on public.gate_passes
  for insert
  to authenticated
  with check (
    (select private.is_presence_admin(organization_id, hostel_branch_id))
    or (select private.is_student_self(student_id))
  );

drop policy if exists "gate_passes_update_admins" on public.gate_passes;
create policy "gate_passes_update_admins"
  on public.gate_passes
  for update
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "gate_pass_events_select_admin_or_self" on public.gate_pass_events;
create policy "gate_pass_events_select_admin_or_self"
  on public.gate_pass_events
  for select
  to authenticated
  using (
    (select private.is_presence_admin(organization_id, hostel_branch_id))
    or exists (
      select 1
      from public.gate_passes gp
      where gp.id = gate_pass_id
        and gp.deleted_at is null
        and (select private.is_student_self(gp.student_id))
    )
  );

drop policy if exists "gate_pass_events_insert_admins" on public.gate_pass_events;
create policy "gate_pass_events_insert_admins"
  on public.gate_pass_events
  for insert
  to authenticated
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "visitor_passes_select_admin_or_self" on public.visitor_passes;
create policy "visitor_passes_select_admin_or_self"
  on public.visitor_passes
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_presence_admin(organization_id, hostel_branch_id))
      or (student_id is not null and (select private.is_student_self(student_id)))
    )
  );

drop policy if exists "visitor_passes_insert_admin_or_self" on public.visitor_passes;
create policy "visitor_passes_insert_admin_or_self"
  on public.visitor_passes
  for insert
  to authenticated
  with check (
    (select private.is_presence_admin(organization_id, hostel_branch_id))
    or (student_id is not null and (select private.is_student_self(student_id)))
  );

drop policy if exists "visitor_passes_update_admins" on public.visitor_passes;
create policy "visitor_passes_update_admins"
  on public.visitor_passes
  for update
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "visitor_pass_events_select_admin_or_self" on public.visitor_pass_events;
create policy "visitor_pass_events_select_admin_or_self"
  on public.visitor_pass_events
  for select
  to authenticated
  using (
    (select private.is_presence_admin(organization_id, hostel_branch_id))
    or exists (
      select 1
      from public.visitor_passes vp
      where vp.id = visitor_pass_id
        and vp.deleted_at is null
        and vp.student_id is not null
        and (select private.is_student_self(vp.student_id))
    )
  );

drop policy if exists "visitor_pass_events_insert_admins" on public.visitor_pass_events;
create policy "visitor_pass_events_insert_admins"
  on public.visitor_pass_events
  for insert
  to authenticated
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

drop policy if exists "student_presence_jobs_select_admins" on public.student_presence_jobs;
create policy "student_presence_jobs_select_admins"
  on public.student_presence_jobs
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  );

drop policy if exists "student_presence_jobs_manage_admins" on public.student_presence_jobs;
create policy "student_presence_jobs_manage_admins"
  on public.student_presence_jobs
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_presence_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_presence_admin(organization_id, hostel_branch_id)));

revoke all on public.student_leave_requests from anon;
revoke all on public.attendance_records from anon;
revoke all on public.gate_passes from anon;
revoke all on public.gate_pass_events from anon;
revoke all on public.visitor_passes from anon;
revoke all on public.visitor_pass_events from anon;
revoke all on public.student_presence_jobs from anon;

grant select, insert, update on public.student_leave_requests to authenticated;
grant select, insert, update on public.attendance_records to authenticated;
grant select, insert, update on public.gate_passes to authenticated;
grant select, insert on public.gate_pass_events to authenticated;
grant select, insert, update on public.visitor_passes to authenticated;
grant select, insert on public.visitor_pass_events to authenticated;
grant select, insert, update on public.student_presence_jobs to authenticated;

grant all on public.student_leave_requests to service_role;
grant all on public.attendance_records to service_role;
grant all on public.gate_passes to service_role;
grant all on public.gate_pass_events to service_role;
grant all on public.visitor_passes to service_role;
grant all on public.visitor_pass_events to service_role;
grant all on public.student_presence_jobs to service_role;

grant execute on function public.review_leave_request(uuid, uuid, text, text) to authenticated;
grant execute on function public.upsert_daily_attendance(uuid, uuid, uuid, uuid, date, text, text, text) to authenticated;
grant execute on function public.record_leave_request_event(uuid, uuid, text, text) to authenticated;
grant execute on function public.record_gate_pass_event(uuid, uuid, text, text) to authenticated;
grant execute on function public.record_visitor_pass_event(uuid, uuid, text, text) to authenticated;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'leave:read',
        'leave:request',
        'leave:manage',
        'attendance:read',
        'attendance:manage',
        'gatepass:read',
        'gatepass:request',
        'gatepass:manage'
      ]
    ) as new_permission(permission)
  )
where role = 'admin'::public.app_role
  and deleted_at is null;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'leave:read',
        'leave:request',
        'attendance:read',
        'gatepass:read',
        'gatepass:request'
      ]
    ) as new_permission(permission)
  )
where role = 'student'::public.app_role
  and deleted_at is null;
