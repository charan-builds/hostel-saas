import type { Route } from "next";
import Link from "next/link";
import { CalendarClock, Plus, ReceiptText } from "lucide-react";

import { InvoiceTable } from "@/components/billing/invoice-table";
import { RevenueCards } from "@/components/billing/revenue-cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatCard } from "@/components/ui/stat-card";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { generateMonthlyInvoicesAction } from "@/modules/billing/actions";
import { getBillingFormOptions, listInvoices } from "@/modules/billing/billing.service";
import { listInvoicesQuerySchema } from "@/modules/billing/schemas";
import { formatCurrency } from "@/lib/utils";

type BillingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const selectClassName =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function currentInvoiceMonth() {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

function billingHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
  },
  overrides: {
    page?: number;
    status?: string | null;
  } = {},
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(overrides.page ?? 1),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  const status = overrides.status === undefined ? query.status : overrides.status;

  if (status) {
    params.set("status", status);
  }

  return `/billing?${params.toString()}` as Route;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  await requireTenantPageAccess({
    permission: "billing:read",
    product: "hostel_erp",
  });
  const query = validateInput(listInvoicesQuerySchema, await searchParams);
  const [invoices, options] = await Promise.all([
    listInvoices(query),
    getBillingFormOptions(query.hostelBranchId),
  ]);
  const defaultBranchId = query.hostelBranchId ?? options.branches[0]?.id ?? "";
  const canGenerate = Boolean(defaultBranchId);
  const collectionRate =
    invoices.summary.totalCents > 0
      ? Math.round((invoices.summary.paidCents / invoices.summary.totalCents) * 100)
      : 0;
  const averageInvoiceCents =
    invoices.count > 0 ? Math.round(invoices.summary.totalCents / invoices.count) : 0;
  const quickFilters = [
    { label: "All", status: null },
    { label: "Pending", status: "pending" },
    { label: "Partially paid", status: "partially_paid" },
    { label: "Overdue", status: "overdue" },
    { label: "Paid", status: "paid" },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button asChild>
            <Link href="/billing/rent-plans/new">
              <Plus aria-hidden="true" />
              Create rent plan
            </Link>
          </Button>
        }
        description="Collect rent, chase dues, generate monthly invoices, and review branch collections from one workspace."
        eyebrow="Hostel ERP"
        title="Billing and rent collection"
      />

      <RevenueCards summary={invoices.summary} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description={`${invoices.summary.pendingCount + invoices.summary.overdueCount} invoices need follow-up`}
          icon={ReceiptText}
          label="Open invoices"
          tone={invoices.summary.balanceCents > 0 ? "warning" : "success"}
          value={String(invoices.summary.pendingCount + invoices.summary.overdueCount)}
        />
        <StatCard
          description="Revenue captured from billed rent"
          icon={ReceiptText}
          label="Collection rate"
          tone={collectionRate >= 90 ? "success" : "warning"}
          value={`${collectionRate}%`}
        />
        <StatCard
          description="Average active invoice value"
          icon={ReceiptText}
          label="Average invoice"
          value={formatCurrency(averageInvoiceCents, invoices.summary.currencyCode)}
        />
        <StatCard
          description="Current invoice cycle helper"
          icon={CalendarClock}
          label="Invoice month"
          value={currentInvoiceMonth().slice(0, 7)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            asChild
            key={filter.label}
            size="sm"
            variant={(query.status ?? null) === filter.status ? "default" : "outline"}
          >
            <Link href={billingHref(query, { status: filter.status })}>
              {filter.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <form action="/billing">
          <SearchFilterBar
            actions={
              <Button type="submit" variant="outline">
                Apply filters
              </Button>
            }
            defaultValue={query.q ?? ""}
            placeholder="Search invoice or student"
          >
            <select
              aria-label="Filter by branch"
              className={selectClassName}
              defaultValue={query.hostelBranchId ?? ""}
              name="hostelBranchId"
            >
              <option value="">All branches</option>
              {options.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by invoice status"
              className={selectClassName}
              defaultValue={query.status ?? ""}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
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
        <Card>
          <CardHeader>
            <CardTitle>Generate monthly invoices</CardTitle>
            <CardDescription>
              Branch-scoped generation prevents duplicate billing cycles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={generateMonthlyInvoicesAction} className="space-y-3">
              <input
                name="organizationId"
                type="hidden"
                value={options.organizationId}
              />
              <select
                className={selectClassName}
                defaultValue={defaultBranchId}
                disabled={!canGenerate}
                name="hostelBranchId"
                required
              >
                {options.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <input
                className={selectClassName}
                defaultValue={currentInvoiceMonth()}
                disabled={!canGenerate}
                name="invoiceMonth"
                required
                type="date"
              />
              <Button className="w-full" disabled={!canGenerate} type="submit">
                Run billing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <InvoiceTable invoices={invoices.data} />
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {invoices.page} of {invoices.pageCount}, {invoices.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Invoice pagination">
          {invoices.page > 1 ? (
            <Link
              className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-accent"
              href={billingHref(query, { page: invoices.page - 1 })}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
              Previous
            </span>
          )}
          {invoices.page < invoices.pageCount ? (
            <Link
              className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-accent"
              href={billingHref(query, { page: invoices.page + 1 })}
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
              Next
            </span>
          )}
        </nav>
      </div>
    </section>
  );
}
