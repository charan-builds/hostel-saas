"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { BookingRequestStatus } from "@/types/domain";

type BookingStatusActionsProps = {
  bookingRequestId: string;
  compact?: boolean;
  currentStatus: string;
};

const nextActions: Partial<
  Record<
    BookingRequestStatus,
    Array<{
      label: string;
      status: BookingRequestStatus;
      variant?: "default" | "outline" | "secondary";
    }>
  >
> = {
  approved: [
    { label: "Reject", status: "rejected", variant: "outline" },
    { label: "Cancel", status: "cancelled", variant: "secondary" },
  ],
  contacted: [
    { label: "Approve", status: "approved" },
    { label: "Reject", status: "rejected", variant: "outline" },
  ],
  pending: [
    { label: "Mark contacted", status: "contacted", variant: "outline" },
    { label: "Approve", status: "approved" },
  ],
};

function isBookingStatus(status: string): status is BookingRequestStatus {
  return [
    "pending",
    "contacted",
    "approved",
    "rejected",
    "expired",
    "converted",
    "cancelled",
  ].includes(status);
}

export function BookingStatusActions({
  bookingRequestId,
  compact = false,
  currentStatus,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = isBookingStatus(currentStatus) ? nextActions[currentStatus] ?? [] : [];

  if (actions.length === 0) {
    return null;
  }

  function updateStatus(status: BookingRequestStatus) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/v1/bookings/${bookingRequestId}/status`, {
        body: JSON.stringify({ status }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setError(result?.error?.message ?? "Could not update booking status.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            disabled={isPending}
            key={action.status}
            onClick={() => updateStatus(action.status)}
            size="sm"
            variant={action.variant}
          >
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {compact ? action.label.replace("Mark ", "") : action.label}
          </Button>
        ))}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
