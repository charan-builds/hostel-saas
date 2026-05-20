import { BedDouble, CheckCircle, DoorOpen, Gauge } from "lucide-react";

import { ErpPageGrid } from "@/components/layout/erp-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
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

const fieldClassName =
  "erp-control w-full";

function bedStatusClass(status: string) {
  if (status === "occupied") {
    return "border-success/30 bg-success/10";
  }

  if (status === "available") {
    return "border-info/30 bg-info/10";
  }

  if (status === "reserved") {
    return "border-primary/30 bg-primary/10";
  }

  if (status === "maintenance" || status === "unavailable") {
    return "border-warning/30 bg-warning/10";
  }

  return "border-border bg-card";
}

const bedLegend = [
  { className: "bg-info", label: "Vacant" },
  { className: "bg-success", label: "Occupied" },
  { className: "bg-primary", label: "Reserved" },
  { className: "bg-warning", label: "Blocked" },
];

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
      <ErpPageGrid>
        <StatCard
          icon={BedDouble}
          label="Beds"
          value={String(occupancy.bedCount)}
        />
        <StatCard
          icon={CheckCircle}
          label="Occupied"
          tone="success"
          value={String(occupancy.occupiedBeds)}
        />
        <StatCard
          icon={DoorOpen}
          label="Vacant"
          tone="info"
          value={String(occupancy.availableBeds)}
        />
        <StatCard
          icon={Gauge}
          label="Occupancy"
          tone={occupancy.occupancyRate >= 90 ? "warning" : "default"}
          value={`${occupancy.occupancyRate}%`}
        />
      </ErpPageGrid>
      <SectionCard
        actions={
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {bedLegend.map((item) => (
              <span className="flex items-center gap-2" key={item.label}>
                <span className={`size-2.5 rounded-full ${item.className}`} />
                {item.label}
              </span>
            ))}
          </div>
        }
        description="Add beds manually for custom labels or adjust room capacity from the room form."
        title="Add bed"
      >
        <form
          action={createRoomBedAction}
          className="grid gap-4 md:grid-cols-[1fr_120px_160px_auto]"
        >
          <input name="roomId" type="hidden" value={room.id} />
          <input name="organizationId" type="hidden" value={room.organization_id} />
          <input name="hostelBranchId" type="hidden" value={room.hostel_branch_id} />
          <label className="space-y-1">
            <span className="text-sm font-medium">Bed code</span>
            <input
              className={fieldClassName}
              name="bedCode"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Order</span>
            <input
              className={fieldClassName}
              defaultValue={beds.length + 1}
              min={0}
              name="sortOrder"
              type="number"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              className={fieldClassName}
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
          <Button className="self-end" type="submit">
            Add bed
          </Button>
        </form>
      </SectionCard>
      <SectionCard
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        description="Each tile shows current bed state, occupant, and available operations."
        title="Bed occupancy map"
      >
        {beds.length === 0 ? (
          <EmptyState
            description="Add beds manually or adjust room capacity from the room form."
            title="No beds have been created"
          />
        ) : (
          beds.map((bed) => (
            <div
              className={`space-y-4 rounded-lg border p-4 shadow-sm ${bedStatusClass(bed.status)}`}
              key={bed.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{bed.bed_code}</p>
                  <div className="mt-1">
                    <StatusBadge status={bed.status} />
                  </div>
                </div>
                <span className="rounded bg-background/80 px-2 py-1 text-xs font-medium">
                  #{bed.sort_order}
                </span>
              </div>
              {bed.occupant ? (
                <div className="rounded-md border border-border bg-background/80 p-3 text-sm">
                  <p className="font-medium">
                    {bed.occupant.first_name} {bed.occupant.last_name}
                  </p>
                  <p className="text-muted-foreground">
                    {bed.occupant.student_code}
                  </p>
                </div>
              ) : null}
              {bed.activeAssignment && bed.occupant ? (
                <div className="space-y-3">
                  <details className="rounded bg-background/80 p-3">
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
                        className={fieldClassName}
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
                      <Input
                        name="transferReason"
                        placeholder="Reason"
                      />
                      <Button type="submit" variant="outline">
                        Transfer student
                      </Button>
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
                    <Input
                      name="reason"
                      placeholder="Unassign reason"
                    />
                    <Button type="submit" variant="outline">
                      Unassign
                    </Button>
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
                    className={fieldClassName}
                    defaultValue={bed.status}
                    name="status"
                  >
                    <option value="available">available</option>
                    <option value="reserved">reserved</option>
                    <option value="maintenance">maintenance</option>
                    <option value="unavailable">unavailable</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <Input
                    defaultValue={bed.status_reason ?? ""}
                    name="statusReason"
                    placeholder="Status reason"
                  />
                  <Button type="submit" variant="outline">
                    Update status
                  </Button>
                </form>
              )}
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}
