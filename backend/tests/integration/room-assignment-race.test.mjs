import assert from "node:assert/strict";
import test from "node:test";

import { hasIntegrationEnv } from "./helpers/env.mjs";
import {
  cleanupTenant,
  createRoomAndBed,
  createStudent,
  createTenant,
} from "./helpers/factories.mjs";
import {
  createServiceClient,
  createSignedInClient,
} from "./helpers/supabase.mjs";

test(
  "concurrent assignment attempts cannot allocate one bed to two students",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenant = await createTenant(admin);

    try {
      const { bed, room } = await createRoomAndBed(admin, tenant);
      const studentA = await createStudent(admin, tenant, "A");
      const studentB = await createStudent(admin, tenant, "B");
      const actor = await createSignedInClient(
        tenant.adminUser.email,
        tenant.adminUser.password,
      );
      const baseArgs = {
        p_actor_user_id: tenant.adminUser.id,
        p_bed_id: bed.id,
        p_hostel_branch_id: tenant.branch.id,
        p_organization_id: tenant.organization.id,
        p_room_id: room.id,
      };

      const results = await Promise.all([
        actor.rpc("assign_student_bed", {
          ...baseArgs,
          p_student_id: studentA.id,
        }),
        actor.rpc("assign_student_bed", {
          ...baseArgs,
          p_student_id: studentB.id,
        }),
      ]);

      const successes = results.filter((result) => !result.error);
      const failures = results.filter((result) => result.error);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);

      const { count, error } = await admin
        .from("student_room_assignments")
        .select("id", { count: "exact", head: true })
        .eq("bed_id", bed.id)
        .eq("status", "active")
        .is("deleted_at", null);

      assert.equal(error, null);
      assert.equal(count, 1);
    } finally {
      await cleanupTenant(admin, tenant);
    }
  },
);
