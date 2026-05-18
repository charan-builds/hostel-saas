import { Building2, MapPinned, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types/domain";

type TenantHeaderProps = {
  branchName?: string | undefined;
  isSuperadmin?: boolean;
  organizationName?: string | undefined;
  role: UserRole | string;
};

export function TenantHeader({
  branchName,
  isSuperadmin = false,
  organizationName,
  role,
}: TenantHeaderProps) {
  return (
    <>
      <Badge className="gap-1.5" variant={isSuperadmin ? "warning" : "outline"}>
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        <span className="capitalize">{role}</span>
      </Badge>
      <Badge className="gap-1.5" variant="muted">
        <Building2 className="size-3.5" aria-hidden="true" />
        {organizationName ?? "Active tenant"}
      </Badge>
      {branchName ? (
        <Badge className="gap-1.5" variant="muted">
          <MapPinned className="size-3.5" aria-hidden="true" />
          {branchName}
        </Badge>
      ) : null}
    </>
  );
}
