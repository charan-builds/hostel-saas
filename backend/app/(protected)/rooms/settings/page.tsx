import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/forms/form-section";
import { ErpPage } from "@/components/layout/erp-page";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import {
  createHostelBranchAction,
  createHostelFloorAction,
  createRoomTemplateAction,
} from "@/modules/rooms/actions";
import { getRoomFormOptions } from "@/modules/rooms/rooms.service";

const fieldClassName =
  "erp-control w-full";

export default async function RoomSettingsPage() {
  await requireTenantPageAccess({
    permission: "room:manage",
    product: "hostel_erp",
  });
  const options = await getRoomFormOptions();
  const selectedBranchId = options.branches[0]?.id ?? "";

  return (
    <ErpPage>
      <PageHeader
        description="Create branches, floors, and reusable room templates for dynamic hostel operations."
        eyebrow="Rooms and beds"
        title="Configuration"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          description="Branches define separate hostel locations under the same tenant."
          title="Create branch"
        >
          <form action={createHostelBranchAction} className="space-y-4">
            <input name="organizationId" type="hidden" value={options.organizationId} />
            <label className="space-y-1">
              <span className="text-sm font-medium">Branch name</span>
              <input
                className={fieldClassName}
                name="name"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Slug</span>
              <input
                className={fieldClassName}
                name="slug"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Timezone</span>
              <input
                className={fieldClassName}
                defaultValue="UTC"
                name="timezone"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Status</span>
              <select
                className={fieldClassName}
                defaultValue="active"
                name="status"
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <FormActions className="static mx-0 border-0 bg-transparent p-0">
              <Button type="submit">Create branch</Button>
            </FormActions>
          </form>
        </SectionCard>
        <SectionCard
          description="Floors help admins understand rooms spatially by branch."
          title="Create floor"
        >
        <form action={createHostelFloorAction} className="space-y-4">
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <label className="space-y-1">
            <span className="text-sm font-medium">Branch</span>
            <select
              className={fieldClassName}
              defaultValue={selectedBranchId}
              name="hostelBranchId"
              required
            >
              {options.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Floor code</span>
            <input
              className={fieldClassName}
              name="floorCode"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Floor name</span>
            <input
              className={fieldClassName}
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Sort order</span>
            <input
              className={fieldClassName}
              defaultValue={0}
              min={0}
              name="sortOrder"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className={fieldClassName}
              defaultValue="active"
              name="status"
            >
              <option value="active">active</option>
              <option value="maintenance">maintenance</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <FormActions className="static mx-0 border-0 bg-transparent p-0">
            <Button type="submit">Create floor</Button>
          </FormActions>
        </form>
        </SectionCard>
        <SectionCard
          description="Templates speed up room creation and standardize bed labels, capacity, and pricing."
          title="Create room template"
        >
        <form action={createRoomTemplateAction} className="space-y-4">
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <label className="space-y-1">
            <span className="text-sm font-medium">Branch</span>
            <select
              className={fieldClassName}
              defaultValue={selectedBranchId}
              name="hostelBranchId"
              required
            >
              {options.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Template name</span>
            <input
              className={fieldClassName}
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Slug</span>
            <input
              className={fieldClassName}
              name="slug"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Room type key</span>
            <input
              className={fieldClassName}
              name="roomTypeKey"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Default capacity</span>
            <input
              className={fieldClassName}
              defaultValue={1}
              min={1}
              name="defaultCapacity"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Monthly rate cents</span>
            <input
              className={fieldClassName}
              defaultValue={0}
              min={0}
              name="monthlyRateCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Security deposit cents</span>
            <input
              className={fieldClassName}
              defaultValue={0}
              min={0}
              name="securityDepositCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Currency</span>
            <input
              className={`${fieldClassName} uppercase`}
              defaultValue="INR"
              maxLength={3}
              minLength={3}
              name="currencyCode"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Bed label pattern</span>
            <input
              className={fieldClassName}
              defaultValue="{ROOM}-B{NN}"
              name="bedLabelPattern"
            />
          </label>
          <FormActions className="static mx-0 border-0 bg-transparent p-0">
            <Button type="submit">Create template</Button>
          </FormActions>
        </form>
        </SectionCard>
      </div>
    </ErpPage>
  );
}
