import type { Route } from "next";
import Link from "next/link";

import { OccupancyCards } from "@/components/rooms/occupancy-cards";
import { RoomTable } from "@/components/rooms/room-table";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { listRoomsQuerySchema } from "@/modules/rooms/schemas";
import { listRooms } from "@/modules/rooms/rooms.service";

type RoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function roomsPageHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    roomType?: string | undefined;
    status?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.roomType) {
    params.set("roomType", query.roomType);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  return `/rooms?${params.toString()}` as Route;
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  await requireTenantPageAccess({
    permission: "room:read",
    product: "hostel_erp",
  });
  const query = validateInput(listRoomsQuerySchema, await searchParams);
  const rooms = await listRooms(query);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Rooms and beds</h2>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            href="/rooms/settings"
          >
            Settings
          </Link>
          <Link
            className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            href="/rooms/new"
          >
            Create room
          </Link>
        </div>
      </div>
      <OccupancyCards totals={rooms.totals} />
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_160px_120px]">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder="Search by code, name, floor"
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.roomType ?? ""}
          name="roomType"
          placeholder="Room type"
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.status ?? ""}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="maintenance">maintenance</option>
          <option value="unavailable">unavailable</option>
          <option value="inactive">inactive</option>
        </select>
        <button className="rounded border border-slate-300 px-3 py-2 font-medium" type="submit">
          Filter
        </button>
      </form>
      <RoomTable rooms={rooms.data} />
      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Page {rooms.page} of {rooms.pageCount}, {rooms.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Room pagination">
          {rooms.page > 1 ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={roomsPageHref(query, rooms.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Previous
            </span>
          )}
          {rooms.page < rooms.pageCount ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={roomsPageHref(query, rooms.page + 1)}
            >
              Next
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Next
            </span>
          )}
        </nav>
      </div>
    </section>
  );
}
