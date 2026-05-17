import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import {
  createGatePass,
  listGatePasses,
} from "@/modules/presence/presence.service";
import {
  createGatePassSchema,
  listGatePassesQuerySchema,
} from "@/modules/presence/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      listGatePassesQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listGatePasses(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateInput(createGatePassSchema, await request.json());
    const data = await createGatePass(input);

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
