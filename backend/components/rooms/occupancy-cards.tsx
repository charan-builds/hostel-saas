import { BedDouble, DoorOpen, Gauge, Hotel } from "lucide-react";

import { ErpPageGrid } from "@/components/layout/erp-page";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

type OccupancyTotals = {
  availableBeds: number;
  capacity: number;
  occupiedBeds: number;
  occupancyRate: number;
  rooms: number;
  unavailableBeds: number;
};

type OccupancyCardsProps = {
  totals: OccupancyTotals;
};

export function OccupancyCards({ totals }: OccupancyCardsProps) {
  const segments = [
    {
      className: "bg-emerald-500",
      label: "Occupied",
      value: totals.occupiedBeds,
      width: totals.capacity > 0 ? (totals.occupiedBeds / totals.capacity) * 100 : 0,
    },
    {
      className: "bg-sky-500",
      label: "Vacant",
      value: totals.availableBeds,
      width: totals.capacity > 0 ? (totals.availableBeds / totals.capacity) * 100 : 0,
    },
    {
      className: "bg-amber-500",
      label: "Unavailable",
      value: totals.unavailableBeds,
      width:
        totals.capacity > 0 ? (totals.unavailableBeds / totals.capacity) * 100 : 0,
    },
  ];

  return (
    <div className="space-y-4">
      <ErpPageGrid>
      <StatCard icon={Hotel} label="Rooms" value={String(totals.rooms)} />
      <StatCard
        description={`${totals.occupiedBeds} occupied`}
        icon={BedDouble}
        label="Capacity"
        value={String(totals.capacity)}
      />
      <StatCard
        icon={DoorOpen}
        label="Vacant beds"
        tone="success"
        value={String(totals.availableBeds)}
      />
      <StatCard
        icon={Gauge}
        label="Occupancy"
        tone={totals.occupancyRate >= 90 ? "warning" : "info"}
        value={`${totals.occupancyRate}%`}
      />
      </ErpPageGrid>
      <SectionCard
        description="Occupied, vacant, and unavailable bed mix across the current room list."
        title="Occupancy distribution"
      >
        <div className="h-3 overflow-hidden rounded bg-muted">
          <div className="flex h-full">
            {segments.map((segment) => (
              <div
                className={segment.className}
                key={segment.label}
                style={{ width: `${segment.width}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {segments.map((segment) => (
            <span className="flex items-center gap-2" key={segment.label}>
              <span className={`h-2.5 w-2.5 rounded-full ${segment.className}`} />
              {segment.label}: {segment.value}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
