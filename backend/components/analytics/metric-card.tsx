type MetricCardProps = {
  label: string;
  value: string;
  tone?: "default" | "good" | "warning" | "critical";
};

const toneClasses = {
  critical:
    "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  default: "border-border bg-card text-card-foreground",
  good: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

export function MetricCard({ label, tone = "default", value }: MetricCardProps) {
  return (
    <div className={`rounded border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
