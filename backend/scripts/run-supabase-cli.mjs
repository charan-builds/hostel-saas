import process from "node:process";

import {
  getSupabaseCliInstallHint,
  isMissingSupabaseCliError,
  runSupabaseCli,
} from "./supabase-env.mjs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-supabase-cli.mjs <supabase args...>");
  process.exit(1);
}

const result = runSupabaseCli(args);

if (isMissingSupabaseCliError(result.error)) {
  console.error(getSupabaseCliInstallHint());
  process.exit(127);
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
