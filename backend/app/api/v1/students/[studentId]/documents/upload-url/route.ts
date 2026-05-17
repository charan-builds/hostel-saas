import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { createStudentDocumentUploadSchema } from "@/modules/students/schemas";
import { createStudentDocumentUpload } from "@/modules/students/students.service";

type StudentDocumentUploadRouteContext = {
  params: Promise<{
    studentId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: StudentDocumentUploadRouteContext,
) {
  try {
    const { studentId } = await context.params;
    const input = validateInput(
      createStudentDocumentUploadSchema,
      await request.json(),
    );
    const data = await createStudentDocumentUpload(studentId, input);

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
