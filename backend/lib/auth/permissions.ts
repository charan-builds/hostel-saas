import {
  PERMISSIONS,
  type Permission,
  type UserRole,
} from "@/types/domain";

type PermissionRegistryEntry = {
  description: string;
  module: string;
  risk: "low" | "medium" | "high" | "critical";
};

export const PERMISSION_REGISTRY = {
  "tenant:create": {
    description: "Create new tenant organizations.",
    module: "tenant",
    risk: "critical",
  },
  "tenant:read": {
    description: "Read active tenant context and basic tenant metadata.",
    module: "tenant",
    risk: "low",
  },
  "tenant:update": {
    description: "Update tenant-level configuration.",
    module: "tenant",
    risk: "high",
  },
  "membership:read": {
    description: "Read tenant memberships.",
    module: "auth",
    risk: "medium",
  },
  "membership:manage": {
    description: "Invite, update, suspend, and revoke tenant memberships.",
    module: "auth",
    risk: "critical",
  },
  "branch:read": {
    description: "Read branch data.",
    module: "rooms",
    risk: "low",
  },
  "branch:manage": {
    description: "Create and update branch data.",
    module: "rooms",
    risk: "high",
  },
  "room:read": {
    description: "Read rooms, beds, and occupancy data.",
    module: "rooms",
    risk: "low",
  },
  "room:manage": {
    description: "Create, update, assign, transfer, and remove rooms or beds.",
    module: "rooms",
    risk: "high",
  },
  "student:read": {
    description: "Read student records.",
    module: "students",
    risk: "medium",
  },
  "student:manage": {
    description: "Create, update, assign, and soft-delete student records.",
    module: "students",
    risk: "high",
  },
  "student:document:upload": {
    description: "Create signed upload URLs and document rows for students.",
    module: "students",
    risk: "high",
  },
  "billing:read": {
    description: "Read billing, invoice, receipt, and rent-plan data.",
    module: "billing",
    risk: "medium",
  },
  "billing:manage": {
    description: "Create rent plans, generate invoices, and adjust invoices.",
    module: "billing",
    risk: "critical",
  },
  "payment:record": {
    description: "Record offline or provider-backed payments.",
    module: "billing",
    risk: "critical",
  },
  "notification:read": {
    description: "Read notification center data.",
    module: "notifications",
    risk: "low",
  },
  "notification:manage": {
    description: "Create reminders and tenant notifications.",
    module: "notifications",
    risk: "medium",
  },
  "notice:read": {
    description: "Read notices.",
    module: "notifications",
    risk: "low",
  },
  "notice:manage": {
    description: "Create, publish, and archive notices.",
    module: "notifications",
    risk: "medium",
  },
  "leave:read": {
    description: "Read leave workflow data.",
    module: "presence",
    risk: "low",
  },
  "leave:request": {
    description: "Create student leave requests.",
    module: "presence",
    risk: "low",
  },
  "leave:manage": {
    description: "Approve, reject, and update leave workflows.",
    module: "presence",
    risk: "medium",
  },
  "attendance:read": {
    description: "Read attendance records.",
    module: "presence",
    risk: "low",
  },
  "attendance:manage": {
    description: "Create and update attendance records.",
    module: "presence",
    risk: "medium",
  },
  "gatepass:read": {
    description: "Read gate pass and visitor records.",
    module: "presence",
    risk: "low",
  },
  "gatepass:request": {
    description: "Create student gate pass requests.",
    module: "presence",
    risk: "low",
  },
  "gatepass:manage": {
    description: "Approve and record gate pass events.",
    module: "presence",
    risk: "medium",
  },
  "analytics:read": {
    description: "Read analytics dashboards and request snapshot refresh jobs.",
    module: "analytics",
    risk: "medium",
  },
  "report:export": {
    description: "Export bounded tenant reports.",
    module: "analytics",
    risk: "high",
  },
  "audit:read": {
    description: "Read tenant audit logs.",
    module: "audit",
    risk: "high",
  },
  "student:self:read": {
    description: "Read own student profile.",
    module: "students",
    risk: "low",
  },
  "student:self:update": {
    description: "Update limited own student profile fields.",
    module: "students",
    risk: "medium",
  },
} as const satisfies Record<Permission, PermissionRegistryEntry>;

export const ROLE_PERMISSIONS = {
  superadmin: PERMISSIONS,
  admin: [
    "tenant:read",
    "tenant:update",
    "membership:read",
    "membership:manage",
    "branch:read",
    "branch:manage",
    "room:read",
    "room:manage",
    "student:read",
    "student:manage",
    "student:document:upload",
    "billing:read",
    "billing:manage",
    "payment:record",
    "notification:read",
    "notification:manage",
    "notice:read",
    "notice:manage",
    "leave:read",
    "leave:request",
    "leave:manage",
    "attendance:read",
    "attendance:manage",
    "gatepass:read",
    "gatepass:request",
    "gatepass:manage",
    "analytics:read",
    "report:export",
    "audit:read",
    "student:self:read",
    "student:self:update",
  ],
  student: [
    "tenant:read",
    "branch:read",
    "notification:read",
    "notice:read",
    "leave:read",
    "leave:request",
    "attendance:read",
    "gatepass:read",
    "gatepass:request",
    "student:self:read",
    "student:self:update",
  ],
} as const satisfies Record<UserRole, readonly Permission[]>;

export function assertPermissionRegistryComplete() {
  return PERMISSIONS.every((permission) => permission in PERMISSION_REGISTRY);
}

export function hasPermission(role: UserRole, permission: Permission) {
  const permissions = ROLE_PERMISSIONS[role] as readonly Permission[];

  return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: readonly Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}
