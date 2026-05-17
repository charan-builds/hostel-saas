import { RoomForm } from "@/components/rooms/room-form";
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
      <div>
        <p className="text-sm font-medium text-slate-500">
          {roomDetails.room.room_code}
        </p>
        <h2 className="text-2xl font-semibold">Edit {roomDetails.room.name}</h2>
      </div>
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
