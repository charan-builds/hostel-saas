import { RoomForm } from "@/components/rooms/room-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getRoom, getRoomFormOptions } from "@/modules/rooms/rooms.service";

type EditRoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  await requireTenantPageAccess({
    permission: "room:manage",
    product: "hostel_erp",
  });
  const { roomId } = await params;
  const roomDetails = await getRoom(roomId);
  const options = await getRoomFormOptions(roomDetails.room.hostel_branch_id);

  return (
    <section className="space-y-6">
      <PageHeader
        description="Adjust room metadata, capacity, pricing, and operational status."
        eyebrow={roomDetails.room.room_code}
        title={`Edit ${roomDetails.room.name}`}
      />
      <RoomForm
        branches={options.branches}
        categories={options.categories}
        floors={options.floors}
        organizationId={roomDetails.room.organization_id}
        room={roomDetails.room}
        templates={options.templates}
      />
    </section>
  );
}
