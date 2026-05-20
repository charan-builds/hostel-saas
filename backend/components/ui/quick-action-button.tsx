import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickActionButtonProps = {
  description?: string;
  href: Route;
  icon: LucideIcon;
  label: string;
  tone?: "default" | "primary" | "success" | "warning";
};

const toneClasses = {
  default: "text-muted-foreground group-hover:text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function QuickActionButton({
  description,
  href,
  icon: Icon,
  label,
  tone = "default",
}: QuickActionButtonProps) {
  return (
    <Link
      className="group flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2"
      href={href}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-md bg-muted",
          toneClasses[tone],
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
