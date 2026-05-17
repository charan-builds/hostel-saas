# Notifications, Notices, and Automated Reminders

The notifications module is a tenant-scoped delivery ledger. Every durable table carries `organization_id`, optional `hostel_branch_id`, and `app`, so RLS can isolate data by tenant while the same model remains usable by future ERP products.

## Data Model

- `notifications` stores the canonical message, source entity, dedupe key, schedule, severity, and action URL.
- `notification_recipients` stores per-user delivery state, read state, dismissal state, and retry metadata.
- `notification_delivery_attempts` stores channel-level attempts for in-app, email, SMS, WhatsApp, and push.
- `notification_preferences` stores user channel preferences and muted notification types.
- `notice_boards` stores admin-authored notices and tenant-wide announcements.
- `notice_acknowledgements` tracks notice read/acknowledgement state per user.
- `notification_jobs` stores background-job-ready work records for reminder automation and scheduled publishing.

## Why This Shape

Notifications and recipients are separated because one message can target many users, each with independent read and delivery state. Delivery attempts are separated because future email, WhatsApp, and SMS providers need retry history without mutating the canonical notification record.

Notice publishing fans out to notifications only when a notice is published. Draft and scheduled notices remain editable workflow records until a worker or admin publishes them.

## RLS Strategy

Admins manage notification and notice records through `private.is_notification_admin`. Users can read and update their own recipient rows, which allows marking notifications as read without exposing tenant-wide delivery data. Notice board reads use `private.can_read_notice_board`, which keeps admin-only notices separate from tenant or student notices.

## Background Jobs

`notification_jobs` and `public.enqueue_billing_reminders` are intentionally worker-ready. Today admins can run the reminder hook manually from the dashboard; later a scheduled worker can call the same RPC with a service role or authenticated worker identity.

## Extensibility

The schema supports future modules by using `app`, `notification_type`, `source_table`, `source_id`, and JSON metadata instead of product-specific columns. Hostel billing reminders already use the same path that gym dues, clothing-shop stock alerts, or inventory reorder notices can use later.
