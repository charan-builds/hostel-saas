import Link from "next/link";

import { ReportPreview } from "@/components/analytics/report-preview";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { getReportData } from "@/modules/analytics/analytics.service";
import { reportQuerySchema } from "@/modules/analytics/schemas";

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const context = await requireTenantPageAccess({
    permission: "analytics:read",
    product: "hostel_erp",
  });
  const query = validateInput(reportQuerySchema, await searchParams);

  if (!context.organizationId) {
    return (
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Reports</p>
          <h2 className="text-2xl font-semibold">Select an active tenant</h2>
        </div>
        <p className="text-sm text-slate-600">
          Reports are tenant-scoped and require an active organization context.
        </p>
      </section>
    );
  }

  const report = await getReportData(query);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Reports and exports</h2>
        </div>
        <Link
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
          href="/analytics"
        >
          Analytics
        </Link>
      </div>
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[160px_150px_150px_1fr_100px_120px]">
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.reportType}
          name="reportType"
        >
          <option value="revenue">revenue</option>
          <option value="occupancy">occupancy</option>
          <option value="attendance">attendance</option>
          <option value="leave">leave</option>
          <option value="collections">collections</option>
          <option value="visitors">visitors</option>
        </select>
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
          {report.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.limit}
          max={500}
          min={1}
          name="limit"
          type="number"
        />
        <button
          className="rounded border border-slate-300 px-3 py-2 font-medium"
          type="submit"
        >
          Preview
        </button>
      </form>
      <ReportPreview
        branches={report.branches}
        query={query}
        rows={report.reportRows}
      />
    </section>
  );
}
