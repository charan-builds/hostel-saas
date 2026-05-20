import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionToolbarProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  title?: string;
};

export function ActionToolbar({
  actions,
  children,
  className,
  description,
  title,
}: ActionToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        ) : null}
        {children ? <div className={cn(title || description ? "mt-3" : undefined)}>{children}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
