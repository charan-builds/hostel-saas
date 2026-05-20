# Hostel ERP Backend

This directory is the only Next.js application root for the Hostel ERP SaaS.

```bash
nvm use
pnpm install
pnpm approve-builds --all
pnpm rebuild supabase
pnpm runtime:check
pnpm repo:hygiene
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test:integration
```

The repository root keeps prompts and wrapper scripts only. Runtime files such as `app/`, `lib/`, `types/`, `supabase/`, `proxy.ts`, `next.config.ts`, and `tsconfig.json` live here so Next.js 16 and Turbopack resolve from one clean project root.

## Connect Supabase

Paste real Supabase values into `.env.local`, then run:

```bash
pnpm verify:supabase
pnpm migrations:check
pnpm supabase:link
pnpm db:push:dry-run
pnpm db:push
pnpm types:db
```

`pnpm verify:supabase`, `pnpm db:push`, `pnpm db:lint`, and `pnpm types:db`
use the pinned local Supabase CLI when its approved build downloaded correctly,
then fall back to `supabase` on `PATH`. Internal cron/worker HTTP entrypoints
also require `JOB_RUNNER_SECRET` before they will execute.

See `../docs/supabase-real-project-setup.md` for the full hosted-project workflow.

## Student Phone OTP Login

Student portal login uses Supabase phone OTP and preserves the existing
`user_profiles`, `tenant_memberships`, and RLS model. Enable phone authentication
and configure an SMS provider in Supabase, then keep student phone numbers in
international format where possible:

```bash
AUTH_DEFAULT_PHONE_COUNTRY_CODE=+91
```

Students request OTPs through `/student-login` or
`POST /api/auth/student/otp/send`, then verify through
`POST /api/auth/student/otp/verify`. The verified session opens
`/student-portal`.

## Cashfree Payments

Online rent collection uses Cashfree from server-only route handlers. Add these
values to `.env.local` when enabling online checkout:

```bash
CASHFREE_ENV=sandbox
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_WEBHOOK_SECRET=your_cashfree_webhook_secret_or_secret_key
```

Use `POST /api/v1/billing/invoices/[invoiceId]/payment-session` to create the
checkout session. Configure Cashfree to send payment webhooks to
`/api/webhooks/cashfree`; browser redirects are informational and do not finalize
payments.

## Public Booking Workflow

Public hostel enquiries use booking-specific tables and APIs instead of writing
directly into students or billing. The main endpoints are:

```bash
GET  /api/public/bookings/availability
POST /api/public/bookings
POST /api/public/bookings/contact
POST /api/public/bookings/:bookingRequestId/payment-session
GET  /api/v1/bookings
PATCH /api/v1/bookings/:bookingRequestId/status
POST /api/v1/bookings/:bookingRequestId/convert
```

Public payment sessions are advance-payment only and require the public access
token returned at booking creation. Cashfree webhooks finalize booking payments;
frontend redirects never mark bookings as paid.

## Real Integration Tests

The default integration command verifies the test contracts while keeping live
Supabase calls skipped:

```bash
pnpm test:integration
```

Real RLS/RPC/payment/race-condition tests require a non-production target:

```bash
SUPABASE_INTEGRATION_TARGET=staging pnpm verify:integration
SUPABASE_INTEGRATION_TARGET=staging pnpm db:test:reset
SUPABASE_INTEGRATION_TARGET=staging pnpm db:test:seed
SUPABASE_INTEGRATION_TARGET=staging pnpm test:integration:supabase
```

Use `pnpm test:integration:local` when `.env.local` points at a local Supabase
stack. CI uses a dedicated staging/disposable project and refuses to run when
the configured project matches `SUPABASE_PRODUCTION_PROJECT_REF`.
