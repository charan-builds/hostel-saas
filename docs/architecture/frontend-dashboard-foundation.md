# Frontend Dashboard Foundation

The frontend foundation is intentionally modular and server-first.

```txt
backend/
  app/
    (protected)/
      layout.tsx
      loading.tsx
      error.tsx
      dashboard/page.tsx
  components/
    charts/
    dashboard/
    data/
    forms/
    layout/
    providers/
    ui/
  lib/
    utils.ts
```

## Architecture Decisions

- `app/(protected)/layout.tsx` owns authenticated dashboard framing.
- `components/layout/app-shell.tsx` is a server component so tenant context, memberships, and notification previews stay server-derived.
- `components/layout/dashboard-shell-client.tsx` owns route-aware navigation, mobile drawer state, dropdowns, theme toggles, and command palette state.
- `components/ui/*` follows shadcn-style primitives without binding module pages to a heavy UI framework.
- `components/data/data-table.tsx` centralizes TanStack Table behavior for sorting, filtering, pagination, selection, and responsive overflow.
- `components/forms/form-field.tsx` centralizes React Hook Form fields and server-action submit behavior.
- `app/globals.css` contains Tailwind v4 theme tokens, light/dark variables, and enterprise dashboard defaults.

## Frontend Standards

- Prefer server components for pages and data loading.
- Use client components only for interaction: navigation state, tables, forms, dialogs, theme, and command palette.
- Keep module pages thin and compose shared primitives.
- Use `Button`, `Card`, `Badge`, `Input`, `StatusChip`, `EmptyState`, `ErrorState`, and `DataTable` before creating module-specific UI.
- Keep dashboard workflows compact, keyboard-accessible, and mobile-responsive.
