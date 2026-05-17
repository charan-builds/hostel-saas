import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getIdempotencyKey, getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { recordInvoicePayment } from "@/modules/billing/billing.service";
import { recordInvoicePaymentSchema } from "@/modules/billing/schemas";

type InvoicePaymentRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function POST(
  request: Request,
  context: InvoicePaymentRouteContext,
) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "billing.payment.record",
    request_id: requestId,
  });

  try {
    const { invoiceId } = await context.params;
    const body = await request.json();
    const input = validateInput(recordInvoicePaymentSchema, {
      ...body,
      idempotencyKey: getIdempotencyKey(request) ?? body.idempotencyKey,
      invoiceId,
      requestId: body.requestId ?? requestId,
    });
    const data = await recordInvoicePayment(input);

    log.info(
      {
        idempotent: data.idempotent ?? false,
        invoice_id: invoiceId,
        payment_id: data.paymentId,
      },
      "Payment recorded",
    );

    return Response.json({ data }, {
      headers: { "x-request-id": requestId },
      status: data.idempotent ? 200 : 201,
    });
  } catch (error) {
    log.warn({ error }, "Payment recording request failed");

    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
          statusCode: 400,
        }),
        requestId,
      );
    }

    return toErrorResponse(error, requestId);
  }
}
