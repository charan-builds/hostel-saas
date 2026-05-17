import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";

const MUTATION_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin) {
    return normalizeOrigin(origin);
  }

  const referer = request.headers.get("referer");

  return referer ? normalizeOrigin(referer) : null;
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
  allowedOrigins: readonly string[],
  options?: {
    requireOrigin?: boolean | undefined;
  },
) {
  const requestOrigin = getRequestOrigin(request);

  if (!requestOrigin) {
    if (options?.requireOrigin) {
      return makeSecurityResponse(
        request,
        403,
        "Mutation requests must include a same-origin Origin or Referer header.",
      );
    }

    return null;
  }

  const normalizedAllowedOrigins = allowedOrigins
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin));

  if (normalizedAllowedOrigins.includes(requestOrigin)) {
    return null;
  }

  return makeSecurityResponse(request, 403, "Cross-origin mutation requests are blocked.");
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
