# Production Readiness Checklist

## Required Before Launch

- [ ] Apply all Supabase migrations through `20260517001000_move_citext_extension_schema.sql`.
- [ ] Rotate any Supabase keys that were ever copied into `.env.example`, docs, prompts, logs, or chat output.
- [ ] Keep `backend/.env.example` placeholder-only and run `pnpm repo:hygiene` before every release branch.
- [ ] Configure `JOB_RUNNER_SECRET` before enabling internal worker HTTP entrypoints.
- [ ] Verify payment retries return the original payment for the same idempotency key.
- [ ] Run `pnpm test:integration:supabase` against a staging or disposable Supabase project.
- [ ] Deploy an analytics worker that claims `analytics_refresh_jobs` and calls `perform_analytics_refresh_job`.
- [ ] Add rate-limit backing storage before multi-instance production scale if in-memory limits are insufficient.
- [ ] Configure structured log ingestion with `request_id`, tenant, branch, actor, event, and error fields.
- [ ] Add alerting for failed analytics jobs, payment conflicts, RPC failures, and service-role errors.
- [ ] Configure CI branch protection for repo hygiene, migration checks, lint, typecheck, build, and integration contract tests.

## Background Job Strategy

- User-facing requests only enqueue jobs.
- Workers run with service role and use database claim/lock functions.
- HTTP-triggered internal workers must send `Authorization: Bearer $JOB_RUNNER_SECRET` or `x-job-runner-secret`.
- Analytics refresh workers can call `POST /api/internal/jobs/analytics-refresh` with `{ "jobId": "<uuid>" }`.
- Jobs must have status, attempts, lock metadata, last error, and completion timestamps.
- Expensive jobs should use advisory locks to prevent duplicate tenant-wide or global work.
- Large report exports should write files to object storage and notify the requester when ready.

## Monitoring Signals

- `billing.payment.record` failures and duplicate idempotency attempts.
- `analytics.snapshot.refresh_requested`, `refresh_completed`, and `refresh_failed`.
- RLS-denied PostgREST/RPC requests.
- Slow report queries and export generation time.
- Audit log insert failures, especially when `durable` audit mode is used.
