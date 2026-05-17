import {
  extractProjectRef,
  loadRuntimeEnv,
} from "../../../scripts/supabase-env.mjs";

const SAFE_INTEGRATION_TARGETS = new Set(["local", "staging", "disposable"]);

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
  const supabaseUrl =
    env.SUPABASE_INTEGRATION_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef =
    env.SUPABASE_INTEGRATION_PROJECT_REF ??
    env.SUPABASE_PROJECT_REF ??
    extractProjectRef(supabaseUrl);
  const isLocal =
    typeof supabaseUrl === "string" &&
    (supabaseUrl.includes("://localhost:") ||
      supabaseUrl.includes("://127.0.0.1:"));
  const serviceRoleKey =
    env.SUPABASE_INTEGRATION_SECRET_KEY ??
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.SUPABASE_SECRET_KEY;

  return {
    anonKey:
      env.SUPABASE_INTEGRATION_PUBLISHABLE_KEY ??
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    enabled: env.RUN_SUPABASE_INTEGRATION_TESTS === "1",
    confirmedNonProduction: env.SUPABASE_CONFIRM_NON_PRODUCTION === "1",
    projectRef,
    productionProjectRef: env.SUPABASE_PRODUCTION_PROJECT_REF,
    serviceRoleKey,
    supabaseUrl,
    target: env.SUPABASE_INTEGRATION_TARGET ?? (isLocal ? "local" : ""),
  };
}

export function hasIntegrationEnv() {
  const env = getIntegrationEnv();

  if (!env.enabled) {
    return false;
  }

  validateIntegrationEnv();

  return true;
}

function getIntegrationEnvErrors(env) {
  const errors = [];
  const missing = [];

  if (!env.enabled) {
    errors.push("RUN_SUPABASE_INTEGRATION_TESTS must be 1 for real Supabase tests.");
  }

  if (!env.target) {
    missing.push("SUPABASE_INTEGRATION_TARGET");
  } else if (!SAFE_INTEGRATION_TARGETS.has(env.target)) {
    errors.push(
      "SUPABASE_INTEGRATION_TARGET must be one of: local, staging, disposable.",
    );
  }

  if (!env.supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_INTEGRATION_URL");
  }

  if (!env.anonKey) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_INTEGRATION_PUBLISHABLE_KEY",
    );
  }

  if (!env.serviceRoleKey) {
    missing.push(
      "SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_INTEGRATION_SECRET_KEY",
    );
  }

  if (missing.length > 0) {
    errors.push(`Missing Supabase integration env: ${missing.join(", ")}.`);
  }

  for (const [name, value] of Object.entries(env)) {
    if (value && hasPlaceholder(value)) {
      errors.push(`${name} still contains a placeholder value.`);
    }
  }

  if (env.target === "local") {
    const isLocal =
      typeof env.supabaseUrl === "string" &&
      (env.supabaseUrl.includes("://localhost:") ||
        env.supabaseUrl.includes("://127.0.0.1:"));

    if (!isLocal) {
      errors.push("SUPABASE_INTEGRATION_TARGET=local requires a localhost Supabase URL.");
    }
  }

  if (
    env.productionProjectRef &&
    env.projectRef &&
    env.productionProjectRef === env.projectRef
  ) {
    errors.push(
      "Integration tests are pointed at SUPABASE_PRODUCTION_PROJECT_REF. Refusing to mutate production.",
    );
  }

  if (
    env.target !== "local" &&
    !env.productionProjectRef &&
    !env.confirmedNonProduction
  ) {
    errors.push(
      "Hosted integration tests require SUPABASE_PRODUCTION_PROJECT_REF or SUPABASE_CONFIRM_NON_PRODUCTION=1.",
    );
  }

  return errors;
}

export function validateIntegrationEnv() {
  const env = getIntegrationEnv();

  const errors = getIntegrationEnvErrors(env);

  if (errors.length > 0) {
    throw new Error(`Supabase integration env is not safe:\n- ${errors.join("\n- ")}`);
  }

  return env;
}

export function requireIntegrationEnv() {
  return validateIntegrationEnv();
}
