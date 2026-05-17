create or replace function private.is_analytics_admin(
  target_organization_id uuid,
  target_hostel_branch_id uuid default null
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

create or replace view public.analytics_branch_occupancy
with (security_invoker = true)
as
with room_stats as (
  select
    organization_id,
    hostel_branch_id,
    count(*)::integer as total_rooms,
    count(*) filter (where status = 'active')::integer as active_rooms
  from public.rooms
  where deleted_at is null
  group by organization_id, hostel_branch_id
),
bed_stats as (
  select
    organization_id,
    hostel_branch_id,
    count(*)::integer as total_beds,
    count(*) filter (where status in ('maintenance', 'inactive'))::integer as unavailable_beds
  from public.room_beds
  where deleted_at is null
  group by organization_id, hostel_branch_id
),
assignment_stats as (
  select
    organization_id,
    hostel_branch_id,
    count(distinct bed_id)::integer as occupied_beds,
    count(distinct student_id)::integer as active_students
  from public.student_room_assignments
  where deleted_at is null
    and status = 'active'
    and end_date is null
  group by organization_id, hostel_branch_id
)
select
  hb.organization_id,
  hb.id as hostel_branch_id,
  hb.name as branch_name,
  coalesce(rs.total_rooms, 0) as total_rooms,
  coalesce(rs.active_rooms, 0) as active_rooms,
  coalesce(bs.total_beds, 0) as total_beds,
  coalesce(bs.unavailable_beds, 0) as unavailable_beds,
  coalesce(ast.occupied_beds, 0) as occupied_beds,
  greatest(
    coalesce(bs.total_beds, 0) - coalesce(bs.unavailable_beds, 0) - coalesce(ast.occupied_beds, 0),
    0
  )::integer as available_beds,
  coalesce(ast.active_students, 0) as active_students,
  case
    when greatest(coalesce(bs.total_beds, 0) - coalesce(bs.unavailable_beds, 0), 0) = 0 then 0::numeric
    else round(
      coalesce(ast.occupied_beds, 0)::numeric
      / greatest(coalesce(bs.total_beds, 0) - coalesce(bs.unavailable_beds, 0), 1)::numeric
      * 100,
      2
    )
  end as occupancy_rate
from public.hostel_branches hb
left join room_stats rs
  on rs.organization_id = hb.organization_id
  and rs.hostel_branch_id = hb.id
left join bed_stats bs
  on bs.organization_id = hb.organization_id
  and bs.hostel_branch_id = hb.id
left join assignment_stats ast
  on ast.organization_id = hb.organization_id
  and ast.hostel_branch_id = hb.id
where hb.deleted_at is null;

create or replace view public.analytics_billing_branch_summary
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  currency_code,
  count(*)::integer as invoice_count,
  count(*) filter (where status in ('pending', 'partially_paid', 'overdue'))::integer as open_invoice_count,
  count(*) filter (where status = 'paid')::integer as paid_invoice_count,
  count(*) filter (where status = 'overdue' or (status in ('pending', 'partially_paid') and due_date < current_date))::integer as overdue_invoice_count,
  coalesce(sum(total_cents), 0)::bigint as invoiced_cents,
  coalesce(sum(paid_cents), 0)::bigint as paid_cents,
  coalesce(sum(balance_cents), 0)::bigint as balance_cents,
  coalesce(sum(balance_cents) filter (
    where status in ('pending', 'partially_paid', 'overdue')
  ), 0)::bigint as pending_due_cents,
  coalesce(sum(balance_cents) filter (
    where status = 'overdue' or (status in ('pending', 'partially_paid') and due_date < current_date)
  ), 0)::bigint as overdue_cents
from public.billing_invoices
where deleted_at is null
  and status <> 'void'
group by organization_id, hostel_branch_id, currency_code;

create or replace view public.analytics_revenue_daily
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  currency_code,
  received_at::date as revenue_date,
  count(*)::integer as payment_count,
  count(distinct student_id)::integer as paying_students,
  coalesce(sum(amount_cents) filter (where status in ('recorded', 'completed')), 0)::bigint as collected_cents,
  coalesce(sum(amount_cents) filter (where status = 'refunded'), 0)::bigint as refunded_cents
from public.billing_payments
where deleted_at is null
group by organization_id, hostel_branch_id, currency_code, received_at::date;

create or replace view public.analytics_attendance_daily
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  attendance_date,
  status,
  count(*)::integer as record_count
from public.attendance_records
where deleted_at is null
group by organization_id, hostel_branch_id, attendance_date, status;

create or replace view public.analytics_leave_daily
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  starts_at::date as leave_date,
  status,
  leave_type,
  count(*)::integer as request_count
from public.student_leave_requests
where deleted_at is null
group by organization_id, hostel_branch_id, starts_at::date, status, leave_type;

create or replace view public.analytics_visitor_daily
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  scheduled_at::date as visitor_date,
  status,
  count(*)::integer as visitor_count
from public.visitor_passes
where deleted_at is null
group by organization_id, hostel_branch_id, scheduled_at::date, status;

create or replace view public.analytics_notification_summary
with (security_invoker = true)
as
select
  organization_id,
  hostel_branch_id,
  count(*)::integer as recipient_count,
  count(*) filter (where read_at is null and dismissed_at is null)::integer as unread_count,
  count(*) filter (where dismissed_at is not null)::integer as dismissed_count,
  count(*) filter (where delivery_status = 'failed')::integer as failed_count,
  count(*) filter (where delivery_status in ('sent', 'delivered'))::integer as delivered_count
from public.notification_recipients
where deleted_at is null
group by organization_id, hostel_branch_id;

create index if not exists billing_payments_org_branch_received_status_idx
  on public.billing_payments (organization_id, hostel_branch_id, received_at desc, status)
  where deleted_at is null;

create index if not exists audit_logs_org_branch_created_idx
  on public.audit_logs (organization_id, hostel_branch_id, created_at desc);

create index if not exists notification_recipients_org_branch_delivery_idx
  on public.notification_recipients (organization_id, hostel_branch_id, delivery_status, read_at)
  where deleted_at is null;

drop materialized view if exists public.analytics_monthly_branch_rollups;
create materialized view public.analytics_monthly_branch_rollups
as
with invoice_monthly as (
  select
    organization_id,
    hostel_branch_id,
    date_trunc('month', invoice_month)::date as metric_month,
    coalesce(sum(total_cents), 0)::bigint as invoiced_cents,
    coalesce(sum(balance_cents), 0)::bigint as balance_cents
  from public.billing_invoices
  where deleted_at is null
    and status <> 'void'
  group by organization_id, hostel_branch_id, date_trunc('month', invoice_month)::date
),
payment_monthly as (
  select
    organization_id,
    hostel_branch_id,
    date_trunc('month', received_at)::date as metric_month,
    coalesce(sum(amount_cents) filter (where status in ('recorded', 'completed')), 0)::bigint as collected_cents
  from public.billing_payments
  where deleted_at is null
  group by organization_id, hostel_branch_id, date_trunc('month', received_at)::date
),
occupancy_current as (
  select
    organization_id,
    hostel_branch_id,
    active_students,
    total_beds,
    occupied_beds,
    occupancy_rate
  from public.analytics_branch_occupancy
)
select
  coalesce(i.organization_id, p.organization_id) as organization_id,
  coalesce(i.hostel_branch_id, p.hostel_branch_id) as hostel_branch_id,
  coalesce(i.metric_month, p.metric_month) as metric_month,
  coalesce(i.invoiced_cents, 0)::bigint as invoiced_cents,
  coalesce(p.collected_cents, 0)::bigint as collected_cents,
  coalesce(i.balance_cents, 0)::bigint as balance_cents,
  coalesce(o.active_students, 0)::integer as active_students,
  coalesce(o.total_beds, 0)::integer as total_beds,
  coalesce(o.occupied_beds, 0)::integer as occupied_beds,
  coalesce(o.occupancy_rate, 0)::numeric as occupancy_rate,
  now() as refreshed_at
from invoice_monthly i
full join payment_monthly p
  on p.organization_id = i.organization_id
  and p.hostel_branch_id = i.hostel_branch_id
  and p.metric_month = i.metric_month
left join occupancy_current o
  on o.organization_id = coalesce(i.organization_id, p.organization_id)
  and o.hostel_branch_id = coalesce(i.hostel_branch_id, p.hostel_branch_id);

create unique index analytics_monthly_branch_rollups_unique
  on public.analytics_monthly_branch_rollups (organization_id, hostel_branch_id, metric_month);

create or replace function public.refresh_analytics_monthly_branch_rollups(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid default null
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

  if not (select private.is_analytics_admin(p_organization_id, p_hostel_branch_id)) then
    raise exception 'Analytics refresh permission is required' using errcode = '42501';
  end if;

  refresh materialized view public.analytics_monthly_branch_rollups;

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
    'analytics.snapshot.refresh',
    'analytics_monthly_branch_rollups',
    jsonb_build_object('refreshed_at', now())
  );

  return jsonb_build_object(
    'organizationId', p_organization_id,
    'hostelBranchId', p_hostel_branch_id,
    'refreshedAt', now()
  );
end;
$$;

revoke all on public.analytics_branch_occupancy from anon;
revoke all on public.analytics_billing_branch_summary from anon;
revoke all on public.analytics_revenue_daily from anon;
revoke all on public.analytics_attendance_daily from anon;
revoke all on public.analytics_leave_daily from anon;
revoke all on public.analytics_visitor_daily from anon;
revoke all on public.analytics_notification_summary from anon;
revoke all on public.analytics_monthly_branch_rollups from anon;
revoke all on public.analytics_monthly_branch_rollups from authenticated;

grant select on public.analytics_branch_occupancy to authenticated;
grant select on public.analytics_billing_branch_summary to authenticated;
grant select on public.analytics_revenue_daily to authenticated;
grant select on public.analytics_attendance_daily to authenticated;
grant select on public.analytics_leave_daily to authenticated;
grant select on public.analytics_visitor_daily to authenticated;
grant select on public.analytics_notification_summary to authenticated;
grant select on public.analytics_monthly_branch_rollups to service_role;
grant execute on function public.refresh_analytics_monthly_branch_rollups(uuid, uuid, uuid) to authenticated;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'analytics:read',
        'report:export'
      ]
    ) as new_permission(permission)
  )
where role = 'admin'::public.app_role
  and deleted_at is null;
