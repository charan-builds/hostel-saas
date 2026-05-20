import type { Route } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, ListChecks, UserCheck, UserX } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { AttendanceForm } from "@/components/presence/attendance-form";
import { AttendanceTable } from "@/components/presence/attendance-table";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import {
  getPresenceFormOptions,
  listAttendance,
} from "@/modules/presence/presence.service";
import { listAttendanceQuerySchema } from "@/modules/presence/schemas";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "erp-control";

function attendanceHref(
  query: {
    attendanceDate: string;
    hostelBranchId?: string | undefined;
    limit: number;
    status?: string | undefined;
  },
  overrides: {
    page?: number;
    status?: string | null;
  } = {},
): Route {
  const params = new URLSearchParams({
    attendanceDate: query.attendanceDate,
    limit: String(query.limit),
    page: String(overrides.page ?? 1),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  const status = overrides.status === undefined ? query.status : overrides.status;

  if (status) {
    params.set("status", status);
  }

  return `/attendance?${params.toString()}` as Route;
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const context = await requireTenantPageAccess({
    permission: "attendance:read",
    product: "hostel_erp",
  });
  const query = validateInput(listAttendanceQuerySchema, await searchParams);
  const [attendance, options] = await Promise.all([
    listAttendance(query),
    getPresenceFormOptions(query.hostelBranchId),
  ]);
  const canManage = context.role === "admin" || context.role === "superadmin";
  const defaultBranchId = query.hostelBranchId ?? options.branches[0]?.id ?? "";
  const branchById = new Map(options.branches.map((branch) => [branch.id, branch.name]));
  const selectedBranchName = query.hostelBranchId
    ? branchById.get(query.hostelBranchId)
    : undefined;
  const attentionCount = attendance.summary.absent + attendance.summary.onLeave;
  const activeFilters = [
    `Date: ${query.attendanceDate}`,
    selectedBranchName ? `Branch: ${selectedBranchName}` : undefined,
    query.status ? `Status: ${query.status.replaceAll("_", " ")}` : undefined,
  ].filter((value): value is string => Boolean(value));
  const quickFilters = [
    { label: "All", status: null },
    { label: "Present", status: "present" },
    { label: "Absent", status: "absent" },
    { label: "On leave", status: "on_leave" },
    { label: "Late", status: "late" },
  ];

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/leave">Leave</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/gate-passes">Gate passes</Link>
            </Button>
          </>
        }
        description="Mark daily presence, review absences, and keep occupancy-aware attendance visible."
        eyebrow="Hostel ERP"
        title="Attendance"
      />

      <ErpPageGrid>
        <StatCard
          description="Matching the selected date and filters"
          icon={CalendarCheck}
          label="Daily records"
          tone="info"
          value={String(attendance.summary.total)}
        />
        <StatCard
          description="Verified residents"
          icon={UserCheck}
          label="Present"
          tone="success"
          value={String(attendance.summary.present)}
        />
        <StatCard
          description="Needs quick follow-up"
          icon={UserX}
          label="Absent"
          tone={attendance.summary.absent > 0 ? "danger" : "default"}
          value={String(attendance.summary.absent)}
        />
        <StatCard
          description="Approved or marked leave"
          icon={Clock}
          label="On leave"
          tone="info"
          value={String(attendance.summary.onLeave)}
        />
      </ErpPageGrid>

      <ActionToolbar
        description="Jump between the daily verification queues without changing the selected branch or date."
        title="Attendance work queue"
      >
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              asChild
              key={filter.label}
              size="sm"
              variant={(query.status ?? null) === filter.status ? "default" : "outline"}
            >
              <Link href={attendanceHref(query, { status: filter.status })}>
                {filter.label}
              </Link>
            </Button>
          ))}
        </div>
      </ActionToolbar>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <SectionCard
            contentClassName="space-y-4"
            description="Pick the operating date and branch before marking or reviewing attendance."
            title="Daily attendance filters"
          >
            <form action="/attendance">
              <SearchFilterBar
                actions={
                  <>
                    <Button type="submit" variant="outline">
                      Apply filters
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href="/attendance">Reset</Link>
                    </Button>
                  </>
                }
                name="_q"
                placeholder="Filter attendance"
                surface="embedded"
              >
                <input
                  aria-label="Attendance date"
                  className={selectClassName}
                  defaultValue={query.attendanceDate}
                  name="attendanceDate"
                  type="date"
                />
                <select
                  aria-label="Filter attendance by status"
                  className={selectClassName}
                  defaultValue={query.status ?? ""}
                  name="status"
                >
                  <option value="">All statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On leave</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
                <select
                  aria-label="Filter attendance by branch"
                  className={selectClassName}
                  defaultValue={query.hostelBranchId ?? ""}
                  name="hostelBranchId"
                >
                  <option value="">All branches</option>
                  {options.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Rows per page"
                  className={selectClassName}
                  defaultValue={String(query.limit)}
                  name="limit"
                >
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </SearchFilterBar>
            </form>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters</span>
              {activeFilters.map((filter) => (
                <span
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize"
                  key={filter}
                >
                  {filter}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            actions={
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium">
                <ListChecks className="size-3.5" aria-hidden="true" />
                {attentionCount} to verify
              </span>
            }
            contentClassName="space-y-4"
            description="Review presence records, absence notes, and room/bed context from the same operational queue."
            title="Daily attendance list"
          >
            <AttendanceTable
              attendanceRecords={attendance.data}
              branchNames={Object.fromEntries(branchById)}
            />
          </SectionCard>
          <PaginationControls
            count={attendance.count}
            hrefForPage={(page) => attendanceHref(query, { page })}
            itemLabel="attendance records"
            page={attendance.page}
            pageCount={attendance.pageCount}
          />
        </div>
        {canManage ? (
          <AttendanceForm
            branches={options.branches}
            defaultAttendanceDate={query.attendanceDate}
            defaultBranchId={defaultBranchId}
            organizationId={options.organizationId}
            students={options.students}
          />
        ) : null}
      </div>
    </ErpPage>
  );
}
