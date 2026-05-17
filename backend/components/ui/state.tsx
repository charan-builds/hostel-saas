"use client";

import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({ action, description, title }: StateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
        <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ action, description, title }: StateProps) {
  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function LoadingState({ description = "Loading workspace data." }: Pick<StateProps, "description">) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {description}
      </div>
    </div>
  );
}

export function RetryButton() {
  return (
    <Button onClick={() => window.location.reload()} variant="outline">
      Retry
    </Button>
  );
}
