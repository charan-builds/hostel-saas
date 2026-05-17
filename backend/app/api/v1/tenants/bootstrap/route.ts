import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/auth/guards";
import { AppError, toErrorResponse } from "@/lib/http/errors";
import { applyActiveTenantCookies } from "@/lib/tenancy/active-tenant";
import { validateInput } from "@/lib/validation/zod";
import { bootstrapTenantForProduct } from "@/modules/onboarding/bootstrap.service";
import { tenantBootstrapApiSchema } from "@/modules/onboarding/schemas";

export async function POST(request: NextRequest) {
  try {
    const tenant = validateInput(tenantBootstrapApiSchema, await request.json());
    const context = await requireRole(["superadmin"], {
      product: tenant.product,
    });
    const result = await bootstrapTenantForProduct({
      actorUserId: context.identity.userId,
      tenant,
    });
    const response = NextResponse.json({ data: result }, { status: 201 });

    return applyActiveTenantCookies(response, {
      organizationId: result.organizationId,
      product: result.product,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
          statusCode: 400,
        }),
      );
    }

    return toErrorResponse(error);
  }
}
