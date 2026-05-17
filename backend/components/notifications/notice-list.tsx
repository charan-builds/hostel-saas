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
  return (
    <div className="space-y-4">
      {notices.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No notices found.
        </div>
      ) : (
        notices.map((notice) => (
          <article
            className="rounded border border-slate-200 bg-white p-5"
            key={notice.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{notice.title}</h3>
                  {notice.pinned ? (
                    <span className="rounded border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                      pinned
                    </span>
                  ) : null}
                  <span className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium">
                    {notice.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {notice.notice_type} - {notice.audience_type} -{" "}
                  {formatDate(notice.published_at)}
                </p>
              </div>
              {notice.acknowledgement?.acknowledged_at ? (
                <span className="rounded border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700">
                  Acknowledged
                </span>
              ) : (
                <form action={acknowledgeNoticeAction}>
                  <input name="noticeId" type="hidden" value={notice.id} />
                  <button
                    className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
                    type="submit"
                  >
                    Acknowledge
                  </button>
                </form>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
              {notice.body}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
