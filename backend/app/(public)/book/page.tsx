"use client";

import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarCheck, Phone, ShieldCheck } from "lucide-react";

import { PublicBookingForm } from "@/components/bookings/public-booking-form";
import { useTenantCMS } from "@/components/providers/tenant-provider";
import { Badge } from "@/components/ui/badge";

export default function BookPage() {
  const searchParams = useSearchParams();
  const selectedRoomId = searchParams.get("room");
  const { tenantScope, websiteConfig, publicContent } = useTenantCMS();
  
  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <Badge variant="info">Admission enquiry</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
              Request a hostel booking callback
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Share your room interest and move-in timeline. {websiteConfig.name} will
              confirm availability, pricing, and admission steps before collecting any
              payment.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["No instant payment", "Pay only after confirmation"],
                ["Fast callback", "Admissions team follows up"],
                ["Room interest saved", "Preference reaches admin inbox"],
              ].map(([title, description]) => (
                <div
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  key={title}
                >
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-lg">
            <p className="text-sm font-semibold">Need help before applying?</p>
            <div className="mt-4 space-y-3 text-sm">
              <a
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-muted"
                href={`tel:${websiteConfig.contact.phone}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Phone className="size-4" aria-hidden="true" />
                  Call hostel
                </span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="font-medium">{tenantScope?.branchName ?? websiteConfig.name}</p>
                <p className="mt-1 text-muted-foreground">
                  {websiteConfig.contact.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-14">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-normal">Booking enquiry</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep it simple. A hostel admin will verify room availability and call
                you with the next step.
              </p>
            </div>
            <Badge variant="outline">Callback first</Badge>
          </div>
          <PublicBookingForm
            roomTypes={publicContent.roomTypes}
            selectedRoomType={selectedRoomId}
            tenantName={websiteConfig.name}
            tenantScope={tenantScope}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">Room interests</h2>
            </div>
            <div className="mt-4 space-y-3">
              {publicContent.roomTypes.map((room) => (
                <div
                  className="rounded-lg border border-border bg-muted/30 p-4"
                  key={room.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{room.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {room.description}
                      </p>
                    </div>
                    <Badge variant={room.id === selectedRoomId ? "info" : "muted"}>
                      {room.capacity} beds
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {room.price}{" "}
                    <span className="font-normal text-muted-foreground">
                      {room.period}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>
                Your booking request is only a lead until a hostel admin confirms
                availability. Online advance payment should only happen from a verified
                payment link.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
