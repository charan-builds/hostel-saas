import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUuidSchema = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const MAX_REPORT_DATE_RANGE_DAYS = 366;
export const MAX_REPORT_EXPORT_ROWS = 500;

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);

  return date.toISOString().slice(0, 10);
}

const baseDateRangeSchema = z.object({
  endDate: z.preprocess(emptyToUndefined, dateSchema.optional()).default(
    new Date().toISOString().slice(0, 10),
  ),
  hostelBranchId: optionalUuidSchema,
  startDate: z.preprocess(emptyToUndefined, dateSchema.optional()).default(
    dateDaysAgo(30),
  ),
});

function validateDateRange(
  value: { endDate: string; startDate: string },
  context: z.RefinementCtx,
) {
  if (value.startDate > value.endDate) {
    context.addIssue({
      code: "custom",
      message: "startDate must be before or equal to endDate.",
      path: ["startDate"],
    });
  }

  const start = Date.parse(`${value.startDate}T00:00:00.000Z`);
  const end = Date.parse(`${value.endDate}T00:00:00.000Z`);
  const days = Math.floor((end - start) / 86_400_000) + 1;

  if (days > MAX_REPORT_DATE_RANGE_DAYS) {
    context.addIssue({
      code: "custom",
      message: `Date range cannot exceed ${MAX_REPORT_DATE_RANGE_DAYS} days.`,
      path: ["endDate"],
    });
  }
}

export const dashboardQuerySchema = baseDateRangeSchema.superRefine(validateDateRange);

export const reportTypeSchema = z.enum([
  "revenue",
  "occupancy",
  "attendance",
  "leave",
  "collections",
  "visitors",
]);

export const reportFormatSchema = z.enum(["excel", "pdf"]);

export const reportQuerySchema = baseDateRangeSchema
  .extend({
    limit: z.coerce.number().int().min(1).max(MAX_REPORT_EXPORT_ROWS).default(100),
    reportType: z.preprocess(
      emptyToUndefined,
      reportTypeSchema.optional(),
    ).default("revenue"),
  })
  .superRefine(validateDateRange);

export const reportExportSchema = baseDateRangeSchema
  .extend({
    format: z.preprocess(
      emptyToUndefined,
      reportFormatSchema.optional(),
    ).default("excel"),
    limit: z.coerce.number().int().min(1).max(MAX_REPORT_EXPORT_ROWS).default(100),
    reportType: z.preprocess(
      emptyToUndefined,
      reportTypeSchema.optional(),
    ).default("revenue"),
  })
  .superRefine(validateDateRange);

export const refreshAnalyticsSnapshotSchema = z.object({
  hostelBranchId: optionalUuidSchema,
  organizationId: z.string().uuid(),
  requestId: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(8).max(160).optional(),
  ),
});

export type DashboardQuery = z.output<typeof dashboardQuerySchema>;
export type ReportQuery = z.output<typeof reportQuerySchema>;
export type ReportExportInput = z.output<typeof reportExportSchema>;
export type ReportType = z.output<typeof reportTypeSchema>;
export type ReportFormat = z.output<typeof reportFormatSchema>;
export type RefreshAnalyticsSnapshotInput = z.output<
  typeof refreshAnalyticsSnapshotSchema
>;
