import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import {
  softDeleteStudentSchema,
  updateStudentSchema,
} from "@/modules/students/schemas";
import {
  getStudent,
  softDeleteStudent,
  updateStudent,
} from "@/modules/students/students.service";

type StudentRouteContext = {
  params: Promise<{
    studentId: string;
  }>;
};

export async function GET(_request: NextRequest, context: StudentRouteContext) {
  try {
    const { studentId } = await context.params;
    const data = await getStudent(studentId);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: StudentRouteContext) {
  try {
    const { studentId } = await context.params;
    const input = validateInput(updateStudentSchema, {
      ...(await request.json()),
      studentId,
    });
    const data = await updateStudent(input);

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

export async function DELETE(request: NextRequest, context: StudentRouteContext) {
  try {
    const { studentId } = await context.params;
    const body = (await request.json()) as unknown;
    const input = validateInput(softDeleteStudentSchema, {
      ...(typeof body === "object" && body !== null ? body : {}),
      studentId,
    });

    await softDeleteStudent(input);

    return Response.json({ data: { studentId } });
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
