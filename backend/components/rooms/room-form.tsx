import { Button } from "@/components/ui/button";
import { FormActions, FormSection } from "@/components/forms/form-section";
import { SectionCard } from "@/components/ui/section-card";
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

const fieldClassName =
  "erp-control w-full";

const textAreaClassName =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

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
      <form action={action} className="space-y-5">
        <input name="organizationId" type="hidden" value={organizationId} />
        {room ? <input name="roomId" type="hidden" value={room.id} /> : null}

        <FormSection
          description="These details identify the room across occupancy, billing, and student assignment workflows."
          title="Room identity"
        >
          <label className="space-y-1">
            <span className="text-sm font-medium">Room code</span>
            <input
              className={fieldClassName}
              defaultValue={room?.room_code}
              name="roomCode"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Room name</span>
            <input
              className={fieldClassName}
              defaultValue={room?.name}
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Hostel branch</span>
            <select
              className={fieldClassName}
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
              className={fieldClassName}
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
            <span className="text-sm font-medium">Legacy floor label</span>
            <input
              className={fieldClassName}
              defaultValue={room?.floor ?? ""}
              name="floor"
            />
          </label>
        </FormSection>

        <FormSection
          description="Template, category, room type, and status control how this room appears in daily operations."
          title="Operational setup"
        >
          <label className="space-y-1">
            <span className="text-sm font-medium">Template</span>
            <select
              className={fieldClassName}
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
              className={fieldClassName}
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
              className={fieldClassName}
              defaultValue={room?.room_type ?? "standard"}
              name="roomType"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className={fieldClassName}
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
            <span className="text-sm font-medium">Capacity</span>
            <input
              className={fieldClassName}
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
              className={textAreaClassName}
              name="bedLabels"
            />
            <span className="block text-xs text-muted-foreground">
              Optional comma or line-separated labels. Leave blank to use generated labels.
            </span>
          </label>
        </FormSection>

        <FormSection
          description="Pricing values feed rent-plan setup and room-level operational context."
          title="Pricing"
        >
          <label className="space-y-1">
            <span className="text-sm font-medium">Monthly rate cents</span>
            <input
              className={fieldClassName}
              defaultValue={room?.monthly_rate_cents ?? 0}
              min={0}
              name="monthlyRateCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Security deposit cents</span>
            <input
              className={fieldClassName}
              defaultValue={room?.security_deposit_cents ?? 0}
              min={0}
              name="securityDepositCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Currency</span>
            <input
              className={`${fieldClassName} uppercase`}
              defaultValue={room?.currency_code ?? "INR"}
              maxLength={3}
              minLength={3}
              name="currencyCode"
            />
          </label>
        </FormSection>

        <FormActions>
          <Button type="submit">
            {isEditing ? "Save room" : "Create room"}
          </Button>
        </FormActions>
      </form>
      {room ? (
        <SectionCard
          className="border-destructive/30"
          description="Soft delete this room only when it should no longer appear in operational room assignment workflows."
          title="Delete room"
        >
            <form action={softDeleteRoomAction} className="space-y-3">
              <input name="roomId" type="hidden" value={room.id} />
              <input name="organizationId" type="hidden" value={organizationId} />
              <input
                name="hostelBranchId"
                type="hidden"
                value={room.hostel_branch_id}
              />
              <Button type="submit" variant="destructive">
                Delete room
              </Button>
            </form>
        </SectionCard>
      ) : null}
    </div>
  );
}
