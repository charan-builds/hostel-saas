import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import { validateInput } from "@/lib/validation/zod";
import { refreshAnalyticsSnapshot } from "@/modules/analytics/analytics.service";
import { refreshAnalyticsSnapshotSchema } from "@/modules/analytics/schemas";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "analytics.snapshot.refresh_requested",
    request_id: requestId,
  });

  try {
    const body = await request.json();
    const input = validateInput(
      refreshAnalyticsSnapshotSchema,
      {
        ...body,
        requestId: body.requestId ?? requestId,
      },
    );
    const data = await refreshAnalyticsSnapshot(input);

    log.info(
      {
        branch_id: data.hostelBranchId,
        job_id: data.jobId,
        status: data.status,
        tenant_id: data.organizationId,
      },
      "Analytics refresh job requested",
    );

    return Response.json(
      { data },
      {
        headers: { "x-request-id": requestId },
        status: 202,
      },
    );
  } catch (error) {
    log.warn({ error }, "Analytics refresh request failed");

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
