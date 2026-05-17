import "server-only";

export const JOB_REGISTRY = {
  "analytics.refresh": {
    description: "Runs one queued analytics refresh job using the service-role RPC.",
    entrypoint: "/api/internal/jobs/analytics-refresh",
    runtime: "cron-or-worker",
  },
  "notifications.billing_reminders": {
    description: "Future worker for scheduled billing reminder delivery.",
    entrypoint: "planned",
    runtime: "cron-or-worker",
  },
  "presence.return_checks": {
    description: "Future worker for overdue leave and gate-pass return checks.",
    entrypoint: "planned",
    runtime: "cron-or-worker",
  },
} as const;

export type JobName = keyof typeof JOB_REGISTRY;
