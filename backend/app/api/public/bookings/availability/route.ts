import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { enforceRequestRateLimit } from "@/lib/security/request-protection";
import { validateInput } from "@/lib/validation/zod";
import { getPublicBookingAvailability } from "@/modules/bookings/bookings.service";
import { bookingAvailabilityQuerySchema } from "@/modules/bookings/schemas";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.availability.lookup",
    request_id: requestId,
  });

  try {
    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: "public:booking:availability",
      limit: 120,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }

    const query = validateInput(
      bookingAvailabilityQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await getPublicBookingAvailability(query);

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking availability lookup failed");

    return toErrorResponse(error, requestId);
  }
}
