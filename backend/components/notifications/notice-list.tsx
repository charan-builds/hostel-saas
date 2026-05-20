import { BellRing, CheckCircle2, MapPin, Pin } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import { acknowledgeNoticeAction } from "@/modules/notifications/actions";
import type { NoticeListItem } from "@/modules/notifications/notifications.service";

type NoticeListProps = {
  branchNames?: Record<string, string>;
  notices: NoticeListItem[];
};

const priorityVariant: Record<string, BadgeProps["variant"]> = {
  high: "warning",
  low: "muted",
  normal: "outline",
  urgent: "critical",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function branchLabel(
  notice: NoticeListItem,
  branchNames: Record<string, string>,
) {
  if (!notice.hostel_branch_id) {
    return "All branches";
  }

  return branchNames[notice.hostel_branch_id] ?? "Selected branch";
}

function NoticeAcknowledgement({ notice }: { notice: NoticeListItem }) {
  if (notice.acknowledgement?.acknowledged_at) {
    return (
      <Badge variant="success">
        <CheckCircle2 className="mr-1 size-3.5" aria-hidden="true" />
        Acknowledged
      </Badge>
    );
  }

  return (
    <form action={acknowledgeNoticeAction}>
      <input name="noticeId" type="hidden" value={notice.id} />
      <Button size="sm" type="submit" variant="outline">
        Acknowledge
      </Button>
    </form>
  );
}

function NoticeMeta({
  branchNames,
  notice,
}: {
  branchNames: Record<string, string>;
  notice: NoticeListItem;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="capitalize">{formatLabel(notice.notice_type)}</span>
      <span aria-hidden="true">·</span>
      <span className="capitalize">{formatLabel(notice.audience_type)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <MapPin className="size-3.5" aria-hidden="true" />
        {branchLabel(notice, branchNames)}
      </span>
    </div>
  );
}

function NoticeMobileCard({
  branchNames,
  notice,
}: {
  branchNames: Record<string, string>;
  notice: NoticeListItem;
}) {
  return (
    <article className="space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-[var(--erp-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {notice.pinned ? <Pin className="size-4 text-warning" aria-hidden="true" /> : null}
            <h3 className="font-semibold">{notice.title}</h3>
          </div>
          <div className="mt-2">
            <NoticeMeta branchNames={branchNames} notice={notice} />
          </div>
        </div>
        <StatusBadge status={notice.status} />
      </div>
      <p className="line-clamp-4 whitespace-pre-line text-sm leading-6 text-foreground">
        {notice.body}
      </p>
      <div className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Priority</span>
          <Badge variant={priorityVariant[notice.priority] ?? "outline"}>
            {formatLabel(notice.priority)}
          </Badge>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Published</span>
          <span className="text-right font-medium">
            {formatDate(notice.published_at)}
          </span>
        </div>
        {notice.scheduled_for ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Scheduled</span>
            <span className="text-right font-medium">
              {formatDate(notice.scheduled_for)}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <BellRing className="size-3.5" aria-hidden="true" />
          Reader acknowledgement
        </span>
        <NoticeAcknowledgement notice={notice} />
      </div>
    </article>
  );
}

export function NoticeList({ branchNames = {}, notices }: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <EmptyState
        description="Try a different audience, status, branch, or search term."
        title="No notices found"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {notices.map((notice) => (
          <NoticeMobileCard
            branchNames={branchNames}
            key={notice.id}
            notice={notice}
          />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card text-card-foreground md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted/85 text-muted-foreground backdrop-blur">
              <tr>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Notice</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Audience</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Priority</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Status</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Schedule</th>
                <th className="h-11 px-4 text-xs font-semibold uppercase tracking-normal">Acknowledgement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notices.map((notice) => (
                <tr className="align-top hover:bg-muted/50" key={notice.id}>
                  <td className="max-w-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      {notice.pinned ? (
                        <Pin className="size-4 text-warning" aria-hidden="true" />
                      ) : null}
                      <p className="font-semibold">{notice.title}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-muted-foreground">
                      {notice.body}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <NoticeMeta branchNames={branchNames} notice={notice} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariant[notice.priority] ?? "outline"}>
                      {formatLabel(notice.priority)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={notice.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>Published {formatDate(notice.published_at)}</p>
                    {notice.scheduled_for ? (
                      <p className="mt-1 text-xs">
                        Scheduled {formatDate(notice.scheduled_for)}
                      </p>
                    ) : null}
                    {notice.expires_at ? (
                      <p className="mt-1 text-xs">
                        Expires {formatDate(notice.expires_at)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <NoticeAcknowledgement notice={notice} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
