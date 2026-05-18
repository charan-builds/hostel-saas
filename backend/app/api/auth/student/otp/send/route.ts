import { type NextRequest } from "next/server";

import { AppError, toErrorResponse } from "@/lib/http/errors";
import { getRequestId } from "@/lib/http/request-context";
import { createRequestLogger } from "@/lib/logger";
import {
  enforceRequestRateLimit,
  enforceSameOriginRequest,
} from "@/lib/security/request-protection";
import { validateInput } from "@/lib/validation/zod";
import { sendStudentPhoneOtp } from "@/modules/auth/phone-auth.service";
import { studentPhoneOtpRequestSchema } from "@/modules/auth/schemas";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const log = createRequestLogger({
    event_type: "auth.student_phone_otp.request",
    request_id: requestId,
  });

  try {
    const originResponse = enforceSameOriginRequest(request, {
      requireOrigin: process.env.NODE_ENV === "production",
      requestId,
    });

    if (originResponse) {
      return originResponse;
    }

    const rateLimitResponse = await enforceRequestRateLimit(request, {
      keyPrefix: "auth:student-otp-send",
      limit: 20,
    });

    if (rateLimitResponse) {
      rateLimitResponse.headers.set("x-request-id", requestId);

      return rateLimitResponse;
    }

    const body = await request.json();
    const input = validateInput(studentPhoneOtpRequestSchema, {
      ...(body && typeof body === "object" && !Array.isArray(body) ? body : {}),
      requestId,
    });
    const data = await sendStudentPhoneOtp(input);

    log.info("Student OTP request accepted");

    return Response.json(
      {
        data: {
          phone: data.phone,
          sent: true,
        },
      },
      {
        headers: { "x-request-id": requestId },
        status: 202,
      },
    );
  } catch (error) {
    log.warn({ error }, "Student OTP request failed");

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
