import {
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Phone,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { updateEnquiryStatus } from "@/lib/actions/enquiries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Enquiries Inbox",
};

type EnquiriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type EnquiryStatus = "new" | "contacted" | "resolved" | "archived";

type Enquiry = {
  created_at: string;
  email: string | null;
  full_name: string;
  id: string;
  message: string;
  phone: string | null;
  status: EnquiryStatus;
};

type EnquiryQueryClient = {
  from: (table: "enquiries") => {
    select: (columns: string) => {
      order: (
        column: string,
        options: { ascending: boolean },
      ) => Promise<{
        data: Enquiry[] | null;
        error: { message?: string } | null;
      }>;
    };
  };
};

const enquiryStatuses: EnquiryStatus[] = [
  "new",
  "contacted",
  "resolved",
  "archived",
];

function getSearchValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function isEnquiryStatus(value: FormDataEntryValue | null): value is EnquiryStatus {
  return (
    value === "new" ||
    value === "contacted" ||
    value === "resolved" ||
    value === "archived"
  );
}

function isQueryStatus(value: string | undefined): value is EnquiryStatus {
  return enquiryStatuses.includes(value as EnquiryStatus);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function matchesQuery(enquiry: Enquiry, q: string | undefined) {
  if (!q) {
    return true;
  }

  const needle = q.toLowerCase();

  return [
    enquiry.full_name,
    enquiry.email ?? "",
    enquiry.phone ?? "",
    enquiry.message,
  ].some((value) => value.toLowerCase().includes(needle));
}

export default async function EnquiriesPage({
  searchParams,
}: EnquiriesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSearchValue(resolvedSearchParams, "q")?.trim();
  const statusParam = getSearchValue(resolvedSearchParams, "status");
  const status = isQueryStatus(statusParam) ? statusParam : undefined;
  const supabase = await createClient();
  const enquiryClient = supabase as unknown as EnquiryQueryClient;

  // RLS scopes this inbox to the signed-in admin's organization.
  const { data: enquiries, error } = await enquiryClient
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load enquiries:", error);
  }

  const allEnquiries = enquiries ?? [];
  const visibleEnquiries = allEnquiries.filter(
    (enquiry) =>
      matchesQuery(enquiry, q) && (!status || enquiry.status === status),
  );
  const newCount = allEnquiries.filter((enquiry) => enquiry.status === "new").length;
  const contactedCount = allEnquiries.filter(
    (enquiry) => enquiry.status === "contacted",
  ).length;
  const resolvedCount = allEnquiries.filter(
    (enquiry) => enquiry.status === "resolved",
  ).length;
  const archivedCount = allEnquiries.filter(
    (enquiry) => enquiry.status === "archived",
  ).length;

  const handleUpdateStatus = async (formData: FormData) => {
    "use server";
    const id = formData.get("id");
    const nextStatus = formData.get("status");

    if (typeof id === "string" && isEnquiryStatus(nextStatus)) {
      await updateEnquiryStatus(id, nextStatus);
      revalidatePath("/admin/enquiries");
    }
  };

  return (
    <ErpPage>
      <PageHeader
        eyebrow="Public website"
        title="Enquiries inbox"
        description="Turn website messages into clear follow-up work for admissions, callbacks, and booking conversion."
        actions={
          <Button asChild>
            <Link href="/contact" target="_blank">
              Open contact page
            </Link>
          </Button>
        }
      />

      <ErpPageGrid>
        <StatCard
          icon={Sparkles}
          label="New enquiries"
          tone="info"
          value={String(newCount)}
          meta="Need first response"
        />
        <StatCard
          icon={Clock}
          label="Contacted"
          tone="warning"
          value={String(contactedCount)}
          meta="Awaiting decision"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          tone="success"
          value={String(resolvedCount)}
          meta="Handled enquiries"
        />
        <StatCard
          icon={Archive}
          label="Archived"
          value={String(archivedCount)}
          meta={`${visibleEnquiries.length} visible now`}
        />
      </ErpPageGrid>

      <ActionToolbar
        title="Lead filters"
        description="Search by name, email, phone, or message content. Keep the inbox focused on follow-up state."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/enquiries">
              <RotateCcw aria-hidden="true" />
              Reset
            </Link>
          </Button>
        }
      >
        <form action="/admin/enquiries" className="w-full">
          <SearchFilterBar
            defaultValue={q ?? ""}
            placeholder="Search enquiries"
            surface="embedded"
            actions={
              <Button type="submit">
                <Filter aria-hidden="true" />
                Apply
              </Button>
            }
          >
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              defaultValue={status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              {enquiryStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </SearchFilterBar>
        </form>
        {q || status ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {q ? <Badge variant="muted">Search: {q}</Badge> : null}
            {status ? <Badge variant="info">Status: {status}</Badge> : null}
          </div>
        ) : null}
      </ActionToolbar>

      <SectionCard
        title="Website enquiries"
        description="Use contact shortcuts and quick status actions to keep admissions follow-up moving."
      >
        {visibleEnquiries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Mail className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-4 text-base font-semibold">No enquiries found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              New website messages will appear here, or adjust the current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lead</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Message</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleEnquiries.map((enquiry) => (
                    <tr className="hover:bg-muted/40" key={enquiry.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold">{enquiry.full_name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(enquiry.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {enquiry.email ? (
                            <a
                              className="flex items-center gap-2 hover:text-primary"
                              href={`mailto:${enquiry.email}`}
                            >
                              <Mail className="size-4" aria-hidden="true" />
                              {enquiry.email}
                            </a>
                          ) : null}
                          {enquiry.phone ? (
                            <a
                              className="flex items-center gap-2 hover:text-primary"
                              href={`tel:${enquiry.phone}`}
                            >
                              <Phone className="size-4" aria-hidden="true" />
                              {enquiry.phone}
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="max-w-md px-4 py-4 align-top text-muted-foreground">
                        <p className="line-clamp-3">{enquiry.message}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={enquiry.status} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <form
                          action={handleUpdateStatus}
                          className="flex justify-end gap-2"
                        >
                          <input name="id" type="hidden" value={enquiry.id} />
                          {enquiry.status === "new" ? (
                            <Button
                              name="status"
                              size="sm"
                              type="submit"
                              value="contacted"
                              variant="outline"
                            >
                              Contacted
                            </Button>
                          ) : null}
                          {enquiry.status !== "resolved" &&
                          enquiry.status !== "archived" ? (
                            <Button
                              name="status"
                              size="sm"
                              type="submit"
                              value="resolved"
                            >
                              Resolve
                            </Button>
                          ) : null}
                          {enquiry.status !== "archived" ? (
                            <Button
                              name="status"
                              size="sm"
                              type="submit"
                              value="archived"
                              variant="secondary"
                            >
                              Archive
                            </Button>
                          ) : null}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {visibleEnquiries.map((enquiry) => (
                <article
                  className="rounded-lg border border-border bg-card p-4"
                  key={enquiry.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{enquiry.full_name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(enquiry.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={enquiry.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {enquiry.message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {enquiry.email ? (
                      <a className="font-medium text-primary" href={`mailto:${enquiry.email}`}>
                        Email
                      </a>
                    ) : null}
                    {enquiry.phone ? (
                      <a className="font-medium text-primary" href={`tel:${enquiry.phone}`}>
                        Call
                      </a>
                    ) : null}
                  </div>
                  <form action={handleUpdateStatus} className="mt-4 flex flex-wrap gap-2">
                    <input name="id" type="hidden" value={enquiry.id} />
                    {enquiry.status === "new" ? (
                      <Button
                        name="status"
                        size="sm"
                        type="submit"
                        value="contacted"
                        variant="outline"
                      >
                        Contacted
                      </Button>
                    ) : null}
                    {enquiry.status !== "resolved" &&
                    enquiry.status !== "archived" ? (
                      <Button name="status" size="sm" type="submit" value="resolved">
                        Resolve
                      </Button>
                    ) : null}
                    {enquiry.status !== "archived" ? (
                      <Button
                        name="status"
                        size="sm"
                        type="submit"
                        value="archived"
                        variant="secondary"
                      >
                        Archive
                      </Button>
                    ) : null}
                  </form>
                </article>
              ))}
            </div>
          </>
        )}
      </SectionCard>
    </ErpPage>
  );
}
