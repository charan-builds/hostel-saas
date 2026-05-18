import {
  BarChart3,
  BedDouble,
  Bell,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FileBarChart,
  Home,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";

import { hasAnyPermission } from "@/lib/auth/permissions";
import type { Permission, UserRole } from "@/types/domain";

export type NavigationItem = {
  branchScoped?: boolean;
  href: Route;
  icon: LucideIcon;
  label: string;
  permissions?: readonly Permission[];
  requiresTenant?: boolean;
  roles?: readonly UserRole[];
};

export type NavigationGroup = {
  items: NavigationItem[];
  label: string;
};

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        permissions: ["tenant:read"],
        requiresTenant: true,
      },
      {
        href: "/analytics",
        icon: BarChart3,
        label: "Analytics",
        permissions: ["analytics:read"],
        requiresTenant: true,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/reports",
        icon: FileBarChart,
        label: "Reports",
        permissions: ["analytics:read", "report:export"],
        requiresTenant: true,
        roles: ["admin", "superadmin"],
      },
    ],
  },
  {
    label: "Hostel ops",
    items: [
      {
        href: "/rooms",
        icon: BedDouble,
        label: "Rooms & beds",
        permissions: ["room:read"],
        branchScoped: true,
        requiresTenant: true,
      },
      {
        href: "/students",
        icon: Users,
        label: "Students",
        permissions: ["student:read"],
        branchScoped: true,
        requiresTenant: true,
      },
      {
        href: "/billing",
        icon: CreditCard,
        label: "Billing",
        permissions: ["billing:read"],
        branchScoped: true,
        requiresTenant: true,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/attendance",
        icon: CalendarCheck,
        label: "Attendance",
        permissions: ["attendance:read"],
        branchScoped: true,
        requiresTenant: true,
      },
      {
        href: "/leave",
        icon: ClipboardList,
        label: "Leave",
        permissions: ["leave:read"],
        branchScoped: true,
        requiresTenant: true,
      },
      {
        href: "/gate-passes",
        icon: DoorOpen,
        label: "Gate passes",
        permissions: ["gatepass:read"],
        branchScoped: true,
        requiresTenant: true,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        href: "/notifications",
        icon: Bell,
        label: "Notifications",
        permissions: ["notification:read"],
        requiresTenant: true,
      },
      {
        href: "/notices",
        icon: Megaphone,
        label: "Notices",
        permissions: ["notice:read"],
        requiresTenant: true,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        href: "/rooms/settings",
        icon: Settings,
        label: "Room settings",
        permissions: ["room:manage"],
        branchScoped: true,
        requiresTenant: true,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin",
        icon: Home,
        label: "Admin home",
        permissions: ["membership:read"],
        requiresTenant: true,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/super-admin",
        icon: Shield,
        label: "Super admin",
        roles: ["superadmin"],
      },
    ],
  },
];

export const PROFILE_ITEMS = [
  {
    href: "/dashboard",
    icon: UserRound,
    label: "My workspace",
  },
] as const;

export type NavigationContext = {
  hasBranchScope?: boolean;
  hasTenantScope?: boolean;
};

export function getVisibleNavigation(
  role: UserRole,
  context: NavigationContext = {},
) {
  return NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const roleAllowed = !item.roles || item.roles.includes(role);
      const permissionAllowed =
        !item.permissions || hasAnyPermission(role, item.permissions);
      const tenantAllowed = !item.requiresTenant || context.hasTenantScope;
      const branchAllowed = !item.branchScoped || context.hasBranchScope;

      return roleAllowed && permissionAllowed && tenantAllowed && branchAllowed;
    }),
  })).filter((group) => group.items.length > 0);
}
