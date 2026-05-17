"use client";

import { ErrorState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      action={<Button onClick={reset}>Retry</Button>}
      description="The workspace could not load. Retry the request or check tenant access."
      title="Workspace error"
    />
  );
}
