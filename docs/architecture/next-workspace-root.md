# Next.js App Root

`backend/` is the only Next.js app root.

The repository root intentionally does not contain:

- `app/`
- `public/`
- `lib/`
- `types/`
- `supabase/`
- `next.config.ts`
- `tsconfig.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

Why:

- Next.js 16 uses Turbopack by default.
- Turbopack resolves files inside its filesystem root.
- Turbopack automatically detects roots from lockfiles such as `pnpm-lock.yaml`.
- Multiple app roots and lockfiles can make `@/` resolve against the wrong tree.

The app config pins the root explicitly:

```ts
// backend/next.config.ts
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
```

The TypeScript alias is app-local:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Use:

```bash
cd backend
pnpm install
pnpm build
```

Or from the repository root:

```bash
pnpm build
```
