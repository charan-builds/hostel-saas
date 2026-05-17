import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import {
  createStudentSchema,
  listStudentsQuerySchema,
} from "@/modules/students/schemas";
import { createStudent, listStudents } from "@/modules/students/students.service";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      listStudentsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listStudents(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createStudentSchema, await request.json());
    const data = await createStudent(input);

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
