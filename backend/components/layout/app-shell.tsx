import type { ReactNode } from "react";

import {
  DashboardShellClient,
  type BranchOption,
  type ShellNotification,
  type ShellTenant,
  type TenantOption,
} from "@/components/layout/dashboard-shell-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const organizationIds = Array.from(
    new Set(
      memberships
        .map((membership) => membership.organization_id)
        .concat(context.organizationId ? [context.organizationId] : []),
    ),
  );
  const supabase = await createSupabaseServerClient();
  const organizationNames = new Map<string, string>();
  let branchOptions: BranchOption[] = [];

  if (organizationIds.length > 0) {
    const { data } = await supabase
      .from("organizations")
      .select("id,name")
      .in("id", organizationIds)
      .is("deleted_at", null);

    for (const organization of data ?? []) {
      organizationNames.set(organization.id, organization.name);
    }
  }

  if (context.organizationId) {
    const { data } = await supabase
      .from("hostel_branches")
      .select("id,name,organization_id,slug")
      .eq("organization_id", context.organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    branchOptions = (data ?? []).map((branch) => ({
      id: branch.id,
      label: branch.name,
      organizationId: branch.organization_id,
      slug: branch.slug,
    }));
  }

  const tenantOptions = memberships.reduce<TenantOption[]>((options, membership) => {
    if (options.some((option) => option.organizationId === membership.organization_id)) {
      return options;
    }

    const organizationName = organizationNames.get(membership.organization_id);

    options.push({
      label: organizationName
        ? `${organizationName} · ${membership.role}`
        : makeTenantLabel(membership.organization_id, membership.role),
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
      branchOptions={branchOptions}
      notifications={notificationItems}
      tenant={tenant}
      tenantOptions={tenantOptions}
      unreadCount={notifications.unreadCount}
    >
      {children}
    </DashboardShellClient>
  );
}
