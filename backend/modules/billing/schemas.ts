import { z } from "zod";

import {
  BILLING_INVOICE_STATUSES,
  BILLING_PAYMENT_METHODS,
  RENT_PLAN_SCOPE_TYPES,
} from "@/types/domain";

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

export const invoiceStatusSchema = z.enum(BILLING_INVOICE_STATUSES);

export const paymentMethodSchema = z.enum(BILLING_PAYMENT_METHODS);

export const rentPlanScopeSchema = z.enum(RENT_PLAN_SCOPE_TYPES);

export const listInvoicesQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, invoiceStatusSchema.optional()),
});

export const createRentPlanSchema = z
  .object({
    amountCents: z.coerce.number().int().min(0).max(100_000_000),
    bedId: optionalUuidSchema,
    code: z.string().trim().min(1).max(40),
    currencyCode: z
      .preprocess(emptyToUndefined, z.string().trim().length(3).optional())
      .transform((value) => value?.toUpperCase() ?? "INR"),
    dueDay: z.coerce.number().int().min(1).max(28).default(5),
    endsOn: optionalDateSchema,
    hostelBranchId: z.string().uuid(),
    monthlyDiscountCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
    name: z.string().trim().min(1).max(160),
    organizationId: optionalUuidSchema,
    roomId: optionalUuidSchema,
    scopeType: rentPlanScopeSchema.default("branch"),
    startsOn: z
      .preprocess(emptyToUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
      .default(new Date().toISOString().slice(0, 10)),
    status: z.enum(["active", "inactive", "archived"]).default("active"),
    studentId: optionalUuidSchema,
  })
  .superRefine((value, context) => {
    if (value.scopeType === "room" && !value.roomId) {
      context.addIssue({
        code: "custom",
        message: "Room rent plans require a room.",
        path: ["roomId"],
      });
    }

    if (value.scopeType === "bed" && (!value.roomId || !value.bedId)) {
      context.addIssue({
        code: "custom",
        message: "Bed rent plans require a room and bed.",
        path: ["bedId"],
      });
    }

    if (value.scopeType === "student" && !value.studentId) {
      context.addIssue({
        code: "custom",
        message: "Student rent plans require a student.",
        path: ["studentId"],
      });
    }
  });

export const generateMonthlyInvoicesSchema = z.object({
  hostelBranchId: z.string().uuid(),
  invoiceMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  organizationId: z.string().uuid(),
});

export const recordInvoicePaymentSchema = z.object({
  amountCents: z.coerce.number().int().min(1).max(100_000_000),
  idempotencyKey: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(160).optional(),
  ),
  invoiceId: z.string().uuid(),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  paymentMethod: paymentMethodSchema.default("cash"),
  provider: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).max(80).optional(),
  ),
  providerEventId: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(255).optional(),
  ),
  providerReference: optionalStringSchema,
  receivedAt: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  requestId: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(160).optional(),
  ),
});

export const addInvoiceAdjustmentSchema = z.object({
  amountCents: z.coerce.number().int().min(1).max(100_000_000),
  description: z.string().trim().min(1).max(255),
  invoiceId: z.string().uuid(),
  itemType: z.enum(["penalty", "fine", "discount", "adjustment"]),
});

export const voidBillingInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  reason: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export type ListInvoicesQuery = z.output<typeof listInvoicesQuerySchema>;
export type CreateRentPlanInput = z.output<typeof createRentPlanSchema>;
export type GenerateMonthlyInvoicesInput = z.output<
  typeof generateMonthlyInvoicesSchema
>;
export type RecordInvoicePaymentInput = z.output<
  typeof recordInvoicePaymentSchema
>;
export type AddInvoiceAdjustmentInput = z.output<
  typeof addInvoiceAdjustmentSchema
>;
export type VoidBillingInvoiceInput = z.output<typeof voidBillingInvoiceSchema>;
