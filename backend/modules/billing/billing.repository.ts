import "server-only";

import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ListInvoicesQuery } from "@/modules/billing/schemas";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type ListInvoiceRowsOptions = {
  input: ListInvoicesQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
};

export async function listInvoiceRows({
  input,
  organizationId,
  supabase,
}: ListInvoiceRowsOptions) {
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("billing_invoices")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("due_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.hostelBranchId) {
    query = query.eq("hostel_branch_id", input.hostelBranchId);
  }

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.q) {
    const filter = buildOrIlikeFilter(["invoice_number"], input.q);

    if (filter) {
      query = query.or(filter);
    }
  }

  return query;
}

export async function listInvoiceSummaryRows(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let query = supabase
    .from("billing_invoices")
    .select("status,total_cents,paid_cents,balance_cents,due_date,currency_code")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (hostelBranchId) {
    query = query.eq("hostel_branch_id", hostelBranchId);
  }

  return query;
}

export async function getInvoiceById(
  supabase: SupabaseServerClient,
  invoiceId: string,
) {
  return supabase
    .from("billing_invoices")
    .select("*")
    .eq("id", invoiceId)
    .is("deleted_at", null)
    .maybeSingle();
}

export async function listInvoiceItems(
  supabase: SupabaseServerClient,
  invoiceId: string,
) {
  return supabase
    .from("billing_invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });
}

export async function listPaymentAllocationsForInvoice(
  supabase: SupabaseServerClient,
  invoiceId: string,
) {
  return supabase
    .from("billing_payment_allocations")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });
}

export async function listPaymentsByIds(
  supabase: SupabaseServerClient,
  paymentIds: string[],
) {
  if (paymentIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("billing_payments")
    .select("*")
    .in("id", paymentIds)
    .is("deleted_at", null)
    .order("received_at", { ascending: false });
}

export async function listReceiptsByPaymentIds(
  supabase: SupabaseServerClient,
  paymentIds: string[],
) {
  if (paymentIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("billing_receipts")
    .select("*")
    .in("payment_id", paymentIds)
    .order("issued_at", { ascending: false });
}

export async function listStudentsByIds(
  supabase: SupabaseServerClient,
  studentIds: string[],
) {
  if (studentIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from("students")
    .select("id,student_code,first_name,last_name,status,hostel_branch_id,organization_id")
    .in("id", studentIds)
    .is("deleted_at", null);
}

export async function listBillingFormOptions(
  supabase: SupabaseServerClient,
  organizationId: string,
  hostelBranchId?: string,
) {
  let studentsQuery = supabase
    .from("students")
    .select("id,student_code,first_name,last_name,status,hostel_branch_id,organization_id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("student_code", { ascending: true });

  let roomsQuery = supabase
    .from("rooms")
    .select("id,room_code,name,hostel_branch_id,organization_id,status")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("room_code", { ascending: true });

  let bedsQuery = supabase
    .from("room_beds")
    .select("id,bed_code,room_id,hostel_branch_id,organization_id,status")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("bed_code", { ascending: true });

  let rentPlansQuery = supabase
    .from("rent_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (hostelBranchId) {
    studentsQuery = studentsQuery.eq("hostel_branch_id", hostelBranchId);
    roomsQuery = roomsQuery.eq("hostel_branch_id", hostelBranchId);
    bedsQuery = bedsQuery.eq("hostel_branch_id", hostelBranchId);
    rentPlansQuery = rentPlansQuery.eq("hostel_branch_id", hostelBranchId);
  }

  const [branches, students, rooms, beds, rentPlans] = await Promise.all([
    supabase
      .from("hostel_branches")
      .select("id,name,slug")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    studentsQuery,
    roomsQuery,
    bedsQuery,
    rentPlansQuery,
  ]);

  return {
    beds,
    branches,
    rentPlans,
    rooms,
    students,
  };
}
