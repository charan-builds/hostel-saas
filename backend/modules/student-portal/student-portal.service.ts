import "server-only";

import { requirePermission } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapPortalError(error: { code?: string }) {
  if (error.code === "PGRST116" || error.code === "02000") {
    return new AppError({
      code: "NOT_FOUND",
      message: "Student portal data was not found.",
      statusCode: 404,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    message: "Unable to load student portal data.",
    statusCode: 500,
    expose: false,
  });
}

export async function getStudentPortalOverview() {
  const context = await requirePermission("student:self:read", {
    product: "hostel_erp",
    roles: ["student"],
  });
  const supabase = await createSupabaseServerClient();
  let studentQuery = supabase
    .from("students")
    .select("*")
    .eq("user_profile_id", context.identity.userId)
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);

  if (context.organizationId) {
    studentQuery = studentQuery.eq("organization_id", context.organizationId);
  }

  if (context.hostelBranchId) {
    studentQuery = studentQuery.eq("hostel_branch_id", context.hostelBranchId);
  }

  const { data: students, error: studentError } = await studentQuery;

  if (studentError) {
    throw mapPortalError(studentError);
  }

  const student = students?.[0];

  if (!student) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "No active student record is linked to this account.",
      statusCode: 404,
    });
  }

  const [assignmentResult, invoiceResult, receiptResult, documentResult] =
    await Promise.all([
      supabase
        .from("student_room_assignments")
        .select("id,room_id,bed_id,start_date,status")
        .eq("student_id", student.id)
        .eq("organization_id", student.organization_id)
        .eq("hostel_branch_id", student.hostel_branch_id)
        .eq("status", "active")
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("billing_invoices")
        .select("id,invoice_number,status,total_cents,balance_cents,due_date,currency_code")
        .eq("student_id", student.id)
        .eq("organization_id", student.organization_id)
        .eq("hostel_branch_id", student.hostel_branch_id)
        .is("deleted_at", null)
        .order("due_date", { ascending: false })
        .limit(5),
      supabase
        .from("billing_receipts")
        .select("id,receipt_number,amount_cents,currency_code,issued_at")
        .eq("student_id", student.id)
        .eq("organization_id", student.organization_id)
        .eq("hostel_branch_id", student.hostel_branch_id)
        .order("issued_at", { ascending: false })
        .limit(5),
      supabase
        .from("student_documents")
        .select("id,document_type,status,created_at,file_name")
        .eq("student_id", student.id)
        .eq("organization_id", student.organization_id)
        .eq("hostel_branch_id", student.hostel_branch_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  for (const result of [
    assignmentResult,
    invoiceResult,
    receiptResult,
    documentResult,
  ]) {
    if (result.error && result.error.code !== "PGRST116") {
      throw mapPortalError(result.error);
    }
  }

  return {
    assignment: assignmentResult.data,
    documents: documentResult.data ?? [],
    invoices: invoiceResult.data ?? [],
    receipts: receiptResult.data ?? [],
    student,
  };
}
