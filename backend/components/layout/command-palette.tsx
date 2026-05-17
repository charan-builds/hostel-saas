"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { NavigationGroup } from "@/components/layout/navigation";
import { Input } from "@/components/ui/input";

type CommandPaletteProps = {
  navigation: NavigationGroup[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CommandPalette({
  navigation,
  onOpenChange,
  open,
}: CommandPaletteProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => navigation.flatMap((group) => group.items),
    [navigation],
  );
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }

      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  useEffect(() => {
    onOpenChange(false);
  }, [onOpenChange, pathname]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 p-4"
      role="dialog"
    >
      <div className="mx-auto mt-16 w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
        <div className="flex items-center gap-3 border-b border-border p-3">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            className="border-0 bg-transparent shadow-none focus-visible:outline-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, modules, and workflows"
            value={query}
          />
          <Button
            aria-label="Close command palette"
            onClick={() => onOpenChange(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching workflow found.
            </p>
          ) : (
            filteredItems.map((item) => (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                href={item.href}
                key={item.href}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
