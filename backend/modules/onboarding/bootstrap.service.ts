import "server-only";

import { logger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";
import type { SaasProduct } from "@/types/domain";
import { AppError } from "@/lib/http/errors";
import type { TenantBootstrapInput } from "@/modules/onboarding/schemas";
import { z } from "zod";

const tenantBootstrapResultSchema = z.object({
  adminMembershipId: z.string().uuid(),
  adminUserId: z.string().uuid(),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  product: z.enum([
    "hostel_erp",
    "clothing_shop_erp",
    "gym_erp",
    "inventory_erp",
  ]),
});

export type TenantBootstrapResult = z.output<typeof tenantBootstrapResultSchema>;

function toAddressJson(input: TenantBootstrapInput): Json {
  return {
    city: input.city ?? "",
    country: input.country,
    line1: input.addressLine1 ?? "",
    postal_code: input.postalCode ?? "",
    state: input.state ?? "",
  };
}

function toSettingsJson(input: TenantBootstrapInput): Json {
  return {
    currency: input.currency,
    hostel_defaults: {
      locale: input.locale,
    },
    locale: input.locale,
  };
}

async function assertOrganizationSlugAvailable(organizationSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to verify tenant availability.",
      statusCode: 500,
      expose: false,
    });
  }

  if (data) {
    throw new AppError({
      code: "CONFLICT",
      message: "A tenant with this slug already exists.",
      statusCode: 409,
    });
  }
}

export async function bootstrapTenantForProduct(input: {
  actorUserId: string;
  tenant: TenantBootstrapInput;
}): Promise<TenantBootstrapResult> {
  const supabase = createSupabaseAdminClient();
  const tenant = input.tenant;

  await assertOrganizationSlugAvailable(tenant.organizationSlug);

  const { data: authUserData, error: authUserError } =
    await supabase.auth.admin.createUser({
      email: tenant.adminEmail,
      email_confirm: true,
      password: tenant.adminPassword,
      user_metadata: {
        full_name: tenant.adminFullName,
      },
    });

  if (authUserError || !authUserData.user) {
    throw new AppError({
      code: "CONFLICT",
      details: authUserError?.message,
      message: "Unable to create tenant admin account.",
      statusCode: 409,
    });
  }

  const adminUserId = authUserData.user.id;

  const { data, error } = await supabase.rpc("bootstrap_tenant", {
    p_actor_user_id: input.actorUserId,
    p_address: toAddressJson(tenant),
    p_admin_email: tenant.adminEmail,
    p_admin_full_name: tenant.adminFullName,
    p_admin_user_id: adminUserId,
    p_hostel_name: tenant.hostelName,
    p_hostel_slug: tenant.hostelSlug,
    p_organization_name: tenant.organizationName,
    p_organization_slug: tenant.organizationSlug,
    p_product: tenant.product as SaasProduct,
    p_settings: toSettingsJson(tenant),
    p_timezone: tenant.timezone,
  });

  if (error) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(adminUserId);

    if (deleteError) {
      logger.error(
        {
          adminUserId,
          deleteError,
          originalError: error,
        },
        "Tenant bootstrap failed and admin auth-user compensation failed",
      );
    }

    throw new AppError({
      code: error.code === "23505" ? "CONFLICT" : "INTERNAL_ERROR",
      details: error.code,
      message:
        error.code === "23505"
          ? "A tenant with this slug already exists."
          : "Tenant bootstrap failed.",
      statusCode: error.code === "23505" ? 409 : 500,
      expose: error.code === "23505",
    });
  }

  const parsedResult = tenantBootstrapResultSchema.safeParse(data);

  if (!parsedResult.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Tenant bootstrap returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  logger.info(
    {
      organizationId: parsedResult.data.organizationId,
      product: parsedResult.data.product,
    },
    "Tenant bootstrap completed",
  );

  return parsedResult.data;
}
