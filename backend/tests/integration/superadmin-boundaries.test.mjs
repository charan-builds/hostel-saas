import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { hasIntegrationEnv } from "./helpers/env.mjs";
import {
  cleanupTenant,
  cleanupUser,
  createSuperadmin,
  createTenant,
} from "./helpers/factories.mjs";
import {
  createServiceClient,
  createSignedInClient,
} from "./helpers/supabase.mjs";

test(
  "superadmin can request tenant analytics refresh without tenant membership",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenant = await createTenant(admin);
    const superadmin = await createSuperadmin(admin);

    try {
      const actor = await createSignedInClient(
        superadmin.email,
        superadmin.password,
      );
      const { data, error } = await actor.rpc("request_analytics_refresh", {
        p_actor_user_id: superadmin.id,
        p_hostel_branch_id: tenant.branch.id,
        p_organization_id: tenant.organization.id,
        p_request_id: randomUUID(),
      });

      assert.equal(error, null);
      assert.equal(data.organizationId, tenant.organization.id);
      assert.match(data.status, /queued|running/);
    } finally {
      await cleanupTenant(admin, tenant);
      await cleanupUser(admin, superadmin);
    }
  },
);
