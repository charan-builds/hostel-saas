import type { Route } from "next";
import Link from "next/link";

import type { RoomListItem } from "@/modules/rooms/rooms.service";

type RoomTableProps = {
  rooms: RoomListItem[];
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export function RoomTable({ rooms }: RoomTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Room</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Occupancy</th>
            <th className="px-4 py-3 font-medium">Pricing</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rooms.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                No rooms found.
              </td>
            </tr>
          ) : (
            rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{room.room_code}</p>
                  <p className="text-slate-600">{room.name}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{room.room_type}</td>
                <td className="px-4 py-3">
                  <span className="rounded border border-slate-200 px-2 py-1 text-xs font-medium">
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-40">
                    <div className="h-2 overflow-hidden rounded bg-slate-100">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${room.occupancy.occupancyRate}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {room.occupancy.occupiedBeds}/{room.occupancy.capacity} used
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatMoney(room.monthly_rate_cents, room.currency_code)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      className="font-medium text-slate-950 underline"
                      href={`/rooms/${room.id}` as Route}
                    >
                      View
                    </Link>
                    <Link
                      className="font-medium text-slate-950 underline"
                      href={`/rooms/${room.id}/edit` as Route}
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
