import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { getAnalyticsDashboard } from "@/modules/analytics/analytics.service";
import { dashboardQuerySchema } from "@/modules/analytics/schemas";
import { getNotificationDashboardWidget } from "@/modules/notifications/notifications.service";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const query = validateInput(dashboardQuerySchema, await searchParams);
  const context = await requireTenantPageAccess({
    hostelBranchId: query.hostelBranchId,
    permission: "tenant:read",
    product: "hostel_erp",
  });
  const canViewAnalytics =
    Boolean(context.organizationId) &&
    (context.role === "admin" || context.role === "superadmin");
  const [notifications, analytics] = await Promise.all([
    context.organizationId
      ? getNotificationDashboardWidget()
      : Promise.resolve({ items: [], unreadCount: 0 }),
    canViewAnalytics ? getAnalyticsDashboard(query) : Promise.resolve(undefined),
  ]);

  return (
    <DashboardHome
      analytics={analytics}
      canManageTenant={canViewAnalytics}
      isSuperadmin={context.isSuperadmin}
      role={context.role}
      unreadNotifications={notifications.unreadCount}
    />
  );
}
