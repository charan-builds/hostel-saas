import {
  CalendarClock,
  CheckCircle2,
  Filter,
  RotateCcw,
  UsersRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { BookingTable } from "@/components/bookings/booking-table";
import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { listBookingRequests } from "@/modules/bookings/bookings.service";
import { listBookingsQuerySchema } from "@/modules/bookings/schemas";
import { BOOKING_REQUEST_STATUSES } from "@/types/domain";

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
  const currentStatus = getSearchValue(resolvedSearchParams, "status");
  const q = getSearchValue(resolvedSearchParams, "q");
  const query = listBookingsQuerySchema.parse({
    hostelBranchId: getSearchValue(resolvedSearchParams, "hostelBranchId"),
    limit: getSearchValue(resolvedSearchParams, "limit"),
    page: getSearchValue(resolvedSearchParams, "page"),
    q,
    status: currentStatus,
  });
  const bookings = await listBookingRequests(query);
  const rows = bookings.data;
  const pending = rows.filter((booking) => booking.status === "pending").length;
  const contacted = rows.filter((booking) => booking.status === "contacted").length;
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

  function hrefForPage(page: number): Route {
    const params = new URLSearchParams();

    if (query.q) {
      params.set("q", query.q);
    }

    if (query.status) {
      params.set("status", query.status);
    }

    if (query.hostelBranchId) {
      params.set("hostelBranchId", query.hostelBranchId);
    }

    params.set("page", String(page));

    return `/bookings?${params.toString()}` as Route;
  }

  return (
    <ErpPage>
      <PageHeader
        eyebrow="Public website"
        title="Bookings and enquiries"
        description="Track public booking requests from first enquiry to callback, approval, optional advance, and student admission handoff."
        actions={
          <Button asChild>
            <Link href="/book" target="_blank">
              Open public form
            </Link>
          </Button>
        }
      />

      <ErpPageGrid>
        <StatCard
          icon={CalendarClock}
          label="New requests"
          tone="warning"
          value={String(pending)}
          meta={`${contacted} contacted on this page`}
        />
        <StatCard
          icon={UsersRound}
          label="Total leads"
          value={String(bookings.count)}
          meta={`Page ${bookings.page} of ${bookings.pageCount}`}
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
      </ErpPageGrid>

      <ActionToolbar
        title="Lead follow-up queue"
        description="Use this queue for first contact, approval decisions, and conversion handoff. Filters apply server-side."
        actions={
          <Button asChild variant="outline">
            <Link href="/bookings">
              <RotateCcw aria-hidden="true" />
              Reset
            </Link>
          </Button>
        }
      >
        <form action="/bookings" className="w-full">
          <SearchFilterBar
            defaultValue={query.q ?? ""}
            placeholder="Search booking code, name, email, or phone"
            surface="embedded"
            actions={
              <Button type="submit">
                <Filter aria-hidden="true" />
                Apply
              </Button>
            }
          >
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              {BOOKING_REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </SearchFilterBar>
        </form>
        {query.q || query.status ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {query.q ? <Badge variant="muted">Search: {query.q}</Badge> : null}
            {query.status ? (
              <Badge variant="info">Status: {query.status.replaceAll("_", " ")}</Badge>
            ) : null}
          </div>
        ) : null}
      </ActionToolbar>

      <SectionCard
        title="Booking requests"
        description="Mobile cards keep callback actions visible for staff working from phones."
      >
        <BookingTable bookings={rows} />
        <div className="mt-4 border-t border-border pt-4">
          <PaginationControls
            count={bookings.count}
            hrefForPage={hrefForPage}
            itemLabel="booking requests"
            page={bookings.page}
            pageCount={bookings.pageCount}
          />
        </div>
      </SectionCard>
    </ErpPage>
  );
}
