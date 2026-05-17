import "server-only";

import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  listActivityRows,
  listAnalyticsBranches,
  listAttendanceDailyRows,
  listBillingSummaryRows,
  listCollectionsReportRows,
  listLeaveDailyRows,
  listNotificationSummaryRows,
  listOccupancyRows,
  listRevenueDailyRows,
  listVisitorDailyRows,
} from "@/modules/analytics/analytics.repository";
import {
  renderExcelXmlReport,
  renderPdfReport,
  type ReportCell,
  type ReportTable,
} from "@/modules/analytics/report-export";
import type {
  DashboardQuery,
  RefreshAnalyticsSnapshotInput,
  ReportExportInput,
  ReportQuery,
  ReportType,
} from "@/modules/analytics/schemas";
import type { Database } from "@/types/database.types";

export type OccupancyAnalyticsRow =
  Database["public"]["Views"]["analytics_branch_occupancy"]["Row"];
export type BillingAnalyticsRow =
  Database["public"]["Views"]["analytics_billing_branch_summary"]["Row"];
export type RevenueAnalyticsRow =
  Database["public"]["Views"]["analytics_revenue_daily"]["Row"];
export type AttendanceAnalyticsRow =
  Database["public"]["Views"]["analytics_attendance_daily"]["Row"];
export type LeaveAnalyticsRow =
  Database["public"]["Views"]["analytics_leave_daily"]["Row"];
export type VisitorAnalyticsRow =
  Database["public"]["Views"]["analytics_visitor_daily"]["Row"];
export type NotificationAnalyticsRow =
  Database["public"]["Views"]["analytics_notification_summary"]["Row"];
export type ActivityFeedRow =
  Database["public"]["Tables"]["audit_logs"]["Row"];

type BranchOption = {
  id: string;
  name: string;
  slug: string;
};

export type ReportRow = Record<string, ReportCell>;

const refreshResultSchema = z.object({
  jobId: z.string().uuid(),
  hostelBranchId: z.string().uuid().nullable(),
  organizationId: z.string().uuid(),
  status: z.enum(["queued", "running", "succeeded", "failed", "cancelled"]),
});

function requireOrganizationId(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required for analytics.",
      statusCode: 400,
    });
  }

  return organizationId;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to access analytics.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    expose: false,
    message: "Analytics query failed.",
    statusCode: 500,
  });
}

function parseRpcResult<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
  message: string,
): z.output<TSchema> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message,
      statusCode: 500,
    });
  }

  return parsed.data;
}

function n(value: number | null | undefined) {
  return value ?? 0;
}

function money(cents: number) {
  return `INR ${(cents / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function sumBy<T>(rows: T[], selector: (row: T) => number | null | undefined) {
  return rows.reduce((total, row) => total + n(selector(row)), 0);
}

function getStatusTotals<T extends { status: string | null; [key: string]: unknown }>(
  rows: T[],
  countKey: keyof T,
) {
  return rows.reduce<Record<string, number>>((totals, row) => {
    const status = row.status ?? "unknown";
    const value = typeof row[countKey] === "number" ? row[countKey] : 0;
    totals[status] = (totals[status] ?? 0) + value;

    return totals;
  }, {});
}

function makeReportTable(title: string, rows: ReportRow[]): ReportTable {
  const columns = rows[0] ? Object.keys(rows[0]) : ["No data"];

  return {
    columns,
    rows:
      rows.length > 0
        ? rows.map((row) => columns.map((column) => row[column] ?? null))
        : [["No records found"]],
    title,
  };
}

function mapReportRows(reportType: ReportType, rows: unknown[]): ReportRow[] {
  switch (reportType) {
    case "occupancy":
      return (rows as OccupancyAnalyticsRow[]).map((row) => ({
        "Active students": n(row.active_students),
        "Available beds": n(row.available_beds),
        Branch: row.branch_name ?? row.hostel_branch_id ?? "",
        "Occupancy rate": `${n(row.occupancy_rate)}%`,
        "Occupied beds": n(row.occupied_beds),
        "Total beds": n(row.total_beds),
        "Total rooms": n(row.total_rooms),
      }));
    case "attendance":
      return (rows as AttendanceAnalyticsRow[]).map((row) => ({
        Count: n(row.record_count),
        Date: row.attendance_date ?? "",
        Status: row.status ?? "",
      }));
    case "leave":
      return (rows as LeaveAnalyticsRow[]).map((row) => ({
        Count: n(row.request_count),
        Date: row.leave_date ?? "",
        Status: row.status ?? "",
        Type: row.leave_type ?? "",
      }));
    case "collections":
      return (
        rows as Array<
          Pick<
            Database["public"]["Tables"]["billing_invoices"]["Row"],
            | "balance_cents"
            | "currency_code"
            | "due_date"
            | "invoice_month"
            | "invoice_number"
            | "paid_cents"
            | "status"
            | "total_cents"
          >
        >
      ).map((row) => ({
        Balance: money(row.balance_cents),
        Currency: row.currency_code,
        Due: row.due_date,
        Invoice: row.invoice_number,
        Month: row.invoice_month,
        Paid: money(row.paid_cents),
        Status: row.status,
        Total: money(row.total_cents),
      }));
    case "visitors":
      return (rows as VisitorAnalyticsRow[]).map((row) => ({
        Count: n(row.visitor_count),
        Date: row.visitor_date ?? "",
        Status: row.status ?? "",
      }));
    case "revenue":
    default:
      return (rows as RevenueAnalyticsRow[]).map((row) => ({
        Collected: money(n(row.collected_cents)),
        Currency: row.currency_code ?? "INR",
        Date: row.revenue_date ?? "",
        Payments: n(row.payment_count),
        Refunds: money(n(row.refunded_cents)),
        Students: n(row.paying_students),
      }));
  }
}

async function loadDashboardData(input: DashboardQuery, organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const [
    branches,
    occupancy,
    billing,
    revenue,
    attendance,
    leave,
    visitors,
    notifications,
    activity,
  ] = await Promise.all([
    listAnalyticsBranches(supabase, organizationId),
    listOccupancyRows({ input, organizationId, supabase }),
    listBillingSummaryRows({ input, organizationId, supabase }),
    listRevenueDailyRows({ input, organizationId, supabase }),
    listAttendanceDailyRows({ input, organizationId, supabase }),
    listLeaveDailyRows({ input, organizationId, supabase }),
    listVisitorDailyRows({ input, organizationId, supabase }),
    listNotificationSummaryRows({ input, organizationId, supabase }),
    listActivityRows({ input, organizationId, supabase }),
  ]);

  const results = [
    branches,
    occupancy,
    billing,
    revenue,
    attendance,
    leave,
    visitors,
    notifications,
    activity,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw mapDatabaseError(failed.error);
  }

  return {
    activity: (activity.data ?? []) as ActivityFeedRow[],
    attendance: attendance.data ?? [],
    billing: billing.data ?? [],
    branches: (branches.data ?? []) as BranchOption[],
    leave: leave.data ?? [],
    notifications: notifications.data ?? [],
    occupancy: occupancy.data ?? [],
    revenue: revenue.data ?? [],
    visitors: visitors.data ?? [],
  };
}

export async function getAnalyticsDashboard(input: DashboardQuery) {
  const context = await requirePermission("analytics:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const data = await loadDashboardData(input, organizationId);
  const totalBeds = sumBy(data.occupancy, (row) => row.total_beds);
  const occupiedBeds = sumBy(data.occupancy, (row) => row.occupied_beds);
  const availableBeds = sumBy(data.occupancy, (row) => row.available_beds);
  const collectedCents = sumBy(data.revenue, (row) => row.collected_cents);
  const pendingDueCents = sumBy(data.billing, (row) => row.pending_due_cents);
  const overdueCents = sumBy(data.billing, (row) => row.overdue_cents);
  const attendanceByStatus = getStatusTotals(data.attendance, "record_count");
  const leaveByStatus = getStatusTotals(data.leave, "request_count");
  const visitorByStatus = getStatusTotals(data.visitors, "visitor_count");

  return {
    activity: data.activity,
    attendance: {
      byStatus: attendanceByStatus,
      rows: data.attendance,
      total: sumBy(data.attendance, (row) => row.record_count),
    },
    billing: {
      collectedCents,
      currencyCode: data.billing[0]?.currency_code ?? data.revenue[0]?.currency_code ?? "INR",
      overdueCents,
      pendingDueCents,
      rows: data.billing,
    },
    branches: data.branches,
    filters: input,
    leave: {
      byStatus: leaveByStatus,
      rows: data.leave,
      total: sumBy(data.leave, (row) => row.request_count),
    },
    notifications: {
      delivered: sumBy(data.notifications, (row) => row.delivered_count),
      failed: sumBy(data.notifications, (row) => row.failed_count),
      unread: sumBy(data.notifications, (row) => row.unread_count),
    },
    occupancy: {
      availableBeds,
      occupiedBeds,
      rate: totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(2)) : 0,
      rows: data.occupancy,
      totalBeds,
    },
    revenue: data.revenue,
    visitors: {
      byStatus: visitorByStatus,
      rows: data.visitors,
      total: sumBy(data.visitors, (row) => row.visitor_count),
    },
  };
}

export async function getReportData(input: ReportQuery) {
  const context = await requirePermission("analytics:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  let result:
    | Awaited<ReturnType<typeof listAttendanceDailyRows>>
    | Awaited<ReturnType<typeof listCollectionsReportRows>>
    | Awaited<ReturnType<typeof listLeaveDailyRows>>
    | Awaited<ReturnType<typeof listOccupancyRows>>
    | Awaited<ReturnType<typeof listRevenueDailyRows>>
    | Awaited<ReturnType<typeof listVisitorDailyRows>>;

  switch (input.reportType) {
    case "occupancy":
      result = await listOccupancyRows({ input, organizationId, supabase });
      break;
    case "attendance":
      result = await listAttendanceDailyRows({ input, organizationId, supabase });
      break;
    case "leave":
      result = await listLeaveDailyRows({ input, organizationId, supabase });
      break;
    case "collections":
      result = await listCollectionsReportRows({ input, organizationId, supabase });
      break;
    case "visitors":
      result = await listVisitorDailyRows({ input, organizationId, supabase });
      break;
    case "revenue":
    default:
      result = await listRevenueDailyRows({ input, organizationId, supabase });
      break;
  }

  if (result.error) {
    throw mapDatabaseError(result.error);
  }

  const rows = result.data ?? [];

  return {
    branches: (await listAnalyticsBranches(supabase, organizationId)).data ?? [],
    filters: input,
    reportRows: mapReportRows(input.reportType, rows),
    rawRows: rows,
  };
}

export async function exportReport(input: ReportExportInput) {
  const context = await requirePermission("report:export", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const report = await getReportData(input);
  const title = `${input.reportType} report ${input.startDate} to ${input.endDate}`;
  const table = makeReportTable(title, report.reportRows);
  const timestamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  const extension = input.format === "pdf" ? "pdf" : "xls";

  await recordAuditEvent({
    action: "report.export",
    actorUserId: context.identity.userId,
    durable: true,
    entityTable: "analytics_reports",
    hostelBranchId: input.hostelBranchId,
    metadata: {
      end_date: input.endDate,
      format: input.format,
      report_type: input.reportType,
      row_count: report.reportRows.length,
      start_date: input.startDate,
    },
    organizationId,
  });

  if (input.format === "pdf") {
    return {
      body: renderPdfReport(table),
      contentType: "application/pdf",
      filename: `${input.reportType}-report-${timestamp}.${extension}`,
    };
  }

  return {
    body: renderExcelXmlReport(table),
    contentType: "application/vnd.ms-excel; charset=utf-8",
    filename: `${input.reportType}-report-${timestamp}.${extension}`,
  };
}

export async function refreshAnalyticsSnapshot(
  input: RefreshAnalyticsSnapshotInput,
) {
  const context = await requirePermission("analytics:read", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "request_analytics_refresh",
    {
      p_actor_user_id: context.identity.userId,
      p_organization_id: input.organizationId,
      ...(input.hostelBranchId === undefined
        ? {}
        : { p_hostel_branch_id: input.hostelBranchId }),
      ...(input.requestId === undefined ? {} : { p_request_id: input.requestId }),
    },
  );

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    refreshResultSchema,
    data,
    "Analytics refresh returned an invalid response.",
  );
}
