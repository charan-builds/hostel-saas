import { RoomForm } from "@/components/rooms/room-form";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        description="Create a room, choose capacity, and let the system generate bed inventory from the configured setup."
        eyebrow="Rooms and beds"
        title="Create room"
      />
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
