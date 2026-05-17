import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { recordLeaveRequestEvent } from "@/modules/presence/presence.service";
import { recordLeaveRequestEventSchema } from "@/modules/presence/schemas";

type LeaveEventsRouteContext = {
  params: Promise<{
    leaveRequestId: string;
  }>;
};

export async function POST(request: Request, context: LeaveEventsRouteContext) {
  try {
    const { leaveRequestId } = await context.params;
    const body = await request.json();
    const input = validateInput(recordLeaveRequestEventSchema, {
      ...body,
      leaveRequestId,
    });
    const data = await recordLeaveRequestEvent(input);

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
          statusCode: 400,
        }),
      );
    }

    return toErrorResponse(error);
  }
}
