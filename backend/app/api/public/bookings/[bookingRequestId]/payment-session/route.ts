import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getIdempotencyKey, getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import {
  enforceRequestRateLimit,
  enforceSameOriginRequest,
} from "@/lib/security/request-protection";
import { validateInput } from "@/lib/validation/zod";
import { createBookingPaymentSession } from "@/modules/bookings/bookings.service";
import { bookingPaymentSessionSchema } from "@/modules/bookings/schemas";

type BookingPaymentSessionRouteContext = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

async function readOptionalJson(request: Request) {
  const body = await request.text();

  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body);
}

export async function POST(
  request: NextRequest,
  context: BookingPaymentSessionRouteContext,
) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.payment_session.create",
    request_id: requestId,
  });

  try {
    const originResponse = enforceSameOriginRequest(request, {
      requestId,
      requireOrigin: true,
    });

    if (originResponse) {
      originResponse.headers.set("x-request-id", requestId);

      return originResponse;
    }

    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: "public:booking:payment-session",
      limit: 30,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }

    const { bookingRequestId } = await context.params;
    const body = await readOptionalJson(request);
    const bodyObject =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};
    const input = validateInput(bookingPaymentSessionSchema, {
      ...bodyObject,
      bookingRequestId,
      idempotencyKey:
        getIdempotencyKey(request) ??
        (typeof bodyObject.idempotencyKey === "string"
          ? bodyObject.idempotencyKey
          : undefined),
      requestId:
        typeof bodyObject.requestId === "string" && bodyObject.requestId.trim()
          ? bodyObject.requestId
          : requestId,
    });
    const data = await createBookingPaymentSession(input);

    log.info(
      {
        booking_request_id: bookingRequestId,
        cashfree_order_id: data.orderId,
      },
      "Booking payment session created",
    );

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 201,
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking payment session request failed");

    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
          statusCode: 400,
        }),
        requestId,
      );
    }

    return toErrorResponse(error, requestId);
  }
}
