alter table public.billing_payments
  add column if not exists idempotency_key text,
  add column if not exists provider_event_id text;

do $$
begin
  alter table public.billing_payments
    drop constraint if exists billing_payments_idempotency_key_length;
  alter table public.billing_payments
    drop constraint if exists billing_payments_provider_event_id_length;
end $$;

alter table public.billing_payments
  add constraint billing_payments_idempotency_key_length
    check (idempotency_key is null or char_length(trim(idempotency_key)) between 8 and 160),
  add constraint billing_payments_provider_event_id_length
    check (provider_event_id is null or char_length(trim(provider_event_id)) between 8 and 255);

create unique index if not exists billing_payments_idempotency_key_unique_active
  on public.billing_payments (organization_id, hostel_branch_id, payment_method, idempotency_key)
  where deleted_at is null and idempotency_key is not null;

create unique index if not exists billing_payments_provider_reference_unique_active
  on public.billing_payments (organization_id, hostel_branch_id, provider, provider_reference)
  where deleted_at is null and provider is not null and provider_reference is not null;

create unique index if not exists billing_payments_provider_event_unique_active
  on public.billing_payments (organization_id, hostel_branch_id, provider, provider_event_id)
  where deleted_at is null and provider is not null and provider_event_id is not null;

create index if not exists billing_payments_org_branch_received_idx
  on public.billing_payments (organization_id, hostel_branch_id, received_at desc)
  where deleted_at is null;

drop function if exists public.record_invoice_payment(
  uuid,
  uuid,
  bigint,
  text,
  timestamptz,
  text,
  text,
  jsonb
);

create or replace function private.billing_payment_result(
  target_payment_id uuid,
  target_invoice_id uuid,
  is_idempotent boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'paymentId', p.id,
    'receiptId', r.id,
    'receiptNumber', r.receipt_number,
    'idempotent', is_idempotent
  )
  from public.billing_payments p
  join public.billing_payment_allocations a
    on a.payment_id = p.id
    and a.invoice_id = target_invoice_id
  join public.billing_receipts r
    on r.payment_id = p.id
  where p.id = target_payment_id
    and p.deleted_at is null
  limit 1;
$$;

create or replace function public.record_invoice_payment(
  p_actor_user_id uuid,
  p_invoice_id uuid,
  p_amount_cents bigint,
  p_payment_method text,
  p_received_at timestamptz default now(),
  p_provider_reference text default null,
  p_notes text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null,
  p_provider text default null,
  p_provider_event_id text default null,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_payment_id uuid;
  v_invoice public.billing_invoices%rowtype;
  v_idempotency_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_payment_id uuid;
  v_provider text := nullif(trim(coalesce(p_provider, '')), '');
  v_provider_event_id text := nullif(trim(coalesce(p_provider_event_id, '')), '');
  v_provider_reference text := nullif(trim(coalesce(p_provider_reference, '')), '');
  v_receipt_id uuid;
  v_receipt_number text;
  v_result jsonb;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Payment amount must be positive' using errcode = '23514';
  end if;

  if p_payment_method not in ('cash', 'upi', 'bank_transfer', 'card', 'cashfree', 'other') then
    raise exception 'Unsupported payment method' using errcode = '23514';
  end if;

  if v_provider is null then
    v_provider := case
      when p_payment_method = 'cashfree' then 'cashfree'
      when v_provider_reference is not null or v_provider_event_id is not null then 'manual'
      else null
    end;
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

  if v_idempotency_key is not null then
    select p.id
      into v_existing_payment_id
    from public.billing_payments p
    join public.billing_payment_allocations a on a.payment_id = p.id
    where p.organization_id = v_invoice.organization_id
      and p.hostel_branch_id = v_invoice.hostel_branch_id
      and p.payment_method = p_payment_method
      and p.idempotency_key = v_idempotency_key
      and p.deleted_at is null
      and a.invoice_id = p_invoice_id
    limit 1;
  end if;

  if v_existing_payment_id is null and v_provider is not null and v_provider_reference is not null then
    select p.id
      into v_existing_payment_id
    from public.billing_payments p
    join public.billing_payment_allocations a on a.payment_id = p.id
    where p.organization_id = v_invoice.organization_id
      and p.hostel_branch_id = v_invoice.hostel_branch_id
      and p.provider = v_provider
      and p.provider_reference = v_provider_reference
      and p.deleted_at is null
      and a.invoice_id = p_invoice_id
    limit 1;
  end if;

  if v_existing_payment_id is null and v_provider is not null and v_provider_event_id is not null then
    select p.id
      into v_existing_payment_id
    from public.billing_payments p
    join public.billing_payment_allocations a on a.payment_id = p.id
    where p.organization_id = v_invoice.organization_id
      and p.hostel_branch_id = v_invoice.hostel_branch_id
      and p.provider = v_provider
      and p.provider_event_id = v_provider_event_id
      and p.deleted_at is null
      and a.invoice_id = p_invoice_id
    limit 1;
  end if;

  if v_existing_payment_id is not null then
    v_result := private.billing_payment_result(v_existing_payment_id, p_invoice_id, true);

    if v_result is not null then
      return v_result;
    end if;
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

  begin
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
      provider_event_id,
      idempotency_key,
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
      v_provider,
      v_provider_reference,
      v_provider_event_id,
      v_idempotency_key,
      coalesce(p_received_at, now()),
      'recorded',
      nullif(trim(coalesce(p_notes, '')), ''),
      coalesce(p_metadata, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('request_id', p_request_id)),
      p_actor_user_id,
      p_actor_user_id
    )
    returning id into v_payment_id;
  exception
    when unique_violation then
      select p.id
        into v_existing_payment_id
      from public.billing_payments p
      join public.billing_payment_allocations a on a.payment_id = p.id
      where p.organization_id = v_invoice.organization_id
        and p.hostel_branch_id = v_invoice.hostel_branch_id
        and p.deleted_at is null
        and a.invoice_id = p_invoice_id
        and (
          (v_idempotency_key is not null and p.payment_method = p_payment_method and p.idempotency_key = v_idempotency_key)
          or (v_provider is not null and v_provider_reference is not null and p.provider = v_provider and p.provider_reference = v_provider_reference)
          or (v_provider is not null and v_provider_event_id is not null and p.provider = v_provider and p.provider_event_id = v_provider_event_id)
        )
      limit 1;

      v_result := private.billing_payment_result(v_existing_payment_id, p_invoice_id, true);

      if v_result is not null then
        return v_result;
      end if;

      raise;
  end;

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
    request_id,
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
    p_request_id,
    jsonb_build_object(
      'invoice_id', p_invoice_id,
      'receipt_id', v_receipt_id,
      'amount_cents', p_amount_cents,
      'payment_method', p_payment_method,
      'provider', v_provider,
      'has_idempotency_key', v_idempotency_key is not null
    )
  );

  return jsonb_build_object(
    'paymentId', v_payment_id,
    'receiptId', v_receipt_id,
    'receiptNumber', v_receipt_number,
    'idempotent', false
  );
end;
$$;

grant execute on function public.record_invoice_payment(
  uuid,
  uuid,
  bigint,
  text,
  timestamptz,
  text,
  text,
  jsonb,
  text,
  text,
  text,
  text
) to authenticated;

create table if not exists public.analytics_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  job_type text not null default 'monthly_branch_rollups'
    check (job_type in ('monthly_branch_rollups')),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  requested_by uuid references auth.users(id) on delete set null,
  locked_by text,
  locked_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text,
  last_error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint analytics_refresh_jobs_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists analytics_refresh_jobs_active_unique
  on public.analytics_refresh_jobs (
    organization_id,
    coalesce(hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
    job_type
  )
  where status in ('queued', 'running');

create index if not exists analytics_refresh_jobs_status_created_idx
  on public.analytics_refresh_jobs (status, created_at)
  where status in ('queued', 'running');

create index if not exists analytics_refresh_jobs_org_created_idx
  on public.analytics_refresh_jobs (organization_id, created_at desc);

drop trigger if exists set_analytics_refresh_jobs_updated_at on public.analytics_refresh_jobs;
create trigger set_analytics_refresh_jobs_updated_at
  before update on public.analytics_refresh_jobs
  for each row
  execute function private.set_updated_at();

alter table public.analytics_refresh_jobs enable row level security;
alter table public.analytics_refresh_jobs force row level security;

drop policy if exists "analytics_refresh_jobs_select_admins" on public.analytics_refresh_jobs;
create policy "analytics_refresh_jobs_select_admins"
  on public.analytics_refresh_jobs
  for select
  to authenticated
  using (
    private.is_analytics_admin(organization_id, hostel_branch_id)
  );

drop policy if exists "analytics_refresh_jobs_insert_admins" on public.analytics_refresh_jobs;
create policy "analytics_refresh_jobs_insert_admins"
  on public.analytics_refresh_jobs
  for insert
  to authenticated
  with check (
    requested_by = (select auth.uid())
    and private.is_analytics_admin(organization_id, hostel_branch_id)
  );

drop policy if exists "analytics_refresh_jobs_update_service_role" on public.analytics_refresh_jobs;
create policy "analytics_refresh_jobs_update_service_role"
  on public.analytics_refresh_jobs
  for update
  to service_role
  using (true)
  with check (true);

create or replace function public.request_analytics_refresh(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid default null,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job_id uuid;
  v_status text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if not (select private.is_analytics_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Analytics refresh permission is required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      'analytics_refresh:' || p_organization_id::text || ':' || coalesce(p_hostel_branch_id::text, 'all'),
      0
    )
  );

  select id, status
    into v_job_id, v_status
  from public.analytics_refresh_jobs
  where organization_id = p_organization_id
    and coalesce(hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(p_hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and job_type = 'monthly_branch_rollups'
    and status in ('queued', 'running')
  order by created_at desc
  limit 1;

  if v_job_id is null then
    insert into public.analytics_refresh_jobs (
      organization_id,
      hostel_branch_id,
      requested_by,
      metadata
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      p_actor_user_id,
      jsonb_strip_nulls(jsonb_build_object('request_id', p_request_id))
    )
    returning id, status into v_job_id, v_status;
  end if;

  insert into public.audit_logs (
    actor_user_id,
    organization_id,
    hostel_branch_id,
    app,
    action,
    entity_table,
    entity_id,
    request_id,
    metadata
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'analytics.snapshot.refresh_requested',
    'analytics_refresh_jobs',
    v_job_id,
    p_request_id,
    jsonb_build_object('status', v_status)
  );

  return jsonb_build_object(
    'jobId', v_job_id,
    'organizationId', p_organization_id,
    'hostelBranchId', p_hostel_branch_id,
    'status', v_status
  );
end;
$$;

create or replace function public.perform_analytics_refresh_job(
  p_job_id uuid,
  p_worker_id text default 'analytics-worker'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.analytics_refresh_jobs%rowtype;
begin
  if coalesce((select auth.role()), '') <> 'service_role' then
    raise exception 'Service role is required to run analytics refresh jobs' using errcode = '42501';
  end if;

  if not pg_try_advisory_xact_lock(hashtextextended('analytics_refresh:monthly_branch_rollups', 0)) then
    raise exception 'Analytics refresh is already running' using errcode = '55P03';
  end if;

  select *
    into v_job
  from public.analytics_refresh_jobs
  where id = p_job_id
    and status = 'queued'
  for update skip locked;

  if v_job.id is null then
    raise exception 'Queued analytics refresh job was not found' using errcode = '02000';
  end if;

  update public.analytics_refresh_jobs
    set status = 'running',
        attempts = attempts + 1,
        locked_by = p_worker_id,
        locked_at = now(),
        last_error_code = null,
        last_error_message = null
  where id = v_job.id;

  begin
    refresh materialized view public.analytics_monthly_branch_rollups;

    update public.analytics_refresh_jobs
      set status = 'succeeded',
          completed_at = now(),
          locked_by = null,
          locked_at = null
    where id = v_job.id;

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
      v_job.requested_by,
      v_job.organization_id,
      v_job.hostel_branch_id,
      'hostel_erp'::public.saas_product,
      'analytics.snapshot.refresh_completed',
      'analytics_refresh_jobs',
      v_job.id,
      jsonb_build_object('worker_id', p_worker_id, 'attempts', v_job.attempts + 1)
    );
  exception
    when others then
      update public.analytics_refresh_jobs
        set status = 'failed',
            completed_at = now(),
            locked_by = null,
            locked_at = null,
            last_error_code = sqlstate,
            last_error_message = sqlerrm
      where id = v_job.id;

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
        v_job.requested_by,
        v_job.organization_id,
        v_job.hostel_branch_id,
        'hostel_erp'::public.saas_product,
        'analytics.snapshot.refresh_failed',
        'analytics_refresh_jobs',
        v_job.id,
        jsonb_build_object('worker_id', p_worker_id, 'error_code', sqlstate, 'error_message', sqlerrm)
      );

      raise;
  end;

  return jsonb_build_object(
    'jobId', v_job.id,
    'organizationId', v_job.organization_id,
    'hostelBranchId', v_job.hostel_branch_id,
    'status', 'succeeded'
  );
end;
$$;

revoke execute on function public.refresh_analytics_monthly_branch_rollups(uuid, uuid, uuid) from authenticated;
grant execute on function public.request_analytics_refresh(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.perform_analytics_refresh_job(uuid, text) to service_role;

revoke all on public.analytics_refresh_jobs from anon;
grant select, insert on public.analytics_refresh_jobs to authenticated;
grant all on public.analytics_refresh_jobs to service_role;

create index if not exists audit_logs_request_id_idx
  on public.audit_logs (request_id)
  where request_id is not null;

create index if not exists audit_logs_action_created_idx
  on public.audit_logs (action, created_at desc);
