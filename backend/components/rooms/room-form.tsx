import type { Database } from "@/types/database.types";
import {
  createRoomAction,
  softDeleteRoomAction,
  updateRoomAction,
} from "@/modules/rooms/actions";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type BranchOption = Pick<
  Database["public"]["Tables"]["hostel_branches"]["Row"],
  "id" | "name" | "slug"
>;
type CategoryOption = Pick<
  Database["public"]["Tables"]["room_categories"]["Row"],
  "hostel_branch_id" | "id" | "name"
>;
type FloorOption = Pick<
  Database["public"]["Tables"]["hostel_floors"]["Row"],
  "floor_code" | "hostel_branch_id" | "id" | "name"
>;
type TemplateOption = Pick<
  Database["public"]["Tables"]["room_templates"]["Row"],
  "hostel_branch_id" | "id" | "name" | "room_type_key"
>;

type RoomFormProps = {
  branches: BranchOption[];
  categories: CategoryOption[];
  floors: FloorOption[];
  organizationId: string;
  room?: RoomRow;
  templates: TemplateOption[];
};

export function RoomForm({
  branches,
  categories,
  floors,
  organizationId,
  room,
  templates,
}: RoomFormProps) {
  const isEditing = Boolean(room);
  const selectedBranchId = room?.hostel_branch_id ?? branches[0]?.id ?? "";
  const action = isEditing ? updateRoomAction : createRoomAction;
  const branchCategories = categories.filter(
    (category) => category.hostel_branch_id === selectedBranchId,
  );
  const branchFloors = floors.filter(
    (floor) => floor.hostel_branch_id === selectedBranchId,
  );
  const branchTemplates = templates.filter(
    (template) => template.hostel_branch_id === selectedBranchId,
  );

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="grid gap-5 rounded border border-slate-200 bg-white p-6 md:grid-cols-2"
      >
        <input name="organizationId" type="hidden" value={organizationId} />
        {room ? <input name="roomId" type="hidden" value={room.id} /> : null}
        <label className="space-y-1">
          <span className="text-sm font-medium">Room code</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.room_code}
            name="roomCode"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Room name</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.name}
            name="name"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Hostel branch</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={selectedBranchId}
            name="hostelBranchId"
            required
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Floor</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.floor_id ?? ""}
            name="floorId"
          >
            <option value="">No floor</option>
            {branchFloors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.floor_code} - {floor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Template</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.template_id ?? ""}
            name="templateId"
          >
            <option value="">No template</option>
            {branchTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Category</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.category_id ?? ""}
            name="categoryId"
          >
            <option value="">No category</option>
            {branchCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Room type key</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.room_type ?? "standard"}
            name="roomType"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.status ?? "active"}
            name="status"
          >
            <option value="active">active</option>
            <option value="maintenance">maintenance</option>
            <option value="unavailable">unavailable</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Floor</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.floor ?? ""}
            name="floor"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Capacity</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.capacity ?? 1}
            min={1}
            name="capacity"
            required
            type="number"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Custom bed labels</span>
          <textarea
            className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
            name="bedLabels"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Monthly rate cents</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.monthly_rate_cents ?? 0}
            min={0}
            name="monthlyRateCents"
            type="number"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Security deposit cents</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={room?.security_deposit_cents ?? 0}
            min={0}
            name="securityDepositCents"
            type="number"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Currency</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2 uppercase"
            defaultValue={room?.currency_code ?? "INR"}
            maxLength={3}
            minLength={3}
            name="currencyCode"
          />
        </label>
        <div className="md:col-span-2">
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            {isEditing ? "Save room" : "Create room"}
          </button>
        </div>
      </form>
      {room ? (
        <form
          action={softDeleteRoomAction}
          className="rounded border border-red-200 bg-white p-6"
        >
          <input name="roomId" type="hidden" value={room.id} />
          <input name="organizationId" type="hidden" value={organizationId} />
          <input name="hostelBranchId" type="hidden" value={room.hostel_branch_id} />
          <button
            className="rounded border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
            type="submit"
          >
            Delete room
          </button>
        </form>
      ) : null}
    </div>
  );
}
