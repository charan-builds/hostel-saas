import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationListItem } from "@/modules/notifications/notifications.service";

type NotificationsDashboardWidgetProps = {
  notifications: NotificationListItem[];
  unreadCount: number;
};

export function NotificationsDashboardWidget({
  notifications,
  unreadCount,
}: NotificationsDashboardWidgetProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Unread notifications</p>
            <p className="mt-1 text-2xl font-semibold">{unreadCount}</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/notifications">View</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No unread notifications.
            </p>
          ) : (
            notifications.slice(0, 3).map((recipient) => (
              <div className="border-t border-border pt-3" key={recipient.id}>
                <p className="text-sm font-medium">
                  {recipient.notification?.title ?? "Notification unavailable"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {recipient.notification?.body ?? ""}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
