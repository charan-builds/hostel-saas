import { type NextRequest } from "next/server";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { AppError, toErrorResponse } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import {
  createTenantMembershipSchema,
  tenantMembershipQuerySchema,
} from "@/modules/tenant/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      tenantMembershipQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const context = await requirePermission("membership:read", {
      organizationId: query.organizationId,
      product: query.product,
    });
    const supabase = await createSupabaseServerClient();
    let membershipsQuery = supabase
      .from("tenant_memberships")
      .select("*")
      .eq("app", query.product)
      .order("created_at", { ascending: false });

    if (context.organizationId) {
      membershipsQuery = membershipsQuery.eq("organization_id", context.organizationId);
    }

    const { data, error } = await membershipsQuery;

    if (error) {
      throw new AppError({
        code: "INTERNAL_ERROR",
        message: "Unable to load tenant memberships.",
        statusCode: 500,
        expose: false,
      });
    }

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createTenantMembershipSchema, await request.json());
    const context = await requirePermission("membership:manage", {
      hostelBranchId: input.hostelBranchId ?? undefined,
      organizationId: input.organizationId,
      product: input.app,
    });
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tenant_memberships")
      .insert({
        app: input.app,
        created_by: context.identity.userId,
        hostel_branch_id: input.hostelBranchId ?? null,
        invited_by: context.identity.userId,
        invited_at: new Date().toISOString(),
        organization_id: input.organizationId,
        role: input.role,
        status: "invited",
        user_id: input.userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new AppError({
        code: "CONFLICT",
        details: error.code,
        message: "Unable to create tenant membership.",
        statusCode: 409,
      });
    }

    await recordAuditEvent({
      action: "tenant_membership.invite",
      actorUserId: context.identity.userId,
      app: input.app,
      durable: true,
      entityId: data.id,
      entityTable: "tenant_memberships",
      hostelBranchId: input.hostelBranchId ?? undefined,
      metadata: {
        role: input.role,
        targetUserId: input.userId,
      },
      organizationId: input.organizationId,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
