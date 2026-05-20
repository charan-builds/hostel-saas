import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ErpPageProps = {
  children: ReactNode;
  className?: string;
};

export function ErpPage({ children, className }: ErpPageProps) {
  return (
    <section className={cn("space-y-6 pb-10", className)}>
      {children}
    </section>
  );
}

type ErpPageGridProps = {
  children: ReactNode;
  className?: string;
  columns?: "two" | "three" | "four";
};

const gridColumns = {
  four: "md:grid-cols-2 xl:grid-cols-4",
  three: "md:grid-cols-2 xl:grid-cols-3",
  two: "lg:grid-cols-2",
};

export function ErpPageGrid({
  children,
  className,
  columns = "four",
}: ErpPageGridProps) {
  return (
    <div className={cn("grid gap-4", gridColumns[columns], className)}>
      {children}
    </div>
  );
}
