import { z } from "zod";

import { publicContent as staticPublicContent } from "@/config/public-content";
import { websiteConfig as staticWebsiteConfig } from "@/config/website-config";

const sectionIds = [
  "hero",
  "facilities",
  "pricing",
  "gallery",
  "rooms",
  "testimonials",
  "location",
  "cta",
] as const;

export type WebsiteSectionId = (typeof sectionIds)[number];

export type WebsiteSectionDefinition = {
  defaults: Record<string, unknown>;
  description: string;
  id: WebsiteSectionId;
  label: string;
  variants: readonly string[];
};

export type WebsiteBuilderSection = {
  enabled: boolean;
  id: WebsiteSectionId;
  props: Record<string, unknown>;
  variant: string;
};

export type WebsiteBuilderDraft = {
  contact: {
    address: string;
    email: string;
    mapsLink: string;
    phone: string;
    whatsapp: string;
  };
  sections: WebsiteBuilderSection[];
  site: {
    description: string;
    logo: string;
    name: string;
    tagline: string;
  };
  theme: {
    accent: string;
    primary: string;
    template: string;
  };
};

export type FacilityItem = {
  description: string;
  highlight?: string;
  icon: string;
  title: string;
};

export type FacilitiesSectionProps = {
  badge: string;
  cta: {
    enabled: boolean;
    href: string;
    label: string;
  };
  items: FacilityItem[];
  subtitle: string;
  title: string;
};

export type RoomShowcaseCard = {
  amenities: string[];
  badge: string;
  ctaHref: string;
  ctaLabel: string;
  description: string;
  highlights: string[];
  id: string;
  image: string;
  occupancy: string;
  period: string;
  pricing: string;
  roomType: string;
  title: string;
};

export type RoomShowcaseSectionProps = {
  badge: string;
  cta: {
    enabled: boolean;
    href: string;
    label: string;
  };
  rooms: RoomShowcaseCard[];
  subtitle: string;
  title: string;
};

const defaultFacilitiesSection: FacilitiesSectionProps = {
  badge: "Amenities",
  cta: {
    enabled: true,
    href: "/book",
    label: "Enquire about rooms",
  },
  items: staticPublicContent.facilities.map((facility) => ({
    description: facility.description,
    highlight: "",
    icon: facility.icon,
    title: facility.title,
  })),
  subtitle:
    "A hostel experience designed around safety, comfort, daily convenience, and peace of mind.",
  title: "Everything students need for a better stay",
};

const defaultRoomShowcaseSection: RoomShowcaseSectionProps = {
  badge: "Room options",
  cta: {
    enabled: true,
    href: "/book",
    label: "Request a callback",
  },
  rooms: staticPublicContent.roomTypes.map((room) => ({
    amenities: room.features,
    badge: room.popular ? "Most requested" : "Available now",
    ctaHref: "/book",
    ctaLabel: "Enquire now",
    description: room.description,
    highlights: room.popular
      ? ["Peaceful stay", "Premium beds", "Less crowding"]
      : ["Study friendly", "Daily essentials", "Budget comfort"],
    id: room.id,
    image: room.image,
    occupancy: `${room.capacity} sharing`,
    period: room.period,
    pricing: room.price,
    roomType: room.title,
    title: room.title,
  })),
  subtitle:
    "Showcase room choices with the comfort, cleanliness, safety, and lifestyle details residents care about.",
  title: "Choose a room that fits your daily rhythm",
};

export const websiteSectionDefinitions: readonly WebsiteSectionDefinition[] = [
  {
    defaults: staticPublicContent.hero,
    description: "Main first impression, calls to action, pricing highlights, and trust proof.",
    id: "hero",
    label: "Hero",
    variants: ["cinematic", "clean", "compact"],
  },
  {
    defaults: defaultFacilitiesSection,
    description: "Facilities, amenities, and conversion-focused hostel trust signals.",
    id: "facilities",
    label: "Facilities",
    variants: ["premium-grid", "icon-cards", "hospitality-highlight"],
  },
  {
    defaults: {},
    description: "Monthly pricing and room-type cards.",
    id: "pricing",
    label: "Pricing",
    variants: ["cards", "simple"],
  },
  {
    defaults: {},
    description: "Photo gallery for rooms, food, and shared spaces.",
    id: "gallery",
    label: "Gallery",
    variants: ["masonry", "grid"],
  },
  {
    defaults: defaultRoomShowcaseSection,
    description: "Aspirational room cards, pricing, occupancy, and room-storytelling.",
    id: "rooms",
    label: "Rooms",
    variants: ["premium-cards", "lifestyle-showcase", "luxury-split"],
  },
  {
    defaults: {},
    description: "Resident trust signals and testimonials.",
    id: "testimonials",
    label: "Testimonials",
    variants: ["slider", "cards"],
  },
  {
    defaults: {},
    description: "Address, map, nearby landmarks, and visit guidance.",
    id: "location",
    label: "Location",
    variants: ["map", "compact"],
  },
  {
    defaults: {},
    description: "Final call-to-action for calls, WhatsApp, or booking enquiries.",
    id: "cta",
    label: "Final CTA",
    variants: ["split", "centered"],
  },
] as const;

const websiteSectionSchema = z.object({
  enabled: z.boolean().default(true),
  id: z.enum(sectionIds),
  props: z.record(z.string(), z.unknown()).default({}),
  variant: z.string().min(1).default("default"),
});

const websiteBuilderDraftSchema = z.object({
  contact: z.object({
    address: z.string().default(staticWebsiteConfig.contact.address),
    email: z.string().default(staticWebsiteConfig.contact.email),
    mapsLink: z.string().default(staticWebsiteConfig.contact.mapsLink),
    phone: z.string().default(staticWebsiteConfig.contact.phone),
    whatsapp: z.string().default(staticWebsiteConfig.contact.whatsapp),
  }),
  sections: z.array(websiteSectionSchema).default([]),
  site: z.object({
    description: z.string().default(staticWebsiteConfig.description),
    logo: z.string().default(staticWebsiteConfig.logo),
    name: z.string().default(staticWebsiteConfig.name),
    tagline: z.string().default(staticWebsiteConfig.tagline),
  }),
  theme: z.object({
    accent: z.string().default("#F97316"),
    primary: z.string().default("#0EA5E9"),
    template: z.string().default("modern"),
  }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function recordValue(value: unknown) {
  return isRecord(value) ? value : {};
}

function defaultSection(definition: WebsiteSectionDefinition): WebsiteBuilderSection {
  return {
    enabled: true,
    id: definition.id,
    props: definition.defaults,
    variant: definition.variants[0] ?? "default",
  };
}

function normalizeSectionId(value: unknown): WebsiteSectionId | null {
  if (value === "features") {
    return "facilities";
  }

  return sectionIds.find((sectionId) => sectionId === value) ?? null;
}

export function getDefaultWebsiteBuilderDraft(): WebsiteBuilderDraft {
  return {
    contact: {
      address: staticWebsiteConfig.contact.address,
      email: staticWebsiteConfig.contact.email,
      mapsLink: staticWebsiteConfig.contact.mapsLink,
      phone: staticWebsiteConfig.contact.phone,
      whatsapp: staticWebsiteConfig.contact.whatsapp,
    },
    sections: websiteSectionDefinitions.map(defaultSection),
    site: {
      description: staticWebsiteConfig.description,
      logo: staticWebsiteConfig.logo,
      name: staticWebsiteConfig.name,
      tagline: staticWebsiteConfig.tagline,
    },
    theme: {
      accent: "#F97316",
      primary: "#0EA5E9",
      template: "modern",
    },
  };
}

function normalizeSections(input: unknown): WebsiteBuilderSection[] {
  const sectionInput = Array.isArray(input) ? input : [];
  const normalized = sectionInput
    .map((section) => {
      if (!isRecord(section)) {
        return null;
      }

      const legacyType = section.type;
      const idCandidate = typeof legacyType === "string" ? legacyType : section.id;
      const id = normalizeSectionId(idCandidate);

      if (!id) {
        return null;
      }

      return websiteSectionSchema.parse({
        enabled:
          typeof section.enabled === "boolean"
            ? section.enabled
            : section.visible !== false,
        id,
        props: recordValue(section.props ?? section.config),
        variant: stringValue(section.variant, "default"),
      });
    })
    .filter((section): section is WebsiteBuilderSection => Boolean(section));

  const byId = new Map(normalized.map((section) => [section.id, section]));
  const ordered = normalized.filter((section, index, sections) => {
    return sections.findIndex((item) => item.id === section.id) === index;
  });

  for (const definition of websiteSectionDefinitions) {
    if (!byId.has(definition.id)) {
      ordered.push(defaultSection(definition));
    }
  }

  return ordered;
}

function normalizeFacilityItem(value: unknown, fallback?: FacilityItem): FacilityItem {
  const item = recordValue(value);

  return {
    description: stringValue(item.description, fallback?.description ?? ""),
    highlight: stringValue(item.highlight, fallback?.highlight ?? ""),
    icon: stringValue(item.icon, fallback?.icon ?? "sparkles"),
    title: stringValue(item.title, fallback?.title ?? "Amenity"),
  };
}

export function normalizeFacilitiesSectionProps(value: unknown): FacilitiesSectionProps {
  const props = recordValue(value);
  const cta = recordValue(props.cta);
  const items = Array.isArray(props.items)
    ? props.items.map((item, index) =>
        normalizeFacilityItem(item, defaultFacilitiesSection.items[index]),
      )
    : defaultFacilitiesSection.items;

  return {
    badge: stringValue(props.badge, defaultFacilitiesSection.badge),
    cta: {
      enabled:
        typeof cta.enabled === "boolean"
          ? cta.enabled
          : defaultFacilitiesSection.cta.enabled,
      href: stringValue(cta.href, defaultFacilitiesSection.cta.href),
      label: stringValue(cta.label, defaultFacilitiesSection.cta.label),
    },
    items: items.length > 0 ? items : defaultFacilitiesSection.items,
    subtitle: stringValue(props.subtitle, defaultFacilitiesSection.subtitle),
    title: stringValue(props.title, defaultFacilitiesSection.title),
  };
}

function stringArrayValue(value: unknown, fallback: string[]) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;
}

function normalizeRoomShowcaseCard(
  value: unknown,
  fallback?: RoomShowcaseCard,
): RoomShowcaseCard {
  const room = recordValue(value);
  const idFallback =
    fallback?.id ??
    stringValue(room.title, "room").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    amenities: stringArrayValue(room.amenities, fallback?.amenities ?? []),
    badge: stringValue(room.badge, fallback?.badge ?? ""),
    ctaHref: stringValue(room.ctaHref, fallback?.ctaHref ?? "/book"),
    ctaLabel: stringValue(room.ctaLabel, fallback?.ctaLabel ?? "Enquire now"),
    description: stringValue(room.description, fallback?.description ?? ""),
    highlights: stringArrayValue(room.highlights, fallback?.highlights ?? []),
    id: stringValue(room.id, idFallback),
    image: stringValue(room.image, fallback?.image ?? ""),
    occupancy: stringValue(room.occupancy, fallback?.occupancy ?? "Shared room"),
    period: stringValue(room.period, fallback?.period ?? "per month"),
    pricing: stringValue(room.pricing ?? room.price, fallback?.pricing ?? ""),
    roomType: stringValue(room.roomType, fallback?.roomType ?? "Room type"),
    title: stringValue(room.title, fallback?.title ?? "Room"),
  };
}

export function normalizeRoomShowcaseSectionProps(value: unknown): RoomShowcaseSectionProps {
  const props = recordValue(value);
  const cta = recordValue(props.cta);
  const rooms = Array.isArray(props.rooms)
    ? props.rooms.map((room, index) =>
        normalizeRoomShowcaseCard(room, defaultRoomShowcaseSection.rooms[index]),
      )
    : defaultRoomShowcaseSection.rooms;

  return {
    badge: stringValue(props.badge, defaultRoomShowcaseSection.badge),
    cta: {
      enabled:
        typeof cta.enabled === "boolean"
          ? cta.enabled
          : defaultRoomShowcaseSection.cta.enabled,
      href: stringValue(cta.href, defaultRoomShowcaseSection.cta.href),
      label: stringValue(cta.label, defaultRoomShowcaseSection.cta.label),
    },
    rooms: rooms.length > 0 ? rooms : defaultRoomShowcaseSection.rooms,
    subtitle: stringValue(props.subtitle, defaultRoomShowcaseSection.subtitle),
    title: stringValue(props.title, defaultRoomShowcaseSection.title),
  };
}

export function normalizeWebsiteBuilderDraft(value: unknown): WebsiteBuilderDraft {
  const defaults = getDefaultWebsiteBuilderDraft();
  const source = recordValue(value);
  const site = recordValue(source.site);
  const contact = recordValue(source.contact);
  const theme = recordValue(source.theme);
  const hero = recordValue(source.hero);

  const sections = normalizeSections(source.sections ?? source.pageSections);
  const heroSection = sections.find((section) => section.id === "hero");
  const facilitiesSection = sections.find((section) => section.id === "facilities");
  const roomSection = sections.find((section) => section.id === "rooms");

  if (heroSection) {
    heroSection.props = {
      ...staticPublicContent.hero,
      ...hero,
      ...heroSection.props,
    };
  }

  if (facilitiesSection) {
    facilitiesSection.props = normalizeFacilitiesSectionProps(facilitiesSection.props);
  }

  if (roomSection) {
    roomSection.props = normalizeRoomShowcaseSectionProps(roomSection.props);
  }

  return websiteBuilderDraftSchema.parse({
    contact: {
      address: stringValue(contact.address, defaults.contact.address),
      email: stringValue(contact.email, defaults.contact.email),
      mapsLink: stringValue(contact.mapsLink, defaults.contact.mapsLink),
      phone: stringValue(contact.phone, defaults.contact.phone),
      whatsapp: stringValue(contact.whatsapp, defaults.contact.whatsapp),
    },
    sections,
    site: {
      description: stringValue(site.description ?? source.description, defaults.site.description),
      logo: stringValue(site.logo ?? source.logo, defaults.site.logo),
      name: stringValue(site.name ?? source.name, defaults.site.name),
      tagline: stringValue(site.tagline ?? source.tagline, defaults.site.tagline),
    },
    theme: {
      accent: stringValue(theme.accent, defaults.theme.accent),
      primary: stringValue(theme.primary, defaults.theme.primary),
      template: stringValue(theme.template ?? source.template, defaults.theme.template),
    },
  });
}

function getSectionProps(
  draft: WebsiteBuilderDraft,
  sectionId: WebsiteSectionId,
) {
  return draft.sections.find((section) => section.id === sectionId)?.props ?? {};
}

export function buildTenantCMSFromDraft(draft: WebsiteBuilderDraft) {
  const normalizedDraft = normalizeWebsiteBuilderDraft(draft);
  const heroProps = getSectionProps(normalizedDraft, "hero");
  const facilitiesProps = normalizeFacilitiesSectionProps(
    getSectionProps(normalizedDraft, "facilities"),
  );
  const roomShowcaseProps = normalizeRoomShowcaseSectionProps(
    getSectionProps(normalizedDraft, "rooms"),
  );

  return {
    publicContent: {
      ...staticPublicContent,
      facilities: facilitiesProps.items,
      facilitiesSection: facilitiesProps,
      hero: {
        ...staticPublicContent.hero,
        ...heroProps,
      },
      roomShowcaseSection: roomShowcaseProps,
      roomTypes: roomShowcaseProps.rooms.map((room) => ({
        capacity: Number.parseInt(room.occupancy, 10) || 1,
        description: room.description,
        features: room.amenities,
        id: room.id,
        image: room.image,
        period: room.period,
        popular: room.badge.toLowerCase().includes("popular") || room.badge.toLowerCase().includes("request"),
        price: room.pricing,
        title: room.title,
      })),
      pageSections: normalizedDraft.sections,
    },
    tenantScope: null,
    themeConfig: normalizedDraft.theme,
    websiteConfig: {
      ...staticWebsiteConfig,
      contact: {
        ...staticWebsiteConfig.contact,
        ...normalizedDraft.contact,
      },
      description: normalizedDraft.site.description,
      logo: normalizedDraft.site.logo,
      name: normalizedDraft.site.name,
      tagline: normalizedDraft.site.tagline,
    },
  };
}

export function getWebsiteDraftFromMetadata(metadata: unknown) {
  const metadataRecord = recordValue(metadata);
  const savedDraft = metadataRecord.websiteDraft;
  const published = metadataRecord.website;

  return {
    draft: normalizeWebsiteBuilderDraft(savedDraft ?? published),
    hasSavedDraft: Boolean(savedDraft),
    publishedDraft: normalizeWebsiteBuilderDraft(published),
  };
}
