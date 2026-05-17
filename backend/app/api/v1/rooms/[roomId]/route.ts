import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { softDeleteRoomSchema, updateRoomSchema } from "@/modules/rooms/schemas";
import { getRoom, softDeleteRoom, updateRoom } from "@/modules/rooms/rooms.service";

type RoomRouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function GET(_request: Request, context: RoomRouteContext) {
  try {
    const { roomId } = await context.params;
    const data = await getRoom(roomId);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RoomRouteContext) {
  try {
    const { roomId } = await context.params;
    const input = validateInput(updateRoomSchema, {
      ...(await request.json()),
      roomId,
    });
    const data = await updateRoom(input);

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

export async function DELETE(request: Request, context: RoomRouteContext) {
  try {
    const { roomId } = await context.params;
    const input = validateInput(softDeleteRoomSchema, {
      ...(await request.json()),
      roomId,
    });

    await softDeleteRoom(input);

    return Response.json({ data: { roomId } });
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
