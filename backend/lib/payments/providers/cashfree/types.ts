import "server-only";

import { z } from "zod";

export const cashfreeEnvironmentSchema = z.enum(["sandbox", "production"]);

export type CashfreeEnvironment = z.output<typeof cashfreeEnvironmentSchema>;

export const cashfreeOrderResponseSchema = z.object({
  order_amount: z.number(),
  order_currency: z.string(),
  order_expiry_time: z.string().optional().nullable(),
  order_id: z.string(),
  order_status: z.string().optional().nullable(),
  payment_session_id: z.string().optional().nullable(),
});

export type CashfreeOrderResponse = z.output<typeof cashfreeOrderResponseSchema>;

export const cashfreeWebhookPayloadSchema = z.object({
  data: z.object({
    order: z.object({
      order_amount: z.number(),
      order_currency: z.string(),
      order_id: z.string(),
      order_tags: z.record(z.string(), z.unknown()).nullable().optional(),
    }),
    payment: z.object({
      bank_reference: z.string().nullable().optional(),
      cf_payment_id: z.union([z.string(), z.number()]).transform(String),
      payment_amount: z.number(),
      payment_currency: z.string(),
      payment_message: z.string().nullable().optional(),
      payment_status: z.string(),
      payment_time: z.string().nullable().optional(),
    }),
  }),
  event_time: z.string().optional(),
  type: z.string(),
});

export type CashfreeWebhookPayload = z.output<typeof cashfreeWebhookPayloadSchema>;
