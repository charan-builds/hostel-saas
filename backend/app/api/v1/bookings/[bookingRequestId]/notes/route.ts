import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { addBookingNote } from "@/modules/bookings/bookings.service";
import { createBookingNoteSchema } from "@/modules/bookings/schemas";

type BookingNotesRouteContext = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

export async function POST(request: Request, context: BookingNotesRouteContext) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.note.create",
    request_id: requestId,
  });

  try {
    const { bookingRequestId } = await context.params;
    const input = validateInput(createBookingNoteSchema, {
      ...(await request.json()),
      bookingRequestId,
    });
    const data = await addBookingNote(input);

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 201,
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking note creation failed");

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
