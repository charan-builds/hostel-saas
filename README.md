# Hostel ERP Backend

This directory is the only Next.js application root for the Hostel ERP SaaS.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

The repository root keeps prompts and wrapper scripts only. Runtime files such as `app/`, `lib/`, `types/`, `supabase/`, `proxy.ts`, `next.config.ts`, and `tsconfig.json` live here so Next.js 16 and Turbopack resolve from one clean project root.
