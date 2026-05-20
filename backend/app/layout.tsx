import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { Inter, Outfit } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Hostel ERP",
  description: "Multi-tenant Hostel ERP SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In a full multi-tenant setup, these would be fetched from the database
  // based on the subdomain/tenant ID. For now, they act as the dynamic injection point.
  const tenantBranding = {
    primary: "#0ea5e9", // mapped to --primary
    accent: "#f97316", // mapped to --accent
  };

  return (
    <html lang="en" className={`h-full antialiased scroll-smooth ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${tenantBranding.primary};
              --accent: ${tenantBranding.accent};
            }
          `
        }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
