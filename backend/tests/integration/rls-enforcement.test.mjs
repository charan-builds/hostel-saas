import assert from "node:assert/strict";
import test from "node:test";

import { hasIntegrationEnv } from "./helpers/env.mjs";
import {
  cleanupTenant,
  createStudent,
  createTenant,
} from "./helpers/factories.mjs";
import {
  createServiceClient,
  createSignedInClient,
} from "./helpers/supabase.mjs";

test(
  "student RLS can read own branch-scoped student row but not another tenant row",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenantA = await createTenant(admin);
    const tenantB = await createTenant(admin);

    try {
      const studentA = await createStudent(admin, tenantA, "A");
      await admin
        .from("students")
        .update({ user_profile_id: tenantA.studentUser.id })
        .eq("id", studentA.id);
      const studentB = await createStudent(admin, tenantB, "B");
      await admin
        .from("students")
        .update({ user_profile_id: tenantB.studentUser.id })
        .eq("id", studentB.id);

      const actor = await createSignedInClient(
        tenantA.studentUser.email,
        tenantA.studentUser.password,
      );
      const own = await actor.from("students").select("id").eq("id", studentA.id);
      const other = await actor.from("students").select("id").eq("id", studentB.id);

      assert.equal(own.error, null);
      assert.equal(own.data.length, 1);
      assert.equal(other.error, null);
      assert.deepEqual(other.data, []);
    } finally {
      await cleanupTenant(admin, tenantA);
      await cleanupTenant(admin, tenantB);
    }
  },
);
