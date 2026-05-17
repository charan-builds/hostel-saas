import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { getReportData } from "@/modules/analytics/analytics.service";
import { reportQuerySchema } from "@/modules/analytics/schemas";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "report.preview",
    request_id: requestId,
  });

  try {
    const query = validateInput(
      reportQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await getReportData(query);

    log.info(
      {
        branch_id: query.hostelBranchId,
        report_type: query.reportType,
        row_count: data.reportRows.length,
      },
      "Report preview generated",
    );

    return Response.json({ data }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    log.warn({ error }, "Report preview failed");

    return toErrorResponse(error, requestId);
  }
}
