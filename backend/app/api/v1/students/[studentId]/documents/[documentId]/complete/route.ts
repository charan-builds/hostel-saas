import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { completeStudentDocumentUploadSchema } from "@/modules/students/schemas";
import { completeStudentDocumentUpload } from "@/modules/students/students.service";

type CompleteStudentDocumentUploadRouteContext = {
  params: Promise<{
    documentId: string;
    studentId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: CompleteStudentDocumentUploadRouteContext,
) {
  try {
    const { documentId, studentId } = await context.params;
    const input = validateInput(completeStudentDocumentUploadSchema, {
      documentId,
      studentId,
    });
    const data = await completeStudentDocumentUpload(input);

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
