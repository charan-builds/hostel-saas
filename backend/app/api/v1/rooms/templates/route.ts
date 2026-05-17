import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createRoomTemplateSchema } from "@/modules/rooms/schemas";
import { createRoomTemplate } from "@/modules/rooms/rooms.service";

export async function POST(request: Request) {
  try {
    const input = validateInput(createRoomTemplateSchema, await request.json());
    const data = await createRoomTemplate(input);

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
