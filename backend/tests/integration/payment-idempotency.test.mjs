import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { hasIntegrationEnv } from "./helpers/env.mjs";
import {
  cleanupTenant,
  createInvoice,
  createStudent,
  createTenant,
} from "./helpers/factories.mjs";
import {
  createServiceClient,
  createSignedInClient,
} from "./helpers/supabase.mjs";

test(
  "record_invoice_payment returns the existing payment for duplicate idempotency keys",
  { skip: !hasIntegrationEnv() },
  async () => {
    const admin = createServiceClient();
    const tenant = await createTenant(admin);

    try {
      const student = await createStudent(admin, tenant);
      const invoice = await createInvoice(admin, tenant, student, 5000);
      const actor = await createSignedInClient(
        tenant.adminUser.email,
        tenant.adminUser.password,
      );
      const idempotencyKey = randomUUID();
      const args = {
        p_actor_user_id: tenant.adminUser.id,
        p_amount_cents: 5000,
        p_idempotency_key: idempotencyKey,
        p_invoice_id: invoice.id,
        p_metadata: { integration_test: true },
        p_notes: "integration test payment",
        p_payment_method: "upi",
        p_provider: "manual",
        p_provider_reference: `upi-${idempotencyKey}`,
        p_request_id: idempotencyKey,
      };

      const first = await actor.rpc("record_invoice_payment", args);
      const second = await actor.rpc("record_invoice_payment", args);

      assert.equal(first.error, null);
      assert.equal(second.error, null);
      assert.equal(first.data.paymentId, second.data.paymentId);
      assert.equal(second.data.idempotent, true);

      const { count, error } = await admin
        .from("billing_payments")
        .select("id", { count: "exact", head: true })
        .eq("idempotency_key", idempotencyKey);

      assert.equal(error, null);
      assert.equal(count, 1);
    } finally {
      await cleanupTenant(admin, tenant);
    }
  },
);
