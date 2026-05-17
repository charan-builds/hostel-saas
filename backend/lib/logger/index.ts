import "server-only";

import pino from "pino";

import { serverEnv } from "@/lib/config/server-env";

export type LogContext = {
  actor_user_id?: string | null | undefined;
  branch_id?: string | null | undefined;
  error_code?: string | null | undefined;
  event_type?: string | undefined;
  request_id?: string | undefined;
  tenant_id?: string | null | undefined;
};

export const logger = pino({
  base: null,
  level: serverEnv.LOG_LEVEL,
  redact: {
    paths: [
      "authorization",
      "cookie",
      "password",
      "refresh_token",
      "token",
      "*.authorization",
      "*.cookie",
      "*.password",
      "*.refresh_token",
      "*.token",
    ],
    remove: true,
  },
});

export type Logger = typeof logger;

export function createRequestLogger(context: LogContext) {
  return logger.child({
    actor_user_id: context.actor_user_id ?? undefined,
    branch_id: context.branch_id ?? undefined,
    error_code: context.error_code ?? undefined,
    event_type: context.event_type,
    request_id: context.request_id,
    tenant_id: context.tenant_id ?? undefined,
  });
}
