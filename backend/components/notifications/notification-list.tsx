import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import {
  dismissNotificationAction,
  markNotificationReadAction,
} from "@/modules/notifications/actions";
import type { NotificationListItem } from "@/modules/notifications/notifications.service";

type NotificationListProps = {
  notifications: NotificationListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        description="Try changing the read-state filter or search term."
        title="No notifications found"
      />
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border p-4">
        <CardTitle className="text-base">Notification center</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {notifications.map((recipient) => {
          const notification = recipient.notification;

          return (
            <article
              className="grid gap-4 p-4 md:grid-cols-[1fr_auto]"
              key={recipient.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {notification?.title ?? "Notification unavailable"}
                  </p>
                  {!recipient.read_at ? (
                    <Badge variant="warning">Unread</Badge>
                  ) : null}
                  {notification?.severity ? (
                    <Badge variant="outline">{notification.severity}</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {notification?.body ?? "This notification is no longer available."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(recipient.created_at)} - {recipient.delivery_status}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                {notification?.action_url ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={notification.action_url as Route}>Open</Link>
                  </Button>
                ) : null}
                {!recipient.read_at ? (
                  <form action={markNotificationReadAction}>
                    <input name="recipientId" type="hidden" value={recipient.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Mark read
                    </Button>
                  </form>
                ) : null}
                <form action={dismissNotificationAction}>
                  <input name="recipientId" type="hidden" value={recipient.id} />
                  <Button size="sm" type="submit" variant="outline">
                    Dismiss
                  </Button>
                </form>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
