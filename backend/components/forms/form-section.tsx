import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormSectionProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  id?: string;
  title: string;
};

export function FormSection({
  children,
  className,
  description,
  id,
  title,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm",
        className,
      )}
      id={id}
    >
      <div className="mb-5 max-w-2xl">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-6 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:bg-card sm:px-5",
        "flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
