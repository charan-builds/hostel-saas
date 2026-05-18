import { Skeleton } from "@/components/ui/skeleton";

type LoadingSkeletonProps = {
  rows?: number;
};

export function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-32 rounded-lg" key={index} />
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton className="h-12 rounded-md" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
