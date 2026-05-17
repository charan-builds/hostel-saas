create table if not exists public.hostel_floors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  floor_code text not null check (char_length(trim(floor_code)) between 1 and 40),
  name text not null check (char_length(trim(name)) between 1 and 120),
  sort_order integer not null default 0 check (sort_order >= 0),
  status text not null default 'active' check (status in ('active', 'maintenance', 'inactive')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint hostel_floors_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint hostel_floors_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists hostel_floors_org_branch_code_unique_active
  on public.hostel_floors (organization_id, hostel_branch_id, floor_code)
  where deleted_at is null;

create index if not exists hostel_floors_org_branch_sort_idx
  on public.hostel_floors (organization_id, hostel_branch_id, sort_order)
  where deleted_at is null;

create table if not exists public.room_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null check (char_length(trim(slug)) between 1 and 120),
  description text,
  default_capacity integer check (default_capacity is null or (default_capacity > 0 and default_capacity <= 100)),
  monthly_rate_cents bigint not null default 0 check (monthly_rate_cents >= 0),
  security_deposit_cents bigint not null default 0 check (security_deposit_cents >= 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  is_system boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint room_categories_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint room_categories_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists room_categories_org_branch_slug_unique_active
  on public.room_categories (organization_id, hostel_branch_id, slug)
  where deleted_at is null;

create index if not exists room_categories_org_branch_idx
  on public.room_categories (organization_id, hostel_branch_id)
  where deleted_at is null;

create table if not exists public.room_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null check (char_length(trim(slug)) between 1 and 120),
  room_type_key text not null check (
    char_length(trim(room_type_key)) between 1 and 80
    and room_type_key ~ '^[a-z0-9][a-z0-9_-]{0,79}$'
  ),
  description text,
  default_capacity integer not null default 1 check (default_capacity > 0 and default_capacity <= 100),
  monthly_rate_cents bigint not null default 0 check (monthly_rate_cents >= 0),
  security_deposit_cents bigint not null default 0 check (security_deposit_cents >= 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  bed_label_pattern text not null default '{ROOM}-B{NN}',
  is_system boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint room_templates_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint room_templates_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists room_templates_org_branch_slug_unique_active
  on public.room_templates (organization_id, hostel_branch_id, slug)
  where deleted_at is null;

create index if not exists room_templates_org_branch_type_idx
  on public.room_templates (organization_id, hostel_branch_id, room_type_key)
  where deleted_at is null;

alter table public.rooms
  add column if not exists category_id uuid,
  add column if not exists floor_id uuid,
  add column if not exists template_id uuid,
  add column if not exists room_type text not null default 'standard',
  add column if not exists monthly_rate_cents bigint not null default 0,
  add column if not exists security_deposit_cents bigint not null default 0,
  add column if not exists currency_code text not null default 'INR',
  add column if not exists pricing_metadata jsonb not null default '{}'::jsonb;

alter table public.room_beds
  add column if not exists sort_order integer not null default 0,
  add column if not exists status_reason text;

do $$
begin
  alter table public.rooms drop constraint if exists rooms_status_check;
  alter table public.rooms drop constraint if exists rooms_room_type_check;
  alter table public.rooms drop constraint if exists rooms_monthly_rate_check;
  alter table public.rooms drop constraint if exists rooms_security_deposit_check;
  alter table public.rooms drop constraint if exists rooms_currency_code_check;
  alter table public.room_beds drop constraint if exists room_beds_status_check;
  alter table public.room_beds drop constraint if exists room_beds_sort_order_check;
end $$;

alter table public.rooms
  add constraint rooms_status_check
    check (status in ('active', 'maintenance', 'unavailable', 'inactive')),
  add constraint rooms_room_type_check
    check (
      char_length(trim(room_type)) between 1 and 80
      and room_type ~ '^[a-z0-9][a-z0-9_-]{0,79}$'
    ),
  add constraint rooms_monthly_rate_check
    check (monthly_rate_cents >= 0),
  add constraint rooms_security_deposit_check
    check (security_deposit_cents >= 0),
  add constraint rooms_currency_code_check
    check (currency_code ~ '^[A-Z]{3}$');

alter table public.room_beds
  add constraint room_beds_status_check
    check (status in ('available', 'occupied', 'reserved', 'maintenance', 'unavailable', 'inactive')),
  add constraint room_beds_sort_order_check
    check (sort_order >= 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_category_org_branch_fk'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_category_org_branch_fk
      foreign key (category_id, organization_id, hostel_branch_id)
      references public.room_categories (id, organization_id, hostel_branch_id)
      on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_floor_org_branch_fk'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_floor_org_branch_fk
      foreign key (floor_id, organization_id, hostel_branch_id)
      references public.hostel_floors (id, organization_id, hostel_branch_id)
      on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_template_org_branch_fk'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_template_org_branch_fk
      foreign key (template_id, organization_id, hostel_branch_id)
      references public.room_templates (id, organization_id, hostel_branch_id)
      on delete restrict;
  end if;
end $$;

create index if not exists rooms_org_branch_type_status_idx
  on public.rooms (organization_id, hostel_branch_id, room_type, status)
  where deleted_at is null;

create index if not exists rooms_floor_idx
  on public.rooms (floor_id)
  where deleted_at is null and floor_id is not null;

create index if not exists rooms_template_idx
  on public.rooms (template_id)
  where deleted_at is null and template_id is not null;

create index if not exists rooms_category_idx
  on public.rooms (category_id)
  where deleted_at is null and category_id is not null;

create index if not exists room_beds_room_status_sort_idx
  on public.room_beds (room_id, status, sort_order)
  where deleted_at is null;

create index if not exists student_room_assignments_active_room_bed_idx
  on public.student_room_assignments (organization_id, hostel_branch_id, room_id, bed_id)
  where deleted_at is null and status = 'active' and end_date is null;

create index if not exists student_room_assignments_student_history_idx
  on public.student_room_assignments (student_id, created_at desc)
  where deleted_at is null;

create or replace function private.sync_room_bed_status_from_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.bed_id is not null then
    update public.room_beds rb
      set status = 'available',
          updated_by = coalesce(new.updated_by, old.updated_by)
    where rb.id = old.bed_id
      and rb.status = 'occupied'
      and rb.deleted_at is null
      and not exists (
        select 1
        from public.student_room_assignments sra
        where sra.bed_id = old.bed_id
          and sra.status = 'active'
          and sra.end_date is null
          and sra.deleted_at is null
          and sra.id <> old.id
      );
  end if;

  if new.bed_id is not null
    and new.status = 'active'
    and new.end_date is null
    and new.deleted_at is null then
    update public.room_beds rb
      set status = 'occupied',
          updated_by = new.updated_by
    where rb.id = new.bed_id
      and rb.status in ('available', 'reserved', 'occupied')
      and rb.deleted_at is null;
  end if;

  return new;
end;
$$;

create or replace function public.create_room_with_beds(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_room_code text,
  p_name text,
  p_floor_id uuid default null,
  p_floor text default null,
  p_capacity integer default 1,
  p_room_type text default 'standard',
  p_template_id uuid default null,
  p_category_id uuid default null,
  p_monthly_rate_cents bigint default 0,
  p_security_deposit_cents bigint default 0,
  p_currency_code text default 'INR',
  p_status text default 'active',
  p_bed_labels jsonb default '[]'::jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
  v_bed_ids uuid[] := array[]::uuid[];
  v_bed_id uuid;
  v_bed_label text;
  v_index integer;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  if p_capacity < 1 or p_capacity > 100 then
    raise exception 'Room capacity is outside the allowed range' using errcode = '23514';
  end if;

  if jsonb_typeof(coalesce(p_bed_labels, '[]'::jsonb)) <> 'array' then
    raise exception 'Bed labels must be an array'
      using errcode = '23514';
  end if;

  if jsonb_array_length(coalesce(p_bed_labels, '[]'::jsonb)) > p_capacity then
    raise exception 'Bed labels cannot exceed room capacity'
      using errcode = '23514';
  end if;

  if p_floor_id is not null and not exists (
    select 1
    from public.hostel_floors hf
    where hf.id = p_floor_id
      and hf.organization_id = p_organization_id
      and hf.hostel_branch_id = p_hostel_branch_id
      and hf.deleted_at is null
  ) then
    raise exception 'Floor does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  if p_template_id is not null and not exists (
    select 1
    from public.room_templates rt
    where rt.id = p_template_id
      and rt.organization_id = p_organization_id
      and rt.hostel_branch_id = p_hostel_branch_id
      and rt.deleted_at is null
  ) then
    raise exception 'Room template does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.room_categories rc
    where rc.id = p_category_id
      and rc.organization_id = p_organization_id
      and rc.hostel_branch_id = p_hostel_branch_id
      and rc.deleted_at is null
  ) then
    raise exception 'Room category does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  insert into public.rooms (
    organization_id,
    hostel_branch_id,
    category_id,
    floor_id,
    template_id,
    room_code,
    name,
    floor,
    capacity,
    room_type,
    monthly_rate_cents,
    security_deposit_cents,
    currency_code,
    status,
    metadata,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    p_category_id,
    p_floor_id,
    p_template_id,
    trim(p_room_code),
    trim(p_name),
    nullif(trim(coalesce(p_floor, '')), ''),
    p_capacity,
    p_room_type,
    p_monthly_rate_cents,
    p_security_deposit_cents,
    upper(p_currency_code),
    p_status,
    p_metadata,
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_room_id;

  for v_index in 1..p_capacity loop
    v_bed_label := nullif(trim(coalesce(p_bed_labels ->> (v_index - 1), '')), '');

    if v_bed_label is null then
      v_bed_label := trim(p_room_code) || '-B' || lpad(v_index::text, 2, '0');
    end if;

    insert into public.room_beds (
      organization_id,
      hostel_branch_id,
      room_id,
      bed_code,
      sort_order,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      v_room_id,
      v_bed_label,
      v_index,
      p_actor_user_id,
      p_actor_user_id
    )
    returning id into v_bed_id;

    v_bed_ids := array_append(v_bed_ids, v_bed_id);
  end loop;

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
    'room.create',
    'rooms',
    v_room_id,
    jsonb_build_object(
      'bed_count', p_capacity,
      'room_type', p_room_type,
      'floor_id', p_floor_id,
      'template_id', p_template_id
    )
  );

  return jsonb_build_object(
    'roomId', v_room_id,
    'bedIds', to_jsonb(v_bed_ids)
  );
end;
$$;

create or replace function public.update_room_configuration(
  p_actor_user_id uuid,
  p_room_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_room_code text,
  p_name text,
  p_floor_id uuid default null,
  p_floor text default null,
  p_capacity integer default 1,
  p_room_type text default 'standard',
  p_template_id uuid default null,
  p_category_id uuid default null,
  p_monthly_rate_cents bigint default 0,
  p_security_deposit_cents bigint default 0,
  p_currency_code text default 'INR',
  p_status text default 'active',
  p_bed_labels jsonb default '[]'::jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_bed_count integer;
  v_bed_id uuid;
  v_bed_ids uuid[] := array[]::uuid[];
  v_bed_label text;
  v_index integer;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.organization_id = p_organization_id
      and r.hostel_branch_id = p_hostel_branch_id
      and r.deleted_at is null
  ) then
    raise exception 'Room was not found in this tenant branch'
      using errcode = '02000';
  end if;

  if p_capacity < 1 or p_capacity > 100 then
    raise exception 'Room capacity is outside the allowed range' using errcode = '23514';
  end if;

  if jsonb_typeof(coalesce(p_bed_labels, '[]'::jsonb)) <> 'array' then
    raise exception 'Bed labels must be an array'
      using errcode = '23514';
  end if;

  if jsonb_array_length(coalesce(p_bed_labels, '[]'::jsonb)) > p_capacity then
    raise exception 'Bed labels cannot exceed room capacity'
      using errcode = '23514';
  end if;

  if p_floor_id is not null and not exists (
    select 1
    from public.hostel_floors hf
    where hf.id = p_floor_id
      and hf.organization_id = p_organization_id
      and hf.hostel_branch_id = p_hostel_branch_id
      and hf.deleted_at is null
  ) then
    raise exception 'Floor does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  if p_template_id is not null and not exists (
    select 1
    from public.room_templates rt
    where rt.id = p_template_id
      and rt.organization_id = p_organization_id
      and rt.hostel_branch_id = p_hostel_branch_id
      and rt.deleted_at is null
  ) then
    raise exception 'Room template does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.room_categories rc
    where rc.id = p_category_id
      and rc.organization_id = p_organization_id
      and rc.hostel_branch_id = p_hostel_branch_id
      and rc.deleted_at is null
  ) then
    raise exception 'Room category does not belong to this tenant branch'
      using errcode = '23503';
  end if;

  select count(*)::integer
    into v_existing_bed_count
  from public.room_beds rb
  where rb.room_id = p_room_id
    and rb.organization_id = p_organization_id
    and rb.hostel_branch_id = p_hostel_branch_id
    and rb.deleted_at is null;

  if v_existing_bed_count > p_capacity then
    raise exception 'Room capacity cannot be lower than existing active bed count'
      using errcode = '23514';
  end if;

  update public.rooms
    set category_id = p_category_id,
        floor_id = p_floor_id,
        template_id = p_template_id,
        room_code = trim(p_room_code),
        name = trim(p_name),
        floor = nullif(trim(coalesce(p_floor, '')), ''),
        capacity = p_capacity,
        room_type = p_room_type,
        monthly_rate_cents = p_monthly_rate_cents,
        security_deposit_cents = p_security_deposit_cents,
        currency_code = upper(p_currency_code),
        status = p_status,
        metadata = metadata || p_metadata,
        updated_by = p_actor_user_id
  where id = p_room_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and deleted_at is null;

  for v_index in (v_existing_bed_count + 1)..p_capacity loop
    v_bed_label := nullif(trim(coalesce(p_bed_labels ->> (v_index - 1), '')), '');

    if v_bed_label is null then
      v_bed_label := trim(p_room_code) || '-B' || lpad(v_index::text, 2, '0');
    end if;

    insert into public.room_beds (
      organization_id,
      hostel_branch_id,
      room_id,
      bed_code,
      sort_order,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      p_room_id,
      v_bed_label,
      v_index,
      p_actor_user_id,
      p_actor_user_id
    )
    returning id into v_bed_id;

    v_bed_ids := array_append(v_bed_ids, v_bed_id);
  end loop;

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
    'room.update',
    'rooms',
    p_room_id,
    jsonb_build_object(
      'capacity', p_capacity,
      'generated_bed_ids', to_jsonb(v_bed_ids),
      'floor_id', p_floor_id,
      'template_id', p_template_id
    )
  );

  return jsonb_build_object(
    'roomId', p_room_id,
    'generatedBedIds', to_jsonb(v_bed_ids)
  );
end;
$$;

create or replace function public.create_room_bed(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_room_id uuid,
  p_bed_code text,
  p_status text default 'available',
  p_sort_order integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bed_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.organization_id = p_organization_id
      and r.hostel_branch_id = p_hostel_branch_id
      and r.deleted_at is null
  ) then
    raise exception 'Room was not found in this tenant branch' using errcode = '23503';
  end if;

  if p_status = 'occupied' then
    raise exception 'Beds become occupied through student assignments'
      using errcode = '23514';
  end if;

  insert into public.room_beds (
    organization_id,
    hostel_branch_id,
    room_id,
    bed_code,
    status,
    sort_order,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    p_room_id,
    trim(p_bed_code),
    p_status,
    p_sort_order,
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_bed_id;

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
    'room_bed.create',
    'room_beds',
    v_bed_id,
    jsonb_build_object('room_id', p_room_id, 'bed_code', p_bed_code)
  );

  return jsonb_build_object('bedId', v_bed_id);
end;
$$;

create or replace function public.update_room_bed_status(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_bed_id uuid,
  p_status text,
  p_status_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  select rb.room_id
    into v_room_id
  from public.room_beds rb
  where rb.id = p_bed_id
    and rb.organization_id = p_organization_id
    and rb.hostel_branch_id = p_hostel_branch_id
    and rb.deleted_at is null;

  if v_room_id is null then
    raise exception 'Bed was not found in this tenant branch' using errcode = '02000';
  end if;

  if exists (
      select 1
      from public.student_room_assignments sra
      where sra.bed_id = p_bed_id
        and sra.status = 'active'
        and sra.end_date is null
        and sra.deleted_at is null
    ) and p_status <> 'occupied' then
    raise exception 'Occupied beds must be unassigned before changing availability'
      using errcode = '23514';
  end if;

  if p_status = 'occupied' and not exists (
    select 1
    from public.student_room_assignments sra
    where sra.bed_id = p_bed_id
      and sra.status = 'active'
      and sra.end_date is null
      and sra.deleted_at is null
  ) then
    raise exception 'Beds become occupied through student assignments'
      using errcode = '23514';
  end if;

  update public.room_beds
    set status = p_status,
        status_reason = nullif(trim(coalesce(p_status_reason, '')), ''),
        updated_by = p_actor_user_id
  where id = p_bed_id
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
    entity_id,
    metadata
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'room_bed.status_update',
    'room_beds',
    p_bed_id,
    jsonb_build_object('room_id', v_room_id, 'status', p_status, 'reason', p_status_reason)
  );

  return jsonb_build_object('bedId', p_bed_id, 'roomId', v_room_id);
end;
$$;

create or replace function public.unassign_student_bed(
  p_actor_user_id uuid,
  p_assignment_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_room_id uuid;
  v_bed_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  update public.student_room_assignments
    set status = 'completed',
        end_date = current_date,
        metadata = metadata || jsonb_build_object('unassign_reason', p_reason),
        updated_by = p_actor_user_id
  where id = p_assignment_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and status = 'active'
    and end_date is null
    and deleted_at is null
  returning student_id, room_id, bed_id into v_student_id, v_room_id, v_bed_id;

  if v_student_id is null then
    raise exception 'Active assignment was not found' using errcode = '02000';
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
    'student.unassign_bed',
    'student_room_assignments',
    p_assignment_id,
    jsonb_build_object(
      'student_id', v_student_id,
      'room_id', v_room_id,
      'bed_id', v_bed_id,
      'reason', p_reason
    )
  );

  return jsonb_build_object(
    'assignmentId', p_assignment_id,
    'studentId', v_student_id,
    'roomId', v_room_id,
    'bedId', v_bed_id
  );
end;
$$;

create or replace function public.transfer_student_bed(
  p_actor_user_id uuid,
  p_student_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_target_room_id uuid,
  p_target_bed_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_assignment_id uuid;
  v_old_room_id uuid;
  v_old_bed_id uuid;
  v_new_assignment_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_student_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Room management permission is required' using errcode = '42501';
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

  if not exists (
    select 1
    from public.room_beds rb
    where rb.id = p_target_bed_id
      and rb.room_id = p_target_room_id
      and rb.organization_id = p_organization_id
      and rb.hostel_branch_id = p_hostel_branch_id
      and rb.status = 'available'
      and rb.deleted_at is null
  ) then
    raise exception 'Target bed is not available in this tenant branch' using errcode = '23503';
  end if;

  update public.student_room_assignments
    set status = 'completed',
        end_date = current_date,
        metadata = metadata || jsonb_build_object(
          'transfer_reason', p_reason,
          'transferred_to_room_id', p_target_room_id,
          'transferred_to_bed_id', p_target_bed_id
        ),
        updated_by = p_actor_user_id
  where student_id = p_student_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and status = 'active'
    and end_date is null
    and deleted_at is null
  returning id, room_id, bed_id into v_old_assignment_id, v_old_room_id, v_old_bed_id;

  insert into public.student_room_assignments (
    organization_id,
    hostel_branch_id,
    student_id,
    room_id,
    bed_id,
    metadata,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    p_student_id,
    p_target_room_id,
    p_target_bed_id,
    jsonb_build_object(
      'transfer_reason', p_reason,
      'transferred_from_assignment_id', v_old_assignment_id,
      'transferred_from_room_id', v_old_room_id,
      'transferred_from_bed_id', v_old_bed_id
    ),
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_new_assignment_id;

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
    'student.transfer_bed',
    'student_room_assignments',
    v_new_assignment_id,
    jsonb_build_object(
      'student_id', p_student_id,
      'old_assignment_id', v_old_assignment_id,
      'old_room_id', v_old_room_id,
      'old_bed_id', v_old_bed_id,
      'target_room_id', p_target_room_id,
      'target_bed_id', p_target_bed_id,
      'reason', p_reason
    )
  );

  return jsonb_build_object(
    'assignmentId', v_new_assignment_id,
    'previousAssignmentId', v_old_assignment_id
  );
end;
$$;

create or replace function public.soft_delete_room(
  p_actor_user_id uuid,
  p_room_id uuid,
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
    raise exception 'Room management permission is required' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.student_room_assignments sra
    where sra.room_id = p_room_id
      and sra.organization_id = p_organization_id
      and sra.hostel_branch_id = p_hostel_branch_id
      and sra.status = 'active'
      and sra.end_date is null
      and sra.deleted_at is null
  ) then
    raise exception 'Rooms with active student assignments cannot be deleted'
      using errcode = '23514';
  end if;

  update public.rooms
    set deleted_at = coalesce(deleted_at, now()),
        status = 'inactive',
        updated_by = p_actor_user_id
  where id = p_room_id
    and organization_id = p_organization_id
    and hostel_branch_id = p_hostel_branch_id
    and deleted_at is null;

  if not found then
    raise exception 'Room was not found' using errcode = '02000';
  end if;

  update public.room_beds
    set deleted_at = coalesce(deleted_at, now()),
        status = 'inactive',
        updated_by = p_actor_user_id
  where room_id = p_room_id
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
    'room.soft_delete',
    'rooms',
    p_room_id
  );

  return jsonb_build_object('roomId', p_room_id);
end;
$$;

drop trigger if exists set_room_categories_updated_at on public.room_categories;
create trigger set_room_categories_updated_at
  before update on public.room_categories
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_hostel_floors_updated_at on public.hostel_floors;
create trigger set_hostel_floors_updated_at
  before update on public.hostel_floors
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_room_templates_updated_at on public.room_templates;
create trigger set_room_templates_updated_at
  before update on public.room_templates
  for each row
  execute function private.set_updated_at();

drop trigger if exists sync_room_bed_status_from_assignment on public.student_room_assignments;
create trigger sync_room_bed_status_from_assignment
  after insert or update of bed_id, status, end_date, deleted_at
  on public.student_room_assignments
  for each row
  execute function private.sync_room_bed_status_from_assignment();

update public.room_beds rb
  set status = 'occupied'
where rb.deleted_at is null
  and rb.status = 'available'
  and exists (
    select 1
    from public.student_room_assignments sra
    where sra.bed_id = rb.id
      and sra.status = 'active'
      and sra.end_date is null
      and sra.deleted_at is null
  );

update public.room_beds rb
  set status = 'available'
where rb.deleted_at is null
  and rb.status = 'occupied'
  and not exists (
    select 1
    from public.student_room_assignments sra
    where sra.bed_id = rb.id
      and sra.status = 'active'
      and sra.end_date is null
      and sra.deleted_at is null
  );

alter table public.room_categories enable row level security;
alter table public.room_categories force row level security;
alter table public.hostel_floors enable row level security;
alter table public.hostel_floors force row level security;
alter table public.room_templates enable row level security;
alter table public.room_templates force row level security;

drop policy if exists "hostel_floors_select_branch_members" on public.hostel_floors;
create policy "hostel_floors_select_branch_members"
  on public.hostel_floors
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_hostel_branch(organization_id, hostel_branch_id))
  );

drop policy if exists "hostel_floors_manage_student_admins" on public.hostel_floors;
create policy "hostel_floors_manage_student_admins"
  on public.hostel_floors
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "room_categories_select_branch_members" on public.room_categories;
create policy "room_categories_select_branch_members"
  on public.room_categories
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_hostel_branch(organization_id, hostel_branch_id))
  );

drop policy if exists "room_categories_manage_student_admins" on public.room_categories;
create policy "room_categories_manage_student_admins"
  on public.room_categories
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

drop policy if exists "room_templates_select_branch_members" on public.room_templates;
create policy "room_templates_select_branch_members"
  on public.room_templates
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_hostel_branch(organization_id, hostel_branch_id))
  );

drop policy if exists "room_templates_manage_student_admins" on public.room_templates;
create policy "room_templates_manage_student_admins"
  on public.room_templates
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_student_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_student_admin(organization_id, hostel_branch_id)));

revoke all on public.hostel_floors from anon;
revoke all on public.room_categories from anon;
revoke all on public.room_templates from anon;
grant select, insert, update on public.hostel_floors to authenticated;
grant select, insert, update on public.room_categories to authenticated;
grant select, insert, update on public.room_templates to authenticated;
grant all on public.hostel_floors to service_role;
grant all on public.room_categories to service_role;
grant all on public.room_templates to service_role;

grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

grant execute on function public.create_room_with_beds(
  uuid,
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  integer,
  text,
  uuid,
  uuid,
  bigint,
  bigint,
  text,
  text,
  jsonb,
  jsonb
) to authenticated;

grant execute on function public.update_room_configuration(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  integer,
  text,
  uuid,
  uuid,
  bigint,
  bigint,
  text,
  text,
  jsonb,
  jsonb
) to authenticated;

grant execute on function public.create_room_bed(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  integer
) to authenticated;

grant execute on function public.update_room_bed_status(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text
) to authenticated;

grant execute on function public.unassign_student_bed(
  uuid,
  uuid,
  uuid,
  uuid,
  text
) to authenticated;

grant execute on function public.transfer_student_bed(
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  uuid,
  text
) to authenticated;

grant execute on function public.soft_delete_room(
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;
