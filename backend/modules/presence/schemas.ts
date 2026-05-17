import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUuidSchema = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
);

const optionalDateTimeSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(80).optional(),
);

const optionalTextSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(1000).optional(),
);

export const leaveStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "checked_out",
  "returned",
  "overdue",
]);

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "on_leave",
  "late",
  "excused",
]);

export const gatePassStatusSchema = z.enum([
  "requested",
  "approved",
  "rejected",
  "checked_out",
  "checked_in",
  "expired",
  "cancelled",
]);

export const listLeaveRequestsQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, leaveStatusSchema.optional()),
  studentId: optionalUuidSchema,
});

export const createLeaveRequestSchema = z.object({
  contactPhone: optionalTextSchema,
  destinationAddress: optionalTextSchema,
  expectedReturnAt: z.string().trim().min(1).max(80),
  hostelBranchId: z.string().uuid(),
  leaveType: z
    .enum(["home_visit", "medical", "emergency", "personal", "academic", "other"])
    .default("personal"),
  organizationId: optionalUuidSchema,
  reason: z.string().trim().min(1).max(1000),
  startsAt: z.string().trim().min(1).max(80),
  studentId: z.string().uuid(),
});

export const reviewLeaveRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  leaveRequestId: z.string().uuid(),
  notes: optionalTextSchema,
});

export const recordLeaveRequestEventSchema = z.object({
  eventType: z.enum(["cancelled", "checked_out", "returned", "overdue"]),
  leaveRequestId: z.string().uuid(),
  notes: optionalTextSchema,
});

export const listAttendanceQuerySchema = z.object({
  attendanceDate: optionalDateSchema.default(new Date().toISOString().slice(0, 10)),
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
  status: z.preprocess(emptyToUndefined, attendanceStatusSchema.optional()),
});

export const markAttendanceSchema = z.object({
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hostelBranchId: z.string().uuid(),
  notes: optionalTextSchema,
  organizationId: z.string().uuid(),
  status: attendanceStatusSchema,
  studentId: z.string().uuid(),
});

export const listGatePassesQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, gatePassStatusSchema.optional()),
  studentId: optionalUuidSchema,
});

export const createGatePassSchema = z.object({
  contactPhone: optionalTextSchema,
  destination: optionalTextSchema,
  expectedExitAt: z.string().trim().min(1).max(80),
  expectedReturnAt: z.string().trim().min(1).max(80),
  hostelBranchId: z.string().uuid(),
  leaveRequestId: optionalUuidSchema,
  organizationId: optionalUuidSchema,
  purpose: z.string().trim().min(1).max(500),
  studentId: z.string().uuid(),
});

export const recordGatePassEventSchema = z.object({
  eventType: z.enum([
    "approved",
    "rejected",
    "checked_out",
    "checked_in",
    "cancelled",
    "expired",
  ]),
  gatePassId: z.string().uuid(),
  notes: optionalTextSchema,
});

export const createVisitorPassSchema = z.object({
  hostelBranchId: z.string().uuid(),
  organizationId: optionalUuidSchema,
  relationship: optionalTextSchema,
  scheduledAt: optionalDateTimeSchema,
  studentId: optionalUuidSchema,
  visitReason: z.string().trim().min(1).max(500),
  visitorName: z.string().trim().min(1).max(120),
  visitorPhone: optionalTextSchema,
});

export const recordVisitorPassEventSchema = z.object({
  eventType: z.enum([
    "approved",
    "rejected",
    "checked_in",
    "checked_out",
    "cancelled",
  ]),
  notes: optionalTextSchema,
  visitorPassId: z.string().uuid(),
});

export type ListLeaveRequestsQuery = z.output<typeof listLeaveRequestsQuerySchema>;
export type CreateLeaveRequestInput = z.output<typeof createLeaveRequestSchema>;
export type ReviewLeaveRequestInput = z.output<typeof reviewLeaveRequestSchema>;
export type RecordLeaveRequestEventInput = z.output<
  typeof recordLeaveRequestEventSchema
>;
export type ListAttendanceQuery = z.output<typeof listAttendanceQuerySchema>;
export type MarkAttendanceInput = z.output<typeof markAttendanceSchema>;
export type ListGatePassesQuery = z.output<typeof listGatePassesQuerySchema>;
export type CreateGatePassInput = z.output<typeof createGatePassSchema>;
export type RecordGatePassEventInput = z.output<typeof recordGatePassEventSchema>;
export type CreateVisitorPassInput = z.output<typeof createVisitorPassSchema>;
export type RecordVisitorPassEventInput = z.output<
  typeof recordVisitorPassEventSchema
>;
