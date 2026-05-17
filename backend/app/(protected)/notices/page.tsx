import type { Route } from "next";
import Link from "next/link";

import { NoticeList } from "@/components/notifications/notice-list";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { listNotices } from "@/modules/notifications/notifications.service";
import { listNoticesQuerySchema } from "@/modules/notifications/schemas";

type NoticesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function noticesPageHref(
  query: {
    audienceType?: string | undefined;
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status: "draft" | "scheduled" | "published" | "archived";
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
    status: query.status,
  });

  if (query.audienceType) {
    params.set("audienceType", query.audienceType);
  }

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  return `/notices?${params.toString()}` as Route;
}

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  await requireTenantPageAccess({
    permission: "notice:read",
    product: "hostel_erp",
  });
  const query = validateInput(listNoticesQuerySchema, await searchParams);
  const notices = await listNotices(query);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Notice board</h2>
        </div>
        <Link
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
          href="/notifications"
        >
          Notifications
        </Link>
      </div>
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_120px]">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.q ?? ""}
          name="q"
          placeholder="Search notices"
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          defaultValue={query.audienceType ?? ""}
          name="audienceType"
        >
          <option value="">all audiences</option>
          <option value="tenant">tenant</option>
          <option value="branch">branch</option>
          <option value="admins">admins</option>
          <option value="students">students</option>
        </select>
        <button
          className="rounded border border-slate-300 px-3 py-2 font-medium"
          type="submit"
        >
          Filter
        </button>
      </form>
      <NoticeList notices={notices.data} />
      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Page {notices.page} of {notices.pageCount}, {notices.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Notice pagination">
          {notices.page > 1 ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={noticesPageHref(query, notices.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Previous
            </span>
          )}
          {notices.page < notices.pageCount ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={noticesPageHref(query, notices.page + 1)}
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
    </section>
  );
}
