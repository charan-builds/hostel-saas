import type { Route } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, UserCheck, UserX } from "lucide-react";

import { AttendanceForm } from "@/components/presence/attendance-form";
import { AttendanceTable } from "@/components/presence/attendance-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
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
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

function attendancePageHref(
  query: {
    attendanceDate: string;
    hostelBranchId?: string | undefined;
    limit: number;
    status?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    attendanceDate: query.attendanceDate,
    limit: String(query.limit),
    page: String(page),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.status) {
    params.set("status", query.status);
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

  return (
    <section className="space-y-6">
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Total" value={String(attendance.summary.total)} />
        <StatCard icon={UserCheck} label="Present" tone="success" value={String(attendance.summary.present)} />
        <StatCard icon={UserX} label="Absent" tone={attendance.summary.absent > 0 ? "danger" : "default"} value={String(attendance.summary.absent)} />
        <StatCard icon={Clock} label="On leave" tone="info" value={String(attendance.summary.onLeave)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <form action="/attendance">
            <SearchFilterBar
              actions={
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
              }
              name="_q"
              placeholder="Filter attendance"
            >
              <input className={selectClassName} defaultValue={query.attendanceDate} name="attendanceDate" type="date" />
              <select className={selectClassName} defaultValue={query.status ?? ""} name="status">
                <option value="">All statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On leave</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
              <select className={selectClassName} defaultValue={query.hostelBranchId ?? ""} name="hostelBranchId">
                <option value="">All branches</option>
                {options.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </SearchFilterBar>
          </form>
          <AttendanceTable attendanceRecords={attendance.data} />
          <PaginationControls
            count={attendance.count}
            hrefForPage={(page) => attendancePageHref(query, page)}
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
    </section>
  );
}
