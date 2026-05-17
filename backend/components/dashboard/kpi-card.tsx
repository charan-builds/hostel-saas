import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  description?: string;
  icon: LucideIcon;
  label: string;
  tone?: "default" | "success" | "warning" | "critical" | "info";
  value: string;
};

const TONE_CLASSES = {
  critical: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  default: "bg-muted text-muted-foreground",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function KpiCard({
  description,
  icon: Icon,
  label,
  tone = "default",
  value,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-32 items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal">{value}</p>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className={cn("rounded-md p-2", TONE_CLASSES[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
