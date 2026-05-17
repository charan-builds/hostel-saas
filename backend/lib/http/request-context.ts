import { randomUUID } from "node:crypto";

import { type NextRequest } from "next/server";

export function getRequestId(request: Request | NextRequest) {
  return (
    request.headers.get("x-request-id") ??
    request.headers.get("x-correlation-id") ??
    randomUUID()
  );
}

export function getIdempotencyKey(request: Request | NextRequest) {
  return (
    request.headers.get("idempotency-key") ??
    request.headers.get("x-idempotency-key") ??
    undefined
  );
}
