import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { updateBookingStatus } from "@/modules/bookings/bookings.service";
import { updateBookingStatusSchema } from "@/modules/bookings/schemas";

type BookingStatusRouteContext = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

export async function PATCH(request: Request, context: BookingStatusRouteContext) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.status.update",
    request_id: requestId,
  });

  try {
    const { bookingRequestId } = await context.params;
    const input = validateInput(updateBookingStatusSchema, {
      ...(await request.json()),
      bookingRequestId,
    });
    const data = await updateBookingStatus(input);

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking status update failed");

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
