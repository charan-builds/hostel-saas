"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { BookingStatusActions } from "@/components/bookings/booking-status-actions";
import { DataTable } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type BookingRequestRow = Database["public"]["Tables"]["booking_requests"]["Row"];

type BookingTableProps = {
  bookings: BookingRequestRow[];
};

function fullName(booking: BookingRequestRow) {
  return [booking.first_name, booking.last_name].filter(Boolean).join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Flexible";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function roomInterest(booking: BookingRequestRow) {
  return booking.room_type?.replaceAll("_", " ") ?? "Any suitable room";
}

function advanceLabel(booking: BookingRequestRow) {
  if (!booking.advance_required) {
    return "Not required";
  }

  return formatCurrency(
    booking.advance_amount_cents,
    booking.advance_currency_code,
  );
}

export function BookingTable({ bookings }: BookingTableProps) {
  const columns = useMemo<ColumnDef<BookingRequestRow>[]>(
    () => [
      {
        accessorKey: "booking_code",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Link
              className="font-semibold hover:text-primary"
              href={`/bookings/${row.original.id}`}
            >
              {row.original.booking_code}
            </Link>
            <div className="text-xs text-muted-foreground">
              {formatDate(row.original.created_at)}
            </div>
          </div>
        ),
        header: "Lead",
      },
      {
        accessorFn: fullName,
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{fullName(row.original)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <a
                className="inline-flex items-center gap-1 hover:text-primary"
                href={`tel:${row.original.phone}`}
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {row.original.phone}
              </a>
              {row.original.email ? (
                <a
                  className="inline-flex items-center gap-1 hover:text-primary"
                  href={`mailto:${row.original.email}`}
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  Email
                </a>
              ) : null}
            </div>
          </div>
        ),
        header: "Student",
      },
      {
        accessorKey: "room_type",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="capitalize">{roomInterest(row.original)}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.requested_bed_count} bed
              {row.original.requested_bed_count === 1 ? "" : "s"} requested
            </p>
          </div>
        ),
        header: "Room interest",
      },
      {
        accessorKey: "move_in_date",
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(row.original.move_in_date)}
          </div>
        ),
        header: "Move-in",
      },
      {
        accessorKey: "advance_amount_cents",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{advanceLabel(row.original)}</p>
            {row.original.advance_required ? (
              <p className="text-xs text-muted-foreground">
                {row.original.advance_refundable ? "Refundable" : "Non-refundable"}
              </p>
            ) : null}
          </div>
        ),
        header: "Advance",
      },
      {
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        header: "Status",
      },
      {
        cell: ({ row }) => (
          <div className="flex min-w-40 justify-end gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/bookings/${row.original.id}`}>Open</Link>
            </Button>
            <BookingStatusActions
              bookingRequestId={row.original.id}
              compact
              currentStatus={row.original.status}
            />
          </div>
        ),
        enableSorting: false,
        header: "Actions",
        id: "actions",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={bookings}
      emptyDescription="New public booking requests will appear here after visitors submit the booking form."
      emptyTitle="No booking requests"
      enablePagination={false}
      filterPlaceholder="Search current page"
      mobileCard={(booking) => (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                className="font-semibold hover:text-primary"
                href={`/bookings/${booking.id}`}
              >
                {fullName(booking)}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {booking.booking_code} · {formatDate(booking.created_at)}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="grid gap-3 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Room interest</p>
              <p className="capitalize">{roomInterest(booking)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Move-in</p>
                <p>{formatDate(booking.move_in_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Advance</p>
                <p>{advanceLabel(booking)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Badge variant="muted">{booking.requested_bed_count} bed request</Badge>
            <a
              className="text-sm font-medium text-primary"
              href={`tel:${booking.phone}`}
            >
              Call
            </a>
            {booking.email ? (
              <a
                className="text-sm font-medium text-primary"
                href={`mailto:${booking.email}`}
              >
                Email
              </a>
            ) : null}
            <Button asChild size="sm" variant="outline">
              <Link href={`/bookings/${booking.id}`}>Open</Link>
            </Button>
          </div>
        </div>
      )}
      pageSize={10}
      rowSelection={false}
      showToolbar={false}
      tableMinWidth="980px"
    />
  );
}
