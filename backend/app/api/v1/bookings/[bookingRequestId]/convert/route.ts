import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { convertBookingToStudent } from "@/modules/bookings/bookings.service";
import { convertBookingToStudentSchema } from "@/modules/bookings/schemas";

type BookingConvertRouteContext = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

export async function POST(request: Request, context: BookingConvertRouteContext) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "booking.convert",
    request_id: requestId,
  });

  try {
    const { bookingRequestId } = await context.params;
    const input = validateInput(convertBookingToStudentSchema, {
      ...(await request.json()),
      bookingRequestId,
    });
    const data = await convertBookingToStudent(input);

    log.info(
      {
        booking_request_id: bookingRequestId,
        student_id: data.studentId,
      },
      "Booking converted to student",
    );

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 201,
      },
    );
  } catch (error) {
    log.warn({ error }, "Booking conversion failed");

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
