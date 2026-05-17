import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { addInvoiceAdjustment } from "@/modules/billing/billing.service";
import { addInvoiceAdjustmentSchema } from "@/modules/billing/schemas";

type InvoiceAdjustmentRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function POST(
  request: Request,
  context: InvoiceAdjustmentRouteContext,
) {
  try {
    const { invoiceId } = await context.params;
    const input = validateInput(addInvoiceAdjustmentSchema, {
      ...(await request.json()),
      invoiceId,
    });
    const data = await addInvoiceAdjustment(input);

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
