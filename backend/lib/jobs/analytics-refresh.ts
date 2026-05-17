import "server-only";

import { z } from "zod";

import { AppError } from "@/lib/http/errors";
import { createRequestLogger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const analyticsRefreshJobResultSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(["succeeded", "failed"]),
});

export type RunAnalyticsRefreshJobInput = {
  jobId: string;
  requestId?: string | undefined;
  workerId?: string | undefined;
};

export async function runAnalyticsRefreshJob(input: RunAnalyticsRefreshJobInput) {
  const logger = createRequestLogger({
    event_type: "analytics.snapshot.worker_run",
    request_id: input.requestId,
  });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("perform_analytics_refresh_job", {
    p_job_id: input.jobId,
    ...(input.workerId === undefined ? {} : { p_worker_id: input.workerId }),
  });

  if (error) {
    logger.error({ error, job_id: input.jobId }, "Analytics refresh job failed");

    throw new AppError({
      code: error.code === "55P03" ? "CONFLICT" : "INTERNAL_ERROR",
      details: error.code,
      expose: error.code === "55P03",
      message:
        error.code === "55P03"
          ? "Analytics refresh is already running."
          : "Analytics refresh worker failed.",
      statusCode: error.code === "55P03" ? 409 : 500,
    });
  }

  const parsed = analyticsRefreshJobResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message: "Analytics refresh worker returned an invalid response.",
      statusCode: 500,
    });
  }

  logger.info({ job_id: parsed.data.jobId, status: parsed.data.status }, "Analytics refresh job completed");

  return parsed.data;
}
