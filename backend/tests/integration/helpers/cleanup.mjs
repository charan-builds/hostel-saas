export const TENANT_TABLE_DELETE_ORDER = [
  "notification_delivery_attempts",
  "notification_recipients",
  "notice_acknowledgements",
  "notifications",
  "notification_jobs",
  "notification_preferences",
  "notice_boards",
  "visitor_pass_events",
  "visitor_passes",
  "gate_pass_events",
  "gate_passes",
  "attendance_records",
  "student_leave_requests",
  "student_presence_jobs",
  "billing_receipts",
  "billing_payment_allocations",
  "billing_payments",
  "billing_invoice_items",
  "billing_invoices",
  "billing_runs",
  "billing_receipt_counters",
  "billing_invoice_counters",
  "rent_plans",
  "student_documents",
  "student_room_assignments",
  "room_beds",
  "rooms",
  "room_templates",
  "room_categories",
  "hostel_floors",
  "students",
  "analytics_refresh_jobs",
  "audit_logs",
  "tenant_memberships",
  "tenant_role_definitions",
  "tenant_settings",
  "user_profiles",
  "hostel_branches",
  "organizations",
];

export async function deleteTenantData(admin, organizationId) {
  for (const table of TENANT_TABLE_DELETE_ORDER) {
    const { error } = await admin.from(table).delete().eq("organization_id", organizationId);

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
