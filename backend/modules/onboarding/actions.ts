"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { setActiveTenantCookie } from "@/lib/tenancy/active-tenant";
import { validateInput } from "@/lib/validation/zod";
import { bootstrapTenantForProduct } from "@/modules/onboarding/bootstrap.service";
import { tenantBootstrapSchema } from "@/modules/onboarding/schemas";

export async function bootstrapTenantAction(formData: FormData) {
  const tenant = validateInput(tenantBootstrapSchema, Object.fromEntries(formData));
  const context = await requireRole(["superadmin"], {
    product: tenant.product,
  });
  const result = await bootstrapTenantForProduct({
    actorUserId: context.identity.userId,
    tenant,
  });

  await setActiveTenantCookie({
    organizationId: result.organizationId,
    product: result.product,
  });

  revalidatePath("/dashboard");
  revalidatePath("/super-admin");
  redirect("/dashboard");
}
