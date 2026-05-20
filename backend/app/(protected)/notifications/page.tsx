import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, Bell, CheckCheck, Inbox } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
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
  "erp-control";

function notificationsHref(
  query: {
    limit: number;
    q?: string | undefined;
    readState: "all" | "read" | "unread";
  },
  overrides: {
    page?: number;
    readState?: "all" | "read" | "unread";
  } = {},
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(overrides.page ?? 1),
    readState: overrides.readState ?? query.readState,
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
  const deliveredCount = notifications.data.filter(
    (recipient) => recipient.delivery_status === "sent",
  ).length;
  const quickFilters = [
    { label: "All", readState: "all" },
    { label: "Unread", readState: "unread" },
    { label: "Read", readState: "read" },
  ] as const;
  const activeFilters = [
    query.q ? `Search: ${query.q}` : undefined,
    `State: ${query.readState}`,
  ].filter((value): value is string => Boolean(value));

  return (
    <ErpPage>
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
      <ActionToolbar
        description="Use the unread queue for daily follow-up and the failed-delivery count for operational checks."
        title="Notification work queue"
      >
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              asChild
              key={filter.readState}
              size="sm"
              variant={query.readState === filter.readState ? "default" : "outline"}
            >
              <Link href={notificationsHref(query, { readState: filter.readState })}>
                {filter.label}
              </Link>
            </Button>
          ))}
        </div>
      </ActionToolbar>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <ErpPageGrid columns="three">
            <StatCard
              description="Needs reader attention"
              icon={Bell}
              label="Unread"
              tone={notifications.summary.unreadCount > 0 ? "warning" : "default"}
              value={String(notifications.summary.unreadCount)}
            />
            <StatCard
              description="Requires delivery review"
              icon={AlertTriangle}
              label="Failed deliveries"
              tone={notifications.summary.failedDeliveries > 0 ? "danger" : "default"}
              value={String(notifications.summary.failedDeliveries)}
            />
            <StatCard
              description="Successfully delivered in this view"
              icon={CheckCheck}
              label="Delivered"
              tone="success"
              value={String(deliveredCount)}
            />
            <StatCard
              description="All matching notification rows"
              icon={Inbox}
              label="Total"
              value={String(notifications.count)}
            />
          </ErpPageGrid>

          <SectionCard
            contentClassName="space-y-4"
            description="Search alerts and switch between unread, read, or all communication states."
            title="Notification filters"
          >
            <form action="/notifications">
              <SearchFilterBar
                actions={
                  <>
                    <Button type="submit" variant="outline">
                      Apply filters
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href="/notifications">Reset</Link>
                    </Button>
                  </>
                }
                defaultValue={query.q ?? ""}
                placeholder="Search notifications"
                surface="embedded"
              >
                <select
                  aria-label="Filter notifications by read state"
                  className={selectClassName}
                  defaultValue={query.readState}
                  name="readState"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                <select
                  aria-label="Rows per page"
                  className={selectClassName}
                  defaultValue={String(query.limit)}
                  name="limit"
                >
                  <option value="10">10 rows</option>
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </SearchFilterBar>
            </form>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters</span>
              {activeFilters.map((filter) => (
                <span
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize"
                  key={filter}
                >
                  {filter}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-4"
            description="Read, open, or dismiss operational messages without losing queue context."
            title="Notification center"
          >
            <NotificationList notifications={notifications.data} />
          </SectionCard>
          <PaginationControls
            count={notifications.count}
            hrefForPage={(page) => notificationsHref(query, { page })}
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
    </ErpPage>
  );
}
