import { CalendarCheck, CalendarClock, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusChip } from "@/components/ui/status-chip";
import { formatCurrency } from "@/lib/utils";
import { listBookingRequests } from "@/modules/bookings/bookings.service";
import { listBookingsQuerySchema } from "@/modules/bookings/schemas";

type BookingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = listBookingsQuerySchema.parse({
    hostelBranchId: getSearchValue(resolvedSearchParams, "hostelBranchId"),
    limit: getSearchValue(resolvedSearchParams, "limit"),
    page: getSearchValue(resolvedSearchParams, "page"),
    q: getSearchValue(resolvedSearchParams, "q"),
    status: getSearchValue(resolvedSearchParams, "status"),
  });
  const bookings = await listBookingRequests(query);
  const rows = bookings.data;
  const pending = rows.filter((booking) => booking.status === "pending").length;
  const approved = rows.filter((booking) => booking.status === "approved").length;
  const rejected = rows.filter((booking) => booking.status === "rejected").length;
  const advanceCents = rows.reduce(
    (total, booking) =>
      total +
      (booking.advance_required && booking.status !== "cancelled"
        ? booking.advance_amount_cents
        : 0),
    0,
  );
  const currencyCode =
    rows.find((booking) => booking.advance_amount_cents > 0)
      ?.advance_currency_code ?? "INR";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public website"
        title="Bookings"
        description="Review public enquiries, follow up with prospects, collect optional advances, and convert approved bookings into students."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Pending"
          tone="warning"
          value={String(pending)}
        />
        <StatCard
          icon={CalendarCheck}
          label="Total enquiries"
          value={String(bookings.count)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          tone="success"
          value={String(approved)}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          tone="danger"
          value={String(rejected)}
          meta={`Advance pipeline ${formatCurrency(advanceCents, currencyCode)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent booking requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No booking requests match the current filters.
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-medium">Booking</th>
                  <th className="py-3 pr-4 font-medium">Guest</th>
                  <th className="py-3 pr-4 font-medium">Room preference</th>
                  <th className="py-3 pr-4 font-medium">Move-in</th>
                  <th className="py-3 pr-4 font-medium">Advance</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-3 pr-4 font-medium">{booking.booking_code}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">
                        {[booking.first_name, booking.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {booking.room_type?.replaceAll("_", " ") ?? "Any room"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {booking.move_in_date ?? "Flexible"}
                    </td>
                    <td className="py-3 pr-4">
                      {booking.advance_required
                        ? formatCurrency(
                            booking.advance_amount_cents,
                            booking.advance_currency_code,
                          )
                        : "Not required"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
