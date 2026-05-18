import "server-only";

import { AppError } from "@/lib/http/errors";
import { serverEnv } from "@/lib/config/server-env";
import type { CashfreeEnvironment } from "@/lib/payments/providers/cashfree/types";

export type CashfreeConfig = {
  apiBaseUrl: string;
  apiVersion: "2025-01-01";
  appId: string;
  environment: CashfreeEnvironment;
  secretKey: string;
  webhookSecret: string;
};

export function getCashfreeConfig(): CashfreeConfig {
  const environment = serverEnv.CASHFREE_ENV ?? "sandbox";
  const appId = serverEnv.CASHFREE_APP_ID;
  const secretKey = serverEnv.CASHFREE_SECRET_KEY;
  const webhookSecret = serverEnv.CASHFREE_WEBHOOK_SECRET ?? secretKey;

  if (!appId || !secretKey || !webhookSecret) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      expose: false,
      message: "Cashfree is not configured.",
      statusCode: 500,
    });
  }

  return {
    apiBaseUrl:
      environment === "production"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg",
    apiVersion: "2025-01-01",
    appId,
    environment,
    secretKey,
    webhookSecret,
  };
}
