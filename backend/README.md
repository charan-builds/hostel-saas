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
