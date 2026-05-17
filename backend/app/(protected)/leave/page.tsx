import type { Route } from "next";
import Link from "next/link";

import { LeaveRequestForm } from "@/components/presence/leave-request-form";
import { LeaveTable } from "@/components/presence/leave-table";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import {
  getPresenceFormOptions,
  listLeaveRequests,
} from "@/modules/presence/presence.service";
import { listLeaveRequestsQuerySchema } from "@/modules/presence/schemas";

type LeavePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function leavePageHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
    studentId?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.studentId) {
    params.set("studentId", query.studentId);
  }

  return `/leave?${params.toString()}` as Route;
}

export default async function LeavePage({ searchParams }: LeavePageProps) {
  const context = await requireTenantPageAccess({
    permission: "leave:read",
    product: "hostel_erp",
  });
  const query = validateInput(listLeaveRequestsQuerySchema, await searchParams);
  const [leaveRequests, options] = await Promise.all([
    listLeaveRequests(query),
    getPresenceFormOptions(query.hostelBranchId),
  ]);
  const canManage = context.role === "admin" || context.role === "superadmin";

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Leave management</h2>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            href="/attendance"
          >
            Attendance
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
            {leaveRequests.summary.total}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold">
            {leaveRequests.summary.pending}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-1 text-2xl font-semibold">
            {leaveRequests.summary.active}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-1 text-2xl font-semibold">
            {leaveRequests.summary.overdue}
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_180px_120px]">
            <input
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.q ?? ""}
              name="q"
              placeholder="Search reason or destination"
            />
            <select
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="checked_out">checked out</option>
              <option value="returned">returned</option>
              <option value="overdue">overdue</option>
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
          <LeaveTable
            canManage={canManage}
            leaveRequests={leaveRequests.data}
          />
          <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              Page {leaveRequests.page} of {leaveRequests.pageCount},{" "}
              {leaveRequests.count} total
            </p>
            <nav className="flex items-center gap-2" aria-label="Leave pagination">
              {leaveRequests.page > 1 ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={leavePageHref(query, leaveRequests.page - 1)}
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Previous
                </span>
              )}
              {leaveRequests.page < leaveRequests.pageCount ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={leavePageHref(query, leaveRequests.page + 1)}
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
        <LeaveRequestForm
          branches={options.branches}
          organizationId={options.organizationId}
          students={options.students}
        />
      </div>
    </section>
  );
}
