import { z } from "zod";

import { SAAS_PRODUCTS } from "@/types/domain";

export const tenantSelectionSchema = z.object({
  organizationId: z.string().uuid(),
  product: z.enum(SAAS_PRODUCTS).default("hostel_erp"),
});

export const tenantMembershipQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  product: z.enum(SAAS_PRODUCTS).default("hostel_erp"),
});

export const createTenantMembershipSchema = z.object({
  app: z.enum(SAAS_PRODUCTS).default("hostel_erp"),
  hostelBranchId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid(),
  role: z.enum(["admin", "student"]),
  userId: z.string().uuid(),
});
