import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await requireTenantPageAccess({
    product: "hostel_erp",
  });

  return <AppShell context={context}>{children}</AppShell>;
}
