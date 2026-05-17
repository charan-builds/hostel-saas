import process from "node:process";

import { cleanupIntegrationData } from "../tests/integration/helpers/cleanup.mjs";
import {
  cleanupTenant,
  createTenant,
} from "../tests/integration/helpers/factories.mjs";
import { createServiceClient } from "../tests/integration/helpers/supabase.mjs";
import { validateIntegrationEnv } from "../tests/integration/helpers/env.mjs";

const command = process.argv[2];

if (!["cleanup", "seed"].includes(command)) {
  console.error("Usage: node scripts/integration-test-db.mjs <cleanup|seed>");
  process.exit(1);
}

try {
  validateIntegrationEnv();

  const admin = createServiceClient();

  if (command === "cleanup") {
    const result = await cleanupIntegrationData(admin);

    console.log(
      `Integration cleanup removed ${result.organizations} organization fixture(s) and ${result.users} auth user(s).`,
    );
  }

  if (command === "seed") {
    const tenant = await createTenant(admin);

    try {
      const { count, error } = await admin
        .from("hostel_branches")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", tenant.organization.id);

      if (error) {
        throw error;
      }

      if (count !== 1) {
        throw new Error("Integration seed verification did not create exactly one branch.");
      }

      console.log("Integration seed smoke fixture created and verified.");
    } finally {
      await cleanupTenant(admin, tenant);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
