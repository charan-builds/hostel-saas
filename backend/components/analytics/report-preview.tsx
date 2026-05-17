import { exportReportAction } from "@/modules/analytics/actions";
import type { ReportRow } from "@/modules/analytics/analytics.service";
import type { ReportQuery } from "@/modules/analytics/schemas";

type BranchOption = {
  id: string;
  name: string;
  slug: string;
};

type ReportPreviewProps = {
  branches: BranchOption[];
  query: ReportQuery;
  rows: ReportRow[];
};

export function ReportPreview({ branches, query, rows }: ReportPreviewProps) {
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-4">
      <form
        action={exportReportAction}
        className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[160px_150px_150px_1fr_130px_120px]"
      >
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
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue="excel"
          name="format"
        >
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
        <button
          className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          Export
        </button>
        <input name="limit" type="hidden" value={query.limit} />
      </form>
      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {columns.length === 0 ? (
                <th className="px-4 py-3 font-medium">Report</th>
              ) : (
                columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-medium">
                    {column}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-500"
                  colSpan={Math.max(columns.length, 1)}
                >
                  No report rows found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${query.reportType}-${index}`}>
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-slate-600">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
