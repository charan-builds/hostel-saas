"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type StudentDocumentUploadFormProps = {
  studentId: string;
};

type UploadUrlResponse = {
  data: {
    document: {
      id: string;
    };
    path: string;
    token: string;
  };
};

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readErrorMessage(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const error = value.error;

  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.message === "string" ? error.message : undefined;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(readErrorMessage(body) ?? "Document upload failed.");
  }

  return body as T;
}

export function StudentDocumentUploadForm({
  studentId,
}: StudentDocumentUploadFormProps) {
  const [message, setMessage] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose a document before uploading.");
      return;
    }

    if (typeof documentType !== "string") {
      setMessage("Choose a document type before uploading.");
      return;
    }

    setIsUploading(true);
    setMessage(undefined);

    try {
      const uploadUrlResponse = await fetch(
        `/api/v1/students/${studentId}/documents/upload-url`,
        {
          body: JSON.stringify({
            documentType,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        },
      );
      const uploadPayload = await parseJsonResponse<UploadUrlResponse>(
        uploadUrlResponse,
      );
      const supabase = createSupabaseBrowserClient();
      const uploadResult = await supabase.storage
        .from("student-documents")
        .uploadToSignedUrl(uploadPayload.data.path, uploadPayload.data.token, file, {
          contentType: file.type || "application/octet-stream",
        });

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

      const completeResponse = await fetch(
        `/api/v1/students/${studentId}/documents/${uploadPayload.data.document.id}/complete`,
        {
          method: "POST",
        },
      );
      await parseJsonResponse(completeResponse);

      form.reset();
      setMessage("Document uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Document upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload document</CardTitle>
        <CardDescription>
          Attach student identity, guardian, address, medical, or supporting records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-[180px_1fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-medium">Document type</span>
              <select className={selectClassName} name="documentType" required>
                <option value="id_proof">ID proof</option>
                <option value="address_proof">Address proof</option>
                <option value="guardian_id">Guardian ID</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">File</span>
              <Input
                accept="application/pdf,image/jpeg,image/png,image/webp"
                name="file"
                required
                type="file"
              />
            </label>
            <Button className="self-end" disabled={isUploading} type="submit">
              {isUploading ? "Uploading" : "Upload"}
            </Button>
          </div>
          {message ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
