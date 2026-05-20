"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  BedDouble,
  Car,
  Coffee,
  Droplet,
  MessageCircle,
  Shield,
  Sparkles,
  Utensils,
  Wifi,
} from "lucide-react";

import { useTenantCMS } from "@/components/providers/tenant-provider";
import {
  normalizeFacilitiesSectionProps,
  type FacilitiesSectionProps,
} from "@/lib/website-builder/sections";
import { cn } from "@/lib/utils";

type FacilitiesSectionComponentProps = {
  sectionProps?: Record<string, unknown> | undefined;
  variant?: string | undefined;
};

const iconMap = {
  bed: BedDouble,
  car: Car,
  coffee: Coffee,
  droplet: Droplet,
  shield: Shield,
  sparkles: Sparkles,
  utensils: Utensils,
  wifi: Wifi,
} as const;

function getFacilitiesProps(
  publicContent: ReturnType<typeof useTenantCMS>["publicContent"],
  sectionProps?: Record<string, unknown>,
) {
  const configuredSection = (
    publicContent as typeof publicContent & {
      facilitiesSection?: Partial<FacilitiesSectionProps>;
    }
  ).facilitiesSection;

  return normalizeFacilitiesSectionProps({
    ...configuredSection,
    ...sectionProps,
    items:
      sectionProps?.items ??
      configuredSection?.items ??
      publicContent.facilities,
  });
}

function SectionIntro({ props }: { props: FacilitiesSectionProps }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center rounded-full border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--primary)]">
        {props.badge}
      </div>
      <h2 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
        {props.title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
        {props.subtitle}
      </p>
    </div>
  );
}

function SectionCTA({ props }: { props: FacilitiesSectionProps }) {
  if (!props.cta.enabled) {
    return null;
  }

  return (
    <div className="mt-12 flex justify-center">
      <Link
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] px-6 py-4 text-sm font-bold text-white shadow-[0_18px_40px_-20px_var(--primary)] transition-transform hover:-translate-y-0.5"
        href={props.cta.href as Route}
      >
        <MessageCircle aria-hidden="true" className="size-4" />
        {props.cta.label}
      </Link>
    </div>
  );
}

function PremiumGrid({ props }: { props: FacilitiesSectionProps }) {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {props.items.map((facility) => {
        const Icon = iconMap[facility.icon as keyof typeof iconMap] ?? Sparkles;

        return (
          <article
            className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.55)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--primary)]/30"
            key={`${facility.title}-${facility.icon}`}
          >
            <div className="absolute right-0 top-0 size-28 translate-x-10 -translate-y-10 rounded-full bg-[color:var(--primary)]/10 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <Icon aria-hidden="true" className="size-7" strokeWidth={1.7} />
            </div>
            {facility.highlight ? (
              <p className="mt-6 inline-flex rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)]">
                {facility.highlight}
              </p>
            ) : null}
            <h3 className="mt-5 font-heading text-2xl font-bold text-slate-950">
              {facility.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {facility.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function IconCards({ props }: { props: FacilitiesSectionProps }) {
  return (
    <div className="mt-14 grid gap-4 lg:grid-cols-2">
      {props.items.map((facility, index) => {
        const Icon = iconMap[facility.icon as keyof typeof iconMap] ?? Sparkles;

        return (
          <article
            className={cn(
              "flex gap-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl",
              index === 0 && "lg:row-span-2 lg:flex-col lg:justify-end lg:p-8",
            )}
            key={`${facility.title}-${facility.icon}`}
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
              <Icon aria-hidden="true" className="size-7" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-xl font-bold text-slate-950">
                  {facility.title}
                </h3>
                {facility.highlight ? (
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                    {facility.highlight}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {facility.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function HospitalityHighlight({ props }: { props: FacilitiesSectionProps }) {
  const [featured, ...rest] = props.items;
  const FeaturedIcon = iconMap[(featured?.icon ?? "sparkles") as keyof typeof iconMap] ?? Sparkles;

  return (
    <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary),transparent_38%),radial-gradient(circle_at_bottom_left,var(--accent),transparent_32%)] opacity-25" />
        <div className="relative">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
            <FeaturedIcon aria-hidden="true" className="size-8" strokeWidth={1.7} />
          </div>
          {featured?.highlight ? (
            <p className="mt-8 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/15">
              {featured.highlight}
            </p>
          ) : null}
          <h3 className="mt-5 font-heading text-4xl font-extrabold tracking-tight">
            {featured?.title ?? "Premium hostel amenities"}
          </h3>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
            {featured?.description ?? props.subtitle}
          </p>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {rest.map((facility) => {
          const Icon = iconMap[facility.icon as keyof typeof iconMap] ?? Sparkles;

          return (
            <article
              className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              key={`${facility.title}-${facility.icon}`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-950">
                  {facility.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {facility.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function FacilitiesSection({
  sectionProps,
  variant = "premium-grid",
}: FacilitiesSectionComponentProps) {
  const { publicContent } = useTenantCMS();
  const props = getFacilitiesProps(publicContent, sectionProps);

  return (
    <section className="relative overflow-hidden bg-[#f8fafc] py-20 md:py-28">
      <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--primary)]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro props={props} />
        {variant === "icon-cards" ? <IconCards props={props} /> : null}
        {variant === "hospitality-highlight" ? (
          <HospitalityHighlight props={props} />
        ) : null}
        {variant !== "icon-cards" && variant !== "hospitality-highlight" ? (
          <PremiumGrid props={props} />
        ) : null}
        <SectionCTA props={props} />
      </div>
    </section>
  );
}
