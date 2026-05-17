create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  user_id uuid not null references auth.users(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  muted_notification_types text[] not null default '{}'::text[],
  locale text not null default 'en-IN',
  timezone text not null default 'UTC',
  quiet_hours jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notification_preferences_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create unique index if not exists notification_preferences_user_scope_unique_active
  on public.notification_preferences (
    organization_id,
    app,
    user_id,
    coalesce(hostel_branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where deleted_at is null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  category text not null default 'system' check (
    category in ('system', 'notice', 'billing', 'leave', 'admin', 'student')
  ),
  notification_type text not null check (
    char_length(trim(notification_type)) between 3 and 120
    and notification_type ~ '^[a-z0-9][a-z0-9_.-]{2,119}$'
  ),
  title text not null check (char_length(trim(title)) between 1 and 160),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  severity text not null default 'info' check (
    severity in ('info', 'success', 'warning', 'critical')
  ),
  audience_type text not null default 'tenant' check (
    audience_type in ('tenant', 'branch', 'admins', 'students', 'student', 'user')
  ),
  target_user_id uuid references auth.users(id) on delete set null,
  target_student_id uuid,
  source_table text,
  source_id uuid,
  action_url text,
  dedupe_key text,
  scheduled_for timestamptz,
  expires_at timestamptz,
  status text not null default 'queued' check (
    status in ('draft', 'scheduled', 'queued', 'sent', 'cancelled', 'failed')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notifications_id_org_unique unique (id, organization_id),
  constraint notifications_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint notifications_target_student_fk
    foreign key (target_student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists notifications_org_dedupe_unique_active
  on public.notifications (organization_id, dedupe_key)
  where deleted_at is null and dedupe_key is not null;

create index if not exists notifications_org_branch_status_scheduled_idx
  on public.notifications (organization_id, hostel_branch_id, status, scheduled_for)
  where deleted_at is null;

create index if not exists notifications_source_idx
  on public.notifications (source_table, source_id)
  where deleted_at is null and source_table is not null and source_id is not null;

create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  notification_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  student_id uuid,
  role public.app_role,
  delivery_status text not null default 'pending' check (
    delivery_status in ('pending', 'queued', 'sent', 'delivered', 'failed', 'cancelled')
  ),
  read_at timestamptz,
  dismissed_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  channel_preferences jsonb not null default '{}'::jsonb,
  attempts integer not null default 0 check (attempts >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notification_recipients_id_org_unique unique (id, organization_id),
  constraint notification_recipients_notification_fk
    foreign key (notification_id, organization_id)
    references public.notifications (id, organization_id)
    on delete cascade,
  constraint notification_recipients_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint notification_recipients_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict,
  constraint notification_recipients_has_target check (
    user_id is not null or student_id is not null or role is not null
  )
);

create unique index if not exists notification_recipients_notification_user_unique_active
  on public.notification_recipients (notification_id, user_id)
  where deleted_at is null and user_id is not null;

create unique index if not exists notification_recipients_notification_student_unique_active
  on public.notification_recipients (notification_id, student_id)
  where deleted_at is null and student_id is not null;

create index if not exists notification_recipients_user_read_idx
  on public.notification_recipients (user_id, read_at, created_at desc)
  where deleted_at is null and user_id is not null;

create index if not exists notification_recipients_org_status_idx
  on public.notification_recipients (organization_id, hostel_branch_id, delivery_status)
  where deleted_at is null;

create table if not exists public.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  notification_id uuid not null,
  recipient_id uuid not null,
  channel text not null check (channel in ('in_app', 'email', 'sms', 'whatsapp', 'push')),
  provider text,
  provider_message_id text,
  status text not null default 'queued' check (
    status in ('queued', 'sent', 'delivered', 'failed', 'cancelled')
  ),
  attempted_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notification_delivery_attempts_notification_fk
    foreign key (notification_id, organization_id)
    references public.notifications (id, organization_id)
    on delete cascade,
  constraint notification_delivery_attempts_recipient_fk
    foreign key (recipient_id, organization_id)
    references public.notification_recipients (id, organization_id)
    on delete cascade,
  constraint notification_delivery_attempts_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists notification_delivery_attempts_recipient_channel_idx
  on public.notification_delivery_attempts (recipient_id, channel, created_at desc);

create index if not exists notification_delivery_attempts_status_idx
  on public.notification_delivery_attempts (organization_id, status, channel, created_at desc);

create table if not exists public.notice_boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  title text not null check (char_length(trim(title)) between 1 and 160),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  notice_type text not null default 'general' check (
    notice_type in ('general', 'billing', 'maintenance', 'event', 'policy', 'emergency')
  ),
  priority text not null default 'normal' check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  audience_type text not null default 'tenant' check (
    audience_type in ('tenant', 'branch', 'admins', 'students')
  ),
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'published', 'archived')
  ),
  pinned boolean not null default false,
  published_at timestamptz,
  scheduled_for timestamptz,
  expires_at timestamptz,
  attachments jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notice_boards_id_org_unique unique (id, organization_id),
  constraint notice_boards_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint notice_boards_schedule_shape check (
    (status <> 'scheduled' and scheduled_for is null)
    or (status = 'scheduled' and scheduled_for is not null)
  )
);

create index if not exists notice_boards_org_branch_status_idx
  on public.notice_boards (organization_id, hostel_branch_id, status, pinned desc, published_at desc)
  where deleted_at is null;

create table if not exists public.notice_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  notice_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid,
  read_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint notice_acknowledgements_notice_fk
    foreign key (notice_id, organization_id)
    references public.notice_boards (id, organization_id)
    on delete cascade,
  constraint notice_acknowledgements_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict,
  constraint notice_acknowledgements_student_fk
    foreign key (student_id, organization_id, hostel_branch_id)
    references public.students (id, organization_id, hostel_branch_id)
    on delete restrict
);

create unique index if not exists notice_acknowledgements_notice_user_unique_active
  on public.notice_acknowledgements (notice_id, user_id)
  where deleted_at is null;

create index if not exists notice_acknowledgements_user_idx
  on public.notice_acknowledgements (user_id, created_at desc)
  where deleted_at is null;

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  hostel_branch_id uuid,
  app public.saas_product not null default 'hostel_erp',
  job_type text not null check (
    job_type in ('billing_reminder', 'overdue_payment_alert', 'notice_publish', 'custom')
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
  constraint notification_jobs_branch_org_fk
    foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
    on delete restrict
);

create index if not exists notification_jobs_due_idx
  on public.notification_jobs (status, scheduled_for, attempts)
  where deleted_at is null;

create or replace function private.is_notification_admin(
  target_organization_id uuid,
  target_hostel_branch_id uuid,
  target_app public.saas_product
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
      target_app,
      array['admin'::public.app_role]
    )),
    false
  );
$$;

create or replace function private.can_read_notice_board(
  target_organization_id uuid,
  target_hostel_branch_id uuid,
  target_app public.saas_product,
  target_audience_type text,
  target_status text,
  target_expires_at timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select private.is_notification_admin(
      target_organization_id,
      target_hostel_branch_id,
      target_app
    ))
    or (
      target_status = 'published'
      and (target_expires_at is null or target_expires_at > now())
      and target_audience_type <> 'admins'
      and (select private.has_active_membership(
        target_organization_id,
        target_hostel_branch_id,
        target_app,
        null
      ))
    ),
    false
  );
$$;

create or replace function public.mark_notification_read(
  p_actor_user_id uuid,
  p_recipient_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient public.notification_recipients%rowtype;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_recipient
  from public.notification_recipients
  where id = p_recipient_id
    and deleted_at is null
  for update;

  if v_recipient.id is null then
    raise exception 'Notification recipient was not found' using errcode = '02000';
  end if;

  if not (
    v_recipient.user_id = p_actor_user_id
    or (select private.is_notification_admin(
      v_recipient.organization_id,
      v_recipient.hostel_branch_id,
      'hostel_erp'::public.saas_product
    ))
  ) then
    raise exception 'Notification access is required' using errcode = '42501';
  end if;

  update public.notification_recipients
    set read_at = coalesce(read_at, now()),
        updated_by = p_actor_user_id
  where id = p_recipient_id;

  return jsonb_build_object('recipientId', p_recipient_id);
end;
$$;

create or replace function public.dismiss_notification(
  p_actor_user_id uuid,
  p_recipient_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient public.notification_recipients%rowtype;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  select *
    into v_recipient
  from public.notification_recipients
  where id = p_recipient_id
    and deleted_at is null
  for update;

  if v_recipient.id is null then
    raise exception 'Notification recipient was not found' using errcode = '02000';
  end if;

  if v_recipient.user_id <> p_actor_user_id then
    raise exception 'Notification access is required' using errcode = '42501';
  end if;

  update public.notification_recipients
    set dismissed_at = coalesce(dismissed_at, now()),
        read_at = coalesce(read_at, now()),
        updated_by = p_actor_user_id
  where id = p_recipient_id;

  return jsonb_build_object('recipientId', p_recipient_id);
end;
$$;

create or replace function public.enqueue_billing_reminders(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_hostel_branch_id uuid,
  p_due_before date default current_date,
  p_reminder_kind text default 'overdue_payment_alert'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice record;
  v_notification_id uuid;
  v_recipient_id uuid;
  v_created_count integer := 0;
  v_skipped_count integer := 0;
  v_dedupe_key text;
begin
  if p_actor_user_id <> (select auth.uid()) then
    raise exception 'Actor mismatch' using errcode = '42501';
  end if;

  if p_reminder_kind not in ('billing_reminder', 'overdue_payment_alert') then
    raise exception 'Unsupported reminder kind' using errcode = '23514';
  end if;

  if not (select private.is_notification_admin(
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product
  )) then
    raise exception 'Notification permission is required' using errcode = '42501';
  end if;

  for v_invoice in
    select
      bi.id,
      bi.invoice_number,
      bi.student_id,
      bi.balance_cents,
      bi.currency_code,
      bi.due_date,
      bi.hostel_branch_id,
      s.user_profile_id,
      s.first_name,
      s.last_name,
      s.student_code
    from public.billing_invoices bi
    join public.students s on s.id = bi.student_id
    where bi.organization_id = p_organization_id
      and bi.hostel_branch_id = p_hostel_branch_id
      and bi.deleted_at is null
      and bi.status in ('pending', 'partially_paid', 'overdue')
      and bi.balance_cents > 0
      and bi.due_date <= p_due_before
      and s.deleted_at is null
      and s.user_profile_id is not null
  loop
    v_notification_id := null;
    v_recipient_id := null;
    v_dedupe_key := 'billing:' || p_reminder_kind || ':' || v_invoice.id::text || ':' || p_due_before::text;

    insert into public.notifications (
      organization_id,
      hostel_branch_id,
      app,
      category,
      notification_type,
      title,
      body,
      severity,
      audience_type,
      target_user_id,
      target_student_id,
      source_table,
      source_id,
      action_url,
      dedupe_key,
      status,
      metadata,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      'hostel_erp'::public.saas_product,
      'billing',
      p_reminder_kind,
      case
        when p_reminder_kind = 'overdue_payment_alert' then 'Payment overdue'
        else 'Payment reminder'
      end,
      'Invoice ' || v_invoice.invoice_number || ' has an outstanding balance.',
      case
        when p_reminder_kind = 'overdue_payment_alert' then 'warning'
        else 'info'
      end,
      'student',
      v_invoice.user_profile_id,
      v_invoice.student_id,
      'billing_invoices',
      v_invoice.id,
      '/billing/invoices/' || v_invoice.id::text,
      v_dedupe_key,
      'queued',
      jsonb_build_object(
        'invoice_number', v_invoice.invoice_number,
        'balance_cents', v_invoice.balance_cents,
        'currency_code', v_invoice.currency_code,
        'due_date', v_invoice.due_date,
        'student_code', v_invoice.student_code
      ),
      p_actor_user_id,
      p_actor_user_id
    )
    on conflict (organization_id, dedupe_key)
    where deleted_at is null and dedupe_key is not null
    do nothing
    returning id into v_notification_id;

    if v_notification_id is null then
      select n.id
        into v_notification_id
      from public.notifications n
      where n.organization_id = p_organization_id
        and n.dedupe_key = v_dedupe_key
        and n.deleted_at is null;
      v_skipped_count := v_skipped_count + 1;
    else
      v_created_count := v_created_count + 1;
    end if;

    insert into public.notification_recipients (
      organization_id,
      hostel_branch_id,
      notification_id,
      user_id,
      student_id,
      delivery_status,
      channel_preferences,
      created_by,
      updated_by
    )
    values (
      p_organization_id,
      p_hostel_branch_id,
      v_notification_id,
      v_invoice.user_profile_id,
      v_invoice.student_id,
      'queued',
      jsonb_build_object('in_app', true, 'email', true),
      p_actor_user_id,
      p_actor_user_id
    )
    on conflict (notification_id, user_id)
    where deleted_at is null and user_id is not null
    do nothing
    returning id into v_recipient_id;

    if v_recipient_id is not null then
      insert into public.notification_delivery_attempts (
        organization_id,
        hostel_branch_id,
        notification_id,
        recipient_id,
        channel,
        provider,
        status,
        attempted_at,
        created_by,
        updated_by
      )
      values (
        p_organization_id,
        p_hostel_branch_id,
        v_notification_id,
        v_recipient_id,
        'in_app',
        'internal',
        'sent',
        now(),
        p_actor_user_id,
        p_actor_user_id
      );
    end if;
  end loop;

  insert into public.notification_jobs (
    organization_id,
    hostel_branch_id,
    app,
    job_type,
    status,
    scheduled_for,
    payload,
    attempts,
    completed_at,
    created_by,
    updated_by
  )
  values (
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    p_reminder_kind,
    'completed',
    now(),
    jsonb_build_object(
      'due_before', p_due_before,
      'created_count', v_created_count,
      'skipped_count', v_skipped_count
    ),
    1,
    now(),
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
    metadata
  )
  values (
    p_actor_user_id,
    p_organization_id,
    p_hostel_branch_id,
    'hostel_erp'::public.saas_product,
    'notifications.billing_reminders.enqueue',
    'notifications',
    jsonb_build_object(
      'reminder_kind', p_reminder_kind,
      'due_before', p_due_before,
      'created_count', v_created_count,
      'skipped_count', v_skipped_count
    )
  );

  return jsonb_build_object(
    'createdCount', v_created_count,
    'skippedCount', v_skipped_count
  );
end;
$$;

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
  before update on public.notifications
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notification_recipients_updated_at on public.notification_recipients;
create trigger set_notification_recipients_updated_at
  before update on public.notification_recipients
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notification_delivery_attempts_updated_at on public.notification_delivery_attempts;
create trigger set_notification_delivery_attempts_updated_at
  before update on public.notification_delivery_attempts
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notice_boards_updated_at on public.notice_boards;
create trigger set_notice_boards_updated_at
  before update on public.notice_boards
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notice_acknowledgements_updated_at on public.notice_acknowledgements;
create trigger set_notice_acknowledgements_updated_at
  before update on public.notice_acknowledgements
  for each row
  execute function private.set_updated_at();

drop trigger if exists set_notification_jobs_updated_at on public.notification_jobs;
create trigger set_notification_jobs_updated_at
  before update on public.notification_jobs
  for each row
  execute function private.set_updated_at();

alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.notification_delivery_attempts enable row level security;
alter table public.notice_boards enable row level security;
alter table public.notice_acknowledgements enable row level security;
alter table public.notification_jobs enable row level security;

alter table public.notification_preferences force row level security;
alter table public.notifications force row level security;
alter table public.notification_recipients force row level security;
alter table public.notification_delivery_attempts force row level security;
alter table public.notice_boards force row level security;
alter table public.notice_acknowledgements force row level security;
alter table public.notification_jobs force row level security;

drop policy if exists "notification_preferences_select_scoped" on public.notification_preferences;
create policy "notification_preferences_select_scoped"
  on public.notification_preferences
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_notification_admin(organization_id, hostel_branch_id, app))
    )
  );

drop policy if exists "notification_preferences_manage_scoped" on public.notification_preferences;
create policy "notification_preferences_manage_scoped"
  on public.notification_preferences
  for all
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_notification_admin(organization_id, hostel_branch_id, app))
    )
  )
  with check (
    user_id = (select auth.uid())
    or (select private.is_notification_admin(organization_id, hostel_branch_id, app))
  );

drop policy if exists "notifications_select_admin_or_recipient" on public.notifications;
create policy "notifications_select_admin_or_recipient"
  on public.notifications
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      (select private.is_notification_admin(organization_id, hostel_branch_id, app))
      or exists (
        select 1
        from public.notification_recipients nr
        where nr.notification_id = id
          and nr.deleted_at is null
          and (
            nr.user_id = (select auth.uid())
            or exists (
              select 1
              from public.students s
              where s.id = nr.student_id
                and s.user_profile_id = (select auth.uid())
                and s.deleted_at is null
            )
          )
      )
    )
  );

drop policy if exists "notifications_manage_admins" on public.notifications;
create policy "notifications_manage_admins"
  on public.notifications
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_notification_admin(organization_id, hostel_branch_id, app))
  )
  with check ((select private.is_notification_admin(organization_id, hostel_branch_id, app)));

drop policy if exists "notification_recipients_select_admin_or_self" on public.notification_recipients;
create policy "notification_recipients_select_admin_or_self"
  on public.notification_recipients
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_notification_admin(
        organization_id,
        hostel_branch_id,
        'hostel_erp'::public.saas_product
      ))
      or exists (
        select 1
        from public.students s
        where s.id = student_id
          and s.user_profile_id = (select auth.uid())
          and s.deleted_at is null
      )
    )
  );

drop policy if exists "notification_recipients_insert_admins" on public.notification_recipients;
create policy "notification_recipients_insert_admins"
  on public.notification_recipients
  for insert
  to authenticated
  with check ((select private.is_notification_admin(
    organization_id,
    hostel_branch_id,
    'hostel_erp'::public.saas_product
  )));

drop policy if exists "notification_recipients_update_admin_or_self" on public.notification_recipients;
create policy "notification_recipients_update_admin_or_self"
  on public.notification_recipients
  for update
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_notification_admin(
        organization_id,
        hostel_branch_id,
        'hostel_erp'::public.saas_product
      ))
    )
  )
  with check (
    user_id = (select auth.uid())
    or (select private.is_notification_admin(
      organization_id,
      hostel_branch_id,
      'hostel_erp'::public.saas_product
    ))
  );

drop policy if exists "notification_delivery_attempts_select_admin_or_self" on public.notification_delivery_attempts;
create policy "notification_delivery_attempts_select_admin_or_self"
  on public.notification_delivery_attempts
  for select
  to authenticated
  using (
    (select private.is_notification_admin(
      organization_id,
      hostel_branch_id,
      'hostel_erp'::public.saas_product
    ))
    or exists (
      select 1
      from public.notification_recipients nr
      where nr.id = recipient_id
        and nr.deleted_at is null
        and nr.user_id = (select auth.uid())
    )
  );

drop policy if exists "notification_delivery_attempts_manage_admins" on public.notification_delivery_attempts;
create policy "notification_delivery_attempts_manage_admins"
  on public.notification_delivery_attempts
  for all
  to authenticated
  using ((select private.is_notification_admin(
    organization_id,
    hostel_branch_id,
    'hostel_erp'::public.saas_product
  )))
  with check ((select private.is_notification_admin(
    organization_id,
    hostel_branch_id,
    'hostel_erp'::public.saas_product
  )));

drop policy if exists "notice_boards_select_visible" on public.notice_boards;
create policy "notice_boards_select_visible"
  on public.notice_boards
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_read_notice_board(
      organization_id,
      hostel_branch_id,
      app,
      audience_type,
      status,
      expires_at
    ))
  );

drop policy if exists "notice_boards_manage_admins" on public.notice_boards;
create policy "notice_boards_manage_admins"
  on public.notice_boards
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_notification_admin(organization_id, hostel_branch_id, app))
  )
  with check ((select private.is_notification_admin(organization_id, hostel_branch_id, app)));

drop policy if exists "notice_acknowledgements_select_admin_or_self" on public.notice_acknowledgements;
create policy "notice_acknowledgements_select_admin_or_self"
  on public.notice_acknowledgements
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      user_id = (select auth.uid())
      or (select private.is_notification_admin(
        organization_id,
        hostel_branch_id,
        'hostel_erp'::public.saas_product
      ))
    )
  );

drop policy if exists "notice_acknowledgements_insert_self" on public.notice_acknowledgements;
create policy "notice_acknowledgements_insert_self"
  on public.notice_acknowledgements
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.has_active_membership(
      organization_id,
      hostel_branch_id,
      'hostel_erp'::public.saas_product,
      null
    ))
  );

drop policy if exists "notice_acknowledgements_update_self" on public.notice_acknowledgements;
create policy "notice_acknowledgements_update_self"
  on public.notice_acknowledgements
  for update
  to authenticated
  using (
    deleted_at is null
    and user_id = (select auth.uid())
  )
  with check (user_id = (select auth.uid()));

drop policy if exists "notification_jobs_select_admins" on public.notification_jobs;
create policy "notification_jobs_select_admins"
  on public.notification_jobs
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.is_notification_admin(organization_id, hostel_branch_id, app))
  );

drop policy if exists "notification_jobs_manage_admins" on public.notification_jobs;
create policy "notification_jobs_manage_admins"
  on public.notification_jobs
  for all
  to authenticated
  using (
    deleted_at is null
    and (select private.is_notification_admin(organization_id, hostel_branch_id, app))
  )
  with check ((select private.is_notification_admin(organization_id, hostel_branch_id, app)));

revoke all on public.notification_preferences from anon;
revoke all on public.notifications from anon;
revoke all on public.notification_recipients from anon;
revoke all on public.notification_delivery_attempts from anon;
revoke all on public.notice_boards from anon;
revoke all on public.notice_acknowledgements from anon;
revoke all on public.notification_jobs from anon;

grant select, insert, update on public.notification_preferences to authenticated;
grant select, insert, update on public.notifications to authenticated;
grant select, insert, update on public.notification_recipients to authenticated;
grant select, insert, update on public.notification_delivery_attempts to authenticated;
grant select, insert, update on public.notice_boards to authenticated;
grant select, insert, update on public.notice_acknowledgements to authenticated;
grant select, insert, update on public.notification_jobs to authenticated;

grant all on public.notification_preferences to service_role;
grant all on public.notifications to service_role;
grant all on public.notification_recipients to service_role;
grant all on public.notification_delivery_attempts to service_role;
grant all on public.notice_boards to service_role;
grant all on public.notice_acknowledgements to service_role;
grant all on public.notification_jobs to service_role;

grant execute on function public.mark_notification_read(uuid, uuid) to authenticated;
grant execute on function public.dismiss_notification(uuid, uuid) to authenticated;
grant execute on function public.enqueue_billing_reminders(uuid, uuid, uuid, date, text) to authenticated;

update public.tenant_role_definitions
  set permissions = array(
    select distinct new_permission.permission
    from unnest(
      permissions || array[
        'notification:read',
        'notification:manage',
        'notice:read',
        'notice:manage'
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
        'notification:read',
        'notice:read'
      ]
    ) as new_permission(permission)
  )
where role = 'student'::public.app_role
  and deleted_at is null;
