import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  title?: string;
};

export function SectionCard({
  actions,
  children,
  className,
  contentClassName,
  description,
  title,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <Card className={className}>
      {hasHeader ? (
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {typeof description === "string" ? (
              <CardDescription>{description}</CardDescription>
            ) : description ? (
              <div className="text-sm text-muted-foreground">{description}</div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(!hasHeader && "pt-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
