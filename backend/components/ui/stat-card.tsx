import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone = "default" | "info" | "success" | "warning" | "danger";

const toneClasses: Record<StatTone, string> = {
  danger: "bg-destructive/10 text-destructive",
  default: "bg-muted text-muted-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

type StatCardProps = {
  description?: string;
  href?: Route;
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone?: StatTone;
  value: string;
};

export function StatCard({
  description,
  href,
  icon: Icon,
  label,
  meta,
  tone = "default",
  value,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "h-full transition-colors",
        href ? "hover:border-primary/35 hover:bg-muted/60" : undefined,
      )}
    >
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-normal">{value}</p>
          </div>
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-md",
              toneClasses[tone],
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        {description || meta ? (
          <div className="mt-auto space-y-1">
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
            {meta ? <p className="text-xs font-medium text-foreground">{meta}</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      aria-label={`${label}: ${value}`}
      className="block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
      href={href}
    >
      {content}
    </Link>
  );
}
