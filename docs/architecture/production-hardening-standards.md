# Production Hardening Standards

This document defines the non-negotiable engineering standards for the multi-tenant ERP platform.

## Database Safety

- Every tenant-owned table must include `organization_id`, and branch-owned hostel tables must also include `hostel_branch_id`.
- Every tenant-owned read path must be protected twice: application permission guard plus PostgreSQL RLS.
- Financial mutations must be RPC-backed, lock the aggregate row with `for update`, and write audit rows in the same transaction.
- Provider-backed writes must accept an idempotency key and a provider reference/event id. Retries must return the original result rather than creating duplicates.
- Long-running analytics refreshes must be requested as jobs. User requests enqueue work; service-role workers execute work.

## API And Service Standards

- Route handlers stay thin: parse input, create request context, call a service, return a response.
- Services own authorization and business rules.
- Repositories own query construction and must enforce DB-level pagination.
- Search filters must use `buildOrIlikeFilter` or a dedicated RPC/full-text-search function. Do not interpolate raw user input into PostgREST filter strings.
- Export endpoints must enforce a max date range and row limit. Large exports belong in a background job and object storage.
- Mutating browser requests must pass same-origin validation. Production requests
  must include a same-origin `Origin` or `Referer` header; development keeps a
  compatibility fallback for local tooling.
- High-risk mutation paths must be rate-limit-ready. The in-memory limiter is
  the local fallback behind the shared `RateLimitStore` interface; use a
  Redis/Upstash-backed adapter before horizontally scaled production.
- Server actions should remain form-post friendly, but high-risk forms must be protected by same-origin checks, SameSite cookies, and durable audit events.
- Upload workflows must use signed URLs, tenant-scoped paths, explicit MIME allow-lists, file-size bounds, and a future malware scan/object verification step.

## Logging Standard

Every production log emitted from request or job code should include:

- `request_id`
- `tenant_id`
- `branch_id`
- `actor_user_id`
- `event_type`
- `error_code`

Use `createRequestLogger` so logs are structured consistently and sensitive fields are redacted by pino.

## Permission Standard

- Add every new permission to `types/domain.ts`.
- Add metadata for every permission in `lib/auth/permissions.ts`.
- Keep role grants in sync with `tenant_role_definitions` migrations.
- High-risk permissions include membership management, billing management, payment recording, audit reads, report exports, and tenant updates.

## Testing Standard

Minimum production test coverage for every new module:

- RLS isolation test across two tenants.
- Admin and student boundary test.
- Superadmin bypass test when applicable.
- RPC race/idempotency test for financial or occupancy workflows.
- Route validation test for malformed input and max bounds.

Integration tests are gated by `RUN_SUPABASE_INTEGRATION_TESTS=1` and require Supabase URL, publishable key, and service-role key.

## Repository Hygiene Standard

- `.env.example` must contain placeholders only.
- `.env.local`, Supabase `.temp`, build output, archives, and TypeScript build info must never be committed.
- Run `pnpm repo:hygiene` before release branches.
- Nested `.git` directories are allowed only when intentionally using submodules; otherwise preserve history first, then remove them manually.

## Backend Freeze Guidance

- Backend architecture may be soft-frozen once lint, typecheck, build, migration
  checks, DB lint, type generation, and live Supabase integration tests pass
  against staging.
- After freeze, prefer additive changes: new repository methods, new UI-facing
  route handlers, and small security/test hardening.
- Avoid schema rewrites or permission model changes unless a live integration
  test proves a production blocker.
