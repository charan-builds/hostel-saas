import Link from "next/link";

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
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Unread notifications</p>
          <p className="mt-1 text-2xl font-semibold">{unreadCount}</p>
        </div>
        <Link
          className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
          href="/notifications"
        >
          View
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">No unread notifications.</p>
        ) : (
          notifications.slice(0, 3).map((recipient) => (
            <div className="border-t border-slate-100 pt-3" key={recipient.id}>
              <p className="text-sm font-medium">
                {recipient.notification?.title ?? "Notification unavailable"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {recipient.notification?.body ?? ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
