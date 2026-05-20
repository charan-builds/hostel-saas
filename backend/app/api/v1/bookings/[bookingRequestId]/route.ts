import { toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { getBookingRequest } from "@/modules/bookings/bookings.service";

type BookingRouteContext = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

export async function GET(request: Request, context: BookingRouteContext) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.read",
    request_id: requestId,
  });

  try {
    const { bookingRequestId } = await context.params;
    const data = await getBookingRequest(bookingRequestId);

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking read request failed");

    return toErrorResponse(error, requestId);
  }
}
