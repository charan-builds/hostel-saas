import "server-only";

import { hasPermission } from "@/lib/auth/permissions";
import {
  getCurrentIdentity,
  getCurrentUserProfile,
  type AuthIdentity,
  type UserProfile,
} from "@/lib/auth/session";
import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveTenantCookie } from "@/lib/tenancy/active-tenant";
import type { Database } from "@/types/database.types";
import type { Permission, SaasProduct, UserRole } from "@/types/domain";

export type TenantMembershipRow =
  Database["public"]["Tables"]["tenant_memberships"]["Row"];

export type TenantAccessOptions = {
  hostelBranchId?: string | undefined;
  organizationId?: string | undefined;
  permission?: Permission | undefined;
  product?: SaasProduct | undefined;
  roles?: readonly UserRole[] | undefined;
};

export type TenantContext = {
  hostelBranchId?: string | undefined;
  identity: AuthIdentity;
  isSuperadmin: boolean;
  membership?: TenantMembershipRow | undefined;
  organizationId?: string | undefined;
  product: SaasProduct;
  profile: UserProfile;
  role: UserRole;
};

function membershipMatches(
  membership: TenantMembershipRow,
  options: Required<Pick<TenantAccessOptions, "product">> & TenantAccessOptions,
) {
  const role = membership.role;

  if (role === "superadmin") {
    return false;
  }

  if (membership.app !== options.product || membership.status !== "active") {
    return false;
  }

  if (options.organizationId && membership.organization_id !== options.organizationId) {
    return false;
  }

  if (
    options.hostelBranchId &&
    membership.hostel_branch_id &&
    membership.hostel_branch_id !== options.hostelBranchId
  ) {
    return false;
  }

  if (options.roles && !options.roles.includes(role)) {
    return false;
  }

  if (options.permission && !hasPermission(role, options.permission)) {
    return false;
  }

  return true;
}

export async function getTenantMemberships(options?: {
  organizationId?: string | undefined;
  product?: SaasProduct | undefined;
  userId?: string | undefined;
}) {
  const identity = options?.userId
    ? { userId: options.userId }
    : await getCurrentIdentity();
  const product = options?.product ?? "hostel_erp";
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", identity.userId)
    .eq("app", product)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (options?.organizationId) {
    query = query.eq("organization_id", options.organizationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to load tenant memberships.",
      statusCode: 500,
      expose: false,
    });
  }

  return data;
}

export async function requireTenantContext(
  options: TenantAccessOptions = {},
): Promise<TenantContext> {
  const identity = await getCurrentIdentity();
  const profile = await getCurrentUserProfile(identity.userId);
  const activeTenant = await getActiveTenantCookie();
  const product = options.product ?? activeTenant.product;
  const organizationId = options.organizationId ?? activeTenant.organizationId;
  const role = profile.role;

  if (role === "superadmin") {
    return {
      hostelBranchId: options.hostelBranchId,
      identity,
      isSuperadmin: true,
      organizationId,
      product,
      profile,
      role,
    };
  }

  const memberships = await getTenantMemberships({
    organizationId,
    product,
    userId: identity.userId,
  });
  const accessOptions = {
    ...options,
    organizationId,
    product,
  };
  const membership = memberships.find((item) =>
    membershipMatches(item, accessOptions),
  );

  if (!membership) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Tenant access is required.",
      statusCode: 403,
    });
  }

  return {
    hostelBranchId: options.hostelBranchId ?? membership.hostel_branch_id ?? undefined,
    identity,
    isSuperadmin: false,
    membership,
    organizationId: membership.organization_id,
    product,
    profile,
    role: membership.role,
  };
}
