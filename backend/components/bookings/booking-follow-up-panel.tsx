"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { BookingStatusActions } from "@/components/bookings/booking-status-actions";
import { Button } from "@/components/ui/button";

type BookingFollowUpPanelProps = {
  bookingRequestId: string;
  currentStatus: string;
};

export function BookingFollowUpPanel({
  bookingRequestId,
  currentStatus,
}: BookingFollowUpPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function addNote(formData: FormData) {
    const body = formData.get("body");

    if (typeof body !== "string" || body.trim().length === 0) {
      setMessage("Add a short follow-up note before saving.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/v1/bookings/${bookingRequestId}/notes`, {
        body: JSON.stringify({
          body: body.trim(),
          noteType: "follow_up",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setMessage(result?.error?.message ?? "Could not add follow-up note.");
        return;
      }

      formRef.current?.reset();
      setMessage("Follow-up note added.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Status actions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Move the lead through first contact, approval, or closure.
        </p>
        <div className="mt-3">
          <BookingStatusActions
            bookingRequestId={bookingRequestId}
            currentStatus={currentStatus}
          />
        </div>
      </div>

      <form ref={formRef} action={addNote} className="space-y-3">
        <label className="space-y-2 text-sm font-medium">
          Follow-up note
          <textarea
            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            name="body"
            placeholder="Call outcome, parent discussion, preferred move-in date, or admission blockers."
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            Add note
          </Button>
          {message ? (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
