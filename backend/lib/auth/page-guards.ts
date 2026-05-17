import "server-only";

import { redirect } from "next/navigation";

import { AppError } from "@/lib/http/errors";
import { requireTenantContext, type TenantAccessOptions } from "@/lib/tenancy/context";

function redirectForAccessError(error: unknown): never {
  if (error instanceof AppError && error.code === "UNAUTHORIZED") {
    redirect("/login");
  }

  redirect("/unauthorized");
}

export async function requireTenantPageAccess(options: TenantAccessOptions = {}) {
  try {
    return await requireTenantContext(options);
  } catch (error) {
    redirectForAccessError(error);
  }
}
