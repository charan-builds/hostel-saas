# 01 - Backend Foundation for Hostel ERP SaaS

Use the master architecture context from `prompts/master-system-prompt.md`.

We are building a production-grade multi-tenant Hostel ERP SaaS using Next.js 16 App Router, TypeScript, Supabase, PostgreSQL, and Tailwind CSS.

Tenant hierarchy:

```txt
Organization -> Hostel Branches -> Users
```

Roles:

```txt
superadmin
admin
student
```

This foundation is intentionally backend-first. The Next.js application root is `backend/`; all runtime paths below are relative to `backend/` unless noted otherwise.

## 1. Recommended Production Folder Structure

```txt
backend/
  app/
    (auth)/
    (dashboard)/
    api/
      v1/
        organizations/
          route.ts
        hostel-branches/
          route.ts
        users/
          route.ts
  lib/
    auth/
      guards.ts
      session.ts
    config/
      public-env.ts
      server-env.ts
    http/
      errors.ts
      response.ts
    logger/
      index.ts
    modules/
      organizations/
        organization.repository.ts
        organization.schemas.ts
        organization.service.ts
        organization.types.ts
      hostel-branches/
        hostel-branch.repository.ts
        hostel-branch.schemas.ts
        hostel-branch.service.ts
        hostel-branch.types.ts
      users/
        user.repository.ts
        user.schemas.ts
        user.service.ts
        user.types.ts
    supabase/
      admin.ts
      browser.ts
      client.ts
      proxy.ts
      server.ts
    validation/
      zod.ts
  supabase/
    migrations/
      20260516000000_initial_tenant_foundation.sql
  types/
    database.types.ts
    domain.ts
prompts/
  master-system-prompt.md
  01-database-foundation.md
```

Why:

- `backend/app/api/v1/*/route.ts` gives an explicit versioned API surface for mobile apps, admin panels, and third-party integrations.
- `backend/lib/modules/*` keeps business domains isolated. Each domain owns its schemas, service rules, and data access layer.
- `backend/lib/supabase/*` centralizes Supabase client creation so auth/session behavior is consistent across Server Components, Route Handlers, Server Actions, and Client Components.
- `backend/supabase/migrations/*` makes database state reproducible and reviewable instead of dashboard-only.
- `backend/types/database.types.ts` should be generated from Supabase in CI after schema changes.

## 2. Supabase Client Setup

Required packages:

```bash
cd backend
pnpm add @supabase/supabase-js @supabase/ssr zod pino server-only
```

Browser client: `backend/lib/supabase/browser.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/config/public-env";
import type { Database } from "@/types/database.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
```

Why:

- Browser code must only receive publishable/public Supabase credentials.
- `createBrowserClient` handles client-side Auth storage for Supabase SSR projects.
- The `Database` generic keeps queries typed.

Server client: `backend/lib/supabase/server.ts`

```ts
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/lib/config/public-env";
import type { Database } from "@/types/database.types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies; Proxy refreshes the session.
          }
        },
      },
    },
  );
}
```

Why:

- Next.js Server Components and Route Handlers read session cookies server-side.
- Supabase SSR requires `getAll` and `setAll`; avoid older `get`, `set`, and `remove` cookie methods.
- `server-only` prevents accidental import into client bundles.

Admin/service-role client: `backend/lib/supabase/admin.ts`

```ts
import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/config/server-env";
import type { Database } from "@/types/database.types";

export function createSupabaseAdminClient() {
  const secretKey =
    serverEnv.SUPABASE_SECRET_KEY ?? serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or legacy SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient<Database>(serverEnv.NEXT_PUBLIC_SUPABASE_URL, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
```

Why:

- Admin clients bypass RLS and must never run in browsers.
- Disabling session persistence avoids writing privileged keys into any session storage.
- Prefer Supabase's newer secret key naming; keep legacy service-role fallback only for migration compatibility.

Proxy session refresh: `backend/proxy.ts` and `backend/lib/supabase/proxy.ts`

Why:

- In Next.js 16, Middleware is renamed to Proxy.
- Proxy refreshes Supabase Auth cookies before Server Components read them.
- Use `supabase.auth.getClaims()` or `getUser()` server-side for verified auth checks; never authorize from `getSession()` alone.

## 3. Environment Variable Structure

Committed template: `backend/.env.example`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key

SUPABASE_SECRET_KEY=sb_secret_your_key
# SUPABASE_SERVICE_ROLE_KEY=your_legacy_service_role_key

DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
LOG_LEVEL=info
```

Why:

- Only `NEXT_PUBLIC_*` variables are allowed to reach browser bundles.
- Supabase secret/service keys and database URLs must remain server-only.
- `.env.example` documents configuration without leaking real secrets.

## 4. Type-Safe Configuration Setup

Files:

```txt
backend/lib/config/public-env.ts
backend/lib/config/server-env.ts
```

Why:

- Zod validates configuration at module load instead of failing deep inside request handling.
- Split public and server env modules so secrets are not imported into client components.
- `server-only` marks server config as a hard boundary.

Recommended rule:

```txt
Client Component -> may import public-env only
Server Component / Route Handler / Server Action -> may import server-env
```

## 5. Database Naming Conventions

Tables:

```txt
organizations
hostel_branches
user_profiles
```

Columns:

```txt
id uuid primary key default gen_random_uuid()
organization_id uuid
hostel_branch_id uuid
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
deleted_at timestamptz
created_by uuid
updated_by uuid
```

Indexes:

```txt
{table}_{columns}_idx
{table}_{columns}_unique_active
```

Policies:

```txt
{table}_{operation}_{scope}
```

Why:

- Plural snake_case tables match PostgreSQL and Supabase conventions.
- UUIDs avoid predictable identifiers and make distributed inserts safer.
- `deleted_at` supports soft deletion and partial unique indexes.
- Audit columns support compliance, support investigations, and admin history.
- Partial indexes keep active-row queries fast without bloating uniqueness for archived data.

## 6. API Architecture Recommendations

Recommended flow:

```txt
route.ts -> validate input -> authorize -> service -> repository -> Supabase/Postgres
```

Example:

```ts
// app/api/v1/organizations/route.ts
import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createOrganizationSchema } from "@/lib/modules/organizations/organization.schemas";
import { createOrganization } from "@/lib/modules/organizations/organization.service";

export async function POST(request: Request) {
  try {
    const body = validateInput(createOrganizationSchema, await request.json());
    const organization = await createOrganization(body);

    return Response.json({ data: organization }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

Why:

- Route Handlers stay thin and predictable.
- Services own business rules and authorization checks.
- Repositories own query shape and indexing assumptions.
- Versioned APIs allow breaking changes without disrupting mobile clients.

## 7. Validation Architecture Using Zod

Shared helper: `backend/lib/validation/zod.ts`

```ts
export function validateInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
      message: "Invalid request payload.",
      statusCode: 422,
    });
  }

  return parsed.data;
}
```

Why:

- All external input is untrusted: request bodies, query strings, route params, webhooks, and CSV imports.
- Zod produces runtime validation and TypeScript inference from the same source.
- Validation errors become consistent API responses.

Module schema example:

```ts
// lib/modules/organizations/organization.schemas.ts
import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/),
});
```

## 8. Error Handling Architecture

Shared file: `backend/lib/http/errors.ts`

Principles:

- Throw `AppError` for expected application failures.
- Convert unknown failures to `INTERNAL_ERROR`.
- Do not expose stack traces, SQL details, Supabase secret responses, or internal policy names to clients.
- Include a request id once request tracing is added.

Why:

- Consistent error envelopes make frontend and mobile clients easier to build.
- Separating expected and unexpected errors improves observability.
- Error details must be useful to developers without leaking sensitive internals.

Recommended envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload.",
    "details": {},
    "requestId": "req_..."
  }
}
```

## 9. Recommended Package Installations

Installed runtime packages:

```bash
cd backend
pnpm add @supabase/supabase-js @supabase/ssr zod pino server-only
```

Recommended near-term dev packages:

```bash
cd backend
pnpm add -D vitest @testing-library/react @testing-library/jest-dom playwright
pnpm add -D eslint-plugin-security knip prettier
```

Recommended Supabase tooling:

```bash
cd backend
pnpm dlx supabase init
pnpm dlx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > types/database.types.ts
```

Runtime guard:

```json
{
  "engines": {
    "node": ">=20.9.0",
    "pnpm": ">=10.0.0"
  }
}
```

Why:

- Supabase packages provide the latest SSR client pattern.
- Zod gives runtime validation.
- Pino gives structured JSON logs suitable for production log pipelines.
- Vitest and Playwright cover service logic and critical browser flows.
- Generated Supabase types remove hand-maintained database type drift.
- Next.js 16 requires Node 20.9.0 or newer, so the project should fail early on older runtimes.

## 10. Security Best Practices

Baseline:

- Enable RLS on every table in exposed schemas.
- Never use service-role or secret keys in browser code.
- Keep server-only files marked with `import "server-only"`.
- Use Supabase Auth JWTs plus RLS for authorization, not frontend state.
- Validate all inputs with Zod before writes.
- Use allowlisted redirects for auth callbacks.
- Add rate limiting for auth, invite, billing, and write-heavy endpoints.
- Keep secrets out of logs with logger redaction.
- Add security headers in `backend/next.config.ts`.
- Do not use `auth.users` directly from client-facing code.

Why:

- Multi-tenant SaaS failure modes are mostly authorization and data isolation failures.
- RLS turns tenant isolation into a database invariant instead of a UI convention.
- Service-role mistakes are high-impact because they bypass RLS.

## 11. Multi-Tenant Architecture Recommendations

Current model:

```txt
organizations.id
hostel_branches.organization_id
user_profiles.organization_id
user_profiles.hostel_branch_id
```

Rules:

- Every tenant-owned table must include `organization_id`.
- Branch-scoped tables should include both `organization_id` and `hostel_branch_id`.
- Use composite foreign keys when branch rows must belong to the same organization.
- Put `organization_id` first in common multi-column indexes.
- Never accept tenant ids from client input without verifying membership in RLS/service code.

Why:

- Organization-level scoping supports billing, admin dashboards, reports, and future enterprise accounts.
- Branch-level scoping supports hostel operations without duplicating organizations.
- Composite tenant keys prevent cross-tenant branch assignment bugs.

Future pattern for feature tables:

```sql
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  hostel_branch_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (hostel_branch_id, organization_id)
    references public.hostel_branches (id, organization_id)
);

create index rooms_org_branch_active_idx
  on public.rooms (organization_id, hostel_branch_id)
  where deleted_at is null;
```

## 12. Row-Level Security Strategy

Migration file:

```txt
backend/supabase/migrations/20260516000000_initial_tenant_foundation.sql
```

Strategy:

- Create helper functions in `private` schema.
- Use `security definer` helper functions for current role/org/branch lookups.
- Wrap auth helpers as `(select auth.uid())` or `(select private.function())` for better policy performance.
- Add indexes for every column used in policies.
- Use `to authenticated` in every authenticated policy.
- Grant no table access to `anon` for ERP core tables.
- Prefer soft delete via `deleted_at` and omit broad `delete` policies.

Why:

- RLS policies must be fast because they run on every query.
- A private schema keeps helper functions outside exposed Supabase API schemas.
- Policy role targeting avoids evaluating tenant checks for unauthenticated requests.
- Soft delete reduces accidental destructive operations and preserves auditability.

Policy shape:

```sql
create policy "hostel_branches_select_tenant_members"
  on public.hostel_branches
  for select
  to authenticated
  using (
    deleted_at is null
    and (select private.can_access_organization(organization_id))
  );
```

## 13. Recommended TypeScript Strict Settings

Current baseline in `backend/tsconfig.json`:

```json
{
  "strict": true,
  "exactOptionalPropertyTypes": true,
  "forceConsistentCasingInFileNames": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitOverride": true,
  "noUncheckedIndexedAccess": true,
  "allowJs": false,
  "target": "ES2022"
}
```

Why:

- `strict` prevents implicit unsafe assumptions.
- `noUncheckedIndexedAccess` catches missing map/array values.
- `exactOptionalPropertyTypes` distinguishes absent values from explicit `undefined`.
- `allowJs: false` keeps the production backend TypeScript-only.
- `ES2022` is a better runtime target for current server environments than legacy browser-era output.

## 14. Logging Strategy

File:

```txt
backend/lib/logger/index.ts
```

Rules:

- Log structured JSON.
- Redact tokens, cookies, authorization headers, passwords, and refresh tokens.
- Use `info` for business events, `warn` for recoverable issues, and `error` for failed operations.
- Include `organizationId`, `hostelBranchId`, `userId`, `requestId`, and route metadata where available.
- Do not log full request bodies by default.

Why:

- Production incidents need searchable structured logs.
- Tenant ids make it possible to debug one organization without exposing another.
- Redaction is mandatory because auth cookies and tokens may pass through server code.

Example:

```ts
logger.info(
  {
    organizationId,
    hostelBranchId,
    userId,
  },
  "Created hostel branch",
);
```

## 15. Recommended Development Workflow

Workflow:

```txt
1. Write or update Zod schemas.
2. Write migration SQL.
3. Apply migration locally.
4. Generate Supabase types.
5. Implement repository queries.
6. Implement service rules.
7. Add Route Handler or Server Action.
8. Add unit/integration tests.
9. Run lint, typecheck, build.
10. Review query plans for high-volume paths.
```

Commands:

```bash
cd backend
pnpm lint
pnpm build
pnpm dlx supabase db lint
pnpm dlx supabase gen types typescript --local > types/database.types.ts
```

Why:

- Schema first keeps database, RLS, and TypeScript aligned.
- Generated types catch query drift.
- Reviewable migrations are safer than dashboard-only changes.

## 16. Git Strategy

Branches:

```txt
main
develop
feature/backend-foundation
feature/module-name
fix/short-bug-name
release/yyyy-mm-dd
```

Rules:

- Protect `main`.
- Require PR review for migrations, auth, RLS, payment, and billing changes.
- Squash feature branches unless preserving migration history is useful.
- Never rewrite shared migration history after it reaches `main`.
- Use conventional commits:

```txt
feat(db): add tenant foundation migration
feat(auth): add supabase ssr clients
fix(rls): restrict branch updates to org admins
chore(types): regenerate supabase database types
```

Why:

- Migrations are production artifacts; rewriting them after deployment creates drift.
- Conventional commits support changelogs and release notes.
- Auth/RLS/payment changes deserve stricter review because mistakes are high-impact.

## 17. Future Scalability Recommendations

Database:

- Keep `organization_id` on all tenant-owned tables.
- Use partial indexes for active rows.
- Add covering indexes for high-volume list pages after real query patterns exist.
- Use keyset pagination for large tables.
- Partition only when measurements justify it, such as huge audit/event tables.
- Move analytics/reporting into materialized views or a warehouse when OLTP queries suffer.

Application:

- Prefer Server Components for read-heavy pages.
- Keep mutations in Route Handlers or Server Actions with shared service logic.
- Add background jobs for emails, invoices, notifications, imports, and report generation.
- Add idempotency keys for payments and webhook handling.
- Add OpenTelemetry tracing before traffic grows.

Supabase:

- Keep RLS policies simple and indexed.
- Use Realtime only for focused user experiences, not broad tenant-wide streams.
- Use Storage policies with the same organization/branch scoping model.
- Use Edge Functions only where they are clearly better than Next.js server code.

Why:

- 100k+ users is less about one magic abstraction and more about consistently indexed tenant queries, bounded response sizes, background processing, and measurable bottlenecks.
- The foundation should let feature modules grow without weakening tenant isolation.

## Implementation Checklist

- [x] Install runtime packages.
- [x] Add type-safe public/server env parsing.
- [x] Add Supabase browser/server/admin clients.
- [x] Add Next 16 Proxy session refresh.
- [x] Add shared validation helper.
- [x] Add shared error envelope.
- [x] Add structured logger.
- [x] Add initial tenant/RLS SQL migration.
- [x] Add stricter TypeScript settings.
- [x] Add `.env.example`.
- [ ] Connect a real Supabase project.
- [ ] Run migration against local Supabase.
- [ ] Generate real Supabase database types.
- [ ] Add module services and repositories for first business feature.

## Source Alignment

Use these official docs as the baseline for this foundation:

- Next.js Turbopack root configuration: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
- Next.js App Router Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js 16 Proxy: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Supabase SSR client setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase service/secret key server usage: https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
      