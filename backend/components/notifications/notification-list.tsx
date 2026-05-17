import Link from "next/link";
import type { Route } from "next";

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
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <p className="font-medium">Notification center</p>
      </div>
      <div className="divide-y divide-slate-200">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No notifications found.</p>
        ) : (
          notifications.map((recipient) => {
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
                      <span className="rounded border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        unread
                      </span>
                    ) : null}
                    {notification?.severity ? (
                      <span className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium">
                        {notification.severity}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {notification?.body ?? "This notification is no longer available."}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(recipient.created_at)} - {recipient.delivery_status}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {notification?.action_url ? (
                    <Link
                      className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
                      href={notification.action_url as Route}
                    >
                      Open
                    </Link>
                  ) : null}
                  {!recipient.read_at ? (
                    <form action={markNotificationReadAction}>
                      <input name="recipientId" type="hidden" value={recipient.id} />
                      <button
                        className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
                        type="submit"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : null}
                  <form action={dismissNotificationAction}>
                    <input name="recipientId" type="hidden" value={recipient.id} />
                    <button
                      className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
                      type="submit"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
