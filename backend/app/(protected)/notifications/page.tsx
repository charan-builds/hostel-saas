import type { Route } from "next";
import Link from "next/link";

import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import {
  getNotificationPreferences,
  listNotifications,
} from "@/modules/notifications/notifications.service";
import { listNotificationsQuerySchema } from "@/modules/notifications/schemas";

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function notificationsPageHref(
  query: {
    limit: number;
    q?: string | undefined;
    readState: "all" | "read" | "unread";
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
    readState: query.readState,
  });

  if (query.q) {
    params.set("q", query.q);
  }

  return `/notifications?${params.toString()}` as Route;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  await requireTenantPageAccess({
    permission: "notification:read",
    product: "hostel_erp",
  });
  const query = validateInput(listNotificationsQuerySchema, await searchParams);
  const [notifications, preferences] = await Promise.all([
    listNotifications(query),
    getNotificationPreferences(),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Notifications</h2>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            href="/notices"
          >
            Notice board
          </Link>
          <Link
            className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            href="/notices/manage"
          >
            Manage notices
          </Link>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Unread</p>
              <p className="mt-1 text-2xl font-semibold">
                {notifications.summary.unreadCount}
              </p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Failed deliveries</p>
              <p className="mt-1 text-2xl font-semibold">
                {notifications.summary.failedDeliveries}
              </p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Total in view</p>
              <p className="mt-1 text-2xl font-semibold">{notifications.count}</p>
            </div>
          </div>
          <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_120px]">
            <input
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.q ?? ""}
              name="q"
              placeholder="Search notifications"
            />
            <select
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={query.readState}
              name="readState"
            >
              <option value="all">all</option>
              <option value="unread">unread</option>
              <option value="read">read</option>
            </select>
            <button
              className="rounded border border-slate-300 px-3 py-2 font-medium"
              type="submit"
            >
              Filter
            </button>
          </form>
          <NotificationList notifications={notifications.data} />
          <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              Page {notifications.page} of {notifications.pageCount},{" "}
              {notifications.count} total
            </p>
            <nav className="flex items-center gap-2" aria-label="Notification pagination">
              {notifications.page > 1 ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={notificationsPageHref(query, notifications.page - 1)}
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Previous
                </span>
              )}
              {notifications.page < notifications.pageCount ? (
                <Link
                  className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
                  href={notificationsPageHref(query, notifications.page + 1)}
                >
                  Next
                </Link>
              ) : (
                <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
                  Next
                </span>
              )}
            </nav>
          </div>
        </div>
        <NotificationPreferencesForm
          organizationId={preferences.organizationId}
          preference={preferences.preference}
        />
      </div>
    </section>
  );
}
