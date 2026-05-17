import { existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import {
  extractProjectRef,
  getSupabaseCliInstallHint,
  isMissingSupabaseCliError,
  loadRuntimeEnv,
  runSupabaseCli,
} from "./supabase-env.mjs";

const envPath = resolve(process.cwd(), ".env.local");
const env = loadRuntimeEnv(process.cwd());
const errors = [];
const warnings = [];
const details = [];

function hasValue(name) {
  return typeof env[name] === "string" && env[name].trim().length > 0;
}

function valueOf(name) {
  return hasValue(name) ? env[name].trim() : "";
}

function hasPlaceholder(value) {
  return [
    "your-project-ref",
    "your_key",
    "your-",
    "password@db.",
    "sb_publishable_your",
    "sb_secret_your",
  ].some((token) => value.includes(token));
}

function requireEnv(name) {
  const value = valueOf(name);

  if (!value) {
    errors.push(`${name} is required.`);
    return "";
  }

  if (hasPlaceholder(value)) {
    errors.push(`${name} still contains a placeholder value.`);
  }

  return value;
}

function validateUrl(name, options = {}) {
  const value = requireEnv(name);

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);

    if (!["http:", "https:", "postgres:", "postgresql:"].includes(parsed.protocol)) {
      errors.push(`${name} has an unsupported URL protocol.`);
    }

    if (options.requireHttp && !["http:", "https:"].includes(parsed.protocol)) {
      errors.push(`${name} must be an http(s) URL.`);
    }

    return parsed;
  } catch {
    errors.push(`${name} must be a valid URL.`);
    return null;
  }
}

if (!existsSync(envPath)) {
  warnings.push(
    ".env.local was not found. Copy backend/.env.example to backend/.env.local before connecting the real project.",
  );
}

validateUrl("NEXT_PUBLIC_APP_URL", { requireHttp: true });
const supabaseUrl = validateUrl("NEXT_PUBLIC_SUPABASE_URL", {
  requireHttp: true,
});
const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey = valueOf("SUPABASE_SECRET_KEY") || valueOf("SUPABASE_SERVICE_ROLE_KEY");

if (!secretKey) {
  errors.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required.");
} else if (hasPlaceholder(secretKey)) {
  errors.push("Supabase server secret key still contains a placeholder value.");
}

if (publishableKey.startsWith("sb_secret") || publishableKey.includes("service_role")) {
  errors.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY appears to contain a server secret.");
}

if (secretKey.startsWith("sb_publishable")) {
  errors.push("The server Supabase secret appears to contain a publishable key.");
}

if (publishableKey && secretKey && publishableKey === secretKey) {
  errors.push("Publishable key and server secret key must not be the same value.");
}

for (const [name, value] of Object.entries(env)) {
  if (name.startsWith("NEXT_PUBLIC_") && secretKey && value === secretKey) {
    errors.push(`${name} exposes the server Supabase secret to the browser bundle.`);
  }
}

if (hasValue("SUPABASE_SECRET_KEY") && hasValue("SUPABASE_SERVICE_ROLE_KEY")) {
  warnings.push(
    "Both SUPABASE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY are set. Runtime code will prefer SUPABASE_SECRET_KEY.",
  );
}

if (hasValue("DATABASE_URL")) {
  validateUrl("DATABASE_URL");
} else {
  warnings.push("DATABASE_URL is not set. This is okay for linked Supabase CLI workflows.");
}

if (supabaseUrl) {
  const projectRef = valueOf("SUPABASE_PROJECT_REF") || extractProjectRef(supabaseUrl.href);

  if (projectRef) {
    details.push(`project ref: ${projectRef}`);
  } else if (supabaseUrl.hostname !== "127.0.0.1" && supabaseUrl.hostname !== "localhost") {
    warnings.push(
      "Could not infer SUPABASE_PROJECT_REF from NEXT_PUBLIC_SUPABASE_URL. Set SUPABASE_PROJECT_REF before running supabase:link.",
    );
  }
}

if (valueOf("RUN_SUPABASE_INTEGRATION_TESTS") !== "1") {
  warnings.push("Integration tests remain skipped until RUN_SUPABASE_INTEGRATION_TESTS=1.");
}

const cliCheck = runSupabaseCli(["--version"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (isMissingSupabaseCliError(cliCheck.error)) {
  warnings.push(getSupabaseCliInstallHint());
} else if (cliCheck.status !== 0) {
  warnings.push("Supabase CLI exists but `supabase --version` did not complete successfully.");
} else {
  details.push(`supabase cli: ${cliCheck.stdout.trim()}`);
}

if (details.length > 0) {
  console.log(`Supabase details: ${details.join(", ")}`);
}

if (warnings.length > 0) {
  console.warn(`Supabase warnings:\n- ${warnings.join("\n- ")}`);
}

if (errors.length > 0) {
  console.error(`Supabase env verification failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Supabase env verification passed.");
