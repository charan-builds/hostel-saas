import { NextResponse, type NextRequest } from "next/server";

import {
  getAllowedOriginsForRequest,
  isAllowedRequestOrigin,
} from "@/lib/security/allowed-origins";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  logRejectedRequestOrigin,
  readRequestOrigin,
  readRequestUrlOrigin,
} from "@/lib/security/request-origin";

const MUTATION_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function makeSecurityResponse(request: NextRequest, status: number, message: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: {
          code: status === 429 ? "RATE_LIMITED" : "FORBIDDEN",
          message,
        },
      },
      { status },
    );
  }

  return new NextResponse(message, { status });
}

export function isMutationRequest(request: NextRequest) {
  return MUTATION_METHODS.has(request.method.toUpperCase());
}

export function enforceSameOriginRequest(
  request: NextRequest,
  options?: {
    requireOrigin?: boolean | undefined;
    requestId?: string | undefined;
  },
) {
  const requestOrigin = readRequestOrigin(request);
  const requestUrlOrigin = readRequestUrlOrigin(request) ?? undefined;
  const allowedOrigins = getAllowedOriginsForRequest({
    requestUrlOrigin,
  });

  if (!requestOrigin.origin) {
    if (!options?.requireOrigin && !requestOrigin.source) {
      return null;
    }

    logRejectedRequestOrigin({
      allowedOrigins,
      reason: requestOrigin.source ? "invalid_origin" : "missing_origin",
      request,
      requestId: options?.requestId,
      requestOrigin,
    });

    if (requestOrigin.source) {
      return makeSecurityResponse(
        request,
        403,
        "Mutation requests must include a valid same-origin Origin or Referer header.",
      );
    }

    if (options?.requireOrigin) {
      return makeSecurityResponse(
        request,
        403,
        "Mutation requests must include a same-origin Origin or Referer header.",
      );
    }

    return null;
  }

  if (isAllowedRequestOrigin(requestOrigin.origin, { requestUrlOrigin })) {
    return null;
  }

  logRejectedRequestOrigin({
    allowedOrigins,
    reason: "origin_not_allowed",
    request,
    requestId: options?.requestId,
    requestOrigin,
  });

  return makeSecurityResponse(
    request,
    403,
    "Cross-origin mutation requests are blocked. Configure NEXT_PUBLIC_APP_URL or ALLOWED_ORIGINS for trusted origins.",
  );
}

export async function enforceRequestRateLimit(
  request: NextRequest,
  options?: {
    limit?: number | undefined;
    keyPrefix?: string | undefined;
    windowMs?: number | undefined;
  },
) {
  const limit = options?.limit ?? 120;
  const windowMs = options?.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const key = [
    options?.keyPrefix ?? "request",
    getClientIp(request),
    request.method.toUpperCase(),
    request.nextUrl.pathname,
  ].join(":");
  const decision = await checkRateLimit({
    key,
    limit,
    windowMs,
  });

  if (decision.allowed) {
    return null;
  }

  const response = makeSecurityResponse(
    request,
    429,
    "Too many requests. Please retry shortly.",
  );

  response.headers.set("retry-after", String(decision.retryAfterSeconds ?? 1));
  response.headers.set("x-ratelimit-limit", String(decision.limit));
  response.headers.set("x-ratelimit-remaining", String(decision.remaining));
  response.headers.set("x-ratelimit-reset", String(Math.ceil(decision.resetAt / 1000)));

  return response;
}
