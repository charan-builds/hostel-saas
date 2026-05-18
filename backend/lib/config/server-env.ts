import "server-only";

import { z } from "zod";

import { publicEnvSchema } from "@/lib/config/public-env";

const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CASHFREE_APP_ID: z.string().min(1).optional(),
  CASHFREE_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  CASHFREE_SECRET_KEY: z.string().min(1).optional(),
  CASHFREE_WEBHOOK_SECRET: z.string().min(1).optional(),
  AUTH_DEFAULT_PHONE_COUNTRY_CODE: z.string().min(2).max(8).default("+91"),
  DATABASE_URL: z.string().url().optional(),
  JOB_RUNNER_SECRET: z.string().min(24).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
  CASHFREE_ENV: process.env.CASHFREE_ENV,
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
  CASHFREE_WEBHOOK_SECRET: process.env.CASHFREE_WEBHOOK_SECRET,
  AUTH_DEFAULT_PHONE_COUNTRY_CODE: process.env.AUTH_DEFAULT_PHONE_COUNTRY_CODE,
  DATABASE_URL: process.env.DATABASE_URL,
  JOB_RUNNER_SECRET: process.env.JOB_RUNNER_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

if (!parsedServerEnv.success) {
  const errors = parsedServerEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid server environment variables: ${errors}`);
}

export const serverEnv = parsedServerEnv.data;

export type ServerEnv = z.infer<typeof serverEnvSchema>;
