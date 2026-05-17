# Supabase Integration Testing

This repository keeps integration tests safe by default and real in CI. The
default command exercises the Node test harness while skipping live Supabase
calls. The staging command runs the same tests against an explicit
non-production Supabase project.

## Test Commands

From the repository root:

```bash
pnpm test:integration
```

Runs the integration contracts with `RUN_SUPABASE_INTEGRATION_TESTS=0`.

```bash
SUPABASE_INTEGRATION_TARGET=staging pnpm verify:integration
SUPABASE_INTEGRATION_TARGET=staging pnpm db:test:reset
SUPABASE_INTEGRATION_TARGET=staging pnpm db:test:seed
SUPABASE_INTEGRATION_TARGET=staging pnpm test:integration:supabase
```

Runs real Supabase tests after validating that the target is `local`,
`staging`, or `disposable`.

```bash
pnpm test:integration:local
```

Runs the real tests against a local Supabase URL in `.env.local`.

## Required Environment

Real integration tests require:

```bash
RUN_SUPABASE_INTEGRATION_TESTS=1
SUPABASE_INTEGRATION_TARGET=staging
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_staging_key
SUPABASE_SECRET_KEY=sb_secret_your_staging_server_key
SUPABASE_PROJECT_REF=your-staging-project-ref
SUPABASE_ACCESS_TOKEN=sbp_your_personal_access_token
SUPABASE_DB_PASSWORD=your_staging_database_password
SUPABASE_PRODUCTION_PROJECT_REF=your-production-project-ref
```

Optional dedicated integration variables can replace the app variables for test
execution:

```bash
SUPABASE_INTEGRATION_URL=https://your-staging-project-ref.supabase.co
SUPABASE_INTEGRATION_PROJECT_REF=your-staging-project-ref
SUPABASE_INTEGRATION_PUBLISHABLE_KEY=sb_publishable_your_staging_key
SUPABASE_INTEGRATION_SECRET_KEY=sb_secret_your_staging_server_key
```

`SUPABASE_PRODUCTION_PROJECT_REF` is a safety guard. If the active project ref
matches it, integration tests refuse to run.

If no production Supabase project exists yet, set
`SUPABASE_CONFIRM_NON_PRODUCTION=1` locally. Do not use that bypass in CI once a
production project exists.

## CI Strategy

The GitHub Actions workflow has three related lanes:

- `Backend checks` runs repo hygiene, migration filename checks, lint,
  typecheck, build, and skipped-contract integration tests.
- `Supabase integration plan` always runs and explains whether the staging lane
  will execute. It fails fast when a trusted staging run is requested but
  required secrets are missing.
- `Supabase staging integration` installs the official Supabase CLI action,
  links a staging project, runs DB lint, performs a migration dry run, applies
  staging migrations, checks generated DB type drift, cleans stale fixtures,
  verifies fixture seeding, and runs the real RLS/RPC integration tests.

The staging lane runs automatically on pushes to `main` and through manual
`workflow_dispatch`. Pull requests run the backend contract suite only by
default, because applying PR migrations to a shared staging database is unsafe
unless the workflow is manually dispatched for that branch.

Configure these repository secrets for the staging lane:

```text
SUPABASE_STAGING_URL
SUPABASE_STAGING_PUBLISHABLE_KEY
SUPABASE_STAGING_SECRET_KEY
SUPABASE_STAGING_ACCESS_TOKEN
SUPABASE_STAGING_PROJECT_REF
SUPABASE_STAGING_DB_PASSWORD
SUPABASE_PRODUCTION_PROJECT_REF
```

The staging lane intentionally fails on trusted staging contexts when these
secrets are absent. Fork pull requests never receive staging secrets.

## Fixture Lifecycle

Integration fixture data is marked with `metadata.integration_test = true` and
uses `@example.test` auth users. The test runner performs cleanup before and
after real test runs.

`pnpm db:test:reset` removes stale integration organizations and auth users.
It does not drop schemas, reset migrations, or touch unmarked tenant data.

`pnpm db:test:seed` creates a short-lived smoke tenant, verifies the branch was
inserted, and removes it immediately. It is a staging safety check, not a
long-lived seed dataset.

## What The Real Tests Validate

- Tenant admins cannot read another tenant's branch.
- Student RLS allows only the correct branch-scoped student data.
- Payment idempotency returns the original payment on retry.
- Concurrent room assignment cannot allocate one bed to two students.
- Superadmin analytics refresh boundaries work without tenant membership.
- Service-role fixture setup can verify seeded tenant data.

## Safety Rules

- Never point this suite at production.
- Keep production and staging Supabase secrets separate.
- Always set `SUPABASE_PRODUCTION_PROJECT_REF` in CI.
- Do not weaken RLS or use service role inside user-client assertions.
- Use staging/disposable projects for migration application in CI.

References:

- Supabase CI testing: https://supabase.com/docs/guides/deployment/ci/testing
- Supabase GitHub CLI action: https://github.com/supabase/setup-cli
