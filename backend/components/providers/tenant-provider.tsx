"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { websiteConfig as defaultWebsiteConfig } from "@/config/website-config";
import { publicContent as defaultPublicContent } from "@/config/public-content";

type WidenLiteral<T> =
  T extends (...args: infer TArgs) => infer TReturn
    ? (...args: TArgs) => TReturn
    : T extends readonly (infer TItem)[]
      ? ReadonlyArray<WidenLiteral<TItem>>
      : T extends object
        ? { [TKey in keyof T]: WidenLiteral<T[TKey]> }
        : T extends string
          ? string
          : T extends number
            ? number
            : T extends boolean
              ? boolean
              : T;

type WebsiteConfig = Omit<
  WidenLiteral<typeof defaultWebsiteConfig>,
  "mainNav"
> & {
  mainNav: typeof defaultWebsiteConfig.mainNav;
};

// Define the shape of our context
type TenantCMSContextType = {
  tenantScope: {
    branchName: string;
    hostelBranchId: string;
    hostelBranchSlug: string;
    organizationId: string;
    organizationSlug: string;
  } | null;
  websiteConfig: WebsiteConfig;
  publicContent: WidenLiteral<typeof defaultPublicContent>;
  themeConfig: {
    template?: string;
    primary: string;
    accent: string;
  };
};

const TenantCMSContext = createContext<TenantCMSContextType | undefined>(undefined);

export function TenantProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: TenantCMSContextType;
}) {
  return (
    <TenantCMSContext.Provider value={data}>
      {children}
    </TenantCMSContext.Provider>
  );
}

export function useTenantCMS() {
  const context = useContext(TenantCMSContext);
  if (context === undefined) {
    console.warn("useTenantCMS must be used within a TenantProvider. Falling back to default config.");
    return {
      tenantScope: null,
      websiteConfig: defaultWebsiteConfig,
      publicContent: defaultPublicContent,
      themeConfig: { template: "modern", primary: "#0EA5E9", accent: "#F97316" }
    };
  }
  return context;
}
