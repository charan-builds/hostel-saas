import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFilterBarProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
};

export function SearchFilterBar({
  actions,
  children,
  className,
  defaultValue,
  name = "q",
  placeholder = "Search",
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            defaultValue={defaultValue}
            name={name}
            placeholder={placeholder}
            type="search"
          />
        </div>
        {children}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
