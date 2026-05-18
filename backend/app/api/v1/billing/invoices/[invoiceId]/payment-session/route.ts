import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getIdempotencyKey, getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { createInvoicePaymentSession } from "@/modules/billing/billing.service";
import { createPaymentSessionSchema } from "@/modules/billing/schemas";

type InvoicePaymentSessionRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

async function readOptionalJson(request: Request) {
  const body = await request.text();

  if (!body.trim()) {
    return {};
  }

  return JSON.parse(body);
}

export async function POST(
  request: NextRequest,
  context: InvoicePaymentSessionRouteContext,
) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "billing.payment_session.create",
    request_id: requestId,
  });

  try {
    const { invoiceId } = await context.params;
    const body = await readOptionalJson(request);
    const bodyObject =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};
    const input = validateInput(createPaymentSessionSchema, {
      ...bodyObject,
      idempotencyKey:
        getIdempotencyKey(request) ??
        (typeof bodyObject.idempotencyKey === "string"
          ? bodyObject.idempotencyKey
          : undefined),
      invoiceId,
      requestId:
        typeof bodyObject.requestId === "string" && bodyObject.requestId.trim()
          ? bodyObject.requestId
          : requestId,
    });
    const data = await createInvoicePaymentSession(input);

    log.info(
      {
        cashfree_order_id: data.orderId,
        invoice_id: invoiceId,
      },
      "Cashfree payment session created",
    );

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 201,
      },
    );
  } catch (error) {
    log.warn({ error }, "Cashfree payment session request failed");

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
