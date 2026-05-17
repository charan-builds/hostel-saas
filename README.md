# Hostel ERP

Production-grade multi-tenant Hostel ERP SaaS built with Next.js App Router,
TypeScript, Supabase SSR, PostgreSQL, RLS, and pnpm.

## Repository Layout

```text
hostel-erp/
  backend/        Next.js app root, Supabase migrations, modules, tests
  docs/           Architecture, setup, hardening, and launch guidance
  prompts/        Planning prompts and generated architecture notes
```

`backend/` is the only Next.js runtime root. Keep `app/`, `lib/`, `modules/`,
`types/`, `supabase/`, `proxy.ts`, `next.config.ts`, and `tsconfig.json` inside
`backend/` so Turbopack and TypeScript resolve from one deterministic app root.

## Required Runtime

Use Node 22. The repository is pinned with `.nvmrc`.

```bash
nvm use
corepack enable
pnpm --version
pnpm runtime:check
```

## Install

```bash
cd backend
pnpm install
pnpm approve-builds --all
pnpm rebuild supabase
```

The Supabase CLI npm package downloads its platform binary during its approved
build step. If your network blocks GitHub release downloads, install the
Supabase CLI globally and ensure `supabase --version` works.

## Local Checks

From the repository root:

```bash
pnpm repo:hygiene
pnpm migrations:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test:integration
```

`pnpm test:integration` runs the integration contract suite with real Supabase
calls skipped. Real database tests require an explicit non-production target:

```bash
RUN_SUPABASE_INTEGRATION_TESTS=1 SUPABASE_INTEGRATION_TARGET=staging pnpm test:integration:supabase
```

Use `pnpm test:integration:supabase` only against a staging or disposable
Supabase project. Use `pnpm test:integration:local` for a local Supabase stack.
GitHub Actions runs the real staging lane on pushes to `main` or manual
workflow dispatch after the staging secrets are configured.

## Supabase Setup

Create `backend/.env.local` from `backend/.env.example`, paste real project
values, then run:

```bash
pnpm verify:supabase
pnpm supabase:link
pnpm db:push:dry-run
pnpm db:push
pnpm types:db
```

Full hosted-project setup lives in
[`docs/supabase-real-project-setup.md`](docs/supabase-real-project-setup.md).
The real integration-test strategy lives in
[`docs/supabase-integration-testing.md`](docs/supabase-integration-testing.md).

## Production Notes

- Keep `.env.local`, Supabase `.temp`, `.next`, archives, and build info out of
  Git.
- Server secrets must never use `NEXT_PUBLIC_`.
- Run live RLS/integration tests before pilot onboarding.
- Replace the in-memory rate-limit fallback with a Redis/Upstash-backed adapter
  before horizontally scaled production traffic.
- Configure `JOB_RUNNER_SECRET` before enabling internal job HTTP entrypoints.
