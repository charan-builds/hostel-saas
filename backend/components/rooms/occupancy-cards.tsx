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
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">Rooms</p>
        <p className="mt-2 text-2xl font-semibold">{totals.rooms}</p>
      </div>
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">Capacity</p>
        <p className="mt-2 text-2xl font-semibold">{totals.capacity}</p>
      </div>
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">Vacant beds</p>
        <p className="mt-2 text-2xl font-semibold">{totals.availableBeds}</p>
      </div>
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">Occupancy</p>
        <p className="mt-2 text-2xl font-semibold">{totals.occupancyRate}%</p>
      </div>
      <div className="rounded border border-slate-200 bg-white p-4 md:col-span-4">
        <div className="h-3 overflow-hidden rounded bg-slate-100">
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
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          {segments.map((segment) => (
            <span className="flex items-center gap-2" key={segment.label}>
              <span className={`h-2.5 w-2.5 rounded-full ${segment.className}`} />
              {segment.label}: {segment.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
