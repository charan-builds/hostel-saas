import { ActivityFeed } from "@/components/analytics/activity-feed";
import { AnalyticsBars } from "@/components/analytics/analytics-bars";
import { MetricCard } from "@/components/analytics/metric-card";
import type { getAnalyticsDashboard } from "@/modules/analytics/analytics.service";

type AnalyticsDashboardData = Awaited<ReturnType<typeof getAnalyticsDashboard>>;

type AnalyticsDashboardProps = {
  dashboard: AnalyticsDashboardData;
};

function formatMoney(cents: number, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

function statusItems(statuses: Record<string, number>) {
  return Object.entries(statuses).map(([label, value]) => ({ label, value }));
}

export function AnalyticsDashboard({ dashboard }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Occupancy"
          tone="good"
          value={`${dashboard.occupancy.rate}%`}
        />
        <MetricCard
          label="Collections"
          value={formatMoney(
            dashboard.billing.collectedCents,
            dashboard.billing.currencyCode,
          )}
        />
        <MetricCard
          label="Pending dues"
          tone="warning"
          value={formatMoney(
            dashboard.billing.pendingDueCents,
            dashboard.billing.currencyCode,
          )}
        />
        <MetricCard
          label="Overdue"
          tone={dashboard.billing.overdueCents > 0 ? "critical" : "default"}
          value={formatMoney(
            dashboard.billing.overdueCents,
            dashboard.billing.currencyCode,
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Occupied beds"
          value={`${dashboard.occupancy.occupiedBeds}/${dashboard.occupancy.totalBeds}`}
        />
        <MetricCard
          label="Available beds"
          value={String(dashboard.occupancy.availableBeds)}
        />
        <MetricCard label="Leave requests" value={String(dashboard.leave.total)} />
        <MetricCard label="Visitors" value={String(dashboard.visitors.total)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsBars
          items={statusItems(dashboard.attendance.byStatus)}
          title="Attendance by status"
        />
        <AnalyticsBars
          items={statusItems(dashboard.leave.byStatus)}
          title="Leave by status"
        />
        <AnalyticsBars
          items={statusItems(dashboard.visitors.byStatus)}
          title="Visitors by status"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Rooms</th>
                <th className="px-4 py-3 font-medium">Beds</th>
                <th className="px-4 py-3 font-medium">Occupied</th>
                <th className="px-4 py-3 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dashboard.occupancy.rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    No branch occupancy data found.
                  </td>
                </tr>
              ) : (
                dashboard.occupancy.rows.map((row) => (
                  <tr key={row.hostel_branch_id ?? row.branch_name}>
                    <td className="px-4 py-3 font-medium">
                      {row.branch_name ?? "Branch"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.active_rooms ?? 0}/{row.total_rooms ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.available_beds ?? 0} available
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.occupied_beds ?? 0}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.occupancy_rate ?? 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <MetricCard
            label="Unread notifications"
            value={String(dashboard.notifications.unread)}
          />
          <MetricCard
            label="Failed notification deliveries"
            tone={dashboard.notifications.failed > 0 ? "warning" : "default"}
            value={String(dashboard.notifications.failed)}
          />
          <MetricCard
            label="Delivered notifications"
            value={String(dashboard.notifications.delivered)}
          />
        </div>
      </div>
      <ActivityFeed activity={dashboard.activity} />
    </div>
  );
}
