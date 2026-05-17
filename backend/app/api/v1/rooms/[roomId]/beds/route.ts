import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createRoomBedSchema } from "@/modules/rooms/schemas";
import { createRoomBed } from "@/modules/rooms/rooms.service";

type RoomBedsRouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function POST(request: Request, context: RoomBedsRouteContext) {
  try {
    const { roomId } = await context.params;
    const input = validateInput(createRoomBedSchema, {
      ...(await request.json()),
      roomId,
    });
    const data = await createRoomBed(input);

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
