"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  children?: ReactNode;
  confirmLabel?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function ConfirmDialog({
  children,
  confirmLabel = "Confirm",
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <Dialog
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className="space-y-5">
        {children}
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Dialog>
  );
}
