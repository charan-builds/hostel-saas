import Link from "next/link";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { refreshAnalyticsSnapshotAction } from "@/modules/analytics/actions";
import { getAnalyticsDashboard } from "@/modules/analytics/analytics.service";
import { dashboardQuerySchema } from "@/modules/analytics/schemas";

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const context = await requireTenantPageAccess({
    permission: "analytics:read",
    product: "hostel_erp",
  });
  const query = validateInput(dashboardQuerySchema, await searchParams);

  if (!context.organizationId) {
    return (
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Analytics</p>
          <h2 className="text-2xl font-semibold">Select an active tenant</h2>
        </div>
        <p className="text-sm text-slate-600">
          Analytics are tenant-scoped and require an active organization context.
        </p>
      </section>
    );
  }

  const dashboard = await getAnalyticsDashboard(query);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Analytics dashboard</h2>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            href="/reports"
          >
            Reports
          </Link>
          <form action={refreshAnalyticsSnapshotAction}>
            <input
              name="organizationId"
              type="hidden"
              value={context.organizationId}
            />
            {query.hostelBranchId ? (
              <input
                name="hostelBranchId"
                type="hidden"
                value={query.hostelBranchId}
              />
            ) : null}
            <button
              className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Request refresh
            </button>
          </form>
        </div>
      </div>
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[160px_160px_1fr_120px]">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.startDate}
          name="startDate"
          type="date"
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.endDate}
          name="endDate"
          type="date"
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.hostelBranchId ?? ""}
          name="hostelBranchId"
        >
          <option value="">All branches</option>
          {dashboard.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button
          className="rounded border border-slate-300 px-3 py-2 font-medium"
          type="submit"
        >
          Apply
        </button>
      </form>
      <AnalyticsDashboard dashboard={dashboard} />
    </section>
  );
}
