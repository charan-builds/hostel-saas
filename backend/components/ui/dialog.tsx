"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogProps = {
  children: ReactNode;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute("disabled"));
}

function useDialogFocus(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement;
    const animationFrame = window.requestAnimationFrame(() => {
      const firstFocusable = containerRef.current
        ? getFocusableElements(containerRef.current)[0]
        : null;

      firstFocusable?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }

      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const focusable = getFocusableElements(containerRef.current);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", onKeyDown);

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, onOpenChange, open]);
}

export function Dialog({
  children,
  description,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useDialogFocus(open, onOpenChange, containerRef);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="dialog"
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-lg"
        ref={containerRef}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold" id={titleId}>{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

type SheetProps = DialogProps & {
  side?: "left" | "right";
};

export function Sheet({
  children,
  description,
  onOpenChange,
  open,
  side = "right",
  title,
}: SheetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useDialogFocus(open, onOpenChange, containerRef);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
    >
      <div
        className={cn(
          "fixed top-0 h-full w-[min(88vw,22rem)] border-border bg-popover p-4 text-popover-foreground shadow-xl",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
        )}
        ref={containerRef}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold" id={titleId}>{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close panel"
            onClick={() => onOpenChange(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
