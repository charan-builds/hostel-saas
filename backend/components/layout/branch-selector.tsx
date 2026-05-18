"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { ChevronDown, MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";

export type BranchOption = {
  id: string;
  label: string;
  organizationId: string;
  slug?: string | undefined;
};

type BranchSelectorProps = {
  branches: BranchOption[];
  className?: string;
  selectedBranchId?: string | undefined;
};

export function BranchSelector({
  branches,
  className = "hidden sm:block",
  selectedBranchId,
}: BranchSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBranchId = selectedBranchId ?? searchParams.get("hostelBranchId") ?? "all";
  const value = branches.some((branch) => branch.id === activeBranchId)
    ? activeBranchId
    : "all";

  if (branches.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <MapPinned
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        aria-label="Filter active branch"
        className="h-10 max-w-[13rem] appearance-none rounded-md border border-border bg-background py-2 pl-9 pr-8 text-sm shadow-sm"
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          const nextBranchId = event.currentTarget.value;

          if (nextBranchId === "all") {
            params.delete("hostelBranchId");
          } else {
            params.set("hostelBranchId", nextBranchId);
          }

          const query = params.toString();
          router.replace((query ? `${pathname}?${query}` : pathname) as Route);
        }}
      >
        <option value="all">All branches</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
