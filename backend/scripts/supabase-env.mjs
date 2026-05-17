import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

export function parseEnvFile(source) {
  const values = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

export function loadLocalEnv(cwd = process.cwd()) {
  const envPath = resolve(cwd, ".env.local");

  if (!existsSync(envPath)) {
    return {};
  }

  return parseEnvFile(readFileSync(envPath, "utf8"));
}

export function loadRuntimeEnv(cwd = process.cwd()) {
  return {
    ...loadLocalEnv(cwd),
    ...process.env,
  };
}

export function extractProjectRef(supabaseUrl) {
  if (!supabaseUrl) {
    return null;
  }

  try {
    const hostname = new URL(supabaseUrl).hostname;

    if (!hostname.endsWith(".supabase.co")) {
      return null;
    }

    return hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

export function resolveSupabaseCliCommand(cwd = process.cwd()) {
  const candidates =
    process.platform === "win32"
      ? [
          resolve(cwd, "node_modules/.bin/supabase.cmd"),
          resolve(cwd, "node_modules/supabase/bin/supabase.exe"),
        ]
      : [
          resolve(cwd, "node_modules/.bin/supabase"),
          resolve(cwd, "node_modules/supabase/bin/supabase"),
        ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return "supabase";
}

export function getSupabaseCliInstallHint() {
  return [
    "Supabase CLI was not found.",
    "Run `pnpm approve-builds --all` or `pnpm rebuild supabase` from backend/ so the pinned npm CLI package can download its binary.",
    "If your environment blocks GitHub downloads, install the Supabase CLI globally and ensure `supabase --version` works on PATH.",
  ].join(" ");
}

export function runSupabaseCli(args, options = {}) {
  return spawnSync(resolveSupabaseCliCommand(process.cwd()), args, {
    cwd: process.cwd(),
    env: loadRuntimeEnv(process.cwd()),
    stdio: "inherit",
    ...options,
  });
}

export function isMissingSupabaseCliError(error) {
  return error && error.code === "ENOENT";
}
