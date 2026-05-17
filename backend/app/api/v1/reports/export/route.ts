import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { exportReport } from "@/modules/analytics/analytics.service";
import { reportExportSchema } from "@/modules/analytics/schemas";

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "report.export",
    request_id: requestId,
  });

  try {
    const input = validateInput(
      reportExportSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const exportFile = await exportReport(input);

    log.info(
      {
        branch_id: input.hostelBranchId,
        format: input.format,
        report_type: input.reportType,
      },
      "Report export generated",
    );

    return new Response(exportFile.body, {
      headers: {
        "Content-Disposition": `attachment; filename="${exportFile.filename}"`,
        "Content-Type": exportFile.contentType,
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    log.warn({ error }, "Report export failed");

    return toErrorResponse(error, requestId);
  }
}
