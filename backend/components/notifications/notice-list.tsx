import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { acknowledgeNoticeAction } from "@/modules/notifications/actions";
import type { NoticeListItem } from "@/modules/notifications/notifications.service";

type NoticeListProps = {
  notices: NoticeListItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NoticeList({ notices }: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <EmptyState
        description="Try a different audience filter or search term."
        title="No notices found"
      />
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{notice.title}</h3>
                  {notice.pinned ? (
                    <Badge variant="warning">Pinned</Badge>
                  ) : null}
                  <Badge variant="outline">{notice.priority}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {notice.notice_type} - {notice.audience_type} -{" "}
                  {formatDate(notice.published_at)}
                </p>
              </div>
              {notice.acknowledgement?.acknowledged_at ? (
                <Badge variant="success">Acknowledged</Badge>
              ) : (
                <form action={acknowledgeNoticeAction}>
                  <input name="noticeId" type="hidden" value={notice.id} />
                  <Button size="sm" type="submit" variant="outline">
                    Acknowledge
                  </Button>
                </form>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground">
              {notice.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
