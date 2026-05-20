import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { listBookingRequests } from "@/modules/bookings/bookings.service";
import { listBookingsQuerySchema } from "@/modules/bookings/schemas";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.list",
    request_id: requestId,
  });

  try {
    const query = validateInput(
      listBookingsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listBookingRequests(query);

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking list request failed");

    return toErrorResponse(error, requestId);
  }
}
