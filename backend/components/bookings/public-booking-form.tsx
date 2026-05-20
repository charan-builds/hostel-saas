"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RoomTypeOption = {
  capacity: number;
  description: string;
  id: string;
  period: string;
  price: string;
  title: string;
};

type TenantScope = {
  branchName: string;
  hostelBranchId: string;
  hostelBranchSlug: string;
  organizationId: string;
  organizationSlug: string;
} | null;

type SubmitState =
  | { message: string; status: "idle" }
  | { message: string; status: "error" }
  | { bookingCode?: string; message: string; status: "success" };

type PublicBookingFormProps = {
  roomTypes: readonly RoomTypeOption[];
  selectedRoomType?: string | null;
  tenantName: string;
  tenantScope: TenantScope;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function PublicBookingForm({
  roomTypes,
  selectedRoomType,
  tenantName,
  tenantScope,
}: PublicBookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmitState>({
    message: "Tell us what you need. The hostel team will confirm availability before admission.",
    status: "idle",
  });
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  async function handleSubmit(formData: FormData) {
    if (!tenantScope) {
      setState({
        message:
          "This hostel is not ready to accept online booking requests yet. Please call or WhatsApp the hostel directly.",
        status: "error",
      });
      return;
    }

    setIsPending(true);
    setState({
      message: "Submitting your booking request...",
      status: "idle",
    });

    const payload = {
      email: formValue(formData, "email") || undefined,
      expectedStayMonths: formValue(formData, "expectedStayMonths") || undefined,
      firstName: formValue(formData, "firstName"),
      guardianName: formValue(formData, "guardianName") || undefined,
      guardianPhone: formValue(formData, "guardianPhone") || undefined,
      hostelBranchId: tenantScope.hostelBranchId,
      lastName: formValue(formData, "lastName"),
      message: formValue(formData, "message") || undefined,
      moveInDate: formValue(formData, "moveInDate") || undefined,
      organizationId: tenantScope.organizationId,
      phone: formValue(formData, "phone"),
      requestedBedCount: formValue(formData, "requestedBedCount") || "1",
      roomType: formValue(formData, "roomType") || undefined,
      source: "public_website",
    };

    try {
      const response = await fetch("/api/public/bookings/contact", {
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as {
        data?: { bookingCode?: string };
        error?: { message?: string };
      };

      if (!response.ok) {
        setState({
          message:
            result.error?.message ??
            "We could not submit this booking request. Please try again or contact the hostel directly.",
          status: "error",
        });
        return;
      }

      const bookingCode = result.data?.bookingCode;
      setState({
        ...(bookingCode ? { bookingCode } : {}),
        message:
          "Booking request received. The hostel team will call you to confirm room availability and next steps.",
        status: "success",
      });
    } catch {
      setState({
        message:
          "Network error while submitting your booking request. Please try again or contact the hostel directly.",
        status: "error",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          state.status === "success" &&
            "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
          state.status === "error" &&
            "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
          state.status === "idle" &&
            "border-border bg-muted/40 text-muted-foreground",
        )}
        role={state.status === "error" ? "alert" : "status"}
      >
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            {state.message}
            {state.status === "success" && state.bookingCode ? (
              <span className="block pt-1 font-semibold">
                Reference: {state.bookingCode}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          First name
          <Input
            autoComplete="given-name"
            disabled={isPending}
            name="firstName"
            required
            placeholder="Student first name"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Last name
          <Input
            autoComplete="family-name"
            disabled={isPending}
            name="lastName"
            required
            placeholder="Student last name"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Phone number
          <Input
            autoComplete="tel"
            disabled={isPending}
            name="phone"
            required
            type="tel"
            placeholder="+91 98765 43210"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Email
          <Input
            autoComplete="email"
            disabled={isPending}
            name="email"
            type="email"
            placeholder="student@example.com"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Room interest
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={selectedRoomType ?? ""}
            disabled={isPending}
            name="roomType"
          >
            <option value="">Any suitable room</option>
            {roomTypes.map((room) => (
              <option key={room.id} value={room.id}>
                {room.title} · {room.price}/{room.period.replace("per ", "")}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Move-in date
          <Input disabled={isPending} name="moveInDate" type="date" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Beds needed
          <Input
            defaultValue="1"
            disabled={isPending}
            min={1}
            max={20}
            name="requestedBedCount"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Expected stay
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            name="expectedStayMonths"
            defaultValue=""
          >
            <option value="">Not sure yet</option>
            <option value="1">1 month</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Guardian name
          <Input
            autoComplete="name"
            disabled={isPending}
            name="guardianName"
            placeholder="Optional"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Guardian phone
          <Input
            autoComplete="tel"
            disabled={isPending}
            name="guardianPhone"
            placeholder="Optional"
            type="tel"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium">
        Notes for {tenantName}
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          name="message"
          placeholder="Tell us your preferred room, college/company, move-in timing, or questions."
        />
      </label>

      <Button
        className="h-11 w-full sm:w-auto"
        disabled={isPending || !tenantScope}
        type="submit"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Sending request
          </>
        ) : (
          "Request a callback"
        )}
      </Button>
    </form>
  );
}
