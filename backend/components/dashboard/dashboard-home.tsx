import Link from "next/link";
import type { Route } from "next";
import {
  Activity,
  Banknote,
  BedDouble,
  Bell,
  CalendarCheck,
  CreditCard,
  DoorOpen,
  FileBarChart,
  Megaphone,
  Plus,
  ReceiptText,
  UserPlus,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { ActivityFeed } from "@/components/analytics/activity-feed";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { TenantHeader } from "@/components/layout/tenant-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/state";
import { QuickActionButton } from "@/components/ui/quick-action-button";
import { StatCard } from "@/components/ui/stat-card";
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

function sumRows<T>(rows: T[] | undefined, selector: (row: T) => number | null) {
  return (rows ?? []).reduce((total, row) => total + (selector(row) ?? 0), 0);
}

export function DashboardHome({
  analytics,
  canManageTenant,
  isSuperadmin,
  role,
  unreadNotifications,
}: DashboardHomeProps) {
  const currencyCode = analytics?.billing.currencyCode ?? "INR";
  const selectedBranch = analytics?.filters.hostelBranchId
    ? analytics.branches.find((branch) => branch.id === analytics.filters.hostelBranchId)
    : undefined;
  const totalStudents = sumRows(analytics?.occupancy.rows, (row) => row.active_students);
  const openInvoices = sumRows(analytics?.billing.rows, (row) => row.open_invoice_count);
  const overdueInvoices = sumRows(
    analytics?.billing.rows,
    (row) => row.overdue_invoice_count,
  );
  const recentPayments = sumRows(analytics?.revenue, (row) => row.payment_count);
  const activeLeaves =
    (analytics?.leave.byStatus.pending ?? 0) + (analytics?.leave.byStatus.approved ?? 0);
  const quickActions = (
    isSuperadmin
      ? [
          {
            href: "/super-admin/onboarding",
            icon: Plus,
            label: "Create tenant",
          },
        ]
      : canManageTenant
        ? [
            {
              href: "/students/new",
              icon: UserPlus,
              label: "Admit student",
            },
            {
              href: "/rooms/new",
              icon: BedDouble,
              label: "Create room",
            },
            {
              href: "/billing",
              icon: Banknote,
              label: "Collect rent",
            },
            {
              href: "/attendance",
              icon: CalendarCheck,
              label: "Mark attendance",
            },
            {
              href: "/leave",
              icon: FileBarChart,
              label: "Review leave",
            },
            {
              href: "/notices/manage",
              icon: Megaphone,
              label: "Publish notice",
            },
          ]
        : [
            {
              href: "/leave",
              icon: FileBarChart,
              label: "Request leave",
            },
            {
              href: "/notices",
              icon: Megaphone,
              label: "View notices",
            },
            {
              href: "/gate-passes",
              icon: DoorOpen,
              label: "Gate pass",
            },
          ]
  ) satisfies Array<{ href: Route; icon: LucideIcon; label: string }>;

  return (
    <ErpPage>
      <PageHeader
        actions={
          <>
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
          </>
        }
        description="Occupancy, rent collection, attendance, leave, and communication in one daily operations view."
        eyebrow="Hostel ERP"
        meta={
          <TenantHeader
            branchName={selectedBranch?.name}
            isSuperadmin={isSuperadmin}
            role={role}
          />
        }
        title="Operations dashboard"
      />

      <ErpPageGrid>
        <StatCard
          description="Active students in the selected scope"
          href="/students"
          icon={Users}
          label="Total students"
          tone="info"
          value={String(totalStudents)}
        />
        <StatCard
          description={`${analytics?.occupancy.availableBeds ?? 0} beds available`}
          href="/rooms"
          icon={BedDouble}
          label="Occupancy"
          tone="success"
          value={analytics ? `${analytics.occupancy.rate}%` : "Ready"}
        />
        <StatCard
          description={`${openInvoices} open invoices`}
          href="/billing"
          icon={CreditCard}
          label="Collections"
          value={formatCurrency(analytics?.billing.collectedCents ?? 0, currencyCode)}
        />
        <StatCard
          description={`${overdueInvoices} overdue invoices`}
          href="/billing"
          icon={FileBarChart}
          label="Pending dues"
          tone={overdueInvoices > 0 ? "warning" : "default"}
          value={formatCurrency(analytics?.billing.pendingDueCents ?? 0, currencyCode)}
        />
      </ErpPageGrid>

      <ErpPageGrid>
        <StatCard
          description="Occupied beds from live assignments"
          href="/rooms"
          icon={Activity}
          label="Occupied beds"
          value={`${analytics?.occupancy.occupiedBeds ?? 0}/${analytics?.occupancy.totalBeds ?? 0}`}
        />
        <StatCard
          description="Attendance rows in the selected range"
          href="/attendance"
          icon={CalendarCheck}
          label="Attendance"
          value={String(analytics?.attendance.total ?? 0)}
        />
        <StatCard
          description="Pending and approved leave requests"
          href="/leave"
          icon={DoorOpen}
          label="Active leaves"
          tone={activeLeaves > 0 ? "warning" : "default"}
          value={String(activeLeaves)}
        />
        <StatCard
          description={`${recentPayments} payment records`}
          href="/billing"
          icon={ReceiptText}
          label="Recent payments"
          value={formatCurrency(analytics?.billing.collectedCents ?? 0, currencyCode)}
        />
      </ErpPageGrid>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Daily actions</CardTitle>
            <CardDescription>
              The fastest paths for hostel desk work and tenant administration.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionButton
                href={action.href}
                icon={action.icon}
                key={action.href}
                label={action.label}
                tone={action.href === "/billing" ? "warning" : "default"}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operational alerts</CardTitle>
            <CardDescription>Items that usually need same-day attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              href="/notifications"
            >
              <span className="flex items-center gap-2">
                <Bell className="size-4 text-info" aria-hidden="true" />
                Unread notifications
              </span>
              <span className="font-semibold">{unreadNotifications}</span>
            </Link>
            <Link
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              href="/billing"
            >
              <span className="flex items-center gap-2">
                <WalletCards className="size-4 text-warning" aria-hidden="true" />
                Unpaid invoices
              </span>
              <span className="font-semibold">{openInvoices}</span>
            </Link>
            <Link
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              href="/notices"
            >
              <span className="flex items-center gap-2">
                <Megaphone className="size-4 text-success" aria-hidden="true" />
                Notices
              </span>
              <span className="font-semibold">{analytics?.notifications.delivered ?? 0}</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
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
        {analytics ? (
          <ActivityFeed activity={analytics.activity} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent operational activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No activity to show yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BedDouble}
          label="Available beds"
          value={String(analytics?.occupancy.availableBeds ?? 0)}
        />
        <StatCard
          icon={CalendarCheck}
          label="Leave requests"
          value={String(analytics?.leave.total ?? 0)}
        />
        <StatCard
          icon={DoorOpen}
          label="Visitors"
          value={String(analytics?.visitors.total ?? 0)}
        />
        <StatCard
          description="Unread operational messages"
          icon={Bell}
          label="Notifications"
          tone={unreadNotifications > 0 ? "info" : "default"}
          value={String(unreadNotifications)}
        />
      </div>
    </ErpPage>
  );
}
