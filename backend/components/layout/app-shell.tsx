import type { ReactNode } from "react";

import {
  DashboardShellClient,
  type ShellNotification,
  type ShellTenant,
  type TenantOption,
} from "@/components/layout/dashboard-shell-client";
import { getTenantMemberships } from "@/lib/tenancy/context";
import type { TenantContext } from "@/lib/tenancy/context";
import { getNotificationDashboardWidget } from "@/modules/notifications/notifications.service";

type AppShellProps = {
  children: ReactNode;
  context: TenantContext;
};

function makeTenantLabel(organizationId: string, role: string) {
  return `${role} · ${organizationId.slice(0, 8)}`;
}

export async function AppShell({ children, context }: AppShellProps) {
  const memberships = await getTenantMemberships({
    product: context.product,
    userId: context.identity.userId,
  });
  const tenantOptions = memberships.reduce<TenantOption[]>((options, membership) => {
    if (options.some((option) => option.organizationId === membership.organization_id)) {
      return options;
    }

    options.push({
      label: makeTenantLabel(membership.organization_id, membership.role),
      organizationId: membership.organization_id,
      product: membership.app,
      role: membership.role,
    });

    return options;
  }, []);
  const notifications =
    context.organizationId && !context.isSuperadmin
      ? await getNotificationDashboardWidget()
      : { items: [], unreadCount: 0 };
  const notificationItems: ShellNotification[] = notifications.items.map((item) => ({
    body: item.notification?.body ?? "",
    id: item.id,
    title: item.notification?.title ?? "Notification",
  }));
  const tenant: ShellTenant = {
    email: context.profile.email,
    fullName: context.profile.full_name,
    hostelBranchId: context.hostelBranchId,
    isSuperadmin: context.isSuperadmin,
    organizationId: context.organizationId,
    product: context.product,
    role: context.role,
    userId: context.identity.userId,
  };

  return (
    <DashboardShellClient
      notifications={notificationItems}
      tenant={tenant}
      tenantOptions={tenantOptions}
      unreadCount={notifications.unreadCount}
    >
      {children}
    </DashboardShellClient>
  );
}
