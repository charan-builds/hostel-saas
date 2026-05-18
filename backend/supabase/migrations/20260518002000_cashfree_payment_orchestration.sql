create unique index if not exists billing_invoices_cashfree_order_unique_active
  on public.billing_invoices (organization_id, hostel_branch_id, cashfree_order_id)
  where deleted_at is null and cashfree_order_id is not null;

-- Verified provider webhooks need to finalize payments without an interactive
-- Supabase user session. Authenticated users keep the existing actor and
-- billing-admin checks; service_role is limited to Cashfree provider writes.
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
  if coalesce((select auth.role()), '') = 'service_role' then
    if p_actor_user_id is not null then
      raise exception 'Service-role payment recording must use a null actor' using errcode = '42501';
    end if;
  elsif p_actor_user_id is distinct from (select auth.uid()) then
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

  if coalesce((select auth.role()), '') = 'service_role'
     and (p_payment_method <> 'cashfree' or v_provider <> 'cashfree') then
    raise exception 'Service-role payment recording is restricted to Cashfree webhooks' using errcode = '42501';
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

  if coalesce((select auth.role()), '') <> 'service_role'
     and not (select private.is_billing_admin(v_invoice.organization_id, v_invoice.hostel_branch_id)) then
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
