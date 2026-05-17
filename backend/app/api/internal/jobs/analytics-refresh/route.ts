import { randomUUID, timingSafeEqual } from "node:crypto";

import { type NextRequest } from "next/server";

import { serverEnv } from "@/lib/config/server-env";
import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { runAnalyticsRefreshJob } from "@/lib/jobs/analytics-refresh";
import { enforceRequestRateLimit } from "@/lib/security/request-protection";
import { validateInput } from "@/lib/validation/zod";
import { z } from "zod";

export const runtime = "nodejs";

const analyticsRefreshWorkerSchema = z.object({
  jobId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160).optional(),
});

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice("bearer ".length).trim();
}

function safeTokenEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function assertInternalJobRequest(request: NextRequest) {
  const expectedSecret = serverEnv.JOB_RUNNER_SECRET;

  if (!expectedSecret) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Internal job runner is not configured.",
      statusCode: 403,
    });
  }

  const providedSecret =
    request.headers.get("x-job-runner-secret") ?? getBearerToken(request);

  if (!providedSecret || !safeTokenEquals(providedSecret, expectedSecret)) {
    throw new AppError({
      code: "FORBIDDEN",
      message: "Internal job runner authorization failed.",
      statusCode: 403,
    });
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const rateLimitResponse = await enforceRequestRateLimit(request, {
    keyPrefix: "internal-job",
    limit: 60,
  });

  if (rateLimitResponse) {
    rateLimitResponse.headers.set("x-request-id", requestId);

    return rateLimitResponse;
  }

  try {
    assertInternalJobRequest(request);

    const input = validateInput(
      analyticsRefreshWorkerSchema,
      await request.json(),
    );
    const data = await runAnalyticsRefreshJob({
      jobId: input.jobId,
      requestId,
      workerId: input.workerId ?? `http-worker-${randomUUID()}`,
    });

    return Response.json(
      { data },
      {
        headers: {
          "x-request-id": requestId,
        },
      },
    );
  } catch (error) {
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
