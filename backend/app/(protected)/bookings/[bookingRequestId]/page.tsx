import {
  CalendarDays,
  IndianRupee,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { BookingFollowUpPanel } from "@/components/bookings/booking-follow-up-panel";
import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import { getBookingRequest } from "@/modules/bookings/bookings.service";

type BookingDetailPageProps = {
  params: Promise<{
    bookingRequestId: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Flexible";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { bookingRequestId } = await params;
  const { booking, history, notes, payments } =
    await getBookingRequest(bookingRequestId);
  const paidAdvance = payments.find((payment) => payment.status === "succeeded");
  const latestNote = notes[0];

  return (
    <ErpPage>
      <PageHeader
        eyebrow="Booking request"
        title={`${fullName(booking.first_name, booking.last_name)} · ${booking.booking_code}`}
        description="Review lead context, follow-up notes, payment state, and admission handoff readiness."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/bookings">Back to bookings</Link>
            </Button>
            <Button asChild>
              <a href={`tel:${booking.phone}`}>Call lead</a>
            </Button>
          </>
        }
        meta={
          <>
            <StatusBadge status={booking.status} />
            <Badge variant="muted">{booking.source.replaceAll("_", " ")}</Badge>
            {booking.priority !== "normal" ? (
              <Badge variant="warning">{booking.priority}</Badge>
            ) : null}
          </>
        }
      />

      <ErpPageGrid>
        <StatCard
          icon={UserRound}
          label="Lead status"
          value={booking.status.replaceAll("_", " ")}
          meta={`Created ${formatDateTime(booking.created_at)}`}
        />
        <StatCard
          icon={CalendarDays}
          label="Move-in"
          value={formatDate(booking.move_in_date)}
          meta={`${booking.requested_bed_count} bed request`}
        />
        <StatCard
          icon={IndianRupee}
          label="Advance"
          tone={paidAdvance ? "success" : booking.advance_required ? "warning" : "default"}
          value={
            booking.advance_required
              ? formatCurrency(
                  booking.advance_amount_cents,
                  booking.advance_currency_code,
                )
              : "Not required"
          }
          meta={paidAdvance ? "Paid" : booking.advance_refundable ? "Refundable" : "Non-refundable"}
        />
        <StatCard
          icon={MessageSquareText}
          label="Follow-ups"
          value={String(notes.length)}
          meta={latestNote ? `Latest ${formatDateTime(latestNote.created_at)}` : "No notes yet"}
        />
      </ErpPageGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <SectionCard
            title="Lead information"
            description="Contact details and room interest captured from the public website."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Student</p>
                <p className="mt-1 font-semibold">
                  {fullName(booking.first_name, booking.last_name)}
                </p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <a
                    className="flex items-center gap-2 hover:text-primary"
                    href={`tel:${booking.phone}`}
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {booking.phone}
                  </a>
                  {booking.email ? (
                    <a
                      className="flex items-center gap-2 hover:text-primary"
                      href={`mailto:${booking.email}`}
                    >
                      <Mail className="size-4" aria-hidden="true" />
                      {booking.email}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Guardian</p>
                <p className="mt-1 font-semibold">
                  {booking.guardian_name ?? "Not provided"}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {booking.guardian_phone ?? "Guardian phone not provided"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Room interest</p>
                <p className="mt-1 font-semibold capitalize">
                  {booking.room_type?.replaceAll("_", " ") ?? "Any suitable room"}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Expected stay:{" "}
                  {booking.expected_stay_months
                    ? `${booking.expected_stay_months} months`
                    : "Not sure yet"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase text-muted-foreground">Last contact</p>
                <p className="mt-1 font-semibold">
                  {formatDateTime(booking.last_contacted_at)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Updated {formatDateTime(booking.updated_at)}
                </p>
              </div>
            </div>
            {booking.message ? (
              <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Visitor message</p>
                {booking.message}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Follow-up notes" description="Operational notes for callback and admission handoff.">
            {notes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                No notes have been added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div className="rounded-lg border border-border p-4" key={note.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant={note.note_type === "follow_up" ? "info" : "muted"}>
                        {note.note_type.replaceAll("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(note.created_at)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{note.body}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Follow-up actions" description="Keep lead movement explicit and auditable.">
            <BookingFollowUpPanel
              bookingRequestId={booking.id}
              currentStatus={booking.status}
            />
          </SectionCard>

          <SectionCard title="Payment state" description="Advance payment is finalized by verified webhook only.">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No advance payment records for this booking.
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div className="rounded-lg border border-border p-3" key={payment.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {formatCurrency(payment.amount_cents, payment.currency_code)}
                      </p>
                      <StatusBadge status={payment.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {payment.provider} · {formatDateTime(payment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Status history" description="Lead lifecycle events.">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status history yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div className="rounded-lg border border-border p-3" key={item.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.from_status ? <StatusBadge status={item.from_status} /> : null}
                      <span className="text-xs text-muted-foreground">to</span>
                      <StatusBadge status={item.to_status} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </aside>
      </div>
    </ErpPage>
  );
}
