import type { Route } from "next";
import Link from "next/link";
import { BedDouble, DoorOpen, IndianRupee, Wrench } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { BedGrid } from "@/components/rooms/bed-grid";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <ErpPage>
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href={`/rooms/${details.room.id}/edit` as Route}>Edit room</Link>
          </Button>
        }
        description="Review bed inventory, occupancy, status changes, and student transfer actions."
        eyebrow={details.room.room_code}
        meta={<StatusBadge status={details.room.status} />}
        title={details.room.name}
      />
      <ErpPageGrid>
        <StatCard
          icon={DoorOpen}
          label="Room type"
          value={details.room.room_type}
        />
        <StatCard
          icon={Wrench}
          label="Status"
          tone={details.room.status === "active" ? "success" : "warning"}
          value={details.room.status}
        />
        <StatCard
          icon={IndianRupee}
          label="Monthly rate"
          value={formatMoney(
            details.room.monthly_rate_cents,
            details.room.currency_code,
          )}
        />
        <StatCard
          icon={BedDouble}
          label="Deposit"
          value={formatMoney(
            details.room.security_deposit_cents,
            details.room.currency_code,
          )}
        />
      </ErpPageGrid>
      <BedGrid
        availableBeds={details.availableBeds}
        beds={details.beds}
        branchRooms={details.branchRooms}
        occupancy={details.occupancy}
        room={details.room}
      />
    </ErpPage>
  );
}
