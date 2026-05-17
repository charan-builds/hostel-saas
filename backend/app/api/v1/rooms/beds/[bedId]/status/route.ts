import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { updateRoomBedStatusSchema } from "@/modules/rooms/schemas";
import { updateRoomBedStatus } from "@/modules/rooms/rooms.service";

type BedStatusRouteContext = {
  params: Promise<{
    bedId: string;
  }>;
};

export async function PATCH(request: Request, context: BedStatusRouteContext) {
  try {
    const { bedId } = await context.params;
    const input = validateInput(updateRoomBedStatusSchema, {
      ...(await request.json()),
      bedId,
    });

    await updateRoomBedStatus(input);

    return Response.json({ data: { bedId } });
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
