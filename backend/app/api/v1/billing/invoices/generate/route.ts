import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { generateMonthlyInvoices } from "@/modules/billing/billing.service";
import { generateMonthlyInvoicesSchema } from "@/modules/billing/schemas";

export async function POST(request: Request) {
  try {
    const input = validateInput(
      generateMonthlyInvoicesSchema,
      await request.json(),
    );
    const data = await generateMonthlyInvoices(input);

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
