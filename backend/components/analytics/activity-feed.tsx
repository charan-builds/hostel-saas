import type { ActivityFeedRow } from "@/modules/analytics/analytics.service";

type ActivityFeedProps = {
  activity: ActivityFeedRow[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="font-medium">Recent operational activity</p>
      <div className="mt-4 divide-y divide-border">
        {activity.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No recent activity found.
          </p>
        ) : (
          activity.map((event) => (
            <div key={event.id} className="py-3">
              <p className="text-sm font-medium">{event.action}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(event.created_at)}
                {event.entity_table ? ` - ${event.entity_table}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
