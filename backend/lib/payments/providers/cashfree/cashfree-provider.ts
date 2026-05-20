import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { AppError } from "@/lib/http/errors";
import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentSession,
  ProviderOrder,
  VerifiedWebhook,
} from "@/lib/payments/payment-provider";
import { getCashfreeConfig } from "@/lib/payments/providers/cashfree/config";
import {
  cashfreeOrderResponseSchema,
  cashfreeWebhookPayloadSchema,
  type CashfreeOrderResponse,
  type CashfreeWebhookPayload,
} from "@/lib/payments/providers/cashfree/types";

function centsToCashfreeAmount(amountCents: number) {
  return Number((amountCents / 100).toFixed(2));
}

function cashfreeAmountToCents(amount: number) {
  return Math.round(amount * 100);
}

function normalizePhone(phone: string | null | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  return digits.length >= 10 ? digits.slice(-10) : "9999999999";
}

function getOrderReference(input: CreatePaymentSessionInput) {
  return (
    input.referenceId ??
    input.invoiceId ??
    input.bookingRequestId ??
    input.orderId
  );
}

function getDefaultOrderTags(input: CreatePaymentSessionInput) {
  if (input.orderTags) {
    return input.orderTags;
  }

  if (input.invoiceId) {
    return {
      invoice_id: input.invoiceId,
      reference_type: input.referenceType ?? "invoice",
    };
  }

  if (input.bookingRequestId) {
    return {
      booking_request_id: input.bookingRequestId,
      reference_type: input.referenceType ?? "booking",
    };
  }

  return {
    reference_id: getOrderReference(input),
    reference_type: input.referenceType ?? "invoice",
  };
}

function mapOrderStatus(status: string | null | undefined): ProviderOrder["status"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "EXPIRED":
      return "expired";
    case "PAID":
      return "paid";
    case "TERMINATED":
    case "TERMINATION_REQUESTED":
      return "terminated";
    default:
      return "unknown";
  }
}

function toProviderOrder(order: CashfreeOrderResponse): ProviderOrder {
  return {
    amountCents: cashfreeAmountToCents(order.order_amount),
    currencyCode: order.order_currency,
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id ?? undefined,
    status: mapOrderStatus(order.order_status),
  };
}

async function parseCashfreeResponse(response: Response) {
  const body = await response.text();
  let json: unknown = null;

  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message: "Cashfree returned an invalid JSON response.",
      statusCode: 502,
    });
  }

  if (!response.ok) {
    throw new AppError({
      code: response.status === 409 ? "CONFLICT" : "INTERNAL_ERROR",
      details: {
        cashfreeStatus: response.status,
      },
      expose: response.status === 409,
      message:
        response.status === 409
          ? "A Cashfree order already exists for this invoice."
          : "Cashfree payment session request failed.",
      statusCode: response.status === 409 ? 409 : 502,
    });
  }

  const parsed = cashfreeOrderResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message: "Cashfree returned an unexpected order response.",
      statusCode: 502,
    });
  }

  return parsed.data;
}

export class CashfreePaymentProvider
  implements PaymentProvider<CashfreeWebhookPayload>
{
  async createPaymentSession(
    input: CreatePaymentSessionInput,
  ): Promise<PaymentSession> {
    const config = getCashfreeConfig();
    const response = await fetch(`${config.apiBaseUrl}/orders`, {
      body: JSON.stringify({
        customer_details: {
          customer_email: input.customer.email ?? undefined,
          customer_id: input.customer.id,
          customer_name: input.customer.name ?? undefined,
          customer_phone: normalizePhone(input.customer.phone),
        },
        order_amount: centsToCashfreeAmount(input.amountCents),
        order_currency: input.currencyCode,
        order_id: input.orderId,
        order_meta: {
          notify_url: input.notifyUrl,
          return_url: input.returnUrl,
        },
        order_note: input.orderNote ?? `Payment ${getOrderReference(input)}`,
        order_tags: getDefaultOrderTags(input),
      }),
      headers: {
        "Content-Type": "application/json",
        "x-api-version": config.apiVersion,
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
        "x-idempotency-key": input.idempotencyKey,
        "x-request-id": input.requestId,
      },
      method: "POST",
    });
    const order = await parseCashfreeResponse(response);

    if (!order.payment_session_id) {
      throw new AppError({
        code: "INTERNAL_ERROR",
        expose: false,
        message: "Cashfree did not return a payment session.",
        statusCode: 502,
      });
    }

    return {
      amountCents: cashfreeAmountToCents(order.order_amount),
      checkoutMode: "cashfree_payment_session",
      currencyCode: order.order_currency,
      expiresAt: order.order_expiry_time ?? undefined,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      provider: "cashfree",
    };
  }

  async getOrder(orderId: string, requestId: string) {
    const config = getCashfreeConfig();
    const response = await fetch(
      `${config.apiBaseUrl}/orders/${encodeURIComponent(orderId)}`,
      {
        headers: {
          "x-api-version": config.apiVersion,
          "x-client-id": config.appId,
          "x-client-secret": config.secretKey,
          "x-request-id": requestId,
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    return toProviderOrder(await parseCashfreeResponse(response));
  }

  verifyWebhook({
    providerEventId,
    rawBody,
    signature,
    timestamp,
  }: {
    providerEventId?: string | null | undefined;
    rawBody: string;
    signature: string | null;
    timestamp: string | null;
  }): VerifiedWebhook<CashfreeWebhookPayload> {
    const config = getCashfreeConfig();

    if (!signature || !timestamp) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "Missing Cashfree webhook signature.",
        statusCode: 403,
      });
    }

    const expected = createHmac("sha256", config.webhookSecret)
      .update(`${timestamp}${rawBody}`)
      .digest("base64");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    const valid =
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!valid) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "Invalid Cashfree webhook signature.",
        statusCode: 403,
      });
    }

    const parsedPayload = cashfreeWebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!parsedPayload.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Cashfree webhook payload is invalid.",
        statusCode: 400,
      });
    }

    const payload = parsedPayload.data;
    const eventId =
      providerEventId?.trim() || `${payload.type}:${payload.data.payment.cf_payment_id}`;

    return {
      eventId,
      eventTime: payload.event_time,
      eventType: payload.type,
      payload,
    };
  }
}

export function createCashfreePaymentProvider() {
  return new CashfreePaymentProvider();
}
