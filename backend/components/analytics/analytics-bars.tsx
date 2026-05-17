type AnalyticsBarsProps = {
  items: Array<{
    label: string;
    value: number;
  }>;
  title: string;
};

export function AnalyticsBars({ items, title }: AnalyticsBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <p className="font-medium">{title}</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No records in this range.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium capitalize">
                  {item.label.replaceAll("_", " ")}
                </span>
                <span className="text-slate-500">{item.value}</span>
              </div>
              <div className="h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded bg-slate-950"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
