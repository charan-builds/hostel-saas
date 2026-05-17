"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { recordAuditEvent } from "@/lib/audit/log";
import { requireTenantAccess } from "@/lib/auth/guards";
import { setActiveTenantCookie } from "@/lib/tenancy/active-tenant";
import { validateInput } from "@/lib/validation/zod";
import { tenantSelectionSchema } from "@/modules/tenant/schemas";

export async function setActiveTenantAction(formData: FormData) {
  const input = validateInput(tenantSelectionSchema, Object.fromEntries(formData));
  const context = await requireTenantAccess({
    organizationId: input.organizationId,
    product: input.product,
  });

  await setActiveTenantCookie(input);
  await recordAuditEvent({
    action: "tenant.switch",
    actorUserId: context.identity.userId,
    app: input.product,
    organizationId: input.organizationId,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
