import type { Route } from "next";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";

import { ErpPage } from "@/components/layout/erp-page";
import { OccupancyCards } from "@/components/rooms/occupancy-cards";
import { RoomTable } from "@/components/rooms/room-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { listRoomsQuerySchema } from "@/modules/rooms/schemas";
import { listRooms } from "@/modules/rooms/rooms.service";

type RoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "erp-control";

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
    <ErpPage>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/rooms/settings">
                <Settings aria-hidden="true" />
                Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/rooms/new">
                <Plus aria-hidden="true" />
                Create room
              </Link>
            </Button>
          </>
        }
        description="Manage rooms, beds, capacity, pricing, and live occupancy by branch."
        eyebrow="Hostel ERP"
        title="Rooms and beds"
      />
      <OccupancyCards totals={rooms.totals} />
      <form action="/rooms">
        <SearchFilterBar
          defaultValue={query.q ?? ""}
          placeholder="Search by code, name, floor"
          actions={
            <Button type="submit" variant="outline">
              Apply filters
            </Button>
          }
        >
          <input
            className={selectClassName}
            defaultValue={query.roomType ?? ""}
            name="roomType"
            placeholder="Room type"
          />
          <select className={selectClassName} defaultValue={query.status ?? ""} name="status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className={selectClassName} defaultValue={String(query.limit)} name="limit">
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
          </select>
        </SearchFilterBar>
      </form>
      <RoomTable rooms={rooms.data} />
      <PaginationControls
        count={rooms.count}
        hrefForPage={(page) => roomsPageHref(query, page)}
        itemLabel="rooms"
        page={rooms.page}
        pageCount={rooms.pageCount}
      />
    </ErpPage>
  );
}
