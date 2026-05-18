export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const STUDENT_DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type StudentDocumentMimeType =
  (typeof STUDENT_DOCUMENT_ALLOWED_MIME_TYPES)[number];

export type UploadVerificationErrorCode =
  | "invalid_mime"
  | "invalid_tenant_path"
  | "object_missing"
  | "oversized_upload"
  | "empty_upload";

export class UploadVerificationError extends Error {
  readonly code: UploadVerificationErrorCode;
  readonly details?: Record<string, unknown> | undefined;

  constructor(
    code: UploadVerificationErrorCode,
    message: string,
    details?: Record<string, unknown> | undefined,
  ) {
    super(message);
    this.name = "UploadVerificationError";
    this.code = code;
    this.details = details;
  }
}

export function isStudentDocumentMimeType(
  value: string | null | undefined,
): value is StudentDocumentMimeType {
  return STUDENT_DOCUMENT_ALLOWED_MIME_TYPES.includes(
    value as StudentDocumentMimeType,
  );
}

export function assertAllowedStudentDocumentMimeType(
  mimeType: string | null | undefined,
) {
  const normalizedMimeType = mimeType?.split(";")[0]?.trim().toLowerCase();

  if (!isStudentDocumentMimeType(normalizedMimeType)) {
    throw new UploadVerificationError(
      "invalid_mime",
      "Uploaded document MIME type is not allowed.",
      {
        allowedMimeTypes: STUDENT_DOCUMENT_ALLOWED_MIME_TYPES,
        mimeType: normalizedMimeType ?? null,
      },
    );
  }

  return normalizedMimeType;
}

export function assertStudentDocumentSize(sizeBytes: number | null | undefined) {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    throw new UploadVerificationError(
      "object_missing",
      "Uploaded document metadata is missing file size.",
    );
  }

  if (sizeBytes <= 0) {
    throw new UploadVerificationError(
      "empty_upload",
      "Uploaded document is empty.",
      { sizeBytes },
    );
  }

  if (sizeBytes > STUDENT_DOCUMENT_MAX_BYTES) {
    throw new UploadVerificationError(
      "oversized_upload",
      "Uploaded document exceeds the maximum allowed size.",
      {
        maxBytes: STUDENT_DOCUMENT_MAX_BYTES,
        sizeBytes,
      },
    );
  }

  return sizeBytes;
}

function hasUnsafePathSegment(pathSegment: string) {
  return pathSegment === "" || pathSegment === "." || pathSegment === "..";
}

export function assertStudentDocumentStoragePath({
  hostelBranchId,
  organizationId,
  storagePath,
  studentId,
}: {
  hostelBranchId: string;
  organizationId: string;
  storagePath: string;
  studentId: string;
}) {
  const segments = storagePath.split("/");
  const expectedPrefix = [organizationId, hostelBranchId, studentId];

  if (
    segments.length !== 4 ||
    segments.some(hasUnsafePathSegment) ||
    expectedPrefix.some((segment, index) => segments[index] !== segment)
  ) {
    throw new UploadVerificationError(
      "invalid_tenant_path",
      "Uploaded document path does not match the expected tenant scope.",
      {
        expectedPrefix: expectedPrefix.join("/"),
        storagePath,
      },
    );
  }

  return storagePath;
}
