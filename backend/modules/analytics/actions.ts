"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { validateInput } from "@/lib/validation/zod";
import { refreshAnalyticsSnapshot } from "@/modules/analytics/analytics.service";
import {
  refreshAnalyticsSnapshotSchema,
  reportExportSchema,
} from "@/modules/analytics/schemas";

export async function exportReportAction(formData: FormData) {
  const input = validateInput(reportExportSchema, Object.fromEntries(formData));
  const params = new URLSearchParams({
    endDate: input.endDate,
    format: input.format,
    limit: String(input.limit),
    reportType: input.reportType,
    startDate: input.startDate,
  });

  if (input.hostelBranchId) {
    params.set("hostelBranchId", input.hostelBranchId);
  }

  redirect(`/api/v1/reports/export?${params.toString()}`);
}

export async function refreshAnalyticsSnapshotAction(formData: FormData) {
  const input = validateInput(
    refreshAnalyticsSnapshotSchema,
    {
      ...Object.fromEntries(formData),
      requestId: randomUUID(),
    },
  );

  await refreshAnalyticsSnapshot(input);
  redirect("/analytics");
}
