import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const studentStatusSchema = z.enum(["active", "inactive"]);

export const studentGenderSchema = z.enum([
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
]);

export const studentDocumentTypeSchema = z.enum([
  "id_proof",
  "address_proof",
  "guardian_id",
  "medical",
  "other",
]);
export const studentDocumentMimeTypeSchema = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(160).optional(),
);

const optionalUuidSchema = z.preprocess(
  emptyToUndefined,
  z.string().uuid().optional(),
);

const optionalEmailSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().toLowerCase().email().optional(),
);

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
);

export const listStudentsQuerySchema = z.object({
  hostelBranchId: optionalUuidSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, studentStatusSchema.optional()),
});

export const createStudentSchema = z.object({
  admissionDate: z
    .preprocess(emptyToUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
    .default(new Date().toISOString().slice(0, 10)),
  bedId: optionalUuidSchema,
  dateOfBirth: optionalDateSchema,
  email: optionalEmailSchema,
  emergencyContactName: optionalStringSchema,
  emergencyContactPhone: optionalStringSchema,
  firstName: z.string().trim().min(1).max(80),
  gender: z.preprocess(emptyToUndefined, studentGenderSchema.optional()),
  guardianEmail: optionalEmailSchema,
  guardianName: optionalStringSchema,
  guardianPhone: optionalStringSchema,
  hostelBranchId: z.string().uuid(),
  lastName: z.string().trim().min(1).max(80),
  organizationId: optionalUuidSchema,
  phone: optionalStringSchema,
  roomId: optionalUuidSchema,
});

export const updateStudentSchema = createStudentSchema
  .omit({
    bedId: true,
    roomId: true,
  })
  .extend({
    status: studentStatusSchema.default("active"),
    studentId: z.string().uuid(),
  });

export const assignStudentBedSchema = z.object({
  bedId: z.string().uuid(),
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  roomId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export const softDeleteStudentSchema = z.object({
  hostelBranchId: z.string().uuid(),
  organizationId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export const createStudentDocumentUploadSchema = z.object({
  documentType: studentDocumentTypeSchema,
  fileName: z.string().trim().min(1).max(255),
  mimeType: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(studentDocumentMimeTypeSchema),
  sizeBytes: z.coerce.number().int().min(1).max(10 * 1024 * 1024),
});

export const completeStudentDocumentUploadSchema = z.object({
  documentId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export type CreateStudentInput = z.output<typeof createStudentSchema>;
export type UpdateStudentInput = z.output<typeof updateStudentSchema>;
export type ListStudentsQuery = z.output<typeof listStudentsQuerySchema>;
export type AssignStudentBedInput = z.output<typeof assignStudentBedSchema>;
export type SoftDeleteStudentInput = z.output<typeof softDeleteStudentSchema>;
export type CreateStudentDocumentUploadInput = z.output<
  typeof createStudentDocumentUploadSchema
>;
export type CompleteStudentDocumentUploadInput = z.output<
  typeof completeStudentDocumentUploadSchema
>;
