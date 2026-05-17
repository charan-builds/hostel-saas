import "server-only";

import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/errors";
import { logger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getGatePassById,
  getLeaveById,
  getVisitorPassById,
  listAttendanceRows,
  listGatePassEvents,
  listGatePassRows,
  listLeaveRows,
  listPresenceFormOptions,
  listStudentsByIds,
  listVisitorPassRows,
} from "@/modules/presence/presence.repository";
import type {
  CreateGatePassInput,
  CreateLeaveRequestInput,
  CreateVisitorPassInput,
  ListAttendanceQuery,
  ListGatePassesQuery,
  ListLeaveRequestsQuery,
  MarkAttendanceInput,
  RecordGatePassEventInput,
  RecordLeaveRequestEventInput,
  RecordVisitorPassEventInput,
  ReviewLeaveRequestInput,
} from "@/modules/presence/schemas";
import type { Database, Json } from "@/types/database.types";

export type LeaveRequestRow =
  Database["public"]["Tables"]["student_leave_requests"]["Row"];
export type AttendanceRecordRow =
  Database["public"]["Tables"]["attendance_records"]["Row"];
export type GatePassRow = Database["public"]["Tables"]["gate_passes"]["Row"];
export type GatePassEventRow =
  Database["public"]["Tables"]["gate_pass_events"]["Row"];
export type VisitorPassRow =
  Database["public"]["Tables"]["visitor_passes"]["Row"];

export type PresenceStudentSummary = Pick<
  Database["public"]["Tables"]["students"]["Row"],
  | "first_name"
  | "hostel_branch_id"
  | "id"
  | "last_name"
  | "organization_id"
  | "status"
  | "student_code"
  | "user_profile_id"
>;

export type LeaveListItem = LeaveRequestRow & {
  student?: PresenceStudentSummary | undefined;
};

export type AttendanceListItem = AttendanceRecordRow & {
  student?: PresenceStudentSummary | undefined;
};

export type GatePassListItem = GatePassRow & {
  events: GatePassEventRow[];
  student?: PresenceStudentSummary | undefined;
};

const reviewLeaveResultSchema = z.object({
  leaveRequestId: z.string().uuid(),
  status: z.string(),
});

const leaveEventResultSchema = z.object({
  eventType: z.string(),
  leaveRequestId: z.string().uuid(),
  status: z.string(),
});

const markAttendanceResultSchema = z.object({
  attendanceRecordId: z.string().uuid(),
});

const gatePassEventResultSchema = z.object({
  eventType: z.string(),
  gatePassId: z.string().uuid(),
  lateMinutes: z.number().int().min(0),
});

const visitorPassEventResultSchema = z.object({
  eventType: z.string(),
  status: z.string(),
  visitorPassId: z.string().uuid(),
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
      message: "The requested workflow record was not found.",
      statusCode: 404,
    });
  }

  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "A matching attendance, leave, or gate pass record already exists.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: error.message ?? "The workflow request is invalid.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage this workflow.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    expose: false,
    message: "Presence workflow operation failed.",
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

function summarizeLeave(rows: LeaveRequestRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      if (row.status === "pending") {
        summary.pending += 1;
      }
      if (row.status === "approved" || row.status === "checked_out") {
        summary.active += 1;
      }
      if (row.status === "overdue") {
        summary.overdue += 1;
      }
      return summary;
    },
    { active: 0, overdue: 0, pending: 0, total: 0 },
  );
}

function summarizeAttendance(rows: AttendanceRecordRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      if (row.status === "present") {
        summary.present += 1;
      }
      if (row.status === "absent") {
        summary.absent += 1;
      }
      if (row.status === "on_leave") {
        summary.onLeave += 1;
      }
      return summary;
    },
    { absent: 0, onLeave: 0, present: 0, total: 0 },
  );
}

function summarizeGatePasses(rows: GatePassRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      if (row.status === "requested") {
        summary.pending += 1;
      }
      if (row.status === "checked_out") {
        summary.outside += 1;
      }
      if (row.late_entry) {
        summary.late += 1;
      }
      return summary;
    },
    { late: 0, outside: 0, pending: 0, total: 0 },
  );
}

async function getStudentForActor(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const result = await listStudentsByIds(supabase, [studentId]);

  if (result.error) {
    throw mapDatabaseError(result.error);
  }

  const student = result.data?.[0];

  if (!student) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Student was not found.",
      statusCode: 404,
    });
  }

  return student;
}

function assertCanActForStudent(options: {
  actorUserId: string;
  isAdmin: boolean;
  student: PresenceStudentSummary;
}) {
  if (options.isAdmin) {
    return;
  }

  if (options.student.user_profile_id !== options.actorUserId) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Students can only submit workflow records for themselves.",
      statusCode: 403,
    });
  }
}

async function getAdminRecipientIds(
  organizationId: string,
  hostelBranchId?: string | null,
) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("tenant_memberships")
    .select("user_id,hostel_branch_id")
    .eq("organization_id", organizationId)
    .eq("app", "hostel_erp")
    .eq("role", "admin")
    .eq("status", "active")
    .is("deleted_at", null);

  if (hostelBranchId) {
    query = query.or(`hostel_branch_id.is.null,hostel_branch_id.eq.${hostelBranchId}`);
  }

  const { data, error } = await query;

  if (error) {
    throw mapDatabaseError(error);
  }

  return [...new Set((data ?? []).map((row) => row.user_id))];
}

type WorkflowNotificationOptions = {
  actionUrl: string;
  actorUserId: string;
  audienceType: "admins" | "student" | "user";
  body: string;
  category: "leave" | "admin" | "student";
  hostelBranchId: string;
  metadata?: Json | undefined;
  notificationType: string;
  organizationId: string;
  severity?: "info" | "success" | "warning" | "critical" | undefined;
  sourceId: string;
  sourceTable: string;
  targetUserIds: string[];
  title: string;
};

type SafeWorkflowNotificationOptions = Omit<
  WorkflowNotificationOptions,
  "targetUserIds"
> & {
  targetUserIds: Promise<string[]> | string[];
};

async function createWorkflowNotification(options: WorkflowNotificationOptions) {
  const targetUserIds = [...new Set(options.targetUserIds)].filter(Boolean);

  if (targetUserIds.length === 0) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      action_url: options.actionUrl,
      app: "hostel_erp",
      audience_type: options.audienceType,
      body: options.body,
      category: options.category,
      created_by: options.actorUserId,
      hostel_branch_id: options.hostelBranchId,
      metadata: options.metadata ?? {},
      notification_type: options.notificationType,
      organization_id: options.organizationId,
      severity: options.severity ?? "info",
      source_id: options.sourceId,
      source_table: options.sourceTable,
      status: "queued",
      title: options.title,
      updated_by: options.actorUserId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  const { data: recipients, error: recipientError } = await supabase
    .from("notification_recipients")
    .insert(
      targetUserIds.map((userId) => ({
        channel_preferences: { email: true, in_app: true },
        created_by: options.actorUserId,
        delivery_status: "queued",
        hostel_branch_id: options.hostelBranchId,
        notification_id: notification.id,
        organization_id: options.organizationId,
        updated_by: options.actorUserId,
        user_id: userId,
      })),
    )
    .select("*");

  if (recipientError) {
    throw mapDatabaseError(recipientError);
  }

  if (recipients && recipients.length > 0) {
    const { error: deliveryError } = await supabase
      .from("notification_delivery_attempts")
      .insert(
        recipients.map((recipient) => ({
          attempted_at: new Date().toISOString(),
          channel: "in_app",
          created_by: options.actorUserId,
          hostel_branch_id: options.hostelBranchId,
          notification_id: notification.id,
          organization_id: options.organizationId,
          provider: "internal",
          recipient_id: recipient.id,
          status: "sent",
          updated_by: options.actorUserId,
        })),
      );

    if (deliveryError) {
      throw mapDatabaseError(deliveryError);
    }
  }
}

async function notifyWorkflow(options: SafeWorkflowNotificationOptions) {
  try {
    await createWorkflowNotification({
      ...options,
      targetUserIds: await options.targetUserIds,
    });
  } catch (error) {
    logger.warn(
      {
        err: error,
        notificationType: options.notificationType,
        organizationId: options.organizationId,
        sourceId: options.sourceId,
      },
      "Presence workflow notification could not be delivered.",
    );
  }
}

function attachStudents<T extends { student_id: string }>(
  rows: T[],
  students: PresenceStudentSummary[],
) {
  const studentById = new Map(students.map((student) => [student.id, student]));

  return rows.map((row) => ({
    ...row,
    student: studentById.get(row.student_id),
  }));
}

export async function getPresenceFormOptions(hostelBranchId?: string) {
  const context = await requirePermission("branch:read", {
    hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const options = await listPresenceFormOptions(
    supabase,
    organizationId,
    hostelBranchId ?? context.hostelBranchId,
  );

  if (options.branches.error) {
    throw mapDatabaseError(options.branches.error);
  }

  if (options.students.error) {
    throw mapDatabaseError(options.students.error);
  }

  return {
    branches: options.branches.data ?? [],
    organizationId,
    students: options.students.data ?? [],
  };
}

export async function listLeaveRequests(input: ListLeaveRequestsQuery) {
  const context = await requirePermission("leave:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const result = await listLeaveRows({ input, organizationId, supabase });

  if (result.error) {
    throw mapDatabaseError(result.error);
  }

  const rows = result.data ?? [];
  const studentIds = [...new Set(rows.map((row) => row.student_id))];
  const students = await listStudentsByIds(supabase, studentIds);

  if (students.error) {
    throw mapDatabaseError(students.error);
  }

  return {
    count: result.count ?? 0,
    data: attachStudents(rows, students.data ?? []),
    page: input.page,
    pageCount: Math.max(1, Math.ceil((result.count ?? 0) / input.limit)),
    summary: summarizeLeave(rows),
  };
}

export async function createLeaveRequest(input: CreateLeaveRequestInput) {
  const context = await requirePermission("leave:request", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const student = await getStudentForActor(input.studentId);

  assertCanActForStudent({
    actorUserId: context.identity.userId,
    isAdmin: context.role === "admin" || context.role === "superadmin",
    student,
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_leave_requests")
    .insert({
      contact_phone: input.contactPhone ?? null,
      created_by: context.identity.userId,
      destination_address: input.destinationAddress ?? null,
      expected_return_at: input.expectedReturnAt,
      hostel_branch_id: input.hostelBranchId,
      leave_type: input.leaveType,
      metadata: {},
      organization_id: organizationId,
      reason: input.reason,
      requested_by_user_id: context.identity.userId,
      starts_at: input.startsAt,
      student_id: input.studentId,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "leave.request.create",
    actorUserId: context.identity.userId,
    entityId: data.id,
    entityTable: "student_leave_requests",
    hostelBranchId: input.hostelBranchId,
    metadata: {
      expected_return_at: input.expectedReturnAt,
      starts_at: input.startsAt,
      student_id: input.studentId,
    },
    organizationId,
  });

  await notifyWorkflow({
    actionUrl: "/leave",
    actorUserId: context.identity.userId,
    audienceType: "admins",
    body: `${student.student_code} submitted a leave request.`,
    category: "leave",
    hostelBranchId: input.hostelBranchId,
    metadata: { leave_request_id: data.id, student_id: input.studentId },
    notificationType: "leave.requested",
    organizationId,
    sourceId: data.id,
    sourceTable: "student_leave_requests",
    targetUserIds: getAdminRecipientIds(organizationId, input.hostelBranchId),
    title: "Leave approval requested",
  });

  return data;
}

export async function reviewLeaveRequest(input: ReviewLeaveRequestInput) {
  const supabase = await createSupabaseServerClient();
  const { data: leave, error: leaveError } = await getLeaveById(
    supabase,
    input.leaveRequestId,
  );

  if (leaveError) {
    throw mapDatabaseError(leaveError);
  }

  if (!leave) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Leave request was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("leave:manage", {
    hostelBranchId: leave.hostel_branch_id,
    organizationId: leave.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("review_leave_request", {
    p_actor_user_id: context.identity.userId,
    p_decision: input.decision,
    p_leave_request_id: input.leaveRequestId,
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = parseRpcResult(
    reviewLeaveResultSchema,
    data,
    "Leave review returned an invalid response.",
  );
  const student = await getStudentForActor(leave.student_id);

  if (student.user_profile_id) {
    await notifyWorkflow({
      actionUrl: "/leave",
      actorUserId: context.identity.userId,
      audienceType: "student",
      body: `Your leave request was ${parsed.status}.`,
      category: "leave",
      hostelBranchId: leave.hostel_branch_id,
      metadata: { leave_request_id: leave.id, status: parsed.status },
      notificationType: `leave.${parsed.status}`,
      organizationId: leave.organization_id,
      severity: parsed.status === "approved" ? "success" : "warning",
      sourceId: leave.id,
      sourceTable: "student_leave_requests",
      targetUserIds: [student.user_profile_id],
      title: "Leave request updated",
    });
  }

  return parsed;
}

export async function recordLeaveRequestEvent(
  input: RecordLeaveRequestEventInput,
) {
  const supabase = await createSupabaseServerClient();
  const { data: leave, error: leaveError } = await getLeaveById(
    supabase,
    input.leaveRequestId,
  );

  if (leaveError) {
    throw mapDatabaseError(leaveError);
  }

  if (!leave) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Leave request was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("leave:manage", {
    hostelBranchId: leave.hostel_branch_id,
    organizationId: leave.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("record_leave_request_event", {
    p_actor_user_id: context.identity.userId,
    p_event_type: input.eventType,
    p_leave_request_id: input.leaveRequestId,
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = parseRpcResult(
    leaveEventResultSchema,
    data,
    "Leave event returned an invalid response.",
  );
  const student = await getStudentForActor(leave.student_id);

  if (student.user_profile_id) {
    await notifyWorkflow({
      actionUrl: "/leave",
      actorUserId: context.identity.userId,
      audienceType: "student",
      body: `Your leave status changed to ${parsed.status}.`,
      category: "leave",
      hostelBranchId: leave.hostel_branch_id,
      metadata: { event_type: parsed.eventType, leave_request_id: leave.id },
      notificationType: `leave.${parsed.eventType}`,
      organizationId: leave.organization_id,
      severity: parsed.status === "overdue" ? "warning" : "info",
      sourceId: leave.id,
      sourceTable: "student_leave_requests",
      targetUserIds: [student.user_profile_id],
      title: "Leave status updated",
    });
  }

  return parsed;
}

export async function listAttendance(input: ListAttendanceQuery) {
  const context = await requirePermission("attendance:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const result = await listAttendanceRows({ input, organizationId, supabase });

  if (result.error) {
    throw mapDatabaseError(result.error);
  }

  const rows = result.data ?? [];
  const studentIds = [...new Set(rows.map((row) => row.student_id))];
  const students = await listStudentsByIds(supabase, studentIds);

  if (students.error) {
    throw mapDatabaseError(students.error);
  }

  return {
    count: result.count ?? 0,
    data: attachStudents(rows, students.data ?? []),
    page: input.page,
    pageCount: Math.max(1, Math.ceil((result.count ?? 0) / input.limit)),
    summary: summarizeAttendance(rows),
  };
}

export async function markAttendance(input: MarkAttendanceInput) {
  const context = await requirePermission("attendance:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("upsert_daily_attendance", {
    p_actor_user_id: context.identity.userId,
    p_attendance_date: input.attendanceDate,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_source: "manual",
    p_status: input.status,
    p_student_id: input.studentId,
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  return parseRpcResult(
    markAttendanceResultSchema,
    data,
    "Attendance marking returned an invalid response.",
  );
}

export async function listGatePasses(input: ListGatePassesQuery) {
  const context = await requirePermission("gatepass:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const [gatePasses, visitorPasses] = await Promise.all([
    listGatePassRows({ input, organizationId, supabase }),
    listVisitorPassRows({
      hostelBranchId: input.hostelBranchId ?? context.hostelBranchId,
      organizationId,
      supabase,
    }),
  ]);

  if (gatePasses.error) {
    throw mapDatabaseError(gatePasses.error);
  }

  if (visitorPasses.error) {
    throw mapDatabaseError(visitorPasses.error);
  }

  const rows = gatePasses.data ?? [];
  const studentIds = [
    ...new Set([
      ...rows.map((row) => row.student_id),
      ...(visitorPasses.data ?? [])
        .map((visitor) => visitor.student_id)
        .filter((studentId): studentId is string => Boolean(studentId)),
    ]),
  ];
  const [students, events] = await Promise.all([
    listStudentsByIds(supabase, studentIds),
    listGatePassEvents(supabase, rows.map((row) => row.id)),
  ]);

  if (students.error) {
    throw mapDatabaseError(students.error);
  }

  if (events.error) {
    throw mapDatabaseError(events.error);
  }

  const studentById = new Map(
    (students.data ?? []).map((student) => [student.id, student]),
  );
  const eventsByPass = new Map<string, GatePassEventRow[]>();

  (events.data ?? []).forEach((event) => {
    const current = eventsByPass.get(event.gate_pass_id) ?? [];
    current.push(event);
    eventsByPass.set(event.gate_pass_id, current);
  });

  const data: GatePassListItem[] = rows.map((row) => ({
    ...row,
    events: eventsByPass.get(row.id) ?? [],
    student: studentById.get(row.student_id),
  }));

  return {
    count: gatePasses.count ?? 0,
    data,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((gatePasses.count ?? 0) / input.limit)),
    summary: summarizeGatePasses(rows),
    visitorPasses: visitorPasses.data ?? [],
  };
}

export async function createGatePass(input: CreateGatePassInput) {
  const context = await requirePermission("gatepass:request", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const student = await getStudentForActor(input.studentId);

  assertCanActForStudent({
    actorUserId: context.identity.userId,
    isAdmin: context.role === "admin" || context.role === "superadmin",
    student,
  });

  const supabase = await createSupabaseServerClient();

  if (input.leaveRequestId) {
    const { data: leave, error: leaveError } = await getLeaveById(
      supabase,
      input.leaveRequestId,
    );

    if (leaveError) {
      throw mapDatabaseError(leaveError);
    }

    if (
      !leave ||
      leave.organization_id !== organizationId ||
      leave.hostel_branch_id !== input.hostelBranchId ||
      leave.student_id !== input.studentId
    ) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Linked leave request does not belong to this student and branch.",
        statusCode: 400,
      });
    }
  }

  const { data, error } = await supabase
    .from("gate_passes")
    .insert({
      contact_phone: input.contactPhone ?? null,
      created_by: context.identity.userId,
      destination: input.destination ?? null,
      expected_exit_at: input.expectedExitAt,
      expected_return_at: input.expectedReturnAt,
      hostel_branch_id: input.hostelBranchId,
      leave_request_id: input.leaveRequestId ?? null,
      metadata: {},
      organization_id: organizationId,
      purpose: input.purpose,
      student_id: input.studentId,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "gate_pass.request.create",
    actorUserId: context.identity.userId,
    entityId: data.id,
    entityTable: "gate_passes",
    hostelBranchId: input.hostelBranchId,
    metadata: { student_id: input.studentId },
    organizationId,
  });

  await notifyWorkflow({
    actionUrl: "/gate-passes",
    actorUserId: context.identity.userId,
    audienceType: "admins",
    body: `${student.student_code} requested a gate pass.`,
    category: "admin",
    hostelBranchId: input.hostelBranchId,
    metadata: { gate_pass_id: data.id, student_id: input.studentId },
    notificationType: "gate_pass.requested",
    organizationId,
    sourceId: data.id,
    sourceTable: "gate_passes",
    targetUserIds: getAdminRecipientIds(organizationId, input.hostelBranchId),
    title: "Gate pass requested",
  });

  return data;
}

export async function recordGatePassEvent(input: RecordGatePassEventInput) {
  const supabase = await createSupabaseServerClient();
  const { data: gatePass, error: gatePassError } = await getGatePassById(
    supabase,
    input.gatePassId,
  );

  if (gatePassError) {
    throw mapDatabaseError(gatePassError);
  }

  if (!gatePass) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Gate pass was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("gatepass:manage", {
    hostelBranchId: gatePass.hostel_branch_id,
    organizationId: gatePass.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("record_gate_pass_event", {
    p_actor_user_id: context.identity.userId,
    p_event_type: input.eventType,
    p_gate_pass_id: input.gatePassId,
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = parseRpcResult(
    gatePassEventResultSchema,
    data,
    "Gate pass event returned an invalid response.",
  );
  const student = await getStudentForActor(gatePass.student_id);

  if (student.user_profile_id) {
    await notifyWorkflow({
      actionUrl: "/gate-passes",
      actorUserId: context.identity.userId,
      audienceType: "student",
      body: `Your gate pass status changed to ${parsed.eventType}.`,
      category: "student",
      hostelBranchId: gatePass.hostel_branch_id,
      metadata: { event_type: parsed.eventType, gate_pass_id: gatePass.id },
      notificationType: `gate_pass.${parsed.eventType}`,
      organizationId: gatePass.organization_id,
      severity: parsed.lateMinutes > 0 ? "warning" : "info",
      sourceId: gatePass.id,
      sourceTable: "gate_passes",
      targetUserIds: [student.user_profile_id],
      title: "Gate pass updated",
    });
  }

  return parsed;
}

export async function createVisitorPass(input: CreateVisitorPassInput) {
  const context = await requirePermission("gatepass:request", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const isAdmin = context.role === "admin" || context.role === "superadmin";

  if (!isAdmin && !input.studentId) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Student visitor requests must be linked to the student record.",
      statusCode: 403,
    });
  }

  if (input.studentId) {
    const student = await getStudentForActor(input.studentId);
    assertCanActForStudent({
      actorUserId: context.identity.userId,
      isAdmin,
      student,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visitor_passes")
    .insert({
      created_by: context.identity.userId,
      hostel_branch_id: input.hostelBranchId,
      metadata: {},
      organization_id: organizationId,
      relationship: input.relationship ?? null,
      scheduled_at: input.scheduledAt ?? new Date().toISOString(),
      student_id: input.studentId ?? null,
      updated_by: context.identity.userId,
      visit_reason: input.visitReason,
      visitor_name: input.visitorName,
      visitor_phone: input.visitorPhone ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "visitor_pass.request.create",
    actorUserId: context.identity.userId,
    entityId: data.id,
    entityTable: "visitor_passes",
    hostelBranchId: input.hostelBranchId,
    organizationId,
  });

  await notifyWorkflow({
    actionUrl: "/gate-passes",
    actorUserId: context.identity.userId,
    audienceType: "admins",
    body: `${input.visitorName} needs visitor approval.`,
    category: "admin",
    hostelBranchId: input.hostelBranchId,
    metadata: { visitor_pass_id: data.id, student_id: input.studentId ?? null },
    notificationType: "visitor_pass.requested",
    organizationId,
    sourceId: data.id,
    sourceTable: "visitor_passes",
    targetUserIds: getAdminRecipientIds(organizationId, input.hostelBranchId),
    title: "Visitor approval requested",
  });

  return data;
}

export async function recordVisitorPassEvent(
  input: RecordVisitorPassEventInput,
) {
  const supabase = await createSupabaseServerClient();
  const { data: visitorPass, error: visitorPassError } = await getVisitorPassById(
    supabase,
    input.visitorPassId,
  );

  if (visitorPassError) {
    throw mapDatabaseError(visitorPassError);
  }

  if (!visitorPass) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Visitor pass was not found.",
      statusCode: 404,
    });
  }

  const context = await requirePermission("gatepass:manage", {
    hostelBranchId: visitorPass.hostel_branch_id,
    organizationId: visitorPass.organization_id,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("record_visitor_pass_event", {
    p_actor_user_id: context.identity.userId,
    p_event_type: input.eventType,
    p_visitor_pass_id: input.visitorPassId,
    ...(input.notes === undefined ? {} : { p_notes: input.notes }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = parseRpcResult(
    visitorPassEventResultSchema,
    data,
    "Visitor pass event returned an invalid response.",
  );

  if (visitorPass.student_id) {
    const student = await getStudentForActor(visitorPass.student_id);

    if (student.user_profile_id) {
      await notifyWorkflow({
        actionUrl: "/gate-passes",
        actorUserId: context.identity.userId,
        audienceType: "student",
        body: `Visitor pass status changed to ${parsed.status}.`,
        category: "student",
        hostelBranchId: visitorPass.hostel_branch_id,
        metadata: {
          event_type: parsed.eventType,
          visitor_pass_id: visitorPass.id,
        },
        notificationType: `visitor_pass.${parsed.eventType}`,
        organizationId: visitorPass.organization_id,
        severity: parsed.status === "rejected" ? "warning" : "info",
        sourceId: visitorPass.id,
        sourceTable: "visitor_passes",
        targetUserIds: [student.user_profile_id],
        title: "Visitor pass updated",
      });
    }
  }

  return parsed;
}
