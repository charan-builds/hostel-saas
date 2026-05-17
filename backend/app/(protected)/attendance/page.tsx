import type { Route } from "next";
import Link from "next/link";

import { AttendanceForm } from "@/components/presence/attendance-form";
import { AttendanceTable } from "@/components/presence/attendance-table";
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Attendance</h2>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            href="/leave"
          >
            Leave
          </Link>
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            href="/gate-passes"
          >
            Gate passes
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">
            {attendance.summary.total}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Present</p>
          <p className="mt-1 text-2xl font-semibold">
            {attendance.summary.present}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Absent</p>
          <p className="mt-1 text-2xl font-semibold">
            {attendance.summary.absent}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">On leave</p>
          <p className="mt-1 text-2xl font-semibold">
            {attendance.summary.onLeave}
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[180px_180px_180px_120px]">
            <input
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.attendanceDate}
              name="attendanceDate"
              type="date"
            />
            <select
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="present">present</option>
              <option value="absent">absent</option>
              <option value="on_leave">on leave</option>
              <option value="late">late</option>
              <option value="excused">excused</option>
            </select>
            <select
              className="rounded border border-slate-300 px-3 py-2"
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
            <button
              className="rounded border border-slate-300 px-3 py-2 font-medium"
              type="submit"
            >
              Filter
            </button>
          </form>
          <AttendanceTable attendanceRecords={attendance.data} />
          <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              Page {attendance.page} of {attendance.pageCount}, {attendance.count}{" "}
              total
            </p>
            <nav
              className="flex items-center gap-2"
              aria-label="Attendance pagination"
            >
              {attendance.page > 1 ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={attendancePageHref(query, attendance.page - 1)}
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Previous
                </span>
              )}
              {attendance.page < attendance.pageCount ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={attendancePageHref(query, attendance.page + 1)}
                >
                  Next
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Next
                </span>
              )}
            </nav>
          </div>
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
