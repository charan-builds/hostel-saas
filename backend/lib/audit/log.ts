import "server-only";

import { createRequestLogger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";
import type { SaasProduct } from "@/types/domain";

export type AuditEvent = {
  action: string;
  actorUserId?: string | undefined;
  app?: SaasProduct | undefined;
  durable?: boolean | undefined;
  entityId?: string | undefined;
  entityTable?: string | undefined;
  hostelBranchId?: string | undefined;
  ipAddress?: string | undefined;
  metadata?: Json | undefined;
  organizationId?: string | undefined;
  requestId?: string | undefined;
  userAgent?: string | undefined;
};

export async function recordAuditEvent(event: AuditEvent) {
  const auditLogger = createRequestLogger({
    actor_user_id: event.actorUserId,
    branch_id: event.hostelBranchId,
    event_type: event.action,
    request_id: event.requestId,
    tenant_id: event.organizationId,
  });

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("audit_logs").insert({
      action: event.action,
      actor_user_id: event.actorUserId ?? null,
      app: event.app ?? "hostel_erp",
      entity_id: event.entityId ?? null,
      entity_table: event.entityTable ?? null,
      hostel_branch_id: event.hostelBranchId ?? null,
      ip_address: event.ipAddress ?? null,
      metadata: event.metadata ?? {},
      organization_id: event.organizationId ?? null,
      request_id: event.requestId ?? null,
      user_agent: event.userAgent ?? null,
    });

    if (error) {
      auditLogger.warn({ error }, "Audit log insert failed");

      if (event.durable) {
        throw error;
      }
    }
  } catch (error) {
    auditLogger.warn({ error }, "Audit log hook failed");

    if (event.durable) {
      throw error;
    }
  }
}
