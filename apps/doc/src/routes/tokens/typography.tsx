import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Text } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";

const SPEC_DIVIDER = "border-[color-mix(in_oklch,var(--foreground)_5%,transparent)]";

const TOC = [
  { id: "specimens", title: "Specimens" },
  { id: "headings", title: "Headings" },
  { id: "sans", title: "Sans" },
  { id: "mono", title: "Mono" },
  { id: "color-variants", title: "Color variants" },
] as const;

const SPECIMENS = [
  {
    title: "Heading",
    family: "Space Grotesk",
    className: "font-heading text-2xl font-medium leading-[1.24] text-[var(--foreground)]",
    specimenClassName: "font-heading text-[5.5rem] font-medium leading-none",
  },
  {
    title: "Sans",
    family: "Space Grotesk",
    className: "font-sans text-sm leading-5 text-[var(--foreground-muted)]",
    specimenClassName: "font-sans text-[4.75rem] leading-none",
  },
  {
    title: "Mono",
    family: "Space Mono",
    className: "font-mono text-sm leading-5 text-[var(--foreground-muted)]",
    specimenClassName: "font-mono text-[4.25rem] leading-none",
  },
] as const;

type TypographySpec = {
  category: string;
  name: string;
  family: string;
  utility: string;
  size: string;
  px: string;
  weight: string;
  weightValue: string;
  tracking: string;
  leading: string;
  leadingPx?: string;
  className: string;
  preview: ReactNode;
};

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const HEADING_SCALE = [
  {
    level: "h1",
    size: "3.5rem",
    px: "56px",
    leadingPx: "64px",
    weight: "medium",
    weightValue: "500",
    tracking: "-1%",
  },
  {
    level: "h2",
    size: "3rem",
    px: "48px",
    leadingPx: "56px",
    weight: "medium",
    weightValue: "500",
    tracking: "-1%",
  },
  {
    level: "h3",
    size: "2.5rem",
    px: "40px",
    leadingPx: "48px",
    weight: "medium",
    weightValue: "500",
    tracking: "-1%",
  },
  {
    level: "h4",
    size: "2rem",
    px: "32px",
    leadingPx: "40px",
    weight: "medium",
    weightValue: "500",
    tracking: "-0.5%",
  },
  {
    level: "h5",
    size: "1.5rem",
    px: "24px",
    leadingPx: "32px",
    weight: "medium",
    weightValue: "500",
    tracking: "0%",
  },
  {
    level: "h6",
    size: "1.25rem",
    px: "20px",
    leadingPx: "28px",
    weight: "medium",
    weightValue: "500",
    tracking: "0%",
  },
] as const;

const SANS_SIZE_BY_TITLE = {
  Large: "large",
  Body: "body",
  Small: "small",
  Caption: "caption",
} as const;

const MONO_SIZE_BY_TITLE = {
  Code: "code",
  Meta: "meta",
  Eyebrow: "eyebrow",
  Tabular: "tabular",
} as const;

const TEXT_COLOR_VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const SANS_TYPOGRAPHY = [
  {
    title: "Large",
    family: "Space Grotesk",
    utility: "font-sans text-lg",
    size: "1.125rem",
    px: "18px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.75",
    className: "font-sans text-lg font-normal leading-7 text-[var(--foreground)]",
  },
  {
    title: "Body",
    family: "Space Grotesk",
    utility: "font-sans text-base",
    size: "1rem",
    px: "16px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.5",
    className: "font-sans text-base font-normal leading-6 text-[var(--foreground)]",
  },
  {
    title: "Small",
    family: "Space Grotesk",
    utility: "font-sans text-sm",
    size: "0.875rem",
    px: "14px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.43",
    className: "font-sans text-sm font-normal leading-5 text-[var(--foreground-muted)]",
  },
  {
    title: "Caption",
    family: "Space Grotesk",
    utility: "font-sans text-xs",
    size: "0.75rem",
    px: "12px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.33",
    className: "font-sans text-xs font-normal leading-4 text-[var(--foreground-muted)]",
  },
] as const;

const MONO_TYPOGRAPHY = [
  {
    title: "Code",
    family: "Space Mono",
    utility: "font-mono text-sm",
    size: "0.875rem",
    px: "14px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.43",
    className: "font-mono text-sm font-normal leading-5 text-[var(--foreground)]",
  },
  {
    title: "Meta",
    family: "Space Mono",
    utility: "font-mono text-xs",
    size: "0.75rem",
    px: "12px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.33",
    className: "font-mono text-xs font-normal leading-4 text-[var(--foreground-muted)]",
  },
  {
    title: "Eyebrow",
    family: "Space Mono",
    utility: "font-mono text-[10px] uppercase tracking-wide",
    size: "0.625rem",
    px: "10px",
    weight: "medium",
    weightValue: "500",
    tracking: "0.05em",
    leading: "1",
    className:
      "font-mono text-[10px] font-medium uppercase tracking-wide leading-none text-[var(--foreground-hint)]",
  },
  {
    title: "Tabular",
    family: "Space Mono",
    utility: "font-mono text-sm tabular-nums",
    size: "0.875rem",
    px: "14px",
    weight: "regular",
    weightValue: "400",
    tracking: "0em",
    leading: "1.43",
    className: "font-mono text-sm font-normal tabular-nums leading-5 text-[var(--foreground)]",
  },
] as const;

const SAMPLE_TEXT = "Where humans and AI agents build together.";

export const Route = createFileRoute("/tokens/typography")({
  component: TypographyDoc,
});

function TypographyDoc() {
  return (
    <TypographyPageScope>
      <DocPage
        title="Typography"
        description="The font contract."
        articleClassName="mx-auto max-w-5xl 2xl:max-w-6xl"
        toc={TOC}
      >
        <DocSection id="specimens" title="Specimens">
          <TypographyScope>
            <SpecimenCard />
          </TypographyScope>
        </DocSection>

        <DocSection id="headings" title="Headings">
          <TypographyScope>
            <TypographySpecList specs={HEADING_SPECS} />
          </TypographyScope>
        </DocSection>

        <DocSection id="sans" title="Sans">
          <TypographyScope>
            <TypographySpecList specs={SANS_SPECS} />
          </TypographyScope>
        </DocSection>

        <DocSection id="mono" title="Mono">
          <TypographyScope>
            <TypographySpecList specs={MONO_SPECS} />
          </TypographyScope>
        </DocSection>

        <DocSection id="color-variants" title="Color variants">
          <TypographyScope>
            <TextColorVariantList />
          </TypographyScope>
        </DocSection>
      </DocPage>
    </TypographyPageScope>
  );
}

const HEADING_SPECS: TypographySpec[] = HEADING_SCALE.map((heading) => ({
  category: "",
  name: heading.level,
  family: SPECIMENS[0].family,
  utility: "font-heading",
  size: heading.size,
  px: heading.px,
  weight: heading.weight,
  weightValue: heading.weightValue,
  tracking: heading.tracking,
  leading: "",
  leadingPx: heading.leadingPx,
  className: "",
  preview: createHeadingPreview(heading.level),
}));

const SANS_SPECS: TypographySpec[] = SANS_TYPOGRAPHY.map(({ title, ...rest }) => ({
  category: "Sans",
  name: title,
  ...rest,
  preview: (
    <Text.Sans size={SANS_SIZE_BY_TITLE[title]} className="whitespace-nowrap">
      {SAMPLE_TEXT}
    </Text.Sans>
  ),
}));

const MONO_SPECS: TypographySpec[] = MONO_TYPOGRAPHY.map(({ title, ...rest }) => ({
  category: "Mono",
  name: title,
  ...rest,
  preview: (
    <Text.Mono size={MONO_SIZE_BY_TITLE[title]} className="whitespace-nowrap">
      {SAMPLE_TEXT}
    </Text.Mono>
  ),
}));

function createHeadingPreview(level: (typeof HEADING_LEVELS)[number]) {
  const levelNumber = Number(level.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;

  return (
    <Text.Heading level={levelNumber} className="whitespace-nowrap">
      {SAMPLE_TEXT}
    </Text.Heading>
  );
}

function TypographyPageScope({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-layer-canvas font-sans [&_article_header_h1]:font-heading [&_article_header_h1]:!font-medium [&_article_header_p]:font-sans [&_article_header_p]:!text-base [&_section]:border-t-0 [&_section>h2]:font-heading"
      style={{
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function TypographyScope({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-[color-mix(in_oklch,var(--foreground)_5%,transparent)]"
      style={{
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function TypographySpecList({ specs }: { specs: TypographySpec[] }) {
  return (
    <>
      {specs.map((spec) => (
        <TypographySpecRow
          key={spec.category ? `${spec.category}-${spec.name}` : spec.name}
          spec={spec}
        />
      ))}
    </>
  );
}

const TEXT_COLOR_VARIANT_SPECS: TypographySpec[] = TEXT_COLOR_VARIANTS.map((variant) => ({
  category: "Variant",
  name: variant,
  family: "Text.Sans",
  utility: `variant="${variant}"`,
  size: "",
  px: "",
  weight: "",
  weightValue: "",
  tracking: "",
  leading: "",
  className: "",
  preview: (
    <Text.Sans size="small" variant={variant} className="whitespace-nowrap">
      {SAMPLE_TEXT}
    </Text.Sans>
  ),
}));

function TextColorVariantList() {
  return (
    <>
      {TEXT_COLOR_VARIANT_SPECS.map((spec) => (
        <TypographySpecRow key={spec.name} spec={spec} />
      ))}
    </>
  );
}

function formatTracking(tracking: string) {
  if (tracking.endsWith("%")) {
    return tracking;
  }

  if (tracking.endsWith("em")) {
    return `${parseFloat(tracking) * 100}%`;
  }

  return tracking;
}

function toLeadingPx(px: string, leading: string) {
  return `${Math.round(parseFloat(px) * parseFloat(leading))}px`;
}

function TypographySpecMeta({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-end font-mono text-xs uppercase tracking-wide">
      {items.map((item, index) => (
        <span key={item.label} className={index === 0 ? "pr-4" : `border-l px-4 ${SPEC_DIVIDER}`}>
          <span className="text-foreground-hint">{item.label}:</span>{" "}
          <span className="text-foreground">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function TypographySpecRow({ spec }: { spec: TypographySpec }) {
  const weight = [spec.weight, spec.weightValue].filter(Boolean).join(" / ");
  const lineHeight =
    spec.leadingPx ?? (spec.px && spec.leading ? toLeadingPx(spec.px, spec.leading) : "");
  const metaItems = useMemo(
    () =>
      [
        { label: "Weight", value: weight },
        { label: "Font size", value: spec.px },
        { label: "Line height", value: lineHeight },
        { label: "Letter spacing", value: formatTracking(spec.tracking) },
      ].filter((item) => item.value),
    [weight, spec.px, lineHeight, spec.tracking],
  );

  // The preview is a rendered sample; in Markdown a `<h1>` sample would become a
  // stray top-level heading. List the spec instead.
  if (isMarkdownMode()) {
    return (
      <section>
        <h3>{spec.category ? `${spec.category} / ${spec.name}` : spec.name}</h3>
        <ul>
          {spec.family ? <li>Family: {spec.family}</li> : null}
          {spec.utility ? (
            <li>
              Usage: <code>{spec.utility}</code>
            </li>
          ) : null}
          {metaItems.map((item) => (
            <li key={item.label}>
              {item.label}: {item.value}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="py-11">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <p className="text-sm font-medium uppercase text-foreground">
          {spec.category ? `${spec.category} / ${spec.name}` : spec.name}
        </p>
        {metaItems.length > 0 ? <TypographySpecMeta items={metaItems} /> : null}
      </div>
      <div className="mt-[60px] min-w-0 overflow-x-auto text-foreground">{spec.preview}</div>
    </div>
  );
}

function SpecimenCard() {
  return (
    <>
      {SPECIMENS.map((sample) => (
        <div
          key={sample.title}
          className="grid min-w-0 items-end gap-x-10 gap-y-6 pt-7 pb-3.5 md:grid-cols-[9rem_minmax(0,1fr)_9rem]"
        >
          <div className="grid min-w-0 content-end gap-1 pb-1">
            <p className="text-sm font-medium text-foreground">{sample.title}</p>
            <p className="text-xs text-foreground-muted">{sample.family}</p>
          </div>
          <div className="min-w-0 overflow-x-auto pb-1">
            <p className={`${sample.className} whitespace-nowrap`}>{SAMPLE_TEXT}</p>
          </div>
          <div className="flex items-end justify-start md:justify-end">
            <div
              className={sample.specimenClassName}
              style={{
                color: "var(--foreground)",
              }}
            >
              Aa
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
