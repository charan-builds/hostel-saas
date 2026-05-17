import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { unassignStudentBedSchema } from "@/modules/rooms/schemas";
import { unassignStudentBed } from "@/modules/rooms/rooms.service";

type UnassignRouteContext = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export async function POST(request: Request, context: UnassignRouteContext) {
  try {
    const { assignmentId } = await context.params;
    const input = validateInput(unassignStudentBedSchema, {
      ...(await request.json()),
      assignmentId,
    });
    const data = await unassignStudentBed(input);

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
