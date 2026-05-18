import type { Route } from "next";
import Link from "next/link";

import { NoticeList } from "@/components/notifications/notice-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { listNotices } from "@/modules/notifications/notifications.service";
import { listNoticesQuerySchema } from "@/modules/notifications/schemas";

type NoticesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

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
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/notifications">Notifications</Link>
          </Button>
        }
        description="Review tenant-wide and branch-level announcements with acknowledgement status visible."
        eyebrow="Hostel ERP"
        title="Notice board"
      />
      <form action="/notices">
        <input name="status" type="hidden" value={query.status} />
        <SearchFilterBar
          actions={
            <Button type="submit" variant="outline">
              Apply filters
            </Button>
          }
          defaultValue={query.q ?? ""}
          placeholder="Search notices"
        >
          <select
            className={selectClassName}
            defaultValue={query.audienceType ?? ""}
            name="audienceType"
          >
            <option value="">All audiences</option>
            <option value="tenant">Tenant</option>
            <option value="branch">Branch</option>
            <option value="admins">Admins</option>
            <option value="students">Students</option>
          </select>
        </SearchFilterBar>
      </form>
      <NoticeList notices={notices.data} />
      <PaginationControls
        count={notices.count}
        hrefForPage={(page) => noticesPageHref(query, page)}
        itemLabel="notices"
        page={notices.page}
        pageCount={notices.pageCount}
      />
    </section>
  );
}
