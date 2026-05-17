import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

import { cleanupIntegrationData } from "../tests/integration/helpers/cleanup.mjs";
import { createServiceClient } from "../tests/integration/helpers/supabase.mjs";
import { validateIntegrationEnv } from "../tests/integration/helpers/env.mjs";

const mode = process.argv[2] ?? "--contracts";
const allowedModes = new Set(["--contracts", "--supabase", "--local"]);

if (!allowedModes.has(mode)) {
  console.error("Usage: node scripts/run-integration-tests.mjs [--contracts|--supabase|--local]");
  process.exit(1);
}

function findTestFiles(dir) {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stat = statSync(path);

      if (stat.isDirectory()) {
        return findTestFiles(path);
      }

      return entry.endsWith(".test.mjs") ? [path] : [];
    })
    .sort();
}

const testFiles = findTestFiles(join(process.cwd(), "tests/integration")).map((file) =>
  relative(process.cwd(), file),
);

if (testFiles.length === 0) {
  console.error("No integration test files found.");
  process.exit(1);
}

const testEnv = {
  ...process.env,
};

if (mode === "--contracts") {
  process.env.RUN_SUPABASE_INTEGRATION_TESTS = "0";
  testEnv.RUN_SUPABASE_INTEGRATION_TESTS = "0";
} else {
  process.env.RUN_SUPABASE_INTEGRATION_TESTS = "1";
  testEnv.RUN_SUPABASE_INTEGRATION_TESTS = "1";

  if (mode === "--local") {
    process.env.SUPABASE_INTEGRATION_TARGET = "local";
    testEnv.SUPABASE_INTEGRATION_TARGET = "local";
  }

  validateIntegrationEnv();

  const admin = createServiceClient();
  const before = await cleanupIntegrationData(admin);

  console.log(
    `Pre-test integration cleanup removed ${before.organizations} organization fixture(s) and ${before.users} auth user(s).`,
  );
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  cwd: process.cwd(),
  env: testEnv,
  stdio: "inherit",
});

let cleanupFailed = false;

if (mode !== "--contracts") {
  try {
    const admin = createServiceClient();
    const after = await cleanupIntegrationData(admin);

    console.log(
      `Post-test integration cleanup removed ${after.organizations} organization fixture(s) and ${after.users} auth user(s).`,
    );
  } catch (error) {
    cleanupFailed = true;
    console.error(error instanceof Error ? error.message : String(error));
  }
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (cleanupFailed) {
  process.exit(1);
}

process.exit(result.status ?? 0);
