import "server-only";

import { getCurrentIdentity } from "@/lib/auth/session";
import { AppError } from "@/lib/http/errors";
import { requireTenantContext, type TenantAccessOptions } from "@/lib/tenancy/context";
import type { Permission, UserRole } from "@/types/domain";

export async function requireAuthenticated() {
  return getCurrentIdentity();
}

export async function requireTenantAccess(options: TenantAccessOptions = {}) {
  return requireTenantContext(options);
}

export async function requirePermission(permission: Permission, options: TenantAccessOptions = {}) {
  return requireTenantContext({
    ...options,
    permission,
  });
}

export async function requireRole(roles: readonly UserRole[], options: TenantAccessOptions = {}) {
  return requireTenantContext({
    ...options,
    roles,
  });
}

export function assertSameTenant(
  expectedOrganizationId: string,
  actualOrganizationId: string | undefined,
) {
  if (expectedOrganizationId !== actualOrganizationId) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Cross-tenant access is not allowed.",
      statusCode: 403,
    });
  }
}
