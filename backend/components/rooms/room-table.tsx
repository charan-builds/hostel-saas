"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";

import { DataTable } from "@/components/data/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RoomListItem } from "@/modules/rooms/rooms.service";
import { formatCurrency } from "@/lib/utils";

type RoomTableProps = {
  rooms: RoomListItem[];
};

function roomRoute(roomId: string, suffix = "") {
  return `/rooms/${roomId}${suffix}` as Route;
}

function vacancyLabel(room: RoomListItem) {
  const { availableBeds, capacity, unavailableBeds } = room.occupancy;

  if (room.status !== "active") {
    return room.status.replaceAll("_", " ");
  }

  if (availableBeds > 0) {
    return `${availableBeds} vacant`;
  }

  if (unavailableBeds > 0) {
    return `${unavailableBeds} blocked`;
  }

  return capacity > 0 ? "Full" : "No beds";
}

function occupancyTone(room: RoomListItem) {
  if (room.status === "maintenance" || room.status === "unavailable") {
    return "bg-warning";
  }

  if (room.occupancy.availableBeds > 0) {
    return "bg-success";
  }

  return "bg-info";
}

function OccupancyMeter({ room }: { room: RoomListItem }) {
  const { availableBeds, capacity, occupiedBeds, occupancyRate, unavailableBeds } =
    room.occupancy;

  return (
    <div className="min-w-44">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium">{occupancyRate}% occupied</span>
        <span className="text-muted-foreground">
          {occupiedBeds}/{capacity}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded bg-muted">
        <div
          className="h-full bg-success"
          style={{ width: `${Math.min(occupancyRate, 100)}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{availableBeds} vacant</span>
        {unavailableBeds > 0 ? <span>{unavailableBeds} blocked</span> : null}
      </div>
    </div>
  );
}

function RoomActions({ room }: { room: RoomListItem }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={roomRoute(room.id)}>
          <Eye aria-hidden="true" />
          View beds
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={roomRoute(room.id, "/edit")}>
          <Pencil aria-hidden="true" />
          Edit
        </Link>
      </Button>
    </div>
  );
}

function RoomMobileCard({ room }: { room: RoomListItem }) {
  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link className="font-semibold hover:underline" href={roomRoute(room.id)}>
            {room.room_code}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{room.name}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>
      <div className="rounded-md border border-border bg-muted/40 p-3">
        <OccupancyMeter room={room} />
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="text-right font-medium">{room.room_type}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Vacancy</dt>
          <dd className="text-right font-medium">{vacancyLabel(room)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Pricing</dt>
          <dd className="text-right font-medium">
            {formatCurrency(room.monthly_rate_cents, room.currency_code)}
          </dd>
        </div>
      </dl>
      <div className="grid grid-cols-2 gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={roomRoute(room.id)}>View beds</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={roomRoute(room.id, "/edit")}>Edit</Link>
        </Button>
      </div>
    </article>
  );
}

export function RoomTable({ rooms }: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        description="Try changing filters or create a new room."
        title="No rooms found"
      />
    );
  }

  const columns: ColumnDef<RoomListItem>[] = [
    {
      accessorKey: "room_code",
      cell: ({ row }) => {
        const room = row.original;

        return (
          <div>
            <Link
              className="font-semibold text-foreground hover:underline"
              href={roomRoute(room.id)}
            >
              {room.room_code}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{room.name}</p>
          </div>
        );
      },
      header: "Room",
    },
    {
      accessorKey: "room_type",
      cell: ({ row }) => (
        <div>
          <p className="font-medium capitalize">
            {row.original.room_type.replaceAll("_", " ")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Capacity {row.original.capacity}</p>
        </div>
      ),
      header: "Type / capacity",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      header: "Status",
    },
    {
      cell: ({ row }) => <OccupancyMeter room={row.original} />,
      header: "Occupancy",
      id: "occupancy",
    },
    {
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${occupancyTone(row.original)}`} />
          <span className="font-medium">{vacancyLabel(row.original)}</span>
        </div>
      ),
      header: "Vacancy",
      id: "vacancy",
    },
    {
      accessorKey: "monthly_rate_cents",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {formatCurrency(row.original.monthly_rate_cents, row.original.currency_code)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">per month</p>
        </div>
      ),
      header: "Pricing",
    },
    {
      cell: ({ row }) => <RoomActions room={row.original} />,
      enableSorting: false,
      header: "Actions",
      id: "actions",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rooms}
      enablePagination={false}
      mobileCard={(room) => <RoomMobileCard room={room} />}
      rowSelection={false}
      showToolbar={false}
      tableMinWidth="1080px"
    />
  );
}
