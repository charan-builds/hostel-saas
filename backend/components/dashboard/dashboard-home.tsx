import Link from "next/link";
import type { Route } from "next";
import {
  Activity,
  BedDouble,
  Bell,
  CalendarCheck,
  CreditCard,
  DoorOpen,
  FileBarChart,
  Users,
} from "lucide-react";

import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import type { getAnalyticsDashboard } from "@/modules/analytics/analytics.service";
import { formatCurrency } from "@/lib/utils";

type DashboardData = Awaited<ReturnType<typeof getAnalyticsDashboard>>;

type DashboardHomeProps = {
  analytics?: DashboardData | undefined;
  canManageTenant: boolean;
  isSuperadmin: boolean;
  role: string;
  unreadNotifications: number;
};

function statusItems(statuses: Record<string, number>) {
  return Object.entries(statuses).map(([label, value]) => ({
    label: label.replaceAll("_", " "),
    value,
  }));
}

export function DashboardHome({
  analytics,
  canManageTenant,
  isSuperadmin,
  role,
  unreadNotifications,
}: DashboardHomeProps) {
  const currencyCode = analytics?.billing.currencyCode ?? "INR";
  const quickActions = [
    {
      href: "/students/new",
      label: "Add student",
    },
    {
      href: "/rooms/new",
      label: "Create room",
    },
    {
      href: "/billing",
      label: "Collect payment",
    },
    {
      href: "/notices/manage",
      label: "Publish notice",
    },
  ] satisfies Array<{ href: Route; label: string }>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Hostel ERP</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
            Operations dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor occupancy, collections, attendance, and daily hostel activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSuperadmin ? (
            <Button asChild>
              <Link href="/super-admin/onboarding">Create tenant</Link>
            </Button>
          ) : null}
          {canManageTenant ? (
            <>
              <Button asChild variant="outline">
                <Link href="/analytics">Analytics</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/reports">Reports</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          description="Current branch and tenant occupancy"
          icon={BedDouble}
          label="Occupancy"
          tone="success"
          value={analytics ? `${analytics.occupancy.rate}%` : "Ready"}
        />
        <KpiCard
          description="Recorded payments in selected range"
          icon={CreditCard}
          label="Collections"
          value={formatCurrency(analytics?.billing.collectedCents ?? 0, currencyCode)}
        />
        <KpiCard
          description="Open balance across active invoices"
          icon={FileBarChart}
          label="Pending dues"
          tone={(analytics?.billing.pendingDueCents ?? 0) > 0 ? "warning" : "default"}
          value={formatCurrency(analytics?.billing.pendingDueCents ?? 0, currencyCode)}
        />
        <KpiCard
          description="Unread operational messages"
          icon={Bell}
          label="Notifications"
          tone={unreadNotifications > 0 ? "info" : "default"}
          value={String(unreadNotifications)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                asChild
                className="h-12 justify-start"
                key={action.href}
                variant="outline"
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workspace role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-accent text-accent-foreground">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold capitalize">{role}</p>
                <p className="text-sm text-muted-foreground">
                  Role-aware navigation and actions are enabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <SimpleBarChart
            items={statusItems(analytics.attendance.byStatus)}
            title="Attendance"
          />
          <SimpleBarChart items={statusItems(analytics.leave.byStatus)} title="Leave" />
          <SimpleBarChart
            items={statusItems(analytics.visitors.byStatus)}
            title="Visitors"
          />
        </div>
      ) : (
        <EmptyState
          description="Analytics widgets appear after a tenant is active and the current role has analytics access."
          title="Analytics workspace is waiting for data"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="Active beds"
          value={`${analytics?.occupancy.occupiedBeds ?? 0}/${analytics?.occupancy.totalBeds ?? 0}`}
        />
        <KpiCard
          icon={BedDouble}
          label="Available beds"
          value={String(analytics?.occupancy.availableBeds ?? 0)}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Leave requests"
          value={String(analytics?.leave.total ?? 0)}
        />
        <KpiCard
          icon={DoorOpen}
          label="Visitors"
          value={String(analytics?.visitors.total ?? 0)}
        />
      </div>
    </section>
  );
}
