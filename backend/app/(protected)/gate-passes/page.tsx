import type { Route } from "next";
import Link from "next/link";

import { GatePassForm } from "@/components/presence/gate-pass-form";
import { GatePassTable } from "@/components/presence/gate-pass-table";
import { VisitorPassForm } from "@/components/presence/visitor-pass-form";
import { VisitorPassTable } from "@/components/presence/visitor-pass-table";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import {
  getPresenceFormOptions,
  listGatePasses,
} from "@/modules/presence/presence.service";
import { listGatePassesQuerySchema } from "@/modules/presence/schemas";

type GatePassesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function gatePassPageHref(
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

  return `/gate-passes?${params.toString()}` as Route;
}

export default async function GatePassesPage({
  searchParams,
}: GatePassesPageProps) {
  const context = await requireTenantPageAccess({
    permission: "gatepass:read",
    product: "hostel_erp",
  });
  const query = validateInput(listGatePassesQuerySchema, await searchParams);
  const [gatePasses, options] = await Promise.all([
    listGatePasses(query),
    getPresenceFormOptions(query.hostelBranchId),
  ]);
  const canManage = context.role === "admin" || context.role === "superadmin";
  const defaultBranchId = query.hostelBranchId ?? options.branches[0]?.id ?? "";

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Gate passes</h2>
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
            href="/attendance"
          >
            Attendance
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold">
            {gatePasses.summary.total}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold">
            {gatePasses.summary.pending}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Outside</p>
          <p className="mt-1 text-2xl font-semibold">
            {gatePasses.summary.outside}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Late</p>
          <p className="mt-1 text-2xl font-semibold">
            {gatePasses.summary.late}
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
              placeholder="Search purpose or destination"
            />
            <select
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="requested">requested</option>
              <option value="approved">approved</option>
              <option value="checked_out">checked out</option>
              <option value="checked_in">checked in</option>
              <option value="rejected">rejected</option>
              <option value="expired">expired</option>
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
          <GatePassTable
            canManage={canManage}
            gatePasses={gatePasses.data}
          />
          <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              Page {gatePasses.page} of {gatePasses.pageCount},{" "}
              {gatePasses.count} total
            </p>
            <nav
              className="flex items-center gap-2"
              aria-label="Gate pass pagination"
            >
              {gatePasses.page > 1 ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={gatePassPageHref(query, gatePasses.page - 1)}
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Previous
                </span>
              )}
              {gatePasses.page < gatePasses.pageCount ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={gatePassPageHref(query, gatePasses.page + 1)}
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
          <VisitorPassTable
            canManage={canManage}
            visitorPasses={gatePasses.visitorPasses}
          />
        </div>
        <div className="space-y-4">
          <GatePassForm
            branches={options.branches}
            defaultBranchId={defaultBranchId}
            organizationId={options.organizationId}
            students={options.students}
          />
          <VisitorPassForm
            allowUnlinkedVisitors={canManage}
            branches={options.branches}
            defaultBranchId={defaultBranchId}
            organizationId={options.organizationId}
            students={options.students}
          />
        </div>
      </div>
    </section>
  );
}
