import "server-only";

import { randomUUID } from "node:crypto";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { buildOrIlikeFilter } from "@/lib/db/postgrest-filters";
import { AppError } from "@/lib/http/errors";
import { logger } from "@/lib/logger";
import { verifyStudentDocumentUpload } from "@/lib/storage/storage-verification";
import {
  STUDENT_DOCUMENT_BUCKET,
  UploadVerificationError,
} from "@/lib/storage/upload-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";
import type {
  AssignStudentBedInput,
  CompleteStudentDocumentUploadInput,
  CreateStudentDocumentUploadInput,
  CreateStudentInput,
  ListStudentsQuery,
  SoftDeleteStudentInput,
  UpdateStudentInput,
} from "@/modules/students/schemas";
import { z } from "zod";

const createStudentResultSchema = z.object({
  assignmentId: z.string().uuid().nullable(),
  studentCode: z.string(),
  studentId: z.string().uuid(),
});

const assignStudentResultSchema = z.object({
  assignmentId: z.string().uuid(),
});

type StudentRow = Awaited<ReturnType<typeof listStudents>>["data"][number];

function toGuardianInfo(input: CreateStudentInput | UpdateStudentInput): Json {
  return {
    email: input.guardianEmail ?? "",
    name: input.guardianName ?? "",
    phone: input.guardianPhone ?? "",
  };
}

function toEmergencyContact(input: CreateStudentInput | UpdateStudentInput): Json {
  return {
    name: input.emergencyContactName ?? "",
    phone: input.emergencyContactPhone ?? "",
  };
}

function requireOrganizationId(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required.",
      statusCode: 400,
    });
  }

  return organizationId;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "The selected bed or student code is already allocated.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: "The student, branch, room, or bed selection is invalid.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage students in this tenant.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    message: "Student operation failed.",
    statusCode: 500,
    expose: false,
  });
}

function toJsonObject(value: Json): { [key: string]: Json | undefined } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {};
}

function toSerializableJson(value: unknown): Json {
  try {
    return JSON.parse(JSON.stringify(value ?? {})) as Json;
  } catch {
    return {
      serialization_error: "Upload verification details were not JSON-safe.",
    };
  }
}

export async function listStudents(input: ListStudentsQuery) {
  const context = await requirePermission("student:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const from = (input.page - 1) * input.limit;
  const to = from + input.limit - 1;
  let query = supabase
    .from("students")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.hostelBranchId) {
    query = query.eq("hostel_branch_id", input.hostelBranchId);
  }

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.q) {
    const filter = buildOrIlikeFilter(
      ["student_code", "first_name", "last_name", "email"],
      input.q,
    );

    if (filter) {
      query = query.or(filter);
    }
  }

  const { count, data, error } = await query;

  if (error) {
    throw mapDatabaseError(error);
  }

  return {
    count: count ?? 0,
    data,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / input.limit)),
  };
}

export async function getStudent(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!data) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Student was not found.",
      statusCode: 404,
    });
  }

  await requirePermission("student:read", {
    hostelBranchId: data.hostel_branch_id,
    organizationId: data.organization_id,
    product: "hostel_erp",
  });

  return data;
}

export async function getStudentFormOptions() {
  const context = await requirePermission("student:manage", {
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const [branchesResult, roomsResult, bedsResult] = await Promise.all([
    supabase
      .from("hostel_branches")
      .select("id,name,slug")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name"),
    supabase
      .from("rooms")
      .select("id,hostel_branch_id,room_code,name")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("room_code"),
    supabase
      .from("room_beds")
      .select("id,hostel_branch_id,room_id,bed_code")
      .eq("organization_id", organizationId)
      .eq("status", "available")
      .is("deleted_at", null)
      .order("bed_code"),
  ]);

  if (branchesResult.error) {
    throw mapDatabaseError(branchesResult.error);
  }

  if (roomsResult.error) {
    throw mapDatabaseError(roomsResult.error);
  }

  if (bedsResult.error) {
    throw mapDatabaseError(bedsResult.error);
  }

  return {
    branches: branchesResult.data,
    beds: bedsResult.data,
    organizationId,
    rooms: roomsResult.data,
  };
}

export async function createStudent(input: CreateStudentInput) {
  const context = await requirePermission("student:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_student_with_assignment", {
    p_actor_user_id: context.identity.userId,
    p_admission_date: input.admissionDate,
    p_emergency_contact: toEmergencyContact(input),
    p_first_name: input.firstName,
    p_guardian_info: toGuardianInfo(input),
    p_hostel_branch_id: input.hostelBranchId,
    p_last_name: input.lastName,
    p_metadata: {},
    p_organization_id: organizationId,
    ...(input.bedId === undefined ? {} : { p_bed_id: input.bedId }),
    ...(input.dateOfBirth === undefined
      ? {}
      : { p_date_of_birth: input.dateOfBirth }),
    ...(input.email === undefined ? {} : { p_email: input.email }),
    ...(input.gender === undefined ? {} : { p_gender: input.gender }),
    ...(input.phone === undefined ? {} : { p_phone: input.phone }),
    ...(input.roomId === undefined ? {} : { p_room_id: input.roomId }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = createStudentResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Student creation returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function updateStudent(input: UpdateStudentInput) {
  const existing = await getStudent(input.studentId);
  const organizationId = input.organizationId ?? existing.organization_id;

  const context = await requirePermission("student:manage", {
    hostelBranchId: existing.hostel_branch_id,
    organizationId,
    product: "hostel_erp",
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .update({
      admission_date: input.admissionDate,
      date_of_birth: input.dateOfBirth ?? null,
      email: input.email ?? null,
      emergency_contact: toEmergencyContact(input),
      first_name: input.firstName,
      gender: input.gender ?? null,
      guardian_info: toGuardianInfo(input),
      last_name: input.lastName,
      phone: input.phone ?? null,
      status: input.status,
      updated_by: context.identity.userId,
    })
    .eq("id", input.studentId)
    .eq("organization_id", organizationId)
    .eq("hostel_branch_id", existing.hostel_branch_id)
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "student.update",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: input.studentId,
    entityTable: "students",
    hostelBranchId: existing.hostel_branch_id,
    organizationId,
  });

  return data;
}

export async function assignStudentBed(input: AssignStudentBedInput) {
  const context = await requirePermission("student:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("assign_student_bed", {
    p_actor_user_id: context.identity.userId,
    p_bed_id: input.bedId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_room_id: input.roomId,
    p_student_id: input.studentId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = assignStudentResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Student assignment returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function softDeleteStudent(input: SoftDeleteStudentInput) {
  const context = await requirePermission("student:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("soft_delete_student", {
    p_actor_user_id: context.identity.userId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_student_id: input.studentId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function createStudentDocumentUpload(
  studentId: string,
  input: CreateStudentDocumentUploadInput,
) {
  const student = await getStudent(studentId);
  const context = await requirePermission("student:document:upload", {
    hostelBranchId: student.hostel_branch_id,
    organizationId: student.organization_id,
    product: "hostel_erp",
  });
  const adminClient = createSupabaseAdminClient();
  const storagePath = [
    student.organization_id,
    student.hostel_branch_id,
    student.id,
    `${randomUUID()}-${sanitizeFileName(input.fileName)}`,
  ].join("/");
  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (uploadError) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Unable to create a document upload URL.",
      statusCode: 500,
      expose: false,
    });
  }

  const { data, error } = await adminClient
    .from("student_documents")
    .insert({
      created_by: context.identity.userId,
      document_type: input.documentType,
      file_name: input.fileName,
      hostel_branch_id: student.hostel_branch_id,
      mime_type: input.mimeType,
      organization_id: student.organization_id,
      size_bytes: input.sizeBytes,
      status: "pending",
      storage_bucket: STUDENT_DOCUMENT_BUCKET,
      storage_path: storagePath,
      student_id: student.id,
      uploaded_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "student_document.upload_url_created",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: data.id,
    entityTable: "student_documents",
    hostelBranchId: student.hostel_branch_id,
    organizationId: student.organization_id,
  });

  return {
    document: data,
    path: uploadData.path,
    signedUrl: uploadData.signedUrl,
    token: uploadData.token,
  };
}

export async function completeStudentDocumentUpload(
  input: CompleteStudentDocumentUploadInput,
) {
  const student = await getStudent(input.studentId);
  const context = await requirePermission("student:document:upload", {
    hostelBranchId: student.hostel_branch_id,
    organizationId: student.organization_id,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  const { data: document, error: documentError } = await supabase
    .from("student_documents")
    .select("*")
    .eq("id", input.documentId)
    .eq("student_id", student.id)
    .eq("organization_id", student.organization_id)
    .eq("hostel_branch_id", student.hostel_branch_id)
    .is("deleted_at", null)
    .single();

  if (documentError) {
    throw mapDatabaseError(documentError);
  }

  try {
    const verification = await verifyStudentDocumentUpload({
      bucket: document.storage_bucket,
      expectedMimeType: document.mime_type,
      expectedSizeBytes: document.size_bytes,
      hostelBranchId: student.hostel_branch_id,
      organizationId: student.organization_id,
      storagePath: document.storage_path,
      studentId: student.id,
      supabase: adminClient,
    });
    const checkedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("student_documents")
      .update({
        metadata: {
          ...toJsonObject(document.metadata),
          upload_verification: {
            checked_at: checkedAt,
            mime_type: verification.contentType,
            size_bytes: verification.sizeBytes,
            status: "passed",
          },
        },
        mime_type: verification.contentType,
        size_bytes: verification.sizeBytes,
        status: "uploaded",
        updated_by: context.identity.userId,
      })
      .eq("id", document.id)
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .eq("hostel_branch_id", student.hostel_branch_id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) {
      throw mapDatabaseError(error);
    }

    await recordAuditEvent({
      action: "student_document.upload_completed",
      actorUserId: context.identity.userId,
      durable: true,
      entityId: data.id,
      entityTable: "student_documents",
      hostelBranchId: student.hostel_branch_id,
      metadata: {
        mime_type: verification.contentType,
        size_bytes: verification.sizeBytes,
        storage_bucket: document.storage_bucket,
        storage_path: document.storage_path,
      },
      organizationId: student.organization_id,
    });

    return data;
  } catch (error) {
    if (!(error instanceof UploadVerificationError)) {
      throw error;
    }

    const checkedAt = new Date().toISOString();
    const verificationDetails = toSerializableJson(error.details);
    const { error: rejectionError } = await supabase
      .from("student_documents")
      .update({
        metadata: {
          ...toJsonObject(document.metadata),
          upload_verification: {
            checked_at: checkedAt,
            details: verificationDetails,
            error_code: error.code,
            message: error.message,
            status: "failed",
          },
        },
        status: "rejected",
        updated_by: context.identity.userId,
      })
      .eq("id", document.id)
      .eq("student_id", student.id)
      .eq("organization_id", student.organization_id)
      .eq("hostel_branch_id", student.hostel_branch_id)
      .is("deleted_at", null);

    if (rejectionError) {
      throw mapDatabaseError(rejectionError);
    }

    logger.warn(
      {
        actor_user_id: context.identity.userId,
        branch_id: student.hostel_branch_id,
        document_id: document.id,
        error_code: error.code,
        event_type: "student_document.upload_verification_failed",
        storage_bucket: document.storage_bucket,
        storage_path: document.storage_path,
        student_id: student.id,
        tenant_id: student.organization_id,
      },
      error.message,
    );

    await recordAuditEvent({
      action: "student_document.upload_verification_failed",
      actorUserId: context.identity.userId,
      durable: true,
      entityId: document.id,
      entityTable: "student_documents",
      hostelBranchId: student.hostel_branch_id,
      metadata: {
        error_code: error.code,
        storage_bucket: document.storage_bucket,
        storage_path: document.storage_path,
        verification_details: verificationDetails,
      },
      organizationId: student.organization_id,
    });

    throw new AppError({
      code: "VALIDATION_ERROR",
      details: { reason: error.code },
      message: "Uploaded document verification failed.",
      statusCode: 400,
    });
  }
}

export type StudentListRow = StudentRow;
