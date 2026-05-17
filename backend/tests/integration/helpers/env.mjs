import { loadRuntimeEnv } from "../../../scripts/supabase-env.mjs";

function hasPlaceholder(value) {
  return typeof value === "string" && [
    "your-project-ref",
    "your_key",
    "your-",
    "password@db.",
    "sb_publishable_your",
    "sb_secret_your",
  ].some((token) => value.includes(token));
}

export function getIntegrationEnv() {
  const env = loadRuntimeEnv(process.cwd());
  const serviceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY;

  return {
    anonKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    enabled: env.RUN_SUPABASE_INTEGRATION_TESTS === "1",
    serviceRoleKey,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function hasIntegrationEnv() {
  const env = getIntegrationEnv();

  return env.enabled;
}

export function requireIntegrationEnv() {
  const env = getIntegrationEnv();
  const missing = [];

  if (!env.supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!env.anonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  if (!env.serviceRoleKey) {
    missing.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(`Missing Supabase integration env: ${missing.join(", ")}.`);
  }

  for (const [name, value] of Object.entries(env)) {
    if (value && hasPlaceholder(value)) {
      throw new Error(`${name} still contains a placeholder value.`);
    }
  }

  return env;
}
