import type { NextRequest } from "next/server";

import { normalizeOrigin } from "@/lib/security/allowed-origins";

export type RequestOrigin = {
  origin: string | null;
  rawValue: string | null;
  source: "origin" | "referer" | null;
};

export function readRequestOrigin(request: NextRequest): RequestOrigin {
  const origin = request.headers.get("origin");

  if (origin) {
    return {
      origin: normalizeOrigin(origin),
      rawValue: origin,
      source: "origin",
    };
  }

  const referer = request.headers.get("referer");

  if (referer) {
    return {
      origin: normalizeOrigin(referer),
      rawValue: referer,
      source: "referer",
    };
  }

  return {
    origin: null,
    rawValue: null,
    source: null,
  };
}

export function readRequestUrlOrigin(request: NextRequest) {
  return normalizeOrigin(request.nextUrl.origin);
}

export function logRejectedRequestOrigin({
  allowedOrigins,
  reason,
  request,
  requestId,
  requestOrigin,
}: {
  allowedOrigins: readonly string[];
  reason: "missing_origin" | "origin_not_allowed" | "invalid_origin";
  request: NextRequest;
  requestId?: string | undefined;
  requestOrigin: RequestOrigin;
}) {
  console.warn(
    JSON.stringify({
      allowed_origins: allowedOrigins,
      event_type: "security.origin_rejected",
      method: request.method,
      origin: requestOrigin.origin,
      origin_source: requestOrigin.source,
      path: request.nextUrl.pathname,
      reason,
      request_id: requestId,
    }),
  );
}

