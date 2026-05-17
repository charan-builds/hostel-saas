import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { voidBillingInvoice } from "@/modules/billing/billing.service";
import { voidBillingInvoiceSchema } from "@/modules/billing/schemas";

type InvoiceVoidRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function POST(request: Request, context: InvoiceVoidRouteContext) {
  try {
    const { invoiceId } = await context.params;
    const input = validateInput(voidBillingInvoiceSchema, {
      ...(await request.json()),
      invoiceId,
    });
    const data = await voidBillingInvoice(input);

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
