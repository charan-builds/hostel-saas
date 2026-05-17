import { toErrorResponse } from "@/lib/http/errors";
import { getInvoice } from "@/modules/billing/billing.service";

type InvoiceRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_request: Request, context: InvoiceRouteContext) {
  try {
    const { invoiceId } = await context.params;
    const data = await getInvoice(invoiceId);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
