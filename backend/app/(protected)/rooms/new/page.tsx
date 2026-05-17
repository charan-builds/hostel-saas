import { RoomForm } from "@/components/rooms/room-form";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { getRoomFormOptions } from "@/modules/rooms/rooms.service";

export default async function NewRoomPage() {
  await requireTenantPageAccess({
    permission: "room:manage",
    product: "hostel_erp",
  });
  const options = await getRoomFormOptions();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Rooms and beds</p>
        <h2 className="text-2xl font-semibold">Create room</h2>
      </div>
      <RoomForm
        branches={options.branches}
        categories={options.categories}
        floors={options.floors}
        organizationId={options.organizationId}
        templates={options.templates}
      />
    </section>
  );
}
