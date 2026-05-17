import { z } from "zod";

import { SAAS_PRODUCTS } from "@/types/domain";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/);

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const tenantBootstrapSchema = z.object({
  addressLine1: optionalTextSchema,
  adminEmail: z.string().trim().toLowerCase().email(),
  adminFullName: z.string().trim().min(2).max(160),
  adminPassword: z.string().min(12).max(256),
  city: optionalTextSchema,
  country: z.string().trim().min(2).max(80).default("India"),
  currency: z.string().trim().min(3).max(3).default("INR"),
  hostelName: z.string().trim().min(2).max(120),
  hostelSlug: slugSchema,
  locale: z.string().trim().min(2).max(16).default("en"),
  organizationName: z.string().trim().min(2).max(120),
  organizationSlug: slugSchema,
  postalCode: optionalTextSchema,
  product: z.enum(SAAS_PRODUCTS).default("hostel_erp"),
  state: optionalTextSchema,
  timezone: z.string().trim().min(2).max(80).default("Asia/Kolkata"),
});

export type TenantBootstrapInput = z.output<typeof tenantBootstrapSchema>;

export const tenantBootstrapApiSchema = tenantBootstrapSchema;
