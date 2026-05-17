import process from "node:process";

import {
  extractProjectRef,
  getSupabaseCliInstallHint,
  isMissingSupabaseCliError,
  loadRuntimeEnv,
  runSupabaseCli,
} from "./supabase-env.mjs";

const env = loadRuntimeEnv(process.cwd());
const configuredRef = env.SUPABASE_PROJECT_REF?.trim();
const inferredRef = extractProjectRef(env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = configuredRef || inferredRef;

if (!projectRef) {
  console.error(
    "Could not determine Supabase project ref. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF in .env.local.",
  );
  process.exit(1);
}

const result = runSupabaseCli(["link", "--project-ref", projectRef]);

if (isMissingSupabaseCliError(result.error)) {
  console.error(getSupabaseCliInstallHint());
  process.exit(127);
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
