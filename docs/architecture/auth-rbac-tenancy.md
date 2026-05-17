# Auth, RBAC, and Tenant Authorization

The production auth foundation uses three layers:

```txt
Proxy session gate -> Server tenant/RBAC guard -> PostgreSQL RLS
```

Why:

- Proxy is the right place for fast, optimistic session checks and Supabase cookie refresh.
- Server Components, Route Handlers, and Server Actions are the right place for database-backed authorization.
- PostgreSQL RLS is the final data isolation boundary, so tenant safety does not depend on UI state.

## Runtime Layout

```txt
backend/
  app/
    (auth)/
      login/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      admin/page.tsx
      super-admin/page.tsx
    api/v1/tenant/memberships/route.ts
    unauthorized/page.tsx
  components/
    layout/app-shell.tsx
  lib/
    audit/log.ts
    auth/
      guards.ts
      page-guards.ts
      permissions.ts
      routes.ts
      session.ts
    tenancy/
      active-tenant.ts
      context.ts
    supabase/
      proxy.ts
      server.ts
  modules/
    auth/
      actions.ts
      schemas.ts
    tenant/
      actions.ts
      schemas.ts
  supabase/migrations/
    20260516001000_auth_rbac_tenant_memberships.sql
```

## Role Model

`superadmin` is global and remains on `user_profiles.role`.

`admin` and `student` are tenant/product scoped through `tenant_memberships`.

Why:

- Global superadmin bypass should be rare, explicit, and auditable.
- Tenant membership rows let one user belong to multiple organizations or products.
- Product scoping keeps the model reusable for hostel ERP, clothing shop ERP, gym ERP, and inventory ERP systems.

## Proxy Rules

`backend/proxy.ts` delegates to `backend/lib/supabase/proxy.ts`.

Proxy responsibilities:

- Refresh Supabase SSR cookies.
- Redirect anonymous users away from protected routes.
- Redirect authenticated users away from `/login`.

Proxy does not query tenant membership tables.

Why:

- Proxy should stay fast and deterministic.
- Tenant authorization needs database checks, audit context, and RLS compatibility.

## Server Guards

Use these server-only utilities:

- `requireAuthenticated()` for identity only.
- `requireTenantAccess()` for tenant membership.
- `requirePermission()` for RBAC.
- `requireRole()` for explicit role-only routes.
- `requireTenantPageAccess()` in Server Component layouts/pages.

Why:

- Server-only guards prevent client-side authorization drift.
- Permission checks are reusable across pages, server actions, and route handlers.
- `superadmin` bypass is centralized instead of repeated across modules.

## RLS Strategy

The database migration adds:

- `saas_product` enum.
- `membership_status` enum.
- `tenant_memberships`.
- `audit_logs`.
- `private.has_active_membership()`.
- Updated `private.is_org_admin()` and `private.can_access_organization()`.

Why:

- RLS policies can enforce tenant isolation independently of application bugs.
- Private `security definer` helpers keep policy logic fast and outside exposed API schemas.
- Audit logs provide a durable trail for privileged actions.

## Development Rules

- Server Components by default.
- Use Server Actions for app-owned form mutations.
- Use Route Handlers for API surfaces that mobile apps or integrations may call.
- Validate every input with Zod before authorization-sensitive writes.
- Never import service-role clients into client components.
- Never trust active tenant cookies without revalidating membership.

Official references:

- Next.js Proxy: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Supabase SSR clients: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
