import "server-only";

import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardQuery, ReportQuery } from "@/modules/analytics/schemas";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const DASHBOARD_ROW_LIMIT = 500;

function getLimit(input: unknown, fallback = DASHBOARD_ROW_LIMIT) {
  if (
    typeof input === "object" &&
    input !== null &&
    "limit" in input &&
    typeof input.limit === "number"
  ) {
    return input.limit;
  }

  return fallback;
}

function applyBranchFilter<TQuery extends { eq: (column: string, value: string) => TQuery }>(
  query: TQuery,
  hostelBranchId?: string,
) {
  return hostelBranchId ? query.eq("hostel_branch_id", hostelBranchId) : query;
}

export async function listAnalyticsBranches(
  supabase: SupabaseServerClient,
  organizationId: string,
) {
  return supabase
    .from("hostel_branches")
    .select("id,name,slug")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true })
    .limit(DASHBOARD_ROW_LIMIT);
}

export async function listOccupancyRows(options: {
  input: Pick<DashboardQuery, "hostelBranchId">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_branch_occupancy")
    .select("*")
    .eq("organization_id", options.organizationId)
    .order("branch_name", { ascending: true })
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listBillingSummaryRows(options: {
  input: Pick<DashboardQuery, "hostelBranchId">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_billing_branch_summary")
    .select("*")
    .eq("organization_id", options.organizationId)
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listRevenueDailyRows(options: {
  input: Pick<DashboardQuery, "endDate" | "hostelBranchId" | "startDate">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_revenue_daily")
    .select("*")
    .eq("organization_id", options.organizationId)
    .gte("revenue_date", options.input.startDate)
    .lte("revenue_date", options.input.endDate)
    .order("revenue_date", { ascending: true })
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listAttendanceDailyRows(options: {
  input: Pick<DashboardQuery, "endDate" | "hostelBranchId" | "startDate">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_attendance_daily")
    .select("*")
    .eq("organization_id", options.organizationId)
    .gte("attendance_date", options.input.startDate)
    .lte("attendance_date", options.input.endDate)
    .order("attendance_date", { ascending: true })
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listLeaveDailyRows(options: {
  input: Pick<DashboardQuery, "endDate" | "hostelBranchId" | "startDate">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_leave_daily")
    .select("*")
    .eq("organization_id", options.organizationId)
    .gte("leave_date", options.input.startDate)
    .lte("leave_date", options.input.endDate)
    .order("leave_date", { ascending: true })
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listVisitorDailyRows(options: {
  input: Pick<DashboardQuery, "endDate" | "hostelBranchId" | "startDate">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_visitor_daily")
    .select("*")
    .eq("organization_id", options.organizationId)
    .gte("visitor_date", options.input.startDate)
    .lte("visitor_date", options.input.endDate)
    .order("visitor_date", { ascending: true })
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listNotificationSummaryRows(options: {
  input: Pick<DashboardQuery, "hostelBranchId">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("analytics_notification_summary")
    .select("*")
    .eq("organization_id", options.organizationId)
    .limit(getLimit(options.input));

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listActivityRows(options: {
  input: Pick<DashboardQuery, "hostelBranchId">;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("audit_logs")
    .select("id,action,entity_table,entity_id,actor_user_id,hostel_branch_id,metadata,created_at")
    .eq("organization_id", options.organizationId)
    .order("created_at", { ascending: false })
    .limit(15);

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}

export async function listCollectionsReportRows(options: {
  input: ReportQuery;
  organizationId: string;
  supabase: SupabaseServerClient;
}) {
  let query = options.supabase
    .from("billing_invoices")
    .select("invoice_number,invoice_month,due_date,status,total_cents,paid_cents,balance_cents,currency_code,student_id,hostel_branch_id")
    .eq("organization_id", options.organizationId)
    .is("deleted_at", null)
    .gte("due_date", options.input.startDate)
    .lte("due_date", options.input.endDate)
    .order("due_date", { ascending: false })
    .limit(options.input.limit);

  query = applyBranchFilter(query, options.input.hostelBranchId);

  return query;
}
