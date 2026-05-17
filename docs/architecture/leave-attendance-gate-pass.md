# Leave, Attendance, and Gate Pass Workflows

The presence module models temporary absence, daily attendance, gate movement, and visitor entry as tenant-scoped workflow records. Every table carries `organization_id`, `hostel_branch_id`, audit columns, and soft-delete support so PostgreSQL RLS can isolate tenants while services keep business rules reusable.

## Data Model

- `student_leave_requests` stores leave lifecycle state, reason, destination, expected return, and review metadata.
- `attendance_records` stores one active attendance row per student per day and snapshots the active room/bed assignment when attendance is marked.
- `gate_passes` stores student exit approvals, expected exit/return times, actual movement, and late-entry flags.
- `gate_pass_events` is an append-only movement history for approvals, check-outs, check-ins, cancellations, and expiry events.
- `visitor_passes` tracks visitor approvals independently while optionally linking a visitor to a student.
- `visitor_pass_events` records visitor approval, check-in, check-out, and cancellation history.
- `student_presence_jobs` is the worker-ready queue for overdue leave scans, gate-pass expiry, attendance rollups, biometric imports, and QR syncs.

## Why This Shape

Attendance uses a partial unique index on `(organization_id, hostel_branch_id, student_id, attendance_date)` where `deleted_at is null`, which makes daily marking idempotent without losing soft-delete history.

Gate passes and gate pass events are separated because a pass has a current state, while security and audit teams need a durable entry/exit timeline. This also prepares the module for future guard devices, QR scans, and background expiry jobs.

Leave review, leave lifecycle events, attendance marking, gate pass events, and visitor pass events run through PostgreSQL RPC functions. The RPC boundary keeps state transitions transactional, validates tenant and branch ownership inside the database, and writes audit logs in the same transaction as the workflow change.

## RLS Strategy

Admins and superadmins manage branch workflow records through `private.is_presence_admin`. Students can read and create their own leave, attendance, gate pass, and visitor records through `private.is_student_self`. Direct status mutation is admin-only; student-facing actions go through validated server actions and RLS-backed inserts.

## Notifications

Server services create in-app notification records for leave requests, leave reviews, gate pass requests, gate pass status changes, and visitor approval requests. Notification writes use the service-role client because notifications are cross-recipient fan-out records; workflow data itself still uses the authenticated SSR client and RLS.

## Query Optimization

Workflow list pages filter by tenant, branch, status, date, and student. Matching composite indexes keep the hot dashboard paths predictable:

- leave: `(organization_id, hostel_branch_id, status, starts_at desc)`
- attendance: `(organization_id, hostel_branch_id, attendance_date desc, status)`
- gate pass: `(organization_id, hostel_branch_id, status, expected_exit_at desc)`
- visitor pass: `(organization_id, hostel_branch_id, status, scheduled_at desc)`

## Extensibility

The same module boundaries can support QR, biometric, mobile check-in, scheduled jobs, and other ERP products. Product-specific behavior should live in services and jobs; tenant isolation, ownership checks, workflow events, and audit logging remain shared infrastructure.
