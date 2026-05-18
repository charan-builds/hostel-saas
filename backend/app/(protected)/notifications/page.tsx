import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, Bell, Inbox } from "lucide-react";

import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatCard } from "@/components/ui/stat-card";
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

const selectClassName =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

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
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/notices">Notice board</Link>
            </Button>
            <Button asChild>
              <Link href="/notices/manage">Manage notices</Link>
            </Button>
          </>
        }
        description="Track unread alerts, delivery problems, and operational messages from one queue."
        eyebrow="Hostel ERP"
        title="Notifications"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Bell}
              label="Unread"
              tone={notifications.summary.unreadCount > 0 ? "warning" : "default"}
              value={String(notifications.summary.unreadCount)}
            />
            <StatCard
              icon={AlertTriangle}
              label="Failed deliveries"
              tone={notifications.summary.failedDeliveries > 0 ? "danger" : "default"}
              value={String(notifications.summary.failedDeliveries)}
            />
            <StatCard
              icon={Inbox}
              label="Total in view"
              value={String(notifications.count)}
            />
          </div>
          <form action="/notifications">
            <SearchFilterBar
              actions={
                <Button type="submit" variant="outline">
                  Apply filters
                </Button>
              }
              defaultValue={query.q ?? ""}
              placeholder="Search notifications"
            >
              <select
                className={selectClassName}
                defaultValue={query.readState}
                name="readState"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </SearchFilterBar>
          </form>
          <NotificationList notifications={notifications.data} />
          <PaginationControls
            count={notifications.count}
            hrefForPage={(page) => notificationsPageHref(query, page)}
            itemLabel="notifications"
            page={notifications.page}
            pageCount={notifications.pageCount}
          />
        </div>
        <NotificationPreferencesForm
          organizationId={preferences.organizationId}
          preference={preferences.preference}
        />
      </div>
    </section>
  );
}
