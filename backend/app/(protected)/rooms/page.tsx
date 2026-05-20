import type { Route } from "next";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";

import { ErpPage } from "@/components/layout/erp-page";
import { OccupancyCards } from "@/components/rooms/occupancy-cards";
import { RoomTable } from "@/components/rooms/room-table";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateInput } from "@/lib/validation/zod";
import { listRoomsQuerySchema } from "@/modules/rooms/schemas";
import { listRooms } from "@/modules/rooms/rooms.service";

type RoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "erp-control";

type BranchOption = {
  id: string;
  name: string;
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

async function listRoomBranches(organizationId: string | undefined) {
  if (!organizationId) {
    return [] satisfies BranchOption[];
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("hostel_branches")
    .select("id,name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return data ?? [];
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const context = await requireTenantPageAccess({
    permission: "room:read",
    product: "hostel_erp",
  });
  const query = validateInput(listRoomsQuerySchema, await searchParams);
  const [rooms, branches] = await Promise.all([
    listRooms(query),
    listRoomBranches(context.organizationId),
  ]);
  const branchById = new Map(branches.map((branch) => [branch.id, branch.name]));
  const selectedBranchName = query.hostelBranchId
    ? branchById.get(query.hostelBranchId)
    : undefined;
  const activeFilters = [
    query.q ? `Search: ${query.q}` : undefined,
    selectedBranchName ? `Branch: ${selectedBranchName}` : undefined,
    query.roomType ? `Type: ${query.roomType.replaceAll("_", " ")}` : undefined,
    query.status ? `Status: ${query.status}` : undefined,
  ].filter((value): value is string => Boolean(value));

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
      <ActionToolbar
        description="Use these operational views to spot rooms that need allocation or maintenance attention."
        title="Occupancy views"
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant={!query.status ? "default" : "outline"}>
            <Link href="/rooms">All rooms</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={query.status === "active" ? "default" : "outline"}
          >
            <Link href="/rooms?status=active">Active</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={query.status === "maintenance" ? "default" : "outline"}
          >
            <Link href="/rooms?status=maintenance">Maintenance</Link>
          </Button>
        </div>
      </ActionToolbar>
      <SectionCard
        contentClassName="space-y-4"
        description="Find rooms by branch, type, status, code, name, or floor."
        title="Room search"
      >
        <form action="/rooms">
          <SearchFilterBar
            actions={
              <>
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/rooms">Reset</Link>
                </Button>
              </>
            }
            defaultValue={query.q ?? ""}
            placeholder="Search by code, name, floor"
            surface="embedded"
          >
            <select
              aria-label="Filter rooms by branch"
              className={selectClassName}
              defaultValue={query.hostelBranchId ?? ""}
              name="hostelBranchId"
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <input
              className={selectClassName}
              defaultValue={query.roomType ?? ""}
              name="roomType"
              placeholder="Room type"
            />
            <select
              className={selectClassName}
              defaultValue={query.status ?? ""}
              name="status"
            >
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
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters</span>
            {activeFilters.map((filter) => (
              <span
                className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize"
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>
        ) : null}
      </SectionCard>
      <SectionCard
        contentClassName="space-y-4"
        description="Review capacity, vacancy, pricing, and bed workflows from one operational list."
        title="Room occupancy list"
      >
        <RoomTable rooms={rooms.data} />
      </SectionCard>
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
