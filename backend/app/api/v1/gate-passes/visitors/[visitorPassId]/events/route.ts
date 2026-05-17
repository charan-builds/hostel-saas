import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { recordVisitorPassEvent } from "@/modules/presence/presence.service";
import { recordVisitorPassEventSchema } from "@/modules/presence/schemas";

type VisitorPassEventsRouteContext = {
  params: Promise<{
    visitorPassId: string;
  }>;
};

export async function POST(
  request: Request,
  context: VisitorPassEventsRouteContext,
) {
  try {
    const { visitorPassId } = await context.params;
    const body = await request.json();
    const input = validateInput(recordVisitorPassEventSchema, {
      ...body,
      visitorPassId,
    });
    const data = await recordVisitorPassEvent(input);

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
