import type { Route } from "next";
import Link from "next/link";

import { BedGrid } from "@/components/rooms/bed-grid";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getRoom } from "@/modules/rooms/rooms.service";

type RoomDetailPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

function formatMoney(cents: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  await requireTenantPageAccess({
    permission: "room:read",
    product: "hostel_erp",
  });
  const { roomId } = await params;
  const details = await getRoom(roomId);

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {details.room.room_code}
          </p>
          <h2 className="text-2xl font-semibold">{details.room.name}</h2>
        </div>
        <Link
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
          href={`/rooms/${details.room.id}/edit` as Route}
        >
          Edit room
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Type</p>
          <p className="mt-2 font-semibold">{details.room.room_type}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <p className="mt-2 font-semibold">{details.room.status}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Monthly rate</p>
          <p className="mt-2 font-semibold">
            {formatMoney(details.room.monthly_rate_cents, details.room.currency_code)}
          </p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Deposit</p>
          <p className="mt-2 font-semibold">
            {formatMoney(
              details.room.security_deposit_cents,
              details.room.currency_code,
            )}
          </p>
        </div>
      </div>
      <BedGrid
        availableBeds={details.availableBeds}
        beds={details.beds}
        branchRooms={details.branchRooms}
        occupancy={details.occupancy}
        room={details.room}
      />
    </section>
  );
}
