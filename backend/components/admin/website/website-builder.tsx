"use client";

import type { CSSProperties } from "react";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Laptop,
  Loader2,
  PanelLeft,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from "lucide-react";

import { PageRenderer } from "@/components/marketing/page-renderer";
import { TenantProvider } from "@/components/providers/tenant-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { updateWebsiteCMS } from "@/lib/actions/cms";
import {
  buildTenantCMSFromDraft,
  normalizeFacilitiesSectionProps,
  normalizeWebsiteBuilderDraft,
  websiteSectionDefinitions,
  type FacilitiesSectionProps,
  type WebsiteBuilderDraft,
  type WebsiteBuilderSection,
  type WebsiteSectionId,
} from "@/lib/website-builder/sections";
import { cn } from "@/lib/utils";

type PreviewMode = "desktop" | "tablet" | "mobile";

type WebsiteBuilderProps = {
  hasSavedDraft: boolean;
  initialDraft: WebsiteBuilderDraft;
};

const inputClassName = "erp-control w-full";

const previewModes: {
  icon: typeof Laptop;
  id: PreviewMode;
  label: string;
  width: number;
}[] = [
  { icon: Laptop, id: "desktop", label: "Desktop", width: 1180 },
  { icon: Tablet, id: "tablet", label: "Tablet", width: 768 },
  { icon: Smartphone, id: "mobile", label: "Mobile", width: 390 },
];

const facilityIconOptions = [
  "sparkles",
  "shield",
  "wifi",
  "utensils",
  "droplet",
  "car",
  "coffee",
  "bed",
] as const;

function serializedDraft(draft: WebsiteBuilderDraft) {
  return JSON.stringify(draft);
}

function sectionDefinition(sectionId: WebsiteSectionId) {
  return websiteSectionDefinitions.find((definition) => definition.id === sectionId);
}

function heroString(
  draft: WebsiteBuilderDraft,
  key: string,
  fallback: string,
) {
  const value = draft.sections.find((section) => section.id === "hero")?.props[key];

  return typeof value === "string" ? value : fallback;
}

function getFacilitiesSection(draft: WebsiteBuilderDraft) {
  return draft.sections.find((section) => section.id === "facilities");
}

function actionStateMessage(state: Awaited<ReturnType<typeof updateWebsiteCMS>> | null) {
  if (!state) {
    return null;
  }

  if ("error" in state && state.error) {
    return { tone: "error" as const, value: state.error };
  }

  if ("success" in state && state.success) {
    return { tone: "success" as const, value: state.message };
  }

  return null;
}

export function WebsiteBuilder({
  hasSavedDraft: initialHasSavedDraft,
  initialDraft,
}: WebsiteBuilderProps) {
  const normalizedInitialDraft = useMemo(
    () => normalizeWebsiteBuilderDraft(initialDraft),
    [initialDraft],
  );
  const [draft, setDraft] = useState(normalizedInitialDraft);
  const [persistedDraft, setPersistedDraft] = useState(normalizedInitialDraft);
  const [hasSavedDraft, setHasSavedDraft] = useState(initialHasSavedDraft);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [state, formAction, isPending] = useActionState(updateWebsiteCMS, null);

  const previewData = useMemo(() => buildTenantCMSFromDraft(draft), [draft]);
  const draftPayload = useMemo(() => serializedDraft(draft), [draft]);
  const hasLocalChanges = draftPayload !== serializedDraft(persistedDraft);
  const status = actionStateMessage(state);
  const activePreview = previewModes.find((mode) => mode.id === previewMode) ?? previewModes[0]!;
  const facilitiesSection = getFacilitiesSection(draft);
  const facilitiesProps = useMemo(
    () => normalizeFacilitiesSectionProps(facilitiesSection?.props),
    [facilitiesSection?.props],
  );

  function updateSiteField(field: keyof WebsiteBuilderDraft["site"], value: string) {
    setDraft((current) => ({
      ...current,
      site: {
        ...current.site,
        [field]: value,
      },
    }));
  }

  function updateContactField(field: keyof WebsiteBuilderDraft["contact"], value: string) {
    setDraft((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  }

  function updateThemeField(field: keyof WebsiteBuilderDraft["theme"], value: string) {
    setDraft((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [field]: value,
      },
    }));
  }

  function updateSection(sectionId: WebsiteSectionId, changes: Partial<WebsiteBuilderSection>) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...changes } : section,
      ),
    }));
  }

  function updateSectionProps(
    sectionId: WebsiteSectionId,
    props: Record<string, unknown>,
  ) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId
          ? { ...section, props: { ...section.props, ...props } }
          : section,
      ),
    }));
  }

  function updateFacilitiesProps(
    updater: (props: FacilitiesSectionProps) => FacilitiesSectionProps,
  ) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== "facilities") {
          return section;
        }

        return {
          ...section,
          props: updater(normalizeFacilitiesSectionProps(section.props)),
        };
      }),
    }));
  }

  function updateFacilityItem(
    index: number,
    field: keyof FacilitiesSectionProps["items"][number],
    value: string,
  ) {
    updateFacilitiesProps((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addFacilityItem() {
    updateFacilitiesProps((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          description: "Describe the amenity in a clear, hostel-friendly way.",
          highlight: "",
          icon: "sparkles",
          title: "New amenity",
        },
      ],
    }));
  }

  function removeFacilityItem(index: number) {
    updateFacilitiesProps((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function moveFacilityItem(index: number, direction: "up" | "down") {
    updateFacilitiesProps((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.items.length) {
        return current;
      }

      const items = [...current.items];
      const [item] = items.splice(index, 1);

      if (!item) {
        return current;
      }

      items.splice(targetIndex, 0, item);

      return { ...current, items };
    });
  }

  function moveSection(sectionId: WebsiteSectionId, direction: "up" | "down") {
    setDraft((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      const [section] = sections.splice(index, 1);

      if (!section) {
        return current;
      }

      sections.splice(targetIndex, 0, section);

      return { ...current, sections };
    });
  }

  function discardLocalChanges() {
    setDraft(persistedDraft);
  }

  function markDraftOptimisticallyPersisted() {
    setHasSavedDraft(true);
    setPersistedDraft(draft);
  }

  function markDraftOptimisticallyPublished() {
    setHasSavedDraft(false);
    setPersistedDraft(draft);
  }

  function markSavedDraftOptimisticallyDiscarded() {
    setHasSavedDraft(false);
    setDraft(normalizedInitialDraft);
    setPersistedDraft(normalizedInitialDraft);
  }

  return (
    <form action={formAction} className="space-y-6">
      <input name="actionType" type="hidden" value="builder" />
      <input name="draftPayload" type="hidden" value={draftPayload} />

      <PageHeader
        actions={
          <>
            <Button
              disabled={!hasLocalChanges || isPending}
              onClick={discardLocalChanges}
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" />
              Discard local
            </Button>
            {hasSavedDraft ? (
              <Button
                disabled={isPending}
                name="builderAction"
                onClick={markSavedDraftOptimisticallyDiscarded}
                type="submit"
                value="discard"
                variant="outline"
              >
                <EyeOff aria-hidden="true" />
                Discard saved draft
              </Button>
            ) : null}
            <Button
              disabled={isPending}
              name="builderAction"
              onClick={markDraftOptimisticallyPersisted}
              type="submit"
              value="save_draft"
              variant="secondary"
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              Save draft
            </Button>
            <Button
              disabled={isPending}
              name="builderAction"
              onClick={markDraftOptimisticallyPublished}
              type="submit"
              value="publish"
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              Publish
            </Button>
          </>
        }
        description="Edit content on the left and preview the real public website rendering on the right before saving or publishing."
        eyebrow="Live website builder"
        title="Website builder"
      />

      {status ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            status.tone === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-success/30 bg-success/10 text-success",
          )}
        >
          {status.value}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          description={hasLocalChanges ? "Local edits are preview-only until saved." : "Preview matches the saved draft."}
          icon={Eye}
          label="Draft state"
          tone={hasLocalChanges ? "warning" : "success"}
          value={hasLocalChanges ? "Unsaved" : "Saved"}
        />
        <StatCard
          description="Sections use a normalized id, enabled, variant, and props contract."
          icon={PanelLeft}
          label="Sections"
          value={String(draft.sections.length)}
        />
        <StatCard
          description="Public colors preview instantly without a database write."
          icon={CheckCircle2}
          label="Theme"
          tone="info"
          value={draft.theme.template}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-1">
          <SectionCard
            contentClassName="space-y-4"
            description="Tenant identity, primary brand copy, and public contact details."
            title="Brand and contact"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="space-y-2">
                <span className="text-sm font-medium">Hostel name</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateSiteField("name", event.target.value)}
                  value={draft.site.name}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Logo text</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateSiteField("logo", event.target.value)}
                  value={draft.site.logo}
                />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Tagline</span>
              <input
                className={inputClassName}
                onChange={(event) => updateSiteField("tagline", event.target.value)}
                value={draft.site.tagline}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Description</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) => updateSiteField("description", event.target.value)}
                value={draft.site.description}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="space-y-2">
                <span className="text-sm font-medium">Phone</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateContactField("phone", event.target.value)}
                  value={draft.contact.phone}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">WhatsApp</span>
                <input
                  className={inputClassName}
                  onChange={(event) => updateContactField("whatsapp", event.target.value)}
                  value={draft.contact.whatsapp}
                />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input
                className={inputClassName}
                onChange={(event) => updateContactField("email", event.target.value)}
                value={draft.contact.email}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Address</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) => updateContactField("address", event.target.value)}
                value={draft.contact.address}
              />
            </label>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-4"
            description="Small theme controls now; richer tenant themes can build on this contract later."
            title="Brand theme"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="space-y-2">
                <span className="text-sm font-medium">Primary color</span>
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-2">
                  <span
                    className="size-9 rounded-md border border-border"
                    style={{ backgroundColor: draft.theme.primary }}
                  />
                  <input
                    className={inputClassName}
                    onChange={(event) => updateThemeField("primary", event.target.value)}
                    value={draft.theme.primary}
                  />
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Accent color</span>
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-2">
                  <span
                    className="size-9 rounded-md border border-border"
                    style={{ backgroundColor: draft.theme.accent }}
                  />
                  <input
                    className={inputClassName}
                    onChange={(event) => updateThemeField("accent", event.target.value)}
                    value={draft.theme.accent}
                  />
                </div>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Template</span>
              <select
                className={inputClassName}
                onChange={(event) => updateThemeField("template", event.target.value)}
                value={draft.theme.template}
              >
                <option value="modern">Modern hostel</option>
                <option value="minimal">Minimal</option>
                <option value="premium">Premium</option>
              </select>
            </label>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-4"
            description="The hero is the highest-impact conversion section for public hostel websites."
            title="Hero content"
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium">Badge</span>
              <input
                className={inputClassName}
                onChange={(event) => updateSectionProps("hero", { badge: event.target.value })}
                value={heroString(draft, "badge", "")}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Heading</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) => updateSectionProps("hero", { heading: event.target.value })}
                value={heroString(draft, "heading", draft.site.name)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Supporting copy</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) => updateSectionProps("hero", { description: event.target.value })}
                value={heroString(draft, "description", draft.site.description)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Hero image URL</span>
              <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                <input
                  className={inputClassName}
                  onChange={(event) => updateSectionProps("hero", { image: event.target.value })}
                  value={heroString(draft, "image", "")}
                />
                <Button disabled type="button" variant="outline">
                  <Upload aria-hidden="true" />
                  Asset upload later
                </Button>
              </div>
            </label>
          </SectionCard>

          <SectionCard
            actions={
              <Button onClick={addFacilityItem} type="button" variant="outline">
                <Plus aria-hidden="true" />
                Add amenity
              </Button>
            }
            contentClassName="space-y-4"
            description="Configure hostel amenities as premium hospitality content, not generic feature cards."
            title="Facilities and amenities"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="space-y-2">
                <span className="text-sm font-medium">Section variant</span>
                <select
                  className={inputClassName}
                  onChange={(event) => updateSection("facilities", { variant: event.target.value })}
                  value={facilitiesSection?.variant ?? "premium-grid"}
                >
                  {(sectionDefinition("facilities")?.variants ?? []).map((variant) => (
                    <option key={variant} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                <input
                  checked={facilitiesSection?.enabled ?? true}
                  className="size-4 rounded border-border"
                  onChange={(event) => updateSection("facilities", { enabled: event.target.checked })}
                  type="checkbox"
                />
                Show facilities section
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Badge</span>
              <input
                className={inputClassName}
                onChange={(event) =>
                  updateFacilitiesProps((current) => ({
                    ...current,
                    badge: event.target.value,
                  }))
                }
                value={facilitiesProps.badge}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Title</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) =>
                  updateFacilitiesProps((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                value={facilitiesProps.title}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Subtitle</span>
              <textarea
                className="erp-control min-h-20 w-full"
                onChange={(event) =>
                  updateFacilitiesProps((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
                value={facilitiesProps.subtitle}
              />
            </label>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  checked={facilitiesProps.cta.enabled}
                  className="size-4 rounded border-border"
                  onChange={(event) =>
                    updateFacilitiesProps((current) => ({
                      ...current,
                      cta: { ...current.cta, enabled: event.target.checked },
                    }))
                  }
                  type="checkbox"
                />
                Show section CTA
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label className="space-y-2">
                  <span className="text-sm font-medium">CTA label</span>
                  <input
                    className={inputClassName}
                    onChange={(event) =>
                      updateFacilitiesProps((current) => ({
                        ...current,
                        cta: { ...current.cta, label: event.target.value },
                      }))
                    }
                    value={facilitiesProps.cta.label}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">CTA link</span>
                  <input
                    className={inputClassName}
                    onChange={(event) =>
                      updateFacilitiesProps((current) => ({
                        ...current,
                        cta: { ...current.cta, href: event.target.value },
                      }))
                    }
                    value={facilitiesProps.cta.href}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {facilitiesProps.items.map((facility, index) => (
                <div
                  className="rounded-lg border border-border bg-background p-3"
                  key={`${facility.title}-${index}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Amenity {index + 1}</p>
                    <div className="flex gap-2">
                      <Button
                        aria-label={`Move ${facility.title} up`}
                        disabled={index === 0}
                        onClick={() => moveFacilityItem(index, "up")}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={`Move ${facility.title} down`}
                        disabled={index === facilitiesProps.items.length - 1}
                        onClick={() => moveFacilityItem(index, "down")}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={`Remove ${facility.title}`}
                        disabled={facilitiesProps.items.length <= 1}
                        onClick={() => removeFacilityItem(index)}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Title</span>
                      <input
                        className={inputClassName}
                        onChange={(event) => updateFacilityItem(index, "title", event.target.value)}
                        value={facility.title}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Icon</span>
                      <select
                        className={inputClassName}
                        onChange={(event) => updateFacilityItem(index, "icon", event.target.value)}
                        value={facility.icon}
                      >
                        {facilityIconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 block space-y-2">
                    <span className="text-sm font-medium">Highlight badge</span>
                    <input
                      className={inputClassName}
                      onChange={(event) => updateFacilityItem(index, "highlight", event.target.value)}
                      placeholder="Optional, e.g. 24/7, Included, Safe"
                      value={facility.highlight ?? ""}
                    />
                  </label>
                  <label className="mt-3 block space-y-2">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                      className="erp-control min-h-20 w-full"
                      onChange={(event) => updateFacilityItem(index, "description", event.target.value)}
                      value={facility.description}
                    />
                  </label>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            contentClassName="space-y-3"
            description="Reorder with buttons now. This data shape can later power drag-and-drop, duplication, and section libraries."
            title="Sections"
          >
            {draft.sections.map((section, index) => {
              const definition = sectionDefinition(section.id);

              return (
                <div
                  className="rounded-lg border border-border bg-background p-3"
                  key={section.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{definition?.label ?? section.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {definition?.description}
                      </p>
                    </div>
                    <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                      <input
                        checked={section.enabled}
                        className="size-4 rounded border-border"
                        onChange={(event) => updateSection(section.id, { enabled: event.target.checked })}
                        type="checkbox"
                      />
                      {section.enabled ? "Visible" : "Hidden"}
                    </label>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <select
                      className={inputClassName}
                      onChange={(event) => updateSection(section.id, { variant: event.target.value })}
                      value={section.variant}
                    >
                      {(definition?.variants ?? ["default"]).map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        aria-label={`Move ${definition?.label ?? section.id} up`}
                        disabled={index === 0}
                        onClick={() => moveSection(section.id, "up")}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={`Move ${definition?.label ?? section.id} down`}
                        disabled={index === draft.sections.length - 1}
                        onClick={() => moveSection(section.id, "down")}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </SectionCard>
        </div>

        <SectionCard
          className="xl:sticky xl:top-6 xl:self-start"
          contentClassName="space-y-4"
          description="Preview uses the live public renderer and tenant provider, but does not write changes until you save or publish."
          title="Live preview"
          actions={
            <div className="flex rounded-md border border-border bg-muted/40 p-1">
              {previewModes.map((mode) => (
                <button
                  aria-pressed={previewMode === mode.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                    previewMode === mode.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id)}
                  type="button"
                >
                  <mode.icon aria-hidden="true" className="size-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>
          }
        >
          <div className="overflow-auto rounded-xl border border-border bg-muted p-4">
            <div
              className="mx-auto min-h-[720px] overflow-hidden rounded-lg border border-border bg-background shadow-xl transition-[width] duration-300"
              style={
                {
                  "--accent": draft.theme.accent,
                  "--primary": draft.theme.primary,
                  width: activePreview.width,
                } as CSSProperties
              }
            >
              <TenantProvider data={previewData}>
                <div data-template={draft.theme.template}>
                  <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-5 py-4 text-white">
                    <div className="font-heading text-lg font-extrabold tracking-tight">
                      {draft.site.logo || draft.site.name}
                    </div>
                    <div className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-widest text-white/70 md:flex">
                      {previewData.websiteConfig.mainNav.slice(0, 5).map((item) => (
                        <span key={item.href}>{item.title}</span>
                      ))}
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      Preview
                    </div>
                  </div>
                  <div className="pointer-events-none">
                    <PageRenderer sections={draft.sections} />
                  </div>
                </div>
              </TenantProvider>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Responsive modes resize the preview frame for editing confidence. Final browser validation should still happen on real devices before launch.
          </p>
        </SectionCard>
      </div>
    </form>
  );
}
