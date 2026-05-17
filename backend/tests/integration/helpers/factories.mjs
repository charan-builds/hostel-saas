import { randomUUID } from "node:crypto";

import { deleteTenantData } from "./cleanup.mjs";

export const TEST_PASSWORD = "Integration-test-password-2026!";

function slug(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export async function createAuthUser(admin, role = "admin") {
  const email = `${role}-${randomUUID()}@example.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: TEST_PASSWORD,
    user_metadata: {
      integration_test: true,
      role,
    },
  });

  if (error) {
    throw error;
  }

  return {
    email,
    id: data.user.id,
    password: TEST_PASSWORD,
  };
}

export async function createTenant(admin, options = {}) {
  const adminUser = options.adminUser ?? (await createAuthUser(admin, "admin"));
  const studentUser =
    options.studentUser ?? (await createAuthUser(admin, "student"));
  const orgSlug = slug("it-org");
  const branchSlug = slug("it-branch");

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({
      created_by: adminUser.id,
      metadata: { integration_test: true },
      name: `Integration Org ${orgSlug}`,
      slug: orgSlug,
      updated_by: adminUser.id,
    })
    .select("*")
    .single();

  if (organizationError) {
    throw organizationError;
  }

  const { data: branch, error: branchError } = await admin
    .from("hostel_branches")
    .insert({
      created_by: adminUser.id,
      metadata: { integration_test: true },
      name: `Integration Branch ${branchSlug}`,
      organization_id: organization.id,
      slug: branchSlug,
      updated_by: adminUser.id,
    })
    .select("*")
    .single();

  if (branchError) {
    throw branchError;
  }

  const { error: profileError } = await admin.from("user_profiles").insert([
    {
      created_by: adminUser.id,
      email: adminUser.email,
      full_name: "Integration Admin",
      id: adminUser.id,
      is_active: true,
      metadata: { integration_test: true },
      organization_id: organization.id,
      role: "admin",
      updated_by: adminUser.id,
    },
    {
      created_by: adminUser.id,
      email: studentUser.email,
      full_name: "Integration Student",
      hostel_branch_id: branch.id,
      id: studentUser.id,
      is_active: true,
      metadata: { integration_test: true },
      organization_id: organization.id,
      role: "student",
      updated_by: adminUser.id,
    },
  ]);

  if (profileError) {
    throw profileError;
  }

  const { error: membershipError } = await admin
    .from("tenant_memberships")
    .insert([
      {
        accepted_at: new Date().toISOString(),
        app: "hostel_erp",
        created_by: adminUser.id,
        organization_id: organization.id,
        role: "admin",
        status: "active",
        updated_by: adminUser.id,
        user_id: adminUser.id,
      },
      {
        accepted_at: new Date().toISOString(),
        app: "hostel_erp",
        created_by: adminUser.id,
        hostel_branch_id: branch.id,
        organization_id: organization.id,
        role: "student",
        status: "active",
        updated_by: adminUser.id,
        user_id: studentUser.id,
      },
    ]);

  if (membershipError) {
    throw membershipError;
  }

  return {
    adminUser,
    branch,
    organization,
    studentUser,
  };
}

export async function createSuperadmin(admin) {
  const user = await createAuthUser(admin, "superadmin");
  const { error } = await admin.from("user_profiles").insert({
    email: user.email,
    full_name: "Integration Superadmin",
    id: user.id,
    is_active: true,
    metadata: { integration_test: true },
    role: "superadmin",
  });

  if (error) {
    throw error;
  }

  return user;
}

export async function createStudent(admin, tenant, suffix = "A") {
  const { data, error } = await admin
    .from("students")
    .insert({
      created_by: tenant.adminUser.id,
      emergency_contact: {},
      first_name: "Race",
      guardian_info: {},
      hostel_branch_id: tenant.branch.id,
      last_name: `Student ${suffix}`,
      organization_id: tenant.organization.id,
      student_code: `IT-${randomUUID().slice(0, 8)}-${suffix}`,
      updated_by: tenant.adminUser.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createRoomAndBed(admin, tenant) {
  const roomCode = `R-${randomUUID().slice(0, 8)}`;
  const { data: room, error: roomError } = await admin
    .from("rooms")
    .insert({
      capacity: 1,
      created_by: tenant.adminUser.id,
      hostel_branch_id: tenant.branch.id,
      name: `Room ${roomCode}`,
      organization_id: tenant.organization.id,
      room_code: roomCode,
      updated_by: tenant.adminUser.id,
    })
    .select("*")
    .single();

  if (roomError) {
    throw roomError;
  }

  const { data: bed, error: bedError } = await admin
    .from("room_beds")
    .insert({
      bed_code: `${roomCode}-B1`,
      created_by: tenant.adminUser.id,
      hostel_branch_id: tenant.branch.id,
      organization_id: tenant.organization.id,
      room_id: room.id,
      updated_by: tenant.adminUser.id,
    })
    .select("*")
    .single();

  if (bedError) {
    throw bedError;
  }

  return { bed, room };
}

export async function createInvoice(admin, tenant, student, amountCents = 12345) {
  const month = new Date();
  month.setUTCDate(1);
  const invoiceMonth = month.toISOString().slice(0, 10);
  const invoiceNumber = `INV-IT-${randomUUID().slice(0, 8)}`;

  const { data, error } = await admin
    .from("billing_invoices")
    .insert({
      balance_cents: amountCents,
      created_by: tenant.adminUser.id,
      currency_code: "INR",
      due_date: invoiceMonth,
      hostel_branch_id: tenant.branch.id,
      invoice_month: invoiceMonth,
      invoice_number: invoiceNumber,
      issue_date: invoiceMonth,
      organization_id: tenant.organization.id,
      paid_cents: 0,
      status: "pending",
      student_id: student.id,
      subtotal_cents: amountCents,
      total_cents: amountCents,
      updated_by: tenant.adminUser.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function cleanupTenant(admin, tenant) {
  const organizationId = tenant.organization.id;
  const userIds = [
    tenant.adminUser?.id,
    tenant.studentUser?.id,
    tenant.superadminUser?.id,
  ].filter(Boolean);

  await deleteTenantData(admin, organizationId);

  for (const userId of userIds) {
    await admin.auth.admin.deleteUser(userId);
  }
}

export async function cleanupUser(admin, user) {
  await admin.from("user_profiles").delete().eq("id", user.id);
  await admin.auth.admin.deleteUser(user.id);
}
