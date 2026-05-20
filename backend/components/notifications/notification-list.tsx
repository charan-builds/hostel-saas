import Link from "next/link";
import type { Route } from "next";
import { Bell, CheckCheck, ExternalLink, MailOpen, Trash2 } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  dismissNotificationAction,
  markNotificationReadAction,
} from "@/modules/notifications/actions";
import type { NotificationListItem } from "@/modules/notifications/notifications.service";

type NotificationListProps = {
  notifications: NotificationListItem[];
};

const severityVariant: Record<string, BadgeProps["variant"]> = {
  critical: "critical",
  info: "info",
  success: "success",
  warning: "warning",
};

const deliveryVariant: Record<string, BadgeProps["variant"]> = {
  failed: "critical",
  queued: "warning",
  sent: "success",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function NotificationActions({ recipient }: { recipient: NotificationListItem }) {
  const notification = recipient.notification;

  return (
    <div className="flex flex-wrap items-start gap-2">
      {notification?.action_url ? (
        <Button asChild size="sm" variant="outline">
          <Link href={notification.action_url as Route}>
            <ExternalLink aria-hidden="true" />
            Open
          </Link>
        </Button>
      ) : null}
      {!recipient.read_at ? (
        <form action={markNotificationReadAction}>
          <input name="recipientId" type="hidden" value={recipient.id} />
          <Button size="sm" type="submit" variant="outline">
            <MailOpen aria-hidden="true" />
            Mark read
          </Button>
        </form>
      ) : null}
      <form action={dismissNotificationAction}>
        <input name="recipientId" type="hidden" value={recipient.id} />
        <Button size="sm" type="submit" variant="outline">
          <Trash2 aria-hidden="true" />
          Dismiss
        </Button>
      </form>
    </div>
  );
}

function NotificationMobileCard({
  recipient,
}: {
  recipient: NotificationListItem;
}) {
  const notification = recipient.notification;

  return (
    <article className="space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-[var(--erp-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5">
            <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-semibold">
              {notification?.title ?? "Notification unavailable"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(recipient.created_at)}
          </p>
        </div>
        {!recipient.read_at ? (
          <Badge variant="warning">Unread</Badge>
        ) : (
          <Badge variant="success">
            <CheckCheck className="mr-1 size-3.5" aria-hidden="true" />
            Read
          </Badge>
        )}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {notification?.body ?? "This notification is no longer available."}
      </p>
      <div className="flex flex-wrap gap-2">
        {notification?.severity ? (
          <Badge variant={severityVariant[notification.severity] ?? "outline"}>
            {formatLabel(notification.severity)}
          </Badge>
        ) : null}
        {notification?.category ? (
          <Badge variant="outline">{formatLabel(notification.category)}</Badge>
        ) : null}
        <Badge variant={deliveryVariant[recipient.delivery_status] ?? "outline"}>
          {formatLabel(recipient.delivery_status)}
        </Badge>
      </div>
      <div className="border-t border-border pt-3">
        <NotificationActions recipient={recipient} />
      </div>
    </article>
  );
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
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {notifications.map((recipient) => (
          <NotificationMobileCard key={recipient.id} recipient={recipient} />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted/85 text-muted-foreground backdrop-blur">
              <tr>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Message</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Severity</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Read state</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Delivery</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Created</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.map((recipient) => {
                const notification = recipient.notification;

                return (
                  <tr className="align-top hover:bg-muted/50" key={recipient.id}>
                    <td className="max-w-md px-4 py-3">
                      <p className="font-semibold">
                        {notification?.title ?? "Notification unavailable"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-muted-foreground">
                        {notification?.body ?? "This notification is no longer available."}
                      </p>
                      {notification?.category ? (
                        <p className="mt-2 text-xs capitalize text-muted-foreground">
                          {formatLabel(notification.category)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {notification?.severity ? (
                        <Badge variant={severityVariant[notification.severity] ?? "outline"}>
                          {formatLabel(notification.severity)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!recipient.read_at ? (
                        <Badge variant="warning">Unread</Badge>
                      ) : (
                        <Badge variant="success">Read</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={recipient.delivery_status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(recipient.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <NotificationActions recipient={recipient} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
