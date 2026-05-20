"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, ExternalLink, ShieldCheck, UsersRound } from "lucide-react";

import { DataTable } from "@/components/data/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";

export type TenantControlItem = {
  activeBranchCount: number;
  adminCount: number;
  branchCount: number;
  createdAt: string;
  id: string;
  name: string;
  planLabel: string;
  productLabel: string;
  slug: string;
  status: string;
  studentMemberCount: number;
  updatedAt: string;
};

type TenantControlTableProps = {
  tenants: TenantControlItem[];
};

function tenantRoute(organizationId: string) {
  return `/super-admin/tenants/${organizationId}` as Route;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function TenantMobileCard({ tenant }: { tenant: TenantControlItem }) {
  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
            href={tenantRoute(tenant.id)}
          >
            <Building2 className="size-4" aria-hidden="true" />
            {tenant.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {tenant.slug} · {tenant.productLabel}
          </p>
        </div>
        <StatusBadge status={tenant.status} />
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Branches</dt>
          <dd className="text-right font-medium">
            {tenant.activeBranchCount}/{tenant.branchCount} active
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Admins</dt>
          <dd className="text-right font-medium">{tenant.adminCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="text-right font-medium">{tenant.planLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="text-right font-medium">{formatDate(tenant.updatedAt)}</dd>
        </div>
      </dl>
      <Button asChild size="sm" variant="outline">
        <Link href={tenantRoute(tenant.id)}>
          <ExternalLink aria-hidden="true" />
          Open tenant
        </Link>
      </Button>
    </article>
  );
}

export function TenantControlTable({ tenants }: TenantControlTableProps) {
  if (tenants.length === 0) {
    return (
      <EmptyState
        description="Create the first tenant to start operating the SaaS control center."
        title="No tenants found"
      />
    );
  }

  const columns: ColumnDef<TenantControlItem>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) => {
        const tenant = row.original;

        return (
          <div>
            <Link
              className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:underline"
              href={tenantRoute(tenant.id)}
            >
              <Building2 className="size-4" aria-hidden="true" />
              {tenant.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenant.slug} · {tenant.productLabel}
            </p>
          </div>
        );
      },
      header: "Organization",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      header: "Status",
    },
    {
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1.5">
          <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">
            {row.original.activeBranchCount}/{row.original.branchCount}
          </span>
          <span className="text-muted-foreground">active</span>
        </div>
      ),
      header: "Branches",
      id: "branches",
    },
    {
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
            {row.original.adminCount} admins
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersRound className="size-3.5" aria-hidden="true" />
            {row.original.studentMemberCount} student users
          </p>
        </div>
      ),
      header: "Users",
      id: "users",
    },
    {
      accessorKey: "planLabel",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.planLabel}</span>
      ),
      header: "Plan",
    },
    {
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatDate(row.original.updatedAt)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {formatDate(row.original.createdAt)}
          </p>
        </div>
      ),
      header: "Activity",
    },
    {
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link href={tenantRoute(row.original.id)}>
              <ExternalLink aria-hidden="true" />
              Open
            </Link>
          </Button>
        </div>
      ),
      enableSorting: false,
      header: "Actions",
      id: "actions",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tenants}
      enablePagination={false}
      filterPlaceholder="Search tenants"
      mobileCard={(tenant) => <TenantMobileCard tenant={tenant} />}
      rowSelection={false}
      searchKey="tenant-control"
      tableMinWidth="1080px"
    />
  );
}
