# Tenant Onboarding Bootstrap

The onboarding workflow creates a usable tenant in one controlled flow:

```txt
superadmin -> server action/API -> auth admin user -> transactional SQL RPC -> active tenant cookie
```

## Why This Shape

Supabase Auth user creation lives outside the application Postgres transaction. The service therefore uses a practical enterprise pattern:

```txt
1. Check tenant slug availability.
2. Create the tenant admin auth user with the service-role client.
3. Call public.bootstrap_tenant(...) for all tenant-owned rows.
4. If the SQL transaction fails, delete the newly created auth user.
5. Set the active tenant cookie only after the transaction succeeds.
```

This gives strong consistency for tenant data and a safe compensating action for the one external side effect.

## Files

```txt
backend/
  app/
    (protected)/super-admin/onboarding/page.tsx
    api/v1/tenants/bootstrap/route.ts
  modules/onboarding/
    actions.ts
    bootstrap.service.ts
    schemas.ts
  supabase/migrations/
    20260516002000_tenant_onboarding_bootstrap.sql
```

## Database Writes

The transactional RPC creates:

- `organizations`
- default `hostel_branches`
- tenant admin `user_profiles`
- active admin `tenant_memberships`
- default `tenant_role_definitions`
- default `tenant_settings`
- `audit_logs` event: `tenant.bootstrap`

## Product Model

Supported product enum values:

- `hostel_erp`
- `clothing_shop_erp`
- `gym_erp`
- `inventory_erp`

The current physical-branch table remains `hostel_branches` because the first product is Hostel ERP. Product-specific modules should avoid hard-coding the table name in business logic; use tenant context and future repositories as the abstraction boundary.

## Security Rules

- Only `superadmin` can call the onboarding server action/API route.
- The bootstrap RPC is granted to `service_role` only.
- Tenant tables still use RLS for normal authenticated access.
- Active tenant cookies are HTTP-only and are never trusted without server-side membership checks.
- Duplicate active organization slugs are rejected before auth-user creation and again inside the SQL transaction.

## Server Action vs API Route

Use the server action for the internal Superadmin UI.

Use the route handler when an internal control plane or automation client needs an API surface.

Both paths call the same `bootstrapTenantForProduct` service to keep authorization, validation, compensation, and audit behavior consistent.
