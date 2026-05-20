import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import {
  enforceRequestRateLimit,
  enforceSameOriginRequest,
} from "@/lib/security/request-protection";
import { validateInput } from "@/lib/validation/zod";
import { createPublicBookingRequest } from "@/modules/bookings/bookings.service";
import { createPublicBookingRequestSchema } from "@/modules/bookings/schemas";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined
  );
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.request.create",
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
      keyPrefix: "public:booking:create",
      limit: 20,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }

    const input = validateInput(
      createPublicBookingRequestSchema,
      await request.json(),
    );
    const data = await createPublicBookingRequest(input, {
      ipAddress: getClientIp(request),
      requestId,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    log.info(
      {
        booking_code: data.bookingCode,
        booking_request_id: data.bookingRequestId,
      },
      "Public booking request created",
    );

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 201,
      },
    );
  } catch (error) {
    log.warn({ error }, "Public booking request failed");

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
