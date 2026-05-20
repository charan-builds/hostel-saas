import { z } from "zod";

import { BOOKING_REQUEST_STATUSES } from "@/types/domain";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUuidSchema = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(255).optional(),
);

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
);

const optionalEmailSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().toLowerCase().email().optional(),
);

const optionalSlugSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/)
    .optional(),
);

const scopeFields = {
  hostelBranchId: optionalUuidSchema,
  hostelBranchSlug: optionalSlugSchema,
  organizationId: optionalUuidSchema,
  organizationSlug: optionalSlugSchema,
};

const scopeSchema = z.object(scopeFields).superRefine((value, context) => {
  const hasIds = Boolean(value.organizationId && value.hostelBranchId);
  const hasSlugs = Boolean(value.organizationSlug && value.hostelBranchSlug);

  if (!hasIds && !hasSlugs) {
    context.addIssue({
      code: "custom",
      message:
        "A booking request must include either organization/branch IDs or organization/branch slugs.",
      path: ["organizationId"],
    });
  }
});

export const bookingStatusSchema = z.enum(BOOKING_REQUEST_STATUSES);

export const bookingAvailabilityQuerySchema = scopeSchema.extend({
  categoryId: optionalUuidSchema,
  moveInDate: optionalDateSchema,
  requestedBedCount: z.coerce.number().int().min(1).max(20).default(1),
  roomTemplateId: optionalUuidSchema,
  roomType: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9][a-z0-9_-]{0,79}$/)
      .optional(),
  ),
});

export const createPublicBookingRequestSchema = scopeSchema.extend({
  advanceAmountCents: z.coerce.number().int().min(0).max(1_000_000).default(0),
  advanceCurrencyCode: z
    .preprocess(emptyToUndefined, z.string().trim().length(3).optional())
    .transform((value) => value?.toUpperCase() ?? "INR"),
  advanceRefundable: z.coerce.boolean().default(true),
  categoryId: optionalUuidSchema,
  companyName: z
    .preprocess(emptyToUndefined, z.string().trim().max(0).optional())
    .optional(),
  email: optionalEmailSchema,
  expectedStayMonths: z.coerce.number().int().min(1).max(120).optional(),
  firstName: z.string().trim().min(1).max(80),
  guardianName: optionalStringSchema,
  guardianPhone: optionalStringSchema,
  lastName: z.string().trim().min(1).max(80),
  message: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(2000).optional(),
  ),
  moveInDate: optionalDateSchema,
  phone: z.string().trim().min(8).max(32),
  requestedBedCount: z.coerce.number().int().min(1).max(20).default(1),
  roomId: optionalUuidSchema,
  roomTemplateId: optionalUuidSchema,
  roomType: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9][a-z0-9_-]{0,79}$/)
      .optional(),
  ),
  source: z
    .preprocess(emptyToUndefined, z.string().trim().min(2).max(80).optional())
    .default("public_website"),
});

export const bookingPaymentSessionSchema = z.object({
  accessToken: z.string().trim().min(24).max(255),
  bookingRequestId: z.string().uuid(),
  idempotencyKey: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(160).optional(),
  ),
  requestId: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(160).optional(),
  ),
});

export const listBookingsQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, bookingStatusSchema.optional()),
});

export const updateBookingStatusSchema = z.object({
  advanceAmountCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  advanceCurrencyCode: z
    .preprocess(emptyToUndefined, z.string().trim().length(3).optional())
    .transform((value) => value?.toUpperCase()),
  advanceRefundable: z.coerce.boolean().optional(),
  assignedTo: optionalUuidSchema,
  bookingRequestId: z.string().uuid(),
  note: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(2000).optional(),
  ),
  status: bookingStatusSchema.exclude(["converted"]),
});

export const createBookingNoteSchema = z.object({
  bookingRequestId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  noteType: z.enum(["internal", "follow_up"]).default("internal"),
});

export const convertBookingToStudentSchema = z.object({
  bedId: optionalUuidSchema,
  bookingRequestId: z.string().uuid(),
  roomId: optionalUuidSchema,
});

export type BookingAvailabilityQuery = z.output<
  typeof bookingAvailabilityQuerySchema
>;
export type CreatePublicBookingRequestInput = z.output<
  typeof createPublicBookingRequestSchema
>;
export type BookingPaymentSessionInput = z.output<
  typeof bookingPaymentSessionSchema
>;
export type ListBookingsQuery = z.output<typeof listBookingsQuerySchema>;
export type UpdateBookingStatusInput = z.output<typeof updateBookingStatusSchema>;
export type CreateBookingNoteInput = z.output<typeof createBookingNoteSchema>;
export type ConvertBookingToStudentInput = z.output<
  typeof convertBookingToStudentSchema
>;
