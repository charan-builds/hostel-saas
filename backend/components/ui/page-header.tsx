import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
  title: string;
};

export function PageHeader({
  actions,
  className,
  description,
  eyebrow,
  meta,
  title,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
        {meta ? <div className="mt-3 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
