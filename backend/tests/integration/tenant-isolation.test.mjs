import assert from "node:assert/strict";
import test from "node:test";

import { hasIntegrationEnv } from "./helpers/env.mjs";
import {
  cleanupTenant,
  createTenant,
} from "./helpers/factories.mjs";
import {
  createServiceClient,
  createSignedInClient,
} from "./helpers/supabase.mjs";

test(
  "tenant admins cannot read another tenant branch through RLS",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenantA = await createTenant(admin);
    const tenantB = await createTenant(admin);

    try {
      const tenantAClient = await createSignedInClient(
        tenantA.adminUser.email,
        tenantA.adminUser.password,
      );
      const { data, error } = await tenantAClient
        .from("hostel_branches")
        .select("id,organization_id")
        .eq("organization_id", tenantB.organization.id);

      assert.equal(error, null);
      assert.deepEqual(data, []);
    } finally {
      await cleanupTenant(admin, tenantA);
      await cleanupTenant(admin, tenantB);
    }
  },
);

test(
  "service role can verify seeded tenant data for integration setup",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenant = await createTenant(admin);

    try {
      const { data, error } = await admin
        .from("hostel_branches")
        .select("id")
        .eq("organization_id", tenant.organization.id);

      assert.equal(error, null);
      assert.equal(data.length, 1);
    } finally {
      await cleanupTenant(admin, tenant);
    }
  },
);
