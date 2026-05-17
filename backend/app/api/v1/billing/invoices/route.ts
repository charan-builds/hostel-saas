import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { listInvoices } from "@/modules/billing/billing.service";
import { listInvoicesQuerySchema } from "@/modules/billing/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      listInvoicesQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listInvoices(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
