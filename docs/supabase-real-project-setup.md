# Real Supabase Project Setup

This project already contains the production SaaS backend architecture. These steps only connect that architecture to a hosted Supabase project.

## What Already Exists

- Supabase SSR browser/server/proxy/admin clients live in `backend/lib/supabase/`.
- Env validation lives in `backend/lib/config/`.
- Migrations live in `backend/supabase/migrations/`.
- The private `student-documents` bucket is created by the students migration.
- Signed student document uploads are tenant-scoped by path:
  `organization_id/hostel_branch_id/student_id/random-file-name`.
- Integration tests are gated by `RUN_SUPABASE_INTEGRATION_TESTS=1` and a
  non-production `SUPABASE_INTEGRATION_TARGET`.

## One Manual Step

Create `backend/.env.local` from `backend/.env.example` and paste the real Supabase values:

```bash
cd backend
cp .env.example .env.local
```

Required values:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_publishable_key
SUPABASE_SECRET_KEY=sb_secret_your_server_secret_key
RUN_SUPABASE_INTEGRATION_TESTS=0
SUPABASE_INTEGRATION_TARGET=staging
LOG_LEVEL=info
```

Optional values:

```bash
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_ACCESS_TOKEN=sbp_your_personal_access_token
SUPABASE_DB_PASSWORD=your_database_password
DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
SUPABASE_PRODUCTION_PROJECT_REF=your-production-project-ref
# SUPABASE_CONFIRM_NON_PRODUCTION=1 # local-only bypass before production exists
```

Keep server secrets unprefixed. Anything prefixed with `NEXT_PUBLIC_` is browser-visible in Next.js.

## CLI Workflow

The project pins the Supabase CLI as a backend dev dependency. Approve its build
script once so pnpm can download the platform binary:

```bash
cd backend
pnpm approve-builds --all
pnpm rebuild supabase
pnpm supabase:status
```

If the local CLI binary cannot be downloaded in your environment, install and
authenticate the Supabase CLI globally. The scripts first try the pinned local
binary, then fall back to `supabase` on `PATH`.

The scripts load `backend/.env.local` before calling the CLI, so
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` can live there if you prefer
non-interactive commands.

```bash
pnpm verify:supabase
pnpm migrations:check
pnpm supabase:link
pnpm db:push:dry-run
pnpm db:push
pnpm types:db
```

Why this order:

- `verify:supabase` catches placeholder values and client/server key mixups before anything touches production.
- `migrations:check` validates deterministic migration filenames locally.
- `supabase:link` links `backend/supabase/config.toml` to the hosted project.
- `db:push:dry-run` shows pending migrations before applying them.
- `db:push` applies the SQL migrations through Supabase migration history.
- `types:db` regenerates `backend/types/database.types.ts` from the linked database.

## Validation

After linking and pushing migrations, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test:integration
```

To run the real Supabase integration suite, use a staging or disposable
Supabase project. Set `RUN_SUPABASE_INTEGRATION_TESTS=1` and
`SUPABASE_INTEGRATION_TARGET=staging` in `backend/.env.local`, then run:

```bash
pnpm verify:integration
pnpm db:test:reset
pnpm db:test:seed
pnpm test:integration:supabase
```

The integration helpers load `backend/.env.local`. When
`RUN_SUPABASE_INTEGRATION_TESTS=1`, missing or placeholder Supabase values,
unsafe targets, and production project-ref matches fail the test run instead of
silently skipping. Run those tests against a staging Supabase project or a
disposable branch. They verify tenant isolation, RLS, payment retries, room
assignment race protection, and superadmin boundaries.

See `docs/supabase-integration-testing.md` for CI secrets, fixture cleanup, and
local testing details.

## Storage Notes

The `student-documents` bucket is private and migration-managed. Uploads should continue to use the existing signed-upload service path rather than direct public uploads. The path includes tenant and branch IDs so storage objects remain auditable and can be cleaned up by tenant.

## Local Supabase Config

`backend/supabase/config.toml` exists so Supabase CLI commands can link and
validate this app root. The local database major version is currently set to
PostgreSQL 17. Keep this aligned with the hosted Supabase database major
version after checking the remote database with `SHOW server_version;`.
