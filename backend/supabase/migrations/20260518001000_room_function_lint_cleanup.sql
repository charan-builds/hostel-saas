-- Re-create room capacity RPCs without redundant PL/pgSQL loop variable
-- declarations. PostgreSQL creates integer FOR-loop variables implicitly, so
-- declaring the same names only produced lint warnings without changing runtime
-- behavior.

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
