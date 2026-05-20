"use client";

import React from "react";
import { HeroSection } from "./hero-section";
import { FacilitiesSection } from "./facilities-section";
import { PricingCards } from "./pricing-cards";
import { GallerySection } from "./gallery-section";
import { RoomShowcase } from "./room-showcase";
import { TestimonialSlider } from "./testimonial-slider";
import { LocationMap } from "./location-map";
import { CTASection } from "./cta-section";
import type { WebsiteSectionId } from "@/lib/website-builder/sections";

type MarketingSectionProps = {
  sectionProps?: Record<string, unknown> | undefined;
  variant?: string | undefined;
};

const componentRegistry: Record<string, React.ComponentType<MarketingSectionProps>> = {
  hero: HeroSection,
  facilities: FacilitiesSection,
  features: FacilitiesSection,
  pricing: PricingCards,
  gallery: GallerySection,
  rooms: RoomShowcase,
  testimonials: TestimonialSlider,
  location: LocationMap,
  cta: CTASection,
};

interface PageRendererSection {
  config?: Record<string, unknown>;
  enabled?: boolean;
  id: string;
  props?: Record<string, unknown>;
  type?: string;
  variant?: string;
  visible?: boolean;
}

interface PageRendererProps {
  sections: PageRendererSection[];
}

function resolveSection(section: PageRendererSection) {
  return {
    enabled: section.enabled ?? (section.visible !== false),
    id: section.type ?? (section.id as WebsiteSectionId),
    key: section.id,
    props: section.props ?? section.config,
    variant: section.variant,
  };
}

export function PageRenderer({ sections }: PageRendererProps) {
  if (!sections || !Array.isArray(sections)) {
    return null;
  }

  // Filter out hidden sections and map to actual components
  const activeSections = sections
    .map(resolveSection)
    .filter((section) => section.enabled)
    .map((section) => {
      const Component = componentRegistry[section.id];
      
      if (!Component) {
        console.warn(`No component found for section type: ${section.id}`);
        return null;
      }

      return (
        <React.Fragment key={section.key}>
          <Component sectionProps={section.props} variant={section.variant} />
        </React.Fragment>
      );
    });

  return <>{activeSections}</>;
}
