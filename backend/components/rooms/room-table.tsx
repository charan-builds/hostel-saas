import type { Route } from "next";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusChip } from "@/components/ui/status-chip";
import type { RoomListItem } from "@/modules/rooms/rooms.service";
import { formatCurrency } from "@/lib/utils";

type RoomTableProps = {
  rooms: RoomListItem[];
};

export function RoomTable({ rooms }: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        description="Try changing filters or create a new room."
        title="No rooms found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Room
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Occupancy
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Pricing
                </th>
                <th className="sticky right-0 bg-muted/70 px-4 py-3 text-xs font-semibold uppercase tracking-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rooms.map((room) => (
                <tr className="hover:bg-muted/50" key={room.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{room.room_code}</p>
                    <p className="text-muted-foreground">{room.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {room.room_type}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={room.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-40">
                      <div className="h-2 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full bg-success"
                          style={{ width: `${room.occupancy.occupancyRate}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {room.occupancy.occupiedBeds}/{room.occupancy.capacity} used
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(room.monthly_rate_cents, room.currency_code)}
                  </td>
                  <td className="sticky right-0 bg-card px-4 py-3">
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/rooms/${room.id}` as Route}>
                          <Eye aria-hidden="true" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/rooms/${room.id}/edit` as Route}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {rooms.map((room) => (
          <article
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
            key={room.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{room.room_code}</p>
                <p className="text-sm text-muted-foreground">{room.name}</p>
              </div>
              <StatusChip status={room.status} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Occupancy</dt>
                <dd className="font-medium">
                  {room.occupancy.occupiedBeds}/{room.occupancy.capacity}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Pricing</dt>
                <dd className="font-medium">
                  {formatCurrency(room.monthly_rate_cents, room.currency_code)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/rooms/${room.id}` as Route}>View</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/rooms/${room.id}/edit` as Route}>Edit</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
