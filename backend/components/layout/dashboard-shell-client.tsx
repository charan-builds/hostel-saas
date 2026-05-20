"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import {
  BranchSelector,
  type BranchOption,
} from "@/components/layout/branch-selector";
import { CommandPalette } from "@/components/layout/command-palette";
import {
  getVisibleNavigation,
  PROFILE_ITEMS,
  type NavigationGroup,
} from "@/components/layout/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/dialog";
import { signOutAction } from "@/modules/auth/actions";
import { setActiveTenantAction } from "@/modules/tenant/actions";
import { cn } from "@/lib/utils";
import type { SaasProduct, UserRole } from "@/types/domain";

export type ShellTenant = {
  email: string;
  fullName: string;
  hostelBranchId?: string | undefined;
  isSuperadmin: boolean;
  organizationId?: string | undefined;
  product: SaasProduct;
  role: UserRole;
  userId: string;
};

export type TenantOption = {
  label: string;
  organizationId: string;
  product: SaasProduct;
  role: UserRole;
};

export type ShellNotification = {
  body: string;
  id: string;
  title: string;
};

type DashboardShellClientProps = {
  branchOptions: BranchOption[];
  children: ReactNode;
  notifications: ShellNotification[];
  tenant: ShellTenant;
  tenantOptions: TenantOption[];
  unreadCount: number;
};

export type { BranchOption };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}` as Route,
    label: segment.replaceAll("-", " "),
  }));

  return (
    <nav aria-label="Breadcrumb" className="hidden text-sm md:block">
      <ol className="flex items-center gap-2 text-muted-foreground">
        <li>
          <Link className="hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
        </li>
        {crumbs
          .filter((crumb) => crumb.href !== "/dashboard")
          .map((crumb) => (
            <li className="flex items-center gap-2" key={crumb.href}>
              <span aria-hidden="true">/</span>
              <Link className="capitalize hover:text-foreground" href={crumb.href}>
                {crumb.label}
              </Link>
            </li>
          ))}
      </ol>
    </nav>
  );
}

function SidebarNav({
  collapsed = false,
  navigation,
  onNavigate,
  pathname,
}: {
  collapsed?: boolean;
  navigation: NavigationGroup[];
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="space-y-6" aria-label="Primary navigation">
      {navigation.map((group) => (
        <div key={group.label}>
          {collapsed ? null : (
            <p className="px-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    collapsed ? "justify-center px-0" : undefined,
                    active
                      ? "bg-primary/10 text-foreground before:absolute before:left-0 before:h-5 before:w-1 before:rounded-r-full before:bg-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  href={item.href}
                  key={item.href}
                  title={collapsed ? item.label : undefined}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {collapsed ? null : item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function TenantSwitcher({
  tenant,
  tenantOptions,
}: {
  tenant: ShellTenant;
  tenantOptions: TenantOption[];
}) {
  if (tenantOptions.length === 0) {
    return (
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
        <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">
          {tenant.organizationId ? `Tenant ${tenant.organizationId.slice(0, 8)}` : "Global"}
        </span>
      </div>
    );
  }

  return (
    <form action={setActiveTenantAction} className="relative">
      <input name="product" type="hidden" value={tenant.product} />
      <Building2
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        aria-label="Switch tenant"
        className="h-10 max-w-[13rem] appearance-none rounded-md border border-border bg-background py-2 pl-9 pr-8 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        defaultValue={tenant.organizationId ?? tenantOptions[0]?.organizationId}
        name="organizationId"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {tenantOptions.map((option) => (
          <option key={option.organizationId} value={option.organizationId}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </form>
  );
}

function NotificationDropdown({
  notifications,
  unreadCount,
}: {
  notifications: ShellNotification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        aria-expanded={open}
        aria-label="Open notifications"
        onClick={() => setOpen((value) => !value)}
        size="icon"
        variant="outline"
      >
        <Bell aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-warning text-[10px] font-semibold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--erp-shadow-popover)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Notifications</p>
            <Badge variant={unreadCount > 0 ? "warning" : "muted"}>
              {unreadCount} unread
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
                No unread notifications.
              </p>
            ) : (
              notifications.map((notification) => (
                <Link
                  className="block rounded-md border border-border p-3 hover:bg-accent"
                  href="/notifications"
                  key={notification.id}
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                </Link>
              ))
            )}
          </div>
          <Button asChild className="mt-3 w-full" size="sm" variant="outline">
            <Link href="/notifications">View notification center</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function UserMenu({ tenant }: { tenant: ShellTenant }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        aria-expanded={open}
        aria-label="Open user menu"
        className="gap-2"
        onClick={() => setOpen((value) => !value)}
        variant="outline"
      >
        <span className="grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {tenant.fullName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-28 truncate lg:inline">{tenant.fullName}</span>
      </Button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--erp-shadow-popover)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">
              {tenant.fullName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{tenant.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{tenant.email}</p>
            </div>
          </div>
          <Separator className="my-3" />
          {PROFILE_ITEMS.map((item) => (
            <Link
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <form action={signOutAction} className="mt-2">
            <Button className="w-full justify-start" type="submit" variant="ghost">
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardShellClient({
  branchOptions,
  children,
  notifications,
  tenant,
  tenantOptions,
  unreadCount,
}: DashboardShellClientProps) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigation = useMemo(
    () =>
      getVisibleNavigation(tenant.role, {
        hasBranchScope: branchOptions.length > 0 || Boolean(tenant.hostelBranchId),
        hasTenantScope: Boolean(tenant.organizationId) || tenant.isSuperadmin,
      }),
    [
      branchOptions.length,
      tenant.hostelBranchId,
      tenant.isSuperadmin,
      tenant.organizationId,
      tenant.role,
    ],
  );
  const currentTenantLabel =
    tenantOptions.find((option) => option.organizationId === tenant.organizationId)
      ?.label ??
    (tenant.organizationId ? `Tenant ${tenant.organizationId.slice(0, 8)}` : "Global");
  const scopeLabel = tenant.organizationId ? currentTenantLabel : "Global workspace";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card/95 shadow-[var(--erp-shadow-card)] backdrop-blur transition-[width] lg:block",
          sidebarCollapsed ? "w-20" : "w-72",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex h-16 items-center gap-3 border-b border-border px-4",
              sidebarCollapsed ? "justify-center" : undefined,
            )}
          >
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              H
            </div>
            {sidebarCollapsed ? null : (
              <div className="min-w-0">
                <p className="font-semibold">Hostel ERP</p>
                <p className="truncate text-xs text-muted-foreground">{scopeLabel}</p>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <SidebarNav
              collapsed={sidebarCollapsed}
              navigation={navigation}
              pathname={pathname}
            />
          </div>
          <div className="border-t border-border p-3">
            <Button
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn("w-full", sidebarCollapsed ? "px-0" : "justify-start")}
              onClick={() => setSidebarCollapsed((value) => !value)}
              variant="ghost"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
              {sidebarCollapsed ? null : "Collapse"}
            </Button>
          </div>
        </div>
      </aside>
      <Sheet
        description="Switch tenant, filter branches, and move through ERP workflows."
        onOpenChange={setMobileOpen}
        open={mobileOpen}
        side="left"
        title="Hostel ERP"
      >
        <div className="mb-5 space-y-3">
          <TenantSwitcher tenant={tenant} tenantOptions={tenantOptions} />
          <BranchSelector
            branches={branchOptions}
            className="block"
            selectedBranchId={tenant.hostelBranchId}
          />
        </div>
        <SidebarNav
          navigation={navigation}
          onNavigate={() => setMobileOpen(false)}
          pathname={pathname}
        />
      </Sheet>
      <div
        className={cn(
          "transition-[padding]",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                size="icon"
                variant="outline"
              >
                <Menu aria-hidden="true" />
              </Button>
              <div className="min-w-0">
                <Breadcrumbs pathname={pathname} />
                <button
                  className="mt-1 hidden max-w-md items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted md:flex"
                  onClick={() => setCommandOpen(true)}
                  type="button"
                >
                  <Search className="size-4" aria-hidden="true" />
                  Search workflows
                  <kbd className="ml-auto rounded border border-border px-1.5 text-[10px]">
                    Ctrl K
                  </kbd>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <TenantSwitcher tenant={tenant} tenantOptions={tenantOptions} />
              </div>
              <BranchSelector
                branches={branchOptions}
                selectedBranchId={tenant.hostelBranchId}
              />
              <ThemeToggle />
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <UserMenu tenant={tenant} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:px-8">
          {children}
        </main>
      </div>
      <CommandPalette
        navigation={navigation}
        onOpenChange={setCommandOpen}
        open={commandOpen}
      />
    </div>
  );
}
