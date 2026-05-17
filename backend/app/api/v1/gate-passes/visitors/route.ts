import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createVisitorPass } from "@/modules/presence/presence.service";
import { createVisitorPassSchema } from "@/modules/presence/schemas";

export async function POST(request: Request) {
  try {
    const input = validateInput(createVisitorPassSchema, await request.json());
    const data = await createVisitorPass(input);

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
