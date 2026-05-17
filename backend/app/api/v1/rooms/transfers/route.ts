import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { transferStudentBedSchema } from "@/modules/rooms/schemas";
import { transferStudentBed } from "@/modules/rooms/rooms.service";

export async function POST(request: Request) {
  try {
    const input = validateInput(transferStudentBedSchema, await request.json());
    const data = await transferStudentBed(input);

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
