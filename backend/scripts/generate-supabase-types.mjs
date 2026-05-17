import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import {
  getSupabaseCliInstallHint,
  isMissingSupabaseCliError,
  runSupabaseCli,
} from "./supabase-env.mjs";

const outputPath = resolve(process.cwd(), "types/database.types.ts");
const result = runSupabaseCli(
  ["gen", "types", "typescript", "--linked", "--schema", "public"],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  },
);

if (isMissingSupabaseCliError(result.error)) {
  console.error(getSupabaseCliInstallHint());
  process.exit(127);
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  if (result.stderr) {
    console.error(result.stderr);
  }

  process.exit(result.status ?? 1);
}

if (!result.stdout || !result.stdout.includes("export type Database")) {
  console.error("Supabase type generation completed without a recognizable Database type.");
  process.exit(1);
}

writeFileSync(outputPath, result.stdout);
console.log(`Generated ${outputPath}`);
