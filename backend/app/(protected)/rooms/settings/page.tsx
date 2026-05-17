import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import {
  createHostelBranchAction,
  createHostelFloorAction,
  createRoomTemplateAction,
} from "@/modules/rooms/actions";
import { getRoomFormOptions } from "@/modules/rooms/rooms.service";

export default async function RoomSettingsPage() {
  await requireTenantPageAccess({
    permission: "room:manage",
    product: "hostel_erp",
  });
  const options = await getRoomFormOptions();
  const selectedBranchId = options.branches[0]?.id ?? "";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Rooms and beds</p>
        <h2 className="text-2xl font-semibold">Configuration</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <form
          action={createHostelBranchAction}
          className="grid gap-4 rounded border border-slate-200 bg-white p-6"
        >
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <h3 className="font-semibold">Create branch</h3>
          <label className="space-y-1">
            <span className="text-sm font-medium">Branch name</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="slug"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Timezone</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue="UTC"
              name="timezone"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue="active"
              name="status"
            >
              <option value="active">active</option>
              <option value="suspended">suspended</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Create branch
          </button>
        </form>
        <form
          action={createHostelFloorAction}
          className="grid gap-4 rounded border border-slate-200 bg-white p-6"
        >
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <h3 className="font-semibold">Create floor</h3>
          <label className="space-y-1">
            <span className="text-sm font-medium">Branch</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
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
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="floorCode"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Floor name</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Sort order</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={0}
              min={0}
              name="sortOrder"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue="active"
              name="status"
            >
              <option value="active">active</option>
              <option value="maintenance">maintenance</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Create floor
          </button>
        </form>
        <form
          action={createRoomTemplateAction}
          className="grid gap-4 rounded border border-slate-200 bg-white p-6"
        >
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <h3 className="font-semibold">Create room template</h3>
          <label className="space-y-1">
            <span className="text-sm font-medium">Branch</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
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
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="name"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="slug"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Room type key</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              name="roomTypeKey"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Default capacity</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={1}
              min={1}
              name="defaultCapacity"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Monthly rate cents</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={0}
              min={0}
              name="monthlyRateCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Security deposit cents</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue={0}
              min={0}
              name="securityDepositCents"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Currency</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 uppercase"
              defaultValue="INR"
              maxLength={3}
              minLength={3}
              name="currencyCode"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Bed label pattern</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              defaultValue="{ROOM}-B{NN}"
              name="bedLabelPattern"
            />
          </label>
          <button
            className="rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Create template
          </button>
        </form>
      </div>
    </section>
  );
}
