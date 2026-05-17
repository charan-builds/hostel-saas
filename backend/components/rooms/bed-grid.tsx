import type { Database } from "@/types/database.types";
import type { BedWithOccupant, RoomOccupancy } from "@/modules/rooms/rooms.service";
import {
  createRoomBedAction,
  transferStudentBedAction,
  unassignStudentBedAction,
  updateRoomBedStatusAction,
} from "@/modules/rooms/actions";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type AvailableBed = Database["public"]["Tables"]["room_beds"]["Row"];
type BranchRoom = Pick<
  Database["public"]["Tables"]["rooms"]["Row"],
  "hostel_branch_id" | "id" | "name" | "organization_id" | "room_code" | "status"
>;

type BedGridProps = {
  availableBeds: AvailableBed[];
  beds: BedWithOccupant[];
  branchRooms: BranchRoom[];
  occupancy: RoomOccupancy;
  room: RoomRow;
};

function bedStatusClass(status: string) {
  if (status === "occupied") {
    return "border-emerald-300 bg-emerald-50";
  }

  if (status === "available") {
    return "border-sky-300 bg-sky-50";
  }

  if (status === "reserved") {
    return "border-violet-300 bg-violet-50";
  }

  if (status === "maintenance" || status === "unavailable") {
    return "border-amber-300 bg-amber-50";
  }

  return "border-slate-200 bg-slate-50";
}

export function BedGrid({
  availableBeds,
  beds,
  branchRooms,
  occupancy,
  room,
}: BedGridProps) {
  const roomById = new Map(branchRooms.map((item) => [item.id, item]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Beds</p>
          <p className="mt-2 text-2xl font-semibold">{occupancy.bedCount}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Occupied</p>
          <p className="mt-2 text-2xl font-semibold">{occupancy.occupiedBeds}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Vacant</p>
          <p className="mt-2 text-2xl font-semibold">{occupancy.availableBeds}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-500">Occupancy</p>
          <p className="mt-2 text-2xl font-semibold">{occupancy.occupancyRate}%</p>
        </div>
      </div>
      <form
        action={createRoomBedAction}
        className="grid gap-4 rounded border border-slate-200 bg-white p-6 md:grid-cols-[1fr_120px_160px_auto]"
      >
        <input name="roomId" type="hidden" value={room.id} />
        <input name="organizationId" type="hidden" value={room.organization_id} />
        <input name="hostelBranchId" type="hidden" value={room.hostel_branch_id} />
        <label className="space-y-1">
          <span className="text-sm font-medium">Bed code</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="bedCode"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Order</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={beds.length + 1}
            min={0}
            name="sortOrder"
            type="number"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue="available"
            name="status"
          >
            <option value="available">available</option>
            <option value="reserved">reserved</option>
            <option value="maintenance">maintenance</option>
            <option value="unavailable">unavailable</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <button
          className="self-end rounded bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800"
          type="submit"
        >
          Add bed
        </button>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {beds.length === 0 ? (
          <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No beds have been created for this room.
          </div>
        ) : (
          beds.map((bed) => (
            <div
              className={`space-y-4 rounded border p-4 ${bedStatusClass(bed.status)}`}
              key={bed.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{bed.bed_code}</p>
                  <p className="text-sm text-slate-600">{bed.status}</p>
                </div>
                <span className="rounded bg-white/80 px-2 py-1 text-xs font-medium">
                  #{bed.sort_order}
                </span>
              </div>
              {bed.occupant ? (
                <div className="rounded bg-white/80 p-3 text-sm">
                  <p className="font-medium">
                    {bed.occupant.first_name} {bed.occupant.last_name}
                  </p>
                  <p className="text-slate-600">{bed.occupant.student_code}</p>
                </div>
              ) : null}
              {bed.activeAssignment && bed.occupant ? (
                <div className="space-y-3">
                  <details className="rounded bg-white/80 p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Transfer
                    </summary>
                    <form action={transferStudentBedAction} className="mt-3 space-y-3">
                      <input
                        name="organizationId"
                        type="hidden"
                        value={room.organization_id}
                      />
                      <input
                        name="hostelBranchId"
                        type="hidden"
                        value={room.hostel_branch_id}
                      />
                      <input name="studentId" type="hidden" value={bed.occupant.id} />
                      <input name="redirectRoomId" type="hidden" value={room.id} />
                      <select
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        name="targetBedId"
                        required
                      >
                        <option value="">Select available bed</option>
                        {availableBeds.map((availableBed) => {
                          const targetRoom = roomById.get(availableBed.room_id);

                          return (
                            <option key={availableBed.id} value={availableBed.id}>
                              {targetRoom?.room_code ?? "Room"} -{" "}
                              {availableBed.bed_code}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        name="transferReason"
                        placeholder="Reason"
                      />
                      <button
                        className="rounded border border-slate-300 px-3 py-2 font-medium"
                        type="submit"
                      >
                        Transfer student
                      </button>
                    </form>
                  </details>
                  <form action={unassignStudentBedAction} className="space-y-3">
                    <input
                      name="assignmentId"
                      type="hidden"
                      value={bed.activeAssignment.id}
                    />
                    <input
                      name="organizationId"
                      type="hidden"
                      value={room.organization_id}
                    />
                    <input
                      name="hostelBranchId"
                      type="hidden"
                      value={room.hostel_branch_id}
                    />
                    <input name="redirectRoomId" type="hidden" value={room.id} />
                    <input
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                      name="reason"
                      placeholder="Unassign reason"
                    />
                    <button
                      className="rounded border border-slate-300 bg-white px-3 py-2 font-medium"
                      type="submit"
                    >
                      Unassign
                    </button>
                  </form>
                </div>
              ) : (
                <form action={updateRoomBedStatusAction} className="space-y-3">
                  <input name="bedId" type="hidden" value={bed.id} />
                  <input
                    name="organizationId"
                    type="hidden"
                    value={room.organization_id}
                  />
                  <input
                    name="hostelBranchId"
                    type="hidden"
                    value={room.hostel_branch_id}
                  />
                  <input name="redirectRoomId" type="hidden" value={room.id} />
                  <select
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                    defaultValue={bed.status}
                    name="status"
                  >
                    <option value="available">available</option>
                    <option value="reserved">reserved</option>
                    <option value="maintenance">maintenance</option>
                    <option value="unavailable">unavailable</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <input
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                    defaultValue={bed.status_reason ?? ""}
                    name="statusReason"
                    placeholder="Status reason"
                  />
                  <button
                    className="rounded border border-slate-300 bg-white px-3 py-2 font-medium"
                    type="submit"
                  >
                    Update status
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
