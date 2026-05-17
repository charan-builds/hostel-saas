import type { Route } from "next";
import Link from "next/link";

import { InvoiceTable } from "@/components/billing/invoice-table";
import { RevenueCards } from "@/components/billing/revenue-cards";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import { validateInput } from "@/lib/validation/zod";
import { generateMonthlyInvoicesAction } from "@/modules/billing/actions";
import { getBillingFormOptions, listInvoices } from "@/modules/billing/billing.service";
import { listInvoicesQuerySchema } from "@/modules/billing/schemas";

type BillingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function currentInvoiceMonth() {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

function billingPageHref(
  query: {
    hostelBranchId?: string | undefined;
    limit: number;
    q?: string | undefined;
    status?: string | undefined;
  },
  page: number,
): Route {
  const params = new URLSearchParams({
    limit: String(query.limit),
    page: String(page),
  });

  if (query.hostelBranchId) {
    params.set("hostelBranchId", query.hostelBranchId);
  }

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.status) {
    params.set("status", query.status);
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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Hostel ERP</p>
          <h2 className="text-2xl font-semibold">Billing and rent collection</h2>
        </div>
        <Link
          className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          href="/billing/rent-plans/new"
        >
          Create rent plan
        </Link>
      </div>
      <RevenueCards summary={invoices.summary} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_120px]">
          <input
            className="rounded border border-slate-300 px-3 py-2"
            defaultValue={query.q ?? ""}
            name="q"
            placeholder="Search by invoice number"
          />
          <select
            className="rounded border border-slate-300 px-3 py-2"
            defaultValue={query.status ?? ""}
            name="status"
          >
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="partially_paid">partially paid</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
            <option value="void">void</option>
          </select>
          <button
            className="rounded border border-slate-300 px-3 py-2 font-medium"
            type="submit"
          >
            Filter
          </button>
          {query.hostelBranchId ? (
            <input name="hostelBranchId" type="hidden" value={query.hostelBranchId} />
          ) : null}
        </form>
        <form
          action={generateMonthlyInvoicesAction}
          className="rounded border border-slate-200 bg-white p-4"
        >
          <input name="organizationId" type="hidden" value={options.organizationId} />
          <p className="font-medium">Generate monthly invoices</p>
          <div className="mt-4 grid gap-3">
            <select
              className="rounded border border-slate-300 px-3 py-2"
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
              className="rounded border border-slate-300 px-3 py-2"
              defaultValue={currentInvoiceMonth()}
              disabled={!canGenerate}
              name="invoiceMonth"
              required
              type="date"
            />
            <button
              className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canGenerate}
              type="submit"
            >
              Run billing
            </button>
          </div>
        </form>
      </div>
      <InvoiceTable invoices={invoices.data} />
      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>
          Page {invoices.page} of {invoices.pageCount}, {invoices.count} total
        </p>
        <nav className="flex items-center gap-2" aria-label="Invoice pagination">
          {invoices.page > 1 ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={billingPageHref(query, invoices.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded border border-slate-200 px-3 py-2 text-slate-400">
              Previous
            </span>
          )}
          {invoices.page < invoices.pageCount ? (
            <Link
              className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-900"
              href={billingPageHref(query, invoices.page + 1)}
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
