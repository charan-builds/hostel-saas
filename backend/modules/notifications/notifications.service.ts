import "server-only";

import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  findNotificationIdsForSearch,
  getNoticeById,
  getNotificationPreference,
  listAdminMembershipRecipients,
  listHostelBranches,
  listNoticeAcknowledgementsForIds,
  listNoticeRows,
  listNotificationsByIds,
  listRecipientRows,
  listStudentUserRecipients,
} from "@/modules/notifications/notifications.repository";
import type {
  AcknowledgeNoticeInput,
  CreateNoticeInput,
  DismissNotificationInput,
  EnqueueBillingRemindersInput,
  ListNoticesQuery,
  ListNotificationsQuery,
  MarkNotificationReadInput,
  UpdateNotificationPreferencesInput,
} from "@/modules/notifications/schemas";
import type { Database, Json } from "@/types/database.types";

export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationRecipientRow =
  Database["public"]["Tables"]["notification_recipients"]["Row"];
export type NotificationPreferenceRow =
  Database["public"]["Tables"]["notification_preferences"]["Row"];
export type NoticeRow = Database["public"]["Tables"]["notice_boards"]["Row"];
export type NoticeAcknowledgementRow =
  Database["public"]["Tables"]["notice_acknowledgements"]["Row"];

export type NotificationListItem = NotificationRecipientRow & {
  notification?: NotificationRow | undefined;
};

export type NoticeListItem = NoticeRow & {
  acknowledgement?: NoticeAcknowledgementRow | undefined;
};

type RecipientDraft = {
  hostelBranchId?: string | undefined;
  role?: "admin" | "student" | undefined;
  studentId?: string | undefined;
  userId: string;
};

const mutationResultSchema = z.object({
  recipientId: z.string().uuid(),
});

const billingReminderResultSchema = z.object({
  createdCount: z.number().int().min(0),
  skippedCount: z.number().int().min(0),
});

function requireOrganizationId(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required.",
      statusCode: 400,
    });
  }

  return organizationId;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "02000" || error.code === "PGRST116") {
    return new AppError({
      code: "NOT_FOUND",
      details: error.code,
      message: "The requested notification or notice was not found.",
      statusCode: 404,
    });
  }

  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "A matching notification, notice, or recipient already exists.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: error.message ?? "The notification request is invalid.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage notifications in this tenant.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    expose: false,
    message: "Notification operation failed.",
    statusCode: 500,
  });
}

function parseRpcResult<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
  message: string,
): z.output<TSchema> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message,
      statusCode: 500,
    });
  }

  return parsed.data;
}

function summarizeNotifications(rows: NotificationListItem[]) {
  return rows.reduce(
    (summary, row) => {
      if (!row.read_at) {
        summary.unreadCount += 1;
      }

      if (row.delivery_status === "failed") {
        summary.failedDeliveries += 1;
      }

      return summary;
    },
    {
      failedDeliveries: 0,
      unreadCount: 0,
    },
  );
}

function toPublishedAt(status: CreateNoticeInput["status"]) {
  return status === "published" ? new Date().toISOString() : null;
}

async function resolveNoticeRecipients(options: {
  audienceType: CreateNoticeInput["audienceType"];
  hostelBranchId?: string | undefined;
  organizationId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const recipientByUserId = new Map<string, RecipientDraft>();

  if (["admins", "branch", "tenant"].includes(options.audienceType)) {
    const admins = await listAdminMembershipRecipients(
      supabase,
      options.organizationId,
      options.audienceType === "tenant" ? undefined : options.hostelBranchId,
    );

    if (admins.error) {
      throw mapDatabaseError(admins.error);
    }

    admins.data?.forEach((admin) => {
      recipientByUserId.set(admin.user_id, {
        hostelBranchId: admin.hostel_branch_id ?? undefined,
        role: "admin",
        userId: admin.user_id,
      });
    });
  }

  if (["students", "branch", "tenant"].includes(options.audienceType)) {
    const students = await listStudentUserRecipients(
      supabase,
      options.organizationId,
      options.audienceType === "tenant" ? undefined : options.hostelBranchId,
    );

    if (students.error) {
      throw mapDatabaseError(students.error);
    }

    students.data?.forEach((student) => {
      if (student.user_profile_id) {
        recipientByUserId.set(student.user_profile_id, {
          hostelBranchId: student.hostel_branch_id,
          role: "student",
          studentId: student.id,
          userId: student.user_profile_id,
        });
      }
    });
  }

  return [...recipientByUserId.values()];
}

async function fanOutNoticeNotification(options: {
  actorUserId: string;
  notice: NoticeRow;
}) {
  const recipients = await resolveNoticeRecipients({
    audienceType: options.notice.audience_type as CreateNoticeInput["audienceType"],
    hostelBranchId: options.notice.hostel_branch_id ?? undefined,
    organizationId: options.notice.organization_id,
  });

  if (recipients.length === 0) {
    return {
      notificationId: null,
      recipientCount: 0,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .insert({
      action_url: `/notices`,
      app: options.notice.app,
      audience_type: options.notice.audience_type,
      body: options.notice.body,
      category: "notice",
      created_by: options.actorUserId,
      dedupe_key: `notice:${options.notice.id}`,
      expires_at: options.notice.expires_at,
      hostel_branch_id: options.notice.hostel_branch_id,
      metadata: {
        notice_id: options.notice.id,
        notice_type: options.notice.notice_type,
        priority: options.notice.priority,
      },
      notification_type: `notice.${options.notice.notice_type}`,
      organization_id: options.notice.organization_id,
      scheduled_for: options.notice.scheduled_for,
      severity: options.notice.priority === "urgent" ? "critical" : "info",
      source_id: options.notice.id,
      source_table: "notice_boards",
      status: "queued",
      title: options.notice.title,
      updated_by: options.actorUserId,
    })
    .select("*")
    .single();

  if (notificationError) {
    throw mapDatabaseError(notificationError);
  }

  const recipientRows = recipients.map((recipient) => ({
    channel_preferences: {
      email: true,
      in_app: true,
    },
    created_by: options.actorUserId,
    delivery_status: "queued",
    hostel_branch_id: recipient.hostelBranchId ?? options.notice.hostel_branch_id,
    notification_id: notification.id,
    organization_id: options.notice.organization_id,
    role: recipient.role ?? null,
    student_id: recipient.studentId ?? null,
    updated_by: options.actorUserId,
    user_id: recipient.userId,
  }));
  const { data: insertedRecipients, error: recipientsError } = await supabase
    .from("notification_recipients")
    .insert(recipientRows)
    .select("*");

  if (recipientsError) {
    throw mapDatabaseError(recipientsError);
  }

  const deliveryRows =
    insertedRecipients?.map((recipient) => ({
      attempted_at: new Date().toISOString(),
      channel: "in_app",
      created_by: options.actorUserId,
      hostel_branch_id: recipient.hostel_branch_id,
      notification_id: notification.id,
      organization_id: options.notice.organization_id,
      provider: "internal",
      recipient_id: recipient.id,
      status: "sent",
      updated_by: options.actorUserId,
    })) ?? [];

  if (deliveryRows.length > 0) {
    const { error: deliveryError } = await supabase
      .from("notification_delivery_attempts")
      .insert(deliveryRows);

    if (deliveryError) {
      throw mapDatabaseError(deliveryError);
    }
  }

  return {
    notificationId: notification.id,
    recipientCount: insertedRecipients?.length ?? 0,
  };
}

export async function listNotifications(input: ListNotificationsQuery) {
  const context = await requirePermission("notification:read", {
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const matchingNotifications = await findNotificationIdsForSearch(
    supabase,
    organizationId,
    input.q,
  );

  if (matchingNotifications?.error) {
    throw mapDatabaseError(matchingNotifications.error);
  }

  const matchingNotificationIds = matchingNotifications
    ? matchingNotifications.data.map((notification) => notification.id)
    : undefined;
  const recipientRows = await listRecipientRows({
    input,
    notificationIds: matchingNotificationIds,
    supabase,
    userId: context.identity.userId,
  });

  if (recipientRows.error) {
    throw mapDatabaseError(recipientRows.error);
  }

  const notificationIds = [
    ...new Set((recipientRows.data ?? []).map((row) => row.notification_id)),
  ];
  const notifications = await listNotificationsByIds(supabase, notificationIds);

  if (notifications.error) {
    throw mapDatabaseError(notifications.error);
  }

  const notificationById = new Map(
    (notifications.data ?? []).map((notification) => [
      notification.id,
      notification,
    ]),
  );
  const rows: NotificationListItem[] = (recipientRows.data ?? []).map((row) => ({
    ...row,
    notification: notificationById.get(row.notification_id),
  }));

  return {
    count: recipientRows.count ?? 0,
    data: rows,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((recipientRows.count ?? 0) / input.limit)),
    summary: summarizeNotifications(rows),
  };
}

export async function getNotificationDashboardWidget() {
  const data = await listNotifications({
    limit: 5,
    page: 1,
    readState: "unread",
  });

  return {
    items: data.data,
    unreadCount: data.count,
  };
}

export async function listNotices(input: ListNoticesQuery) {
  const context = await requirePermission("notice:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const result = await listNoticeRows({
    input,
    organizationId,
    supabase,
  });

  if (result.error) {
    throw mapDatabaseError(result.error);
  }

  const noticeIds = (result.data ?? []).map((notice) => notice.id);
  const acknowledgements = await listNoticeAcknowledgementsForIds(
    supabase,
    noticeIds,
    context.identity.userId,
  );

  if (acknowledgements.error) {
    throw mapDatabaseError(acknowledgements.error);
  }

  const acknowledgementByNoticeId = new Map(
    (acknowledgements.data ?? []).map((acknowledgement) => [
      acknowledgement.notice_id,
      acknowledgement,
    ]),
  );
  const notices: NoticeListItem[] = (result.data ?? []).map((notice) => ({
    ...notice,
    acknowledgement: acknowledgementByNoticeId.get(notice.id),
  }));

  return {
    count: result.count ?? 0,
    data: notices,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((result.count ?? 0) / input.limit)),
  };
}

export async function getNoticeManagementOptions() {
  const context = await requirePermission("notice:manage", {
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const branches = await listHostelBranches(supabase, organizationId);

  if (branches.error) {
    throw mapDatabaseError(branches.error);
  }

  return {
    branches: branches.data ?? [],
    organizationId,
  };
}

export async function createNotice(input: CreateNoticeInput) {
  const context = await requirePermission("notice:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const supabase = await createSupabaseServerClient();
  const { data: notice, error } = await supabase
    .from("notice_boards")
    .insert({
      app: "hostel_erp",
      audience_type: input.audienceType,
      body: input.body,
      created_by: context.identity.userId,
      expires_at: input.expiresAt ?? null,
      hostel_branch_id: input.hostelBranchId ?? null,
      metadata: {},
      notice_type: input.noticeType,
      organization_id: organizationId,
      pinned: input.pinned,
      priority: input.priority,
      published_at: toPublishedAt(input.status),
      scheduled_for: input.status === "scheduled" ? input.scheduledFor ?? null : null,
      status: input.status,
      title: input.title,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  const fanout =
    notice.status === "published"
      ? await fanOutNoticeNotification({
          actorUserId: context.identity.userId,
          notice,
        })
      : { notificationId: null, recipientCount: 0 };

  await recordAuditEvent({
    action: "notice.create",
    actorUserId: context.identity.userId,
    entityId: notice.id,
    entityTable: "notice_boards",
    hostelBranchId: notice.hostel_branch_id ?? undefined,
    metadata: {
      audience_type: notice.audience_type,
      notification_id: fanout.notificationId,
      recipient_count: fanout.recipientCount,
      status: notice.status,
    },
    organizationId,
  });

  return {
    notice,
    ...fanout,
  };
}

export async function acknowledgeNotice(input: AcknowledgeNoticeInput) {
  const supabase = await createSupabaseServerClient();
  const { data: notice, error } = await getNoticeById(supabase, input.noticeId);

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!notice) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Notice was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("notice:read", {
    hostelBranchId: notice.hostel_branch_id ?? undefined,
    organizationId: notice.organization_id,
    product: "hostel_erp",
  });
  let studentId: string | null = null;
  let studentQuery = supabase
    .from("students")
    .select("id")
    .eq("organization_id", notice.organization_id)
    .eq("user_profile_id", context.identity.userId)
    .is("deleted_at", null)
    .limit(1);

  if (notice.hostel_branch_id) {
    studentQuery = studentQuery.eq("hostel_branch_id", notice.hostel_branch_id);
  }

  const studentResult = await studentQuery;

  if (studentResult.error) {
    throw mapDatabaseError(studentResult.error);
  }

  studentId = studentResult.data?.[0]?.id ?? null;

  const existing = await supabase
    .from("notice_acknowledgements")
    .select("*")
    .eq("notice_id", notice.id)
    .eq("user_id", context.identity.userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing.error) {
    throw mapDatabaseError(existing.error);
  }

  if (existing.data) {
    const { data, error: updateError } = await supabase
      .from("notice_acknowledgements")
      .update({
        acknowledged_at: new Date().toISOString(),
        updated_by: context.identity.userId,
      })
      .eq("id", existing.data.id)
      .select("*")
      .single();

    if (updateError) {
      throw mapDatabaseError(updateError);
    }

    return data;
  }

  const { data, error: insertError } = await supabase
    .from("notice_acknowledgements")
    .insert({
      acknowledged_at: new Date().toISOString(),
      created_by: context.identity.userId,
      hostel_branch_id: notice.hostel_branch_id,
      metadata: {},
      notice_id: notice.id,
      organization_id: notice.organization_id,
      student_id: studentId,
      updated_by: context.identity.userId,
      user_id: context.identity.userId,
    })
    .select("*")
    .single();

  if (insertError) {
    throw mapDatabaseError(insertError);
  }

  return data;
}

export async function markNotificationRead(input: MarkNotificationReadInput) {
  const context = await requirePermission("notification:read", {
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("mark_notification_read", {
    p_actor_user_id: context.identity.userId,
    p_recipient_id: input.recipientId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    mutationResultSchema,
    data,
    "Notification read update returned an invalid response.",
  );
}

export async function dismissNotification(input: DismissNotificationInput) {
  const context = await requirePermission("notification:read", {
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("dismiss_notification", {
    p_actor_user_id: context.identity.userId,
    p_recipient_id: input.recipientId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    mutationResultSchema,
    data,
    "Notification dismiss returned an invalid response.",
  );
}

export async function getNotificationPreferences(hostelBranchId?: string) {
  const context = await requirePermission("notification:read", {
    hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const preference = await getNotificationPreference(
    supabase,
    organizationId,
    context.identity.userId,
    hostelBranchId,
  );

  if (preference.error) {
    throw mapDatabaseError(preference.error);
  }

  return {
    organizationId,
    preference: preference.data,
  };
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
) {
  const context = await requirePermission("notification:read", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const supabase = await createSupabaseServerClient();
  const existing = await getNotificationPreference(
    supabase,
    organizationId,
    context.identity.userId,
    input.hostelBranchId,
  );

  if (existing.error) {
    throw mapDatabaseError(existing.error);
  }

  const payload = {
    email_enabled: input.emailEnabled,
    hostel_branch_id: input.hostelBranchId ?? null,
    in_app_enabled: input.inAppEnabled,
    locale: input.locale,
    metadata: {},
    muted_notification_types: input.mutedNotificationTypes,
    organization_id: organizationId,
    quiet_hours: {} as Json,
    sms_enabled: input.smsEnabled,
    timezone: input.timezone,
    updated_by: context.identity.userId,
    user_id: context.identity.userId,
    whatsapp_enabled: input.whatsappEnabled,
  };

  if (existing.data) {
    const { data, error } = await supabase
      .from("notification_preferences")
      .update(payload)
      .eq("id", existing.data.id)
      .select("*")
      .single();

    if (error) {
      throw mapDatabaseError(error);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .insert({
      ...payload,
      created_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  return data;
}

export async function enqueueBillingReminders(
  input: EnqueueBillingRemindersInput,
) {
  const context = await requirePermission("notification:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("enqueue_billing_reminders", {
    p_actor_user_id: context.identity.userId,
    p_due_before: input.dueBefore,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_reminder_kind: input.reminderKind,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    billingReminderResultSchema,
    data,
    "Billing reminder enqueue returned an invalid response.",
  );
}
