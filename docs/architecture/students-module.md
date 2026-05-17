# Students Module

The Students module is branch-scoped and tenant-owned. The implementation keeps every write behind server-only authorization and lets PostgreSQL enforce the final isolation boundary.

```txt
Server page/action/API -> students service -> Supabase SSR/Admin client -> PostgreSQL RLS/RPC
```

Why:

- Server Components render protected student screens without exposing service-role keys.
- Server Actions own first-party dashboard form mutations.
- Route Handlers expose the same domain service to future mobile apps and integrations.
- PostgreSQL constraints, triggers, and RLS remain the source of truth for tenant isolation and bed allocation safety.

## Runtime Layout

```txt
backend/
  app/
    (protected)/
      students/
        page.tsx
        new/page.tsx
        [studentId]/edit/page.tsx
    api/v1/students/
      route.ts
      [studentId]/route.ts
      [studentId]/documents/upload-url/route.ts
      [studentId]/documents/[documentId]/complete/route.ts
  components/
    students/
      student-document-upload-form.tsx
      student-form.tsx
      student-table.tsx
  modules/
    students/
      actions.ts
      schemas.ts
      students.service.ts
  supabase/migrations/
    20260516003000_students_module.sql
  types/
    database.types.ts
    domain.ts
```

## Database Model

Core tables:

- `rooms`: branch-owned room inventory with `capacity`, status, soft delete, and audit timestamps.
- `room_beds`: branch-owned bed inventory linked to rooms.
- `students`: branch-owned student profiles with guardian info, emergency contact, generated code, status, soft delete, and metadata.
- `student_room_assignments`: active and historical bed assignments.
- `student_documents`: document metadata linked to Supabase Storage paths.
- `student_code_counters`: branch-local sequence state for deterministic student code generation.

Why:

- `organization_id` and `hostel_branch_id` are denormalized onto operational tables so RLS and indexes can filter without extra joins.
- Composite foreign keys ensure a student, room, and bed cannot cross tenant or branch boundaries.
- Soft deletes preserve audit history and prevent accidental reuse of identifiers while keeping active queries simple.

## Capacity Safety

Room over-allocation is blocked in two places:

- `room_beds` has a trigger that prevents creating more active beds than room capacity.
- `student_room_assignments` has a partial unique index on active `bed_id`, so one bed cannot be assigned to two active students.

Why:

- UI filtering improves ergonomics, but database constraints are the reliable concurrency boundary.
- Partial unique indexes support historical assignment rows while keeping active assignment rules strict.

## RLS Strategy

The migration enables and forces RLS on all Students module tables.

Access rules:

- Superadmins bypass through the centralized private helper.
- Tenant admins manage students only when their active membership includes the branch.
- Students may read their own student row, assignment, and documents when linked through `user_profile_id`.
- Code counters have no direct authenticated access and are only mutated through `security definer` functions.

Why:

- App authorization and RLS intentionally overlap; neither layer needs to trust the other completely.
- Helper functions keep policies readable and reusable as future ERP modules add their own tables.

## Service Boundary

`modules/students/students.service.ts` is the only place dashboard pages, Server Actions, and API routes call Supabase for student domain operations.

Why:

- Permissions, tenant validation, audit events, and database error mapping stay consistent across UI and API entry points.
- Services remain server-only and can safely use the Supabase admin client only for privileged Storage URL generation.

## Validation

`modules/students/schemas.ts` validates:

- list query filters and pagination
- create student input
- update student input
- room and bed assignment input
- soft delete input
- document upload URL input

Why:

- Zod keeps route handlers and Server Actions type-aligned.
- Empty form values are normalized before they reach PostgreSQL.

## Audit Events

The module records:

- `student.create`
- `student.update`
- `student.assign_bed`
- `student.soft_delete`
- `student_document.upload_url_created`
- `student_document.upload_completed`

Why:

- Privileged tenant operations need a durable trail.
- Audit events include organization and branch identifiers so operational reports remain tenant-safe.

## Extensibility

The module follows the same pattern future ERP products should use:

```txt
modules/<domain>/
  schemas.ts
  actions.ts
  <domain>.service.ts
app/(protected)/<domain>/
app/api/v1/<domain>/
supabase/migrations/<timestamp>_<domain>.sql
```

Why:

- Hostel ERP, clothing shop ERP, gym ERP, and inventory ERP modules can share RBAC, tenancy, validation, and audit infrastructure.
- Product-specific tables can stay modular while continuing to use the same organization and branch ownership model.
