import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";

export default async function StudentPortalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await requireTenantPageAccess({
    permission: "student:self:read",
    product: "hostel_erp",
    roles: ["student"],
  });

  return <AppShell context={context}>{children}</AppShell>;
}
