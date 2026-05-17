import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { reviewLeaveRequest } from "@/modules/presence/presence.service";
import { reviewLeaveRequestSchema } from "@/modules/presence/schemas";

type ReviewLeaveRouteContext = {
  params: Promise<{
    leaveRequestId: string;
  }>;
};

export async function POST(request: Request, context: ReviewLeaveRouteContext) {
  try {
    const { leaveRequestId } = await context.params;
    const body = await request.json();
    const input = validateInput(reviewLeaveRequestSchema, {
      ...body,
      leaveRequestId,
    });
    const data = await reviewLeaveRequest(input);

    return Response.json({ data });
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
