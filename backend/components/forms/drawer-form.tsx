"use client";

import type { ReactNode } from "react";

import { Sheet } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DrawerFormProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function DrawerForm({
  children,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: DrawerFormProps) {
  return (
    <Sheet
      className="w-[min(94vw,32rem)]"
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      side="right"
      title={title}
    >
      <div className="flex min-h-[calc(100vh-6rem)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">{children}</div>
        {footer ? (
          <div
            className={cn(
              "sticky bottom-0 -mx-4 mt-5 border-t border-border bg-popover/95 px-4 py-3 backdrop-blur",
              "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
