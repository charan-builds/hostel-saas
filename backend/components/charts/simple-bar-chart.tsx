import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCompactNumber } from "@/lib/utils";

export type ChartItem = {
  label: string;
  tone?: "default" | "success" | "warning" | "critical" | "info";
  value: number;
};

type SimpleBarChartProps = {
  items: ChartItem[];
  title: string;
};

const TONE_CLASSES: Record<NonNullable<ChartItem["tone"]>, string> = {
  critical: "bg-red-500",
  default: "bg-primary",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

export function SimpleBarChart({ items, title }: SimpleBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{item.label}</span>
                <span className="font-medium">{formatCompactNumber(item.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  aria-label={`${item.label}: ${item.value}`}
                  className={cn(
                    "h-full rounded-full",
                    TONE_CLASSES[item.tone ?? "default"],
                  )}
                  role="img"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
