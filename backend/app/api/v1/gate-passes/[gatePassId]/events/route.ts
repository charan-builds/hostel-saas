import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { recordGatePassEvent } from "@/modules/presence/presence.service";
import { recordGatePassEventSchema } from "@/modules/presence/schemas";

type GatePassEventsRouteContext = {
  params: Promise<{
    gatePassId: string;
  }>;
};

export async function POST(
  request: Request,
  context: GatePassEventsRouteContext,
) {
  try {
    const { gatePassId } = await context.params;
    const body = await request.json();
    const input = validateInput(recordGatePassEventSchema, {
      ...body,
      gatePassId,
    });
    const data = await recordGatePassEvent(input);

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
