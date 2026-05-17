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
  href: Route;
  icon: LucideIcon;
  label: string;
  permissions?: readonly Permission[];
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
      },
      {
        href: "/analytics",
        icon: BarChart3,
        label: "Analytics",
        permissions: ["analytics:read"],
        roles: ["admin", "superadmin"],
      },
      {
        href: "/reports",
        icon: FileBarChart,
        label: "Reports",
        permissions: ["analytics:read", "report:export"],
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
      },
      {
        href: "/students",
        icon: Users,
        label: "Students",
        permissions: ["student:read"],
      },
      {
        href: "/billing",
        icon: CreditCard,
        label: "Billing",
        permissions: ["billing:read"],
        roles: ["admin", "superadmin"],
      },
      {
        href: "/attendance",
        icon: CalendarCheck,
        label: "Attendance",
        permissions: ["attendance:read"],
      },
      {
        href: "/leave",
        icon: ClipboardList,
        label: "Leave",
        permissions: ["leave:read"],
      },
      {
        href: "/gate-passes",
        icon: DoorOpen,
        label: "Gate passes",
        permissions: ["gatepass:read"],
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
      },
      {
        href: "/notices",
        icon: Megaphone,
        label: "Notices",
        permissions: ["notice:read"],
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
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin",
        icon: Home,
        label: "Admin home",
        permissions: ["membership:read"],
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

export function getVisibleNavigation(role: UserRole) {
  return NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const roleAllowed = !item.roles || item.roles.includes(role);
      const permissionAllowed =
        !item.permissions || hasAnyPermission(role, item.permissions);

      return roleAllowed && permissionAllowed;
    }),
  })).filter((group) => group.items.length > 0);
}
