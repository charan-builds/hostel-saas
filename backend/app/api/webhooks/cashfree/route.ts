import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { createCashfreePaymentProvider } from "@/lib/payments/providers/cashfree/cashfree-provider";
import { enforceRequestRateLimit } from "@/lib/security/request-protection";
import { processCashfreeWebhook } from "@/modules/billing/billing.service";
import {
  processBookingCashfreeWebhook,
  shouldProcessCashfreeWebhookAsBooking,
} from "@/modules/bookings/bookings.service";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "cashfree.webhook.received",
    request_id: requestId,
  });

  try {
    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: "webhook:cashfree",
      limit: 300,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }

    const rawBody = await request.text();

    if (!rawBody.trim()) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Cashfree webhook body is required.",
        statusCode: 400,
      });
    }

    const provider = createCashfreePaymentProvider();
    const verifiedWebhook = provider.verifyWebhook({
      providerEventId: request.headers.get("x-idempotency-key"),
      rawBody,
      signature: request.headers.get("x-webhook-signature"),
      timestamp: request.headers.get("x-webhook-timestamp"),
    });
    const processWebhook = shouldProcessCashfreeWebhookAsBooking(
      verifiedWebhook.payload,
    )
      ? processBookingCashfreeWebhook
      : processCashfreeWebhook;
    const result = await processWebhook({
      eventId: verifiedWebhook.eventId,
      eventTime: verifiedWebhook.eventTime,
      eventType: verifiedWebhook.eventType,
      payload: verifiedWebhook.payload,
      requestId,
    });

    log.info(
      {
        event_id: verifiedWebhook.eventId,
        event_type: verifiedWebhook.eventType,
        processed: result.processed,
      },
      "Cashfree webhook processed",
    );

    return Response.json(
      {
        data: {
          received: true,
          ...result,
        },
      },
      {
        headers: { "x-request-id": requestId },
        status: 200,
      },
    );
  } catch (error) {
    log.warn({ error }, "Cashfree webhook processing failed");

    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Cashfree webhook body must be valid JSON.",
          statusCode: 400,
        }),
        requestId,
      );
    }

    return toErrorResponse(error, requestId);
  }
}
