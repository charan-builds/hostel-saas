export const TENANT_TABLE_DELETE_ORDER = [
  { table: "notification_delivery_attempts", column: "organization_id" },
  { table: "notification_recipients", column: "organization_id" },
  { table: "notice_acknowledgements", column: "organization_id" },
  { table: "notifications", column: "organization_id" },
  { table: "notification_jobs", column: "organization_id" },
  { table: "notification_preferences", column: "organization_id" },
  { table: "notice_boards", column: "organization_id" },
  { table: "visitor_pass_events", column: "organization_id" },
  { table: "visitor_passes", column: "organization_id" },
  { table: "gate_pass_events", column: "organization_id" },
  { table: "gate_passes", column: "organization_id" },
  { table: "attendance_records", column: "organization_id" },
  { table: "student_leave_requests", column: "organization_id" },
  { table: "student_presence_jobs", column: "organization_id" },
  { table: "billing_receipts", column: "organization_id" },
  { table: "billing_payment_allocations", column: "organization_id" },
  { table: "billing_payments", column: "organization_id" },
  { table: "billing_invoice_items", column: "organization_id" },
  { table: "billing_invoices", column: "organization_id" },
  { table: "billing_runs", column: "organization_id" },
  { table: "billing_receipt_counters", column: "organization_id" },
  { table: "billing_invoice_counters", column: "organization_id" },
  { table: "rent_plans", column: "organization_id" },
  { table: "student_documents", column: "organization_id" },
  { table: "student_room_assignments", column: "organization_id" },
  { table: "room_beds", column: "organization_id" },
  { table: "rooms", column: "organization_id" },
  { table: "room_templates", column: "organization_id" },
  { table: "room_categories", column: "organization_id" },
  { table: "hostel_floors", column: "organization_id" },
  { table: "students", column: "organization_id" },
  { table: "student_code_counters", column: "organization_id" },
  { table: "analytics_refresh_jobs", column: "organization_id" },
  { table: "audit_logs", column: "organization_id" },
  { table: "tenant_memberships", column: "organization_id" },
  { table: "tenant_role_definitions", column: "organization_id" },
  { table: "tenant_settings", column: "organization_id" },
  { table: "user_profiles", column: "organization_id" },
  { table: "hostel_branches", column: "organization_id" },
  { table: "organizations", column: "id" },
];

async function assertIntegrationOrganization(admin, organizationId) {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .contains("metadata", { integration_test: true })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      `Refusing to clean organization ${organizationId} because it is not marked as an integration fixture.`,
    );
  }
}

export async function deleteTenantData(admin, organizationId) {
  await assertIntegrationOrganization(admin, organizationId);

  for (const { table, column } of TENANT_TABLE_DELETE_ORDER) {
    let query = admin.from(table).delete().eq(column, organizationId);

    if (table === "organizations") {
      query = query.contains("metadata", { integration_test: true });
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to clean ${table}: ${error.message}`);
    }
  }
}

async function listIntegrationAuthUsers(admin) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const pageUsers = data.users ?? [];

    users.push(
      ...pageUsers.filter((user) => {
        const metadata = user.user_metadata ?? {};

        return metadata.integration_test === true && user.email?.endsWith("@example.test");
      }),
    );

    if (pageUsers.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function cleanupIntegrationData(admin) {
  const { data: organizations, error } = await admin
    .from("organizations")
    .select("id")
    .contains("metadata", { integration_test: true });

  if (error) {
    throw error;
  }

  for (const organization of organizations ?? []) {
    await deleteTenantData(admin, organization.id);
  }

  const users = await listIntegrationAuthUsers(admin);

  for (const user of users) {
    await admin.from("user_profiles").delete().eq("id", user.id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError && deleteError.status !== 404) {
      throw deleteError;
    }
  }

  return {
    organizations: organizations?.length ?? 0,
    users: users.length,
  };
}
