import { z } from "zod";

import {
  NOTICE_AUDIENCE_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SEVERITIES,
} from "@/types/domain";

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

const checkboxSchema = z.preprocess((value) => {
  if (value === "on" || value === "true" || value === true) {
    return true;
  }

  if (value === "false" || value === false || value == null) {
    return false;
  }

  return value;
}, z.boolean());

export const notificationSeveritySchema = z.enum(NOTIFICATION_SEVERITIES);
export const notificationChannelSchema = z.enum(NOTIFICATION_CHANNELS);
export const noticeAudienceTypeSchema = z.enum(NOTICE_AUDIENCE_TYPES);

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  readState: z
    .preprocess(emptyToUndefined, z.enum(["all", "read", "unread"]).optional())
    .default("all"),
});

export const listNoticesQuerySchema = z.object({
  audienceType: z.preprocess(emptyToUndefined, noticeAudienceTypeSchema.optional()),
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z
    .preprocess(
      emptyToUndefined,
      z.enum(["draft", "scheduled", "published", "archived"]).optional(),
    )
    .default("published"),
});

export const createNoticeSchema = z
  .object({
    audienceType: noticeAudienceTypeSchema.default("tenant"),
    body: z.string().trim().min(1).max(5000),
    expiresAt: optionalDateTimeSchema,
    hostelBranchId: optionalUuidSchema,
    noticeType: z
      .enum(["general", "billing", "maintenance", "event", "policy", "emergency"])
      .default("general"),
    organizationId: optionalUuidSchema,
    pinned: checkboxSchema.default(false),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    scheduledFor: optionalDateTimeSchema,
    status: z.enum(["draft", "scheduled", "published"]).default("published"),
    title: z.string().trim().min(1).max(160),
  })
  .superRefine((value, context) => {
    if (value.audienceType === "branch" && !value.hostelBranchId) {
      context.addIssue({
        code: "custom",
        message: "Branch notices require a branch.",
        path: ["hostelBranchId"],
      });
    }

    if (value.status === "scheduled" && !value.scheduledFor) {
      context.addIssue({
        code: "custom",
        message: "Scheduled notices require a scheduled time.",
        path: ["scheduledFor"],
      });
    }
  });

export const markNotificationReadSchema = z.object({
  recipientId: z.string().uuid(),
});

export const dismissNotificationSchema = z.object({
  recipientId: z.string().uuid(),
});

export const acknowledgeNoticeSchema = z.object({
  noticeId: z.string().uuid(),
});

export const updateNotificationPreferencesSchema = z.object({
  emailEnabled: checkboxSchema.default(false),
  hostelBranchId: optionalUuidSchema,
  inAppEnabled: checkboxSchema.default(false),
  locale: z
    .preprocess(emptyToUndefined, z.string().trim().min(2).max(20).optional())
    .default("en-IN"),
  mutedNotificationTypes: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return value;
    }, z.array(z.string().trim().min(1).max(120)).max(50))
    .default([]),
  organizationId: optionalUuidSchema,
  smsEnabled: checkboxSchema.default(false),
  timezone: z
    .preprocess(emptyToUndefined, z.string().trim().min(1).max(80).optional())
    .default("UTC"),
  whatsappEnabled: checkboxSchema.default(false),
});

export const enqueueBillingRemindersSchema = z.object({
  dueBefore: optionalDateSchema.default(new Date().toISOString().slice(0, 10)),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  reminderKind: z
    .enum(["billing_reminder", "overdue_payment_alert"])
    .default("overdue_payment_alert"),
});

export type ListNotificationsQuery = z.output<
  typeof listNotificationsQuerySchema
>;
export type ListNoticesQuery = z.output<typeof listNoticesQuerySchema>;
export type CreateNoticeInput = z.output<typeof createNoticeSchema>;
export type MarkNotificationReadInput = z.output<
  typeof markNotificationReadSchema
>;
export type DismissNotificationInput = z.output<
  typeof dismissNotificationSchema
>;
export type AcknowledgeNoticeInput = z.output<typeof acknowledgeNoticeSchema>;
export type UpdateNotificationPreferencesInput = z.output<
  typeof updateNotificationPreferencesSchema
>;
export type EnqueueBillingRemindersInput = z.output<
  typeof enqueueBillingRemindersSchema
>;
