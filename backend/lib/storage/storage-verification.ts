import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertAllowedStudentDocumentMimeType,
  assertStudentDocumentSize,
  assertStudentDocumentStoragePath,
  STUDENT_DOCUMENT_BUCKET,
  UploadVerificationError,
} from "@/lib/storage/upload-validation";
import type { Database } from "@/types/database.types";

type VerifyStudentDocumentUploadInput = {
  bucket: string;
  expectedMimeType: string | null;
  expectedSizeBytes: number | null;
  hostelBranchId: string;
  organizationId: string;
  storagePath: string;
  studentId: string;
  supabase: SupabaseClient<Database>;
};

type StorageObjectInfo = {
  bucketId?: string | null | undefined;
  contentType?: string | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  size?: number | null | undefined;
};

function readMetadataMimeType(
  metadata: Record<string, unknown> | null | undefined,
) {
  const mimeType =
    metadata?.mimetype ?? metadata?.mimeType ?? metadata?.contentType;

  return typeof mimeType === "string" ? mimeType : undefined;
}

function readContentType(object: StorageObjectInfo) {
  return object.contentType ?? readMetadataMimeType(object.metadata) ?? null;
}

export async function verifyStudentDocumentUpload({
  bucket,
  expectedMimeType,
  expectedSizeBytes,
  hostelBranchId,
  organizationId,
  storagePath,
  studentId,
  supabase,
}: VerifyStudentDocumentUploadInput) {
  if (bucket !== STUDENT_DOCUMENT_BUCKET) {
    throw new UploadVerificationError(
      "invalid_tenant_path",
      "Uploaded document bucket is not allowed.",
      {
        bucket,
        expectedBucket: STUDENT_DOCUMENT_BUCKET,
      },
    );
  }

  assertStudentDocumentStoragePath({
    hostelBranchId,
    organizationId,
    storagePath,
    studentId,
  });

  const { data, error } = await supabase.storage.from(bucket).info(storagePath);

  if (error || !data) {
    throw new UploadVerificationError(
      "object_missing",
      "Uploaded document object was not found in storage.",
      {
        storageError: error?.message,
        storagePath,
      },
    );
  }

  const object = data as StorageObjectInfo;
  const sizeBytes = assertStudentDocumentSize(object.size);
  const mimeType = assertAllowedStudentDocumentMimeType(readContentType(object));
  const normalizedExpectedMimeType = expectedMimeType
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (normalizedExpectedMimeType && mimeType !== normalizedExpectedMimeType) {
    throw new UploadVerificationError(
      "invalid_mime",
      "Uploaded document MIME type does not match the signed upload request.",
      {
        expectedMimeType: normalizedExpectedMimeType,
        mimeType,
      },
    );
  }

  if (expectedSizeBytes && sizeBytes !== expectedSizeBytes) {
    throw new UploadVerificationError(
      sizeBytes > expectedSizeBytes ? "oversized_upload" : "object_missing",
      "Uploaded document size does not match the signed upload request.",
      {
        expectedSizeBytes,
        sizeBytes,
      },
    );
  }

  return {
    contentType: mimeType,
    sizeBytes,
  };
}
