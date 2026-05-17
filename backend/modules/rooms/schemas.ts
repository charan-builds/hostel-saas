import { z } from "zod";

import { BED_STATUSES, ROOM_STATUSES } from "@/types/domain";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(160).optional(),
);

const optionalUuidSchema = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

const optionalTextSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(500).optional(),
);

function splitBedLabels(value: unknown) {
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/);

export const roomTypeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9_-]{0,79}$/);
export const roomStatusSchema = z.enum(ROOM_STATUSES);
export const bedStatusSchema = z.enum(BED_STATUSES);
const manuallySettableBedStatusSchema = z.enum([
  "available",
  "reserved",
  "maintenance",
  "unavailable",
  "inactive",
]);

export const listRoomsQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  roomType: z.preprocess(emptyToUndefined, roomTypeSchema.optional()),
  status: z.preprocess(emptyToUndefined, roomStatusSchema.optional()),
});

const roomPricingShape = {
  currencyCode: z
    .preprocess(emptyToUndefined, z.string().trim().length(3).optional())
    .transform((value) => value?.toUpperCase() ?? "INR"),
  monthlyRateCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  securityDepositCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
};

export const createRoomSchema = z.object({
  bedLabels: z
    .preprocess(splitBedLabels, z.array(z.string().trim().min(1).max(40)).max(100))
    .default([]),
  capacity: z.coerce.number().int().min(1).max(100),
  categoryId: optionalUuidSchema,
  floor: optionalStringSchema,
  floorId: optionalUuidSchema,
  hostelBranchId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  organizationId: optionalUuidSchema,
  roomCode: z.string().trim().min(1).max(40),
  roomType: roomTypeSchema.default("standard"),
  status: roomStatusSchema.default("active"),
  templateId: optionalUuidSchema,
  ...roomPricingShape,
});

export const updateRoomSchema = createRoomSchema.extend({
  roomId: z.string().uuid(),
});

export const softDeleteRoomSchema = z.object({
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  roomId: z.string().uuid(),
});

export const createRoomBedSchema = z.object({
  bedCode: z.string().trim().min(1).max(40),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  roomId: z.string().uuid(),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  status: manuallySettableBedStatusSchema.default("available"),
});

export const updateRoomBedStatusSchema = z.object({
  bedId: z.string().uuid(),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  status: bedStatusSchema,
  statusReason: optionalTextSchema,
});

export const transferStudentBedSchema = z.object({
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  studentId: z.string().uuid(),
  targetBedId: z.string().uuid(),
  targetRoomId: optionalUuidSchema,
  transferReason: optionalTextSchema,
});

export const unassignStudentBedSchema = z.object({
  assignmentId: z.string().uuid(),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  reason: optionalTextSchema,
});

export const createHostelFloorSchema = z.object({
  floorCode: z.string().trim().min(1).max(40),
  hostelBranchId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  organizationId: z.string().uuid(),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
});

export const createHostelBranchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  organizationId: z.string().uuid(),
  slug: slugSchema,
  status: z.enum(["active", "suspended", "archived"]).default("active"),
  timezone: z.string().trim().min(1).max(80).default("UTC"),
});

export const createRoomTemplateSchema = z.object({
  bedLabelPattern: z.string().trim().min(1).max(80).default("{ROOM}-B{NN}"),
  defaultCapacity: z.coerce.number().int().min(1).max(100).default(1),
  description: optionalTextSchema,
  hostelBranchId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  organizationId: z.string().uuid(),
  roomTypeKey: roomTypeSchema,
  slug: slugSchema,
  ...roomPricingShape,
});

export type ListRoomsQuery = z.output<typeof listRoomsQuerySchema>;
export type CreateRoomInput = z.output<typeof createRoomSchema>;
export type UpdateRoomInput = z.output<typeof updateRoomSchema>;
export type SoftDeleteRoomInput = z.output<typeof softDeleteRoomSchema>;
export type CreateRoomBedInput = z.output<typeof createRoomBedSchema>;
export type UpdateRoomBedStatusInput = z.output<
  typeof updateRoomBedStatusSchema
>;
export type TransferStudentBedInput = z.output<typeof transferStudentBedSchema>;
export type UnassignStudentBedInput = z.output<typeof unassignStudentBedSchema>;
export type CreateHostelBranchInput = z.output<typeof createHostelBranchSchema>;
export type CreateHostelFloorInput = z.output<typeof createHostelFloorSchema>;
export type CreateRoomTemplateInput = z.output<typeof createRoomTemplateSchema>;
