import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createRoomSchema, listRoomsQuerySchema } from "@/modules/rooms/schemas";
import { createRoom, listRooms } from "@/modules/rooms/rooms.service";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      listRoomsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listRooms(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createRoomSchema, await request.json());
    const data = await createRoom(input);

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
