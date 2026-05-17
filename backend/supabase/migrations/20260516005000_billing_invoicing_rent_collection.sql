create table if not exists public.billing_invoice_counters (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  fiscal_year integer not null check (fiscal_year between 2000 and 2200),
  next_value bigint not null default 1 check (next_value > 0),
  updated_at timestamptz not null default now(),
  primary key (organization_id, hostel_branch_id, fiscal_year),
  constraint billing_invoice_counters_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create table if not exists public.billing_receipt_counters (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  fiscal_year integer not null check (fiscal_year between 2000 and 2200),
  next_value bigint not null default 1 check (next_value > 0),
  updated_at timestamptz not null default now(),
  primary key (organization_id, hostel_branch_id, fiscal_year),
  constraint billing_receipt_counters_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'student_room_assignments_id_org_branch_unique'
      and conrelid = 'public.student_room_assignments'::regclass
  ) then
    alter table public.student_room_assignments
      add constraint student_room_assignments_id_org_branch_unique
      unique (id, organization_id, hostel_branch_id);
  end if;
end $$;

create table if not exists public.rent_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  code text not null check (char_length(trim(code)) between 1 and 40),
  name text not null check (char_length(trim(name)) between 1 and 160),
  scope_type text not null default 'branch' check (scope_type in ('branch', 'room', 'bed', 'student')),
  student_id uuid,
  room_id uuid,
  bed_id uuid,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly')),
  amount_cents bigint not null check (amount_cents >= 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  due_day integer not null default 5 check (due_day between 1 and 28),
  starts_on date not null default current_date,
  ends_on date,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  penalty_config jsonb not null default '{}'::jsonb,
  discount_config jsonb not null default '{}'::jsonb,
  cashfree_config jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint rent_plans_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint rent_plans_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint rent_plans_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint rent_plans_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint rent_plans_bed_fk
    foreign key (bed_id, organization_id, hostel_branch_id)
    references public.room_beds (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint rent_plans_date_order check (ends_on is null or ends_on >= starts_on),
  constraint rent_plans_scope_shape check (
    (
      scope_type = 'branch'
      and student_id is null
      and room_id is null
      and bed_id is null
    )
    or (
      scope_type = 'room'
      and student_id is null
      and room_id is not null
      and bed_id is null
    )
    or (
      scope_type = 'bed'
      and student_id is null
      and room_id is not null
      and bed_id is not null
    )
    or (
      scope_type = 'student'
      and student_id is not null
      and room_id is null
      and bed_id is null
    )
  )
);

create unique index if not exists rent_plans_org_branch_code_unique_active
  on public.rent_plans (organization_id, hostel_branch_id, code)
  where deleted_at is null;

create index if not exists rent_plans_org_branch_scope_idx
  on public.rent_plans (organization_id, hostel_branch_id, scope_type, status)
  where deleted_at is null;

create index if not exists rent_plans_room_bed_idx
  on public.rent_plans (room_id, bed_id)
  where deleted_at is null;

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  rent_plan_id uuid,
  room_id uuid,
  bed_id uuid,
  assignment_id uuid,
  invoice_number text not null,
  invoice_month date not null,
  issue_date date not null default current_date,
  due_date date not null,
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  penalty_cents bigint not null default 0 check (penalty_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  paid_cents bigint not null default 0 check (paid_cents >= 0),
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'pending' check (
    status in ('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'void')
  ),
  cashfree_order_id text,
  cashfree_payment_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint billing_invoices_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint billing_invoices_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint billing_invoices_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint billing_invoices_rent_plan_fk
    foreign key (rent_plan_id, organization_id, hostel_branch_id)
    references public.rent_plans (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint billing_invoices_room_fk
    foreign key (room_id, organization_id, hostel_branch_id)
    references public.rooms (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint billing_invoices_bed_fk
    foreign key (bed_id, organization_id, hostel_branch_id)
    references public.room_beds (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint billing_invoices_assignment_fk
    foreign key (assignment_id, organization_id, hostel_branch_id)
    references public.student_room_assignments (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint billing_invoices_month_start check (extract(day from invoice_month) = 1),
  constraint billing_invoices_total_math check (total_cents = greatest(subtotal_cents + penalty_cents - discount_cents, 0))
);

create unique index if not exists billing_invoices_number_unique_active
  on public.billing_invoices (organization_id, hostel_branch_id, invoice_number)
  where deleted_at is null;

create unique index if not exists billing_invoices_student_plan_month_unique_active
  on public.billing_invoices (
    organization_id,
    hostel_branch_id,
    student_id,
    rent_plan_id,
    invoice_month
  )
  where deleted_at is null and rent_plan_id is not null;

create index if not exists billing_invoices_org_branch_status_due_idx
  on public.billing_invoices (organization_id, hostel_branch_id, status, due_date)
  where deleted_at is null;

create index if not exists billing_invoices_student_month_idx
  on public.billing_invoices (student_id, invoice_month desc)
  where deleted_at is null;

create table if not exists public.billing_invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  invoice_id uuid not null,
  item_type text not null check (item_type in ('rent', 'penalty', 'discount', 'fine', 'adjustment')),
  description text not null check (char_length(trim(description)) between 1 and 255),
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_amount_cents bigint not null,
  amount_cents bigint not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint billing_invoice_items_invoice_fk
    foreign key (invoice_id, organization_id, hostel_branch_id)
    references public.billing_invoices (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint billing_invoice_items_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists billing_invoice_items_invoice_idx
  on public.billing_invoice_items (invoice_id);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  student_id uuid not null,
  receipt_number text not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  payment_method text not null check (
    payment_method in ('cash', 'upi', 'bank_transfer', 'card', 'cashfree', 'other')
  ),
  provider text,
  provider_reference text,
  received_at timestamptz not null default now(),
  status text not null default 'recorded' check (
    status in ('pending', 'recorded', 'completed', 'failed', 'refunded')
  ),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint billing_payments_id_org_branch_unique unique (id, organization_id, hostel_branch_id),
  constraint billing_payments_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint billing_payments_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists billing_payments_receipt_number_unique_active
  on public.billing_payments (organization_id, hostel_branch_id, receipt_number)
  where deleted_at is null;

create index if not exists billing_payments_student_received_idx
  on public.billing_payments (student_id, received_at desc)
  where deleted_at is null;

create table if not exists public.billing_payment_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  hostel_branch_id uuid not null,
  payment_id uuid not null,
  invoice_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint billing_payment_allocations_payment_fk
    foreign key (payment_id, organization_id, hostel_branch_id)
    references public.billing_payments (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint billing_payment_allocations_invoice_fk
    foreign key (invoice_id, organization_id, hostel_branch_id)
    references public.billing_invoices (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint billing_payment_allocations_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists billing_payment_allocations_payment_invoice_unique
  on public.billing_payment_allocations (payment_id, invoice_id);

create index if not exists billing_payment_allocations_invoice_idx
  on public.billing_payment_allocations (invoice_id);

create table if not exists public.billing_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  payment_id uuid not null unique,
  student_id uuid not null,
  receipt_number text not null,
  issued_at timestamptz not null default now(),
  amount_cents bigint not null check (amount_cents > 0),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint billing_receipts_payment_fk
    foreign key (payment_id, organization_id, hostel_branch_id)
    references public.billing_payments (id, organization_id, hostel_branch_id)
    on delete cascade,
  constraint billing_receipts_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint billing_receipts_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists billing_receipts_number_unique
  on public.billing_receipts (organization_id, hostel_branch_id, receipt_number);

create table if not exists public.billing_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid not null,
  invoice_month date not null,
  status text not null default 'completed' check (status in ('completed', 'failed', 'partial')),
  generated_count integer not null default 0 check (generated_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint billing_runs_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint billing_runs_month_start check (extract(day from invoice_month) = 1)
);

create unique index if not exists billing_runs_org_branch_month_unique
  on public.billing_runs (organization_id, hostel_branch_id, invoice_month);

create or replace function private.is_billing_admin(
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

create or replace function private.next_billing_invoice_number(
  target_organization_id uuid,
  target_hostel_branch_id uuid,
  target_date date
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fiscal_year integer := extract(year from target_date)::integer;
  v_next_value bigint;
begin
  insert into public.billing_invoice_counters (
    organization_id,
    hostel_branch_id,
    fiscal_year,
    next_value
  )
  values (
    target_organization_id,
    target_hostel_branch_id,
    v_fiscal_year,
    2
  )
  on conflict (organization_id, hostel_branch_id, fiscal_year)
  do update
    set next_value = public.billing_invoice_counters.next_value + 1,
        updated_at = now()
  returning next_value - 1 into v_next_value;

  return 'INV-' || v_fiscal_year::text || '-' || lpad(v_next_value::text, 6, '0');
end;
$$;

create or replace function private.next_billing_receipt_number(
  target_organization_id uuid,
  target_hostel_branch_id uuid,
  target_date date
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fiscal_year integer := extract(year from target_date)::integer;
  v_next_value bigint;
begin
  insert into public.billing_receipt_counters (
    organization_id,
    hostel_branch_id,
    fiscal_year,
    next_value
  )
  values (
    target_organization_id,
    target_hostel_branch_id,
    v_fiscal_year,
    2
  )
  on conflict (organization_id, hostel_branch_id, fiscal_year)
  do update
    set next_value = public.billing_receipt_counters.next_value + 1,
        updated_at = now()
  returning next_value - 1 into v_next_value;

  return 'RCPT-' || v_fiscal_year::text || '-' || lpad(v_next_value::text, 6, '0');
end;
$$;

create or replace function private.recalculate_invoice_status(target_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_due_date date;
  v_paid_cents bigint;
  v_status text;
  v_total_cents bigint;
begin
  select i.total_cents, i.due_date, i.status
    into v_total_cents, v_due_date, v_status
  from public.billing_invoices i
  where i.id = target_invoice_id
    and i.deleted_at is null
  for update;

  if v_total_cents is null or v_status = 'void' then
    return;
  end if;

  select coalesce(sum(a.amount_cents), 0)
    into v_paid_cents
  from public.billing_payment_allocations a
  join public.billing_payments p on p.id = a.payment_id
  where a.invoice_id = target_invoice_id
    and p.deleted_at is null
    and p.status in ('recorded', 'completed');

  update public.billing_invoices
    set paid_cents = least(v_paid_cents, v_total_cents),
        balance_cents = greatest(v_total_cents - least(v_paid_cents, v_total_cents), 0),
        status = case
          when greatest(v_total_cents - least(v_paid_cents, v_total_cents), 0) = 0 then 'paid'
          when v_paid_cents > 0 then 'partially_paid'
          when v_due_date < current_date then 'overdue'
          else 'pending'
        end,
        updated_at = now()
  where id = target_invoice_id
    and deleted_at is null
    and status <> 'void';
end;
$$;

create or replace function public.generate_monthly_rent_invoices(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_invoice_month date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment record;
  v_discount_cents bigint;
  v_due_date date;
  v_generated_count integer := 0;
  v_invoice_id uuid;
  v_invoice_month date := date_trunc('month', p_invoice_month)::date;
  v_period_end date;
  v_plan public.rent_plans%rowtype;
  v_skipped_count integer := 0;
  v_total_cents bigint;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_billing_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Billing permission is required' using errcode = '42501';
  end if;

  v_period_end := (v_invoice_month + interval '1 month - 1 day')::date;

  for v_assignment in
    select
      sra.id as assignment_id,
      sra.student_id,
      sra.room_id,
      sra.bed_id
    from public.student_room_assignments sra
    join public.students s on s.id = sra.student_id
    where sra.organization_id = p_organization_id
      and sra.hostel_branch_id = p_hostel_branch_id
      and sra.status = 'active'
      and sra.end_date is null
      and sra.deleted_at is null
      and s.deleted_at is null
      and s.status = 'active'
  loop
    select rp.*
      into v_plan
    from public.rent_plans rp
    where rp.organization_id = p_organization_id
      and rp.hostel_branch_id = p_hostel_branch_id
      and rp.status = 'active'
      and rp.deleted_at is null
      and rp.starts_on <= v_period_end
      and (rp.ends_on is null or rp.ends_on >= v_invoice_month)
      and (
        (rp.scope_type = 'student' and rp.student_id = v_assignment.student_id)
        or (rp.scope_type = 'bed' and rp.bed_id = v_assignment.bed_id)
        or (rp.scope_type = 'room' and rp.room_id = v_assignment.room_id)
        or (rp.scope_type = 'branch')
      )
    order by case rp.scope_type
      when 'student' then 1
      when 'bed' then 2
      when 'room' then 3
      else 4
    end
    limit 1;

    if v_plan.id is null then
      v_skipped_count := v_skipped_count + 1;
      continue;
    end if;

    v_discount_cents := case
      when (v_plan.discount_config ->> 'monthly_discount_cents') ~ '^[0-9]+$'
        then (v_plan.discount_config ->> 'monthly_discount_cents')::bigint
      else 0
    end;
    v_discount_cents := least(v_discount_cents, v_plan.amount_cents);
    v_total_cents := greatest(v_plan.amount_cents - v_discount_cents, 0);
    v_due_date := v_invoice_month + (v_plan.due_day - 1);
    v_invoice_id := null;

    insert into public.billing_invoices (
      organization_id,
      hostel_branch_id,
      student_id,
      rent_plan_id,
      room_id,
      bed_id,
      assignment_id,
      invoice_number,
      invoice_month,
      issue_date,
      due_date,
      subtotal_cents,
      discount_cents,
      penalty_cents,
      total_cents,
      paid_cents,
      balance_cents,
      currency_code,
      status,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      v_assignment.student_id,
      v_plan.id,
      v_assignment.room_id,
      v_assignment.bed_id,
      v_assignment.assignment_id,
      private.next_billing_invoice_number(p_organization_id, p_hostel_branch_id, v_invoice_month),
      v_invoice_month,
      current_date,
      v_due_date,
      v_plan.amount_cents,
      v_discount_cents,
      0,
      v_total_cents,
      0,
      v_total_cents,
      v_plan.currency_code,
      case when v_due_date < current_date then 'overdue' else 'pending' end,
      p_actor_user_id,
      p_actor_user_id
    )
    on conflict (
      organization_id,
      hostel_branch_id,
      student_id,
      rent_plan_id,
      invoice_month
    )
    where deleted_at is null and rent_plan_id is not null
    do nothing
    returning id into v_invoice_id;

    if v_invoice_id is null then
      v_skipped_count := v_skipped_count + 1;
      continue;
    end if;

    insert into public.billing_invoice_items (
      organization_id,
      hostel_branch_id,
      invoice_id,
      item_type,
      description,
      quantity,
      unit_amount_cents,
      amount_cents,
      created_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      v_invoice_id,
      'rent',
      'Monthly rent',
      1,
      v_plan.amount_cents,
      v_plan.amount_cents,
      p_actor_user_id
    );

    if v_discount_cents > 0 then
      insert into public.billing_invoice_items (
        organization_id,
        hostel_branch_id,
        invoice_id,
        item_type,
        description,
        quantity,
        unit_amount_cents,
        amount_cents,
        created_by
      )
      values (
        p_organization_id,
        p_hostel_branch_id,
        v_invoice_id,
        'discount',
        'Recurring discount',
        1,
        -v_discount_cents,
        -v_discount_cents,
        p_actor_user_id
      );
    end if;

    v_generated_count := v_generated_count + 1;
  end loop;

  insert into public.billing_runs (
    organization_id,
    hostel_branch_id,
    invoice_month,
    status,
    generated_count,
    skipped_count,
    created_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    v_invoice_month,
    'completed',
    v_generated_count,
    v_skipped_count,
    p_actor_user_id
  )
  on conflict (organization_id, hostel_branch_id, invoice_month)
  do update
    set generated_count = public.billing_runs.generated_count + excluded.generated_count,
        skipped_count = public.billing_runs.skipped_count + excluded.skipped_count,
        status = 'completed';

  insert into public.audit_logs (
    actor_user_id,
    organization_id,
    hostel_branch_id,
    app,
    action,
    entity_table,
    metadata
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'billing.generate_monthly_invoices',
    'billing_invoices',
    jsonb_build_object(
      'invoice_month', v_invoice_month,
      'generated_count', v_generated_count,
      'skipped_count', v_skipped_count
    )
  );

  return jsonb_build_object(
    'invoiceMonth', v_invoice_month,
    'generatedCount', v_generated_count,
    'skippedCount', v_skipped_count
  );
end;
$$;

create or replace function public.record_invoice_payment(
  p_actor_user_id uuid,
  p_invoice_id uuid,
  p_amount_cents bigint,
  p_payment_method text,
  p_received_at timestamptz default now(),
  p_provider_reference text default null,
  p_notes text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice public.billing_invoices%rowtype;
  v_payment_id uuid;
  v_receipt_id uuid;
  v_receipt_number text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Payment amount must be positive' using errcode = '23514';
  end if;

  select *
    into v_invoice
  from public.billing_invoices
  where id = p_invoice_id
    and deleted_at is null
  for update;

  if v_invoice.id is null then
    raise exception 'Invoice was not found' using errcode = '02000';
  end if;

  if not (select private.is_billing_admin(v_invoice.organization_id, v_invoice.hostel_branch_id)) then
    raise exception 'Billing permission is required' using errcode = '42501';
  end if;

  if v_invoice.status = 'void' then
    raise exception 'Void invoices cannot receive payments' using errcode = '23514';
  end if;

  perform private.recalculate_invoice_status(p_invoice_id);

  select *
    into v_invoice
  from public.billing_invoices
  where id = p_invoice_id
  for update;

  if p_amount_cents > v_invoice.balance_cents then
    raise exception 'Payment amount exceeds invoice balance' using errcode = '23514';
  end if;

  v_receipt_number := private.next_billing_receipt_number(
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    coalesce(p_received_at::date, current_date)
  );

  insert into public.billing_payments (
    organization_id,
    hostel_branch_id,
    student_id,
    receipt_number,
    amount_cents,
    currency_code,
    payment_method,
    provider,
    provider_reference,
    received_at,
    status,
    notes,
    metadata,
    created_by,
    updated_by
  )
  values (
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    v_invoice.student_id,
    v_receipt_number,
    p_amount_cents,
    v_invoice.currency_code,
    p_payment_method,
    case when p_payment_method = 'cashfree' then 'cashfree' else null end,
    nullif(trim(coalesce(p_provider_reference, '')), ''),
    coalesce(p_received_at, now()),
    'recorded',
    nullif(trim(coalesce(p_notes, '')), ''),
    p_metadata,
    p_actor_user_id,
    p_actor_user_id
  )
  returning id into v_payment_id;

  insert into public.billing_payment_allocations (
    organization_id,
    hostel_branch_id,
    payment_id,
    invoice_id,
    amount_cents,
    created_by
  )
  values (
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    v_payment_id,
    p_invoice_id,
    p_amount_cents,
    p_actor_user_id
  );

  insert into public.billing_receipts (
    organization_id,
    hostel_branch_id,
    payment_id,
    student_id,
    receipt_number,
    issued_at,
    amount_cents,
    currency_code,
    created_by
  )
  values (
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    v_payment_id,
    v_invoice.student_id,
    v_receipt_number,
    coalesce(p_received_at, now()),
    p_amount_cents,
    v_invoice.currency_code,
    p_actor_user_id
  )
  returning id into v_receipt_id;

  perform private.recalculate_invoice_status(p_invoice_id);

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
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'billing.payment.record',
    'billing_payments',
    v_payment_id,
    jsonb_build_object(
      'invoice_id', p_invoice_id,
      'receipt_id', v_receipt_id,
      'amount_cents', p_amount_cents,
      'payment_method', p_payment_method
    )
  );

  return jsonb_build_object(
    'paymentId', v_payment_id,
    'receiptId', v_receipt_id,
    'receiptNumber', v_receipt_number
  );
end;
$$;

create or replace function public.add_invoice_adjustment(
  p_actor_user_id uuid,
  p_invoice_id uuid,
  p_item_type text,
  p_description text,
  p_amount_cents bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice public.billing_invoices%rowtype;
  v_item_id uuid;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if p_item_type not in ('penalty', 'fine', 'discount', 'adjustment') then
    raise exception 'Unsupported adjustment type' using errcode = '23514';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Adjustment amount must be positive' using errcode = '23514';
  end if;

  select *
    into v_invoice
  from public.billing_invoices
  where id = p_invoice_id
    and deleted_at is null
  for update;

  if v_invoice.id is null then
    raise exception 'Invoice was not found' using errcode = '02000';
  end if;

  if not (select private.is_billing_admin(v_invoice.organization_id, v_invoice.hostel_branch_id)) then
    raise exception 'Billing permission is required' using errcode = '42501';
  end if;

  if v_invoice.status = 'void' then
    raise exception 'Void invoices cannot be adjusted' using errcode = '23514';
  end if;

  insert into public.billing_invoice_items (
    organization_id,
    hostel_branch_id,
    invoice_id,
    item_type,
    description,
    quantity,
    unit_amount_cents,
    amount_cents,
    created_by
  )
  values (
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    p_invoice_id,
    p_item_type,
    trim(p_description),
    1,
    case when p_item_type = 'discount' then -p_amount_cents else p_amount_cents end,
    case when p_item_type = 'discount' then -p_amount_cents else p_amount_cents end,
    p_actor_user_id
  )
  returning id into v_item_id;

  update public.billing_invoices
    set discount_cents = case
          when p_item_type = 'discount' then discount_cents + p_amount_cents
          else discount_cents
        end,
        penalty_cents = case
          when p_item_type in ('penalty', 'fine') then penalty_cents + p_amount_cents
          else penalty_cents
        end,
        subtotal_cents = case
          when p_item_type = 'adjustment' then subtotal_cents + p_amount_cents
          else subtotal_cents
        end,
        total_cents = greatest(
          case
            when p_item_type = 'adjustment' then subtotal_cents + p_amount_cents
            else subtotal_cents
          end
          + case
              when p_item_type in ('penalty', 'fine') then penalty_cents + p_amount_cents
              else penalty_cents
            end
          - case
              when p_item_type = 'discount' then discount_cents + p_amount_cents
              else discount_cents
            end,
          0
        ),
        updated_by = p_actor_user_id
  where id = p_invoice_id;

  perform private.recalculate_invoice_status(p_invoice_id);

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
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'billing.invoice.adjust',
    'billing_invoice_items',
    v_item_id,
    jsonb_build_object(
      'invoice_id', p_invoice_id,
      'item_type', p_item_type,
      'amount_cents', p_amount_cents
    )
  );

  return jsonb_build_object('invoiceItemId', v_item_id);
end;
$$;

create or replace function public.void_billing_invoice(
  p_actor_user_id uuid,
  p_invoice_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice public.billing_invoices%rowtype;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_invoice
  from public.billing_invoices
  where id = p_invoice_id
    and deleted_at is null
  for update;

  if v_invoice.id is null then
    raise exception 'Invoice was not found' using errcode = '02000';
  end if;

  if not (select private.is_billing_admin(v_invoice.organization_id, v_invoice.hostel_branch_id)) then
    raise exception 'Billing permission is required' using errcode = '42501';
  end if;

  if v_invoice.paid_cents > 0 then
    raise exception 'Paid invoices cannot be voided' using errcode = '23514';
  end if;

  update public.billing_invoices
    set status = 'void',
        balance_cents = 0,
        metadata = metadata || jsonb_build_object('void_reason', p_reason),
        updated_by = p_actor_user_id
  where id = p_invoice_id;

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
    v_invoice.organization_id,
    v_invoice.hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'billing.invoice.void',
    'billing_invoices',
    p_invoice_id,
    jsonb_build_object('reason', p_reason)
  );

  return jsonb_build_object('invoiceId', p_invoice_id);
end;
$$;

drop trigger if exists set_rent_plans_updated_at on public.rent_plans;
create trigger set_rent_plans_updated_at
  before update on public.rent_plans
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_billing_invoices_updated_at on public.billing_invoices;
create trigger set_billing_invoices_updated_at
  before update on public.billing_invoices
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_billing_payments_updated_at on public.billing_payments;
create trigger set_billing_payments_updated_at
  before update on public.billing_payments
  for each row
  execute function private.set_updated_at();

alter table public.billing_invoice_counters enable row level security;
alter table public.billing_receipt_counters enable row level security;
alter table public.rent_plans enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.billing_invoice_items enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_payment_allocations enable row level security;
alter table public.billing_receipts enable row level security;
alter table public.billing_runs enable row level security;

alter table public.billing_invoice_counters force row level security;
alter table public.billing_receipt_counters force row level security;
alter table public.rent_plans force row level security;
alter table public.billing_invoices force row level security;
alter table public.billing_invoice_items force row level security;
alter table public.billing_payments force row level security;
alter table public.billing_payment_allocations force row level security;
alter table public.billing_receipts force row level security;
alter table public.billing_runs force row level security;

drop policy if exists "billing_invoice_counters_no_direct_access" on public.billing_invoice_counters;
create policy "billing_invoice_counters_no_direct_access"
  on public.billing_invoice_counters
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "billing_receipt_counters_no_direct_access" on public.billing_receipt_counters;
create policy "billing_receipt_counters_no_direct_access"
  on public.billing_receipt_counters
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "rent_plans_select_billing_admins" on public.rent_plans;
create policy "rent_plans_select_billing_admins"
  on public.rent_plans
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_billing_admin(organization_id, hostel_branch_id))
  );

drop policy if exists "rent_plans_manage_billing_admins" on public.rent_plans;
create policy "rent_plans_manage_billing_admins"
  on public.rent_plans
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_billing_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_invoices_select_admin_or_self" on public.billing_invoices;
create policy "billing_invoices_select_admin_or_self"
  on public.billing_invoices
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_billing_admin(organization_id, hostel_branch_id))
      or exists (
        select 1
        from public.students s
        where s.id = student_id
          and s.user_profile_id = (select auth.uid())
          and s.deleted_at is null
      )
    )
  );

drop policy if exists "billing_invoices_manage_billing_admins" on public.billing_invoices;
create policy "billing_invoices_manage_billing_admins"
  on public.billing_invoices
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_billing_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_invoice_items_select_admin_or_self" on public.billing_invoice_items;
create policy "billing_invoice_items_select_admin_or_self"
  on public.billing_invoice_items
  for select
  to authenticated
  using (
    (select private.is_billing_admin(organization_id, hostel_branch_id))
    or exists (
      select 1
      from public.billing_invoices i
      join public.students s on s.id = i.student_id
      where i.id = invoice_id
        and s.user_profile_id = (select auth.uid())
        and i.deleted_at is null
        and s.deleted_at is null
    )
  );

drop policy if exists "billing_invoice_items_manage_billing_admins" on public.billing_invoice_items;
create policy "billing_invoice_items_manage_billing_admins"
  on public.billing_invoice_items
  for all
  to authenticated
  using ((select private.is_billing_admin(organization_id, hostel_branch_id)))
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_payments_select_admin_or_self" on public.billing_payments;
create policy "billing_payments_select_admin_or_self"
  on public.billing_payments
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_billing_admin(organization_id, hostel_branch_id))
      or exists (
        select 1
        from public.students s
        where s.id = student_id
          and s.user_profile_id = (select auth.uid())
          and s.deleted_at is null
      )
    )
  );

drop policy if exists "billing_payments_manage_billing_admins" on public.billing_payments;
create policy "billing_payments_manage_billing_admins"
  on public.billing_payments
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_billing_admin(organization_id, hostel_branch_id))
  )
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_payment_allocations_select_admin_or_self" on public.billing_payment_allocations;
create policy "billing_payment_allocations_select_admin_or_self"
  on public.billing_payment_allocations
  for select
  to authenticated
  using (
    (select private.is_billing_admin(organization_id, hostel_branch_id))
    or exists (
      select 1
      from public.billing_invoices i
      join public.students s on s.id = i.student_id
      where i.id = invoice_id
        and s.user_profile_id = (select auth.uid())
        and i.deleted_at is null
        and s.deleted_at is null
    )
  );

drop policy if exists "billing_payment_allocations_manage_billing_admins" on public.billing_payment_allocations;
create policy "billing_payment_allocations_manage_billing_admins"
  on public.billing_payment_allocations
  for all
  to authenticated
  using ((select private.is_billing_admin(organization_id, hostel_branch_id)))
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_receipts_select_admin_or_self" on public.billing_receipts;
create policy "billing_receipts_select_admin_or_self"
  on public.billing_receipts
  for select
  to authenticated
  using (
    (select private.is_billing_admin(organization_id, hostel_branch_id))
    or exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.user_profile_id = (select auth.uid())
        and s.deleted_at is null
    )
  );

drop policy if exists "billing_receipts_manage_billing_admins" on public.billing_receipts;
create policy "billing_receipts_manage_billing_admins"
  on public.billing_receipts
  for all
  to authenticated
  using ((select private.is_billing_admin(organization_id, hostel_branch_id)))
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_runs_select_billing_admins" on public.billing_runs;
create policy "billing_runs_select_billing_admins"
  on public.billing_runs
  for select
  to authenticated
  using ((select private.is_billing_admin(organization_id, hostel_branch_id)));

drop policy if exists "billing_runs_manage_billing_admins" on public.billing_runs;
create policy "billing_runs_manage_billing_admins"
  on public.billing_runs
  for all
  to authenticated
  using ((select private.is_billing_admin(organization_id, hostel_branch_id)))
  with check ((select private.is_billing_admin(organization_id, hostel_branch_id)));

revoke all on public.billing_invoice_counters from anon;
revoke all on public.billing_receipt_counters from anon;
revoke all on public.rent_plans from anon;
revoke all on public.billing_invoices from anon;
revoke all on public.billing_invoice_items from anon;
revoke all on public.billing_payments from anon;
revoke all on public.billing_payment_allocations from anon;
revoke all on public.billing_receipts from anon;
revoke all on public.billing_runs from anon;

grant select, insert, update on public.rent_plans to authenticated;
grant select, insert, update on public.billing_invoices to authenticated;
grant select, insert, update on public.billing_invoice_items to authenticated;
grant select, insert, update on public.billing_payments to authenticated;
grant select, insert, update on public.billing_payment_allocations to authenticated;
grant select, insert, update on public.billing_receipts to authenticated;
grant select, insert, update on public.billing_runs to authenticated;

grant all on public.billing_invoice_counters to service_role;
grant all on public.billing_receipt_counters to service_role;
grant all on public.rent_plans to service_role;
grant all on public.billing_invoices to service_role;
grant all on public.billing_invoice_items to service_role;
grant all on public.billing_payments to service_role;
grant all on public.billing_payment_allocations to service_role;
grant all on public.billing_receipts to service_role;
grant all on public.billing_runs to service_role;

grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

grant execute on function public.generate_monthly_rent_invoices(
  uuid,
  uuid,
  uuid,
  date
) to authenticated;

grant execute on function public.record_invoice_payment(
  uuid,
  uuid,
  bigint,
  text,
  timestamptz,
  text,
  text,
  jsonb
) to authenticated;

grant execute on function public.add_invoice_adjustment(
  uuid,
  uuid,
  text,
  text,
  bigint
) to authenticated;

grant execute on function public.void_billing_invoice(
  uuid,
  uuid,
  text
) to authenticated;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'billing:read',
        'billing:manage',
        'payment:record'
      ]
    ) as new_permission(permission)
  )
where role = 'admin'::public.app_role
  and deleted_at is null;
