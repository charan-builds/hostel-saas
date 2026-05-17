# Rooms And Bed Management Module

The Rooms module owns hostel room inventory, bed lifecycle, vacancy analytics, and student movement between beds. It is fully admin configurable: branches, floors, templates, rooms, capacity, pricing, and labels are tenant data rather than hardcoded application structure.

```txt
Protected page/action/API -> rooms service -> rooms repository -> Supabase SSR -> PostgreSQL RLS/RPC
```

Why:

- Dashboard forms use Server Actions for first-party mutations.
- Route Handlers expose the same domain operations for future mobile apps and integrations.
- Repository functions keep read queries reusable without spreading Supabase query construction across pages.
- RPC functions keep create/delete/transfer/unassign workflows transactional and auditable.

## Runtime Layout

```txt
backend/
  app/
    (protected)/
      rooms/
        page.tsx
        new/page.tsx
        settings/page.tsx
        [roomId]/page.tsx
        [roomId]/edit/page.tsx
    api/v1/rooms/
      route.ts
      branches/route.ts
      floors/route.ts
      templates/route.ts
      [roomId]/route.ts
      [roomId]/beds/route.ts
      beds/[bedId]/status/route.ts
      transfers/route.ts
      assignments/[assignmentId]/unassign/route.ts
  components/
    rooms/
      bed-grid.tsx
      occupancy-cards.tsx
      room-form.tsx
      room-table.tsx
  modules/
    rooms/
      actions.ts
      rooms.repository.ts
      rooms.service.ts
      schemas.ts
  supabase/migrations/
    20260516004000_rooms_beds_management.sql
```

## Database Model

The migration adds:

- `hostel_floors` for branch-scoped floor configuration.
- `room_categories` for branch-scoped category/pricing groupings.
- `room_templates` for admin-defined room type keys, default capacity, pricing, and bed-label pattern metadata.
- Pricing columns on `rooms`: monthly rate, security deposit, currency, and pricing metadata.
- Dynamic `room_type` keys and expanded room statuses.
- Bed sort order and status reason.
- Expanded bed statuses: `available`, `occupied`, `reserved`, `maintenance`, `unavailable`, `inactive`.
- Transfer, unassign, create-room-with-beds, create-bed, bed-status, and soft-delete-room RPCs.

Why:

- Floors, templates, and categories are tenant-owned data, not global constants, so each hostel can model its own inventory.
- Pricing is stored as integer minor units to avoid floating-point money errors.
- Bed occupancy is derived from assignment history, while `room_beds.status` is synchronized for fast visual screens.
- Room creation generates one bed per capacity slot. Optional custom labels override generated labels without introducing a separate bed-count source of truth.

## Allocation Safety

Hard guarantees:

- A room cannot have more active bed rows than its capacity.
- Room capacity is the source of truth for generated beds.
- A bed cannot have two active assignments.
- A student cannot have two active bed assignments.
- A room with active assignments cannot be soft deleted.
- A bed with an active assignment cannot be marked available, maintenance, unavailable, or inactive.

Why:

- UI checks are useful, but database constraints are the concurrency boundary.
- Partial unique indexes keep historical assignments while enforcing active-state uniqueness.
- Transfer/unassign functions update assignment history and bed status in one transaction.

## RLS Strategy

`room_categories`, `rooms`, `room_beds`, and `student_room_assignments` remain branch and tenant scoped.

Access rules:

- Branch members can read rooms and beds allowed by their tenant context.
- Tenant admins can create, update, delete, transfer, unassign, and change bed statuses.
- Superadmins bypass through the shared private helper.
- Anonymous access is revoked.

Why:

- Application RBAC and PostgreSQL RLS intentionally overlap.
- Future ERP products can reuse the same pattern for warehouse bins, gym lockers, or retail stock locations.

## Service Boundary

`modules/rooms/rooms.service.ts` owns:

- RBAC checks with `room:read` and `room:manage`.
- tenant ownership validation
- RPC calls for transactional workflows
- audit events for direct room edits
- database error mapping
- occupancy composition

Why:

- Pages and API routes stay thin.
- Business rules stay testable and reusable.
- Tenant checks do not drift between dashboard and API entry points.

## Audit Events

The module records:

- `room.create`
- `room.update`
- `room.soft_delete`
- `hostel_branch.create`
- `hostel_floor.create`
- `room_template.create`
- `room_bed.create`
- `room_bed.status_update`
- `student.transfer_bed`
- `student.unassign_bed`

Why:

- Room inventory and student movement are operationally sensitive.
- Audit events carry organization and branch IDs for tenant-safe reporting.
