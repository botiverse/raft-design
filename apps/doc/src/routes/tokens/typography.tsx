import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactElement, ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

const SPEC_DIVIDER = "border-[color-mix(in_oklch,var(--foreground-strong)_5%,transparent)]";

export type TypographyTheme = "brutal" | "elegant";

const THEME_LABELS = {
  brutal: "Brutal",
  elegant: "Elegant",
} as const satisfies Record<TypographyTheme, string>;

const FAMILIES = [
  {
    theme: "Brutal",
    themeId: "brutal",
    status: undefined,
    heading: "FK Grotesk",
    sans: "FK Grotesk",
    mono: "Berkeley Mono",
    samples: [
      {
        title: "Heading",
        family: "FK Grotesk",
        utility: "font-heading",
        px: "24px",
        className:
          "font-heading text-2xl font-medium leading-[1.24] text-[var(--foreground-strong)]",
        specimenClassName: "font-heading text-[5.5rem] font-semibold leading-none",
      },
      {
        title: "Sans",
        family: "FK Grotesk",
        utility: "font-sans",
        px: "14px",
        className: "font-sans text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-sans text-[4.75rem] leading-none",
      },
      {
        title: "Mono",
        family: "Berkeley Mono",
        utility: "font-mono",
        px: "14px",
        className: "font-mono text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-mono text-[4.25rem] leading-none",
      },
    ],
  },
  {
    theme: "Elegant",
    themeId: "elegant",
    status: "in-progress",
    heading: "Inter",
    sans: "Geist",
    mono: "Berkeley Mono",
    samples: [
      {
        title: "Heading",
        family: "Inter",
        utility: "font-heading",
        px: "24px",
        className:
          "font-heading text-2xl font-medium leading-[1.24] text-[var(--foreground-strong)]",
        specimenClassName: "font-heading text-[5.5rem] font-medium leading-none",
      },
      {
        title: "Sans",
        family: "Geist",
        utility: "font-sans",
        px: "14px",
        className: "font-sans text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-sans text-[4.75rem] leading-none",
      },
      {
        title: "Mono",
        family: "Berkeley Mono",
        utility: "font-mono",
        px: "14px",
        className: "font-mono text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-mono text-[4.25rem] leading-none",
      },
    ],
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

const THEME_TYPOGRAPHY = {
  brutal: {
    headings: HEADING_SCALE,
    body: [
      {
        title: "Large",
        family: "FK Grotesk",
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
        family: "FK Grotesk",
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
        family: "FK Grotesk",
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
        family: "FK Grotesk",
        utility: "font-sans text-xs",
        size: "0.75rem",
        px: "12px",
        weight: "regular",
        weightValue: "400",
        tracking: "0em",
        leading: "1.33",
        className: "font-sans text-xs font-normal leading-4 text-[var(--foreground-muted)]",
      },
    ],
    mono: [
      {
        title: "Code",
        family: "Berkeley Mono",
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
        family: "Berkeley Mono",
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
        family: "Berkeley Mono",
        utility: "font-mono text-[10px] uppercase tracking-wide",
        size: "0.625rem",
        px: "10px",
        weight: "medium",
        weightValue: "500",
        tracking: "0.05em",
        leading: "1",
        className:
          "font-mono text-[10px] font-medium uppercase tracking-wide leading-none text-[var(--foreground-placeholder)]",
      },
      {
        title: "Tabular",
        family: "Berkeley Mono",
        utility: "font-mono text-sm tabular-nums",
        size: "0.875rem",
        px: "14px",
        weight: "regular",
        weightValue: "400",
        tracking: "0em",
        leading: "1.43",
        className: "font-mono text-sm font-normal tabular-nums leading-5 text-[var(--foreground)]",
      },
    ],
  },
  elegant: {
    headings: HEADING_SCALE,
    body: [
      {
        title: "Large",
        family: "Geist",
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
        family: "Geist",
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
        family: "Geist",
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
        family: "Geist",
        utility: "font-sans text-xs",
        size: "0.75rem",
        px: "12px",
        weight: "regular",
        weightValue: "400",
        tracking: "0em",
        leading: "1.33",
        className: "font-sans text-xs font-normal leading-4 text-[var(--foreground-muted)]",
      },
    ],
    mono: [
      {
        title: "Code",
        family: "Berkeley Mono",
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
        family: "Berkeley Mono",
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
        family: "Berkeley Mono",
        utility: "font-mono text-[10px] uppercase tracking-wide",
        size: "0.625rem",
        px: "10px",
        weight: "medium",
        weightValue: "500",
        tracking: "0.05em",
        leading: "1",
        className:
          "font-mono text-[10px] font-medium uppercase tracking-wide leading-none text-[var(--foreground-placeholder)]",
      },
      {
        title: "Tabular",
        family: "Berkeley Mono",
        utility: "font-mono text-sm tabular-nums",
        size: "0.875rem",
        px: "14px",
        weight: "regular",
        weightValue: "400",
        tracking: "0em",
        leading: "1.43",
        className: "font-mono text-sm font-normal tabular-nums leading-5 text-[var(--foreground)]",
      },
    ],
  },
} as const;

const SAMPLE_TEXT = "Where humans and AI agents build together.";

export const Route = createFileRoute("/tokens/typography")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/tokens/typography") {
      throw redirect({ to: "/tokens/typography/brutal" });
    }
  },
  component: TokenOutlet,
});

function TokenOutlet() {
  return <Outlet />;
}

export function TypographyDoc({ theme }: { theme: TypographyTheme }) {
  const families = FAMILIES.filter((family) => family.themeId === theme);
  const typography = THEME_TYPOGRAPHY[theme];
  const title = `${THEME_LABELS[theme]} typography`;

  const headingSpecs: TypographySpec[] = typography.headings.map((heading) => ({
    category: "",
    name: heading.level,
    family: families[0]?.heading ?? "font-heading",
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

  const bodySpecs: TypographySpec[] = typography.body.map((item) => {
    const { title, ...rest } = item;

    return {
      category: "Sans",
      name: title,
      ...rest,
      preview: <p className={`${item.className} whitespace-nowrap`}>{SAMPLE_TEXT}</p>,
    };
  });

  const monoSpecs: TypographySpec[] = typography.mono.map((item) => {
    const { title, ...rest } = item;

    return {
      category: "Mono",
      name: title,
      ...rest,
      preview: <p className={`${item.className} whitespace-nowrap`}>{SAMPLE_TEXT}</p>,
    };
  });

  return (
    <TokenThemeScope theme={theme}>
      <DocPage title={title} description="The font contract." showToc={false} toc={[]}>
        <DocSection id="specimens" title="Theme specimens">
          <ThemeTypographyScope theme={theme}>
            {families.map((family) => (
              <SpecimenCard key={family.theme} family={family} />
            ))}
          </ThemeTypographyScope>
        </DocSection>

        <DocSection id="headings" title="Headings">
          <ThemeTypographyScope theme={theme}>
            <TypographySpecList specs={headingSpecs} />
          </ThemeTypographyScope>
        </DocSection>

        <DocSection id="sans" title="Sans">
          <ThemeTypographyScope theme={theme}>
            <TypographySpecList specs={bodySpecs} />
          </ThemeTypographyScope>
        </DocSection>

        <DocSection id="mono" title="Mono">
          <ThemeTypographyScope theme={theme}>
            <TypographySpecList specs={monoSpecs} />
          </ThemeTypographyScope>
        </DocSection>
      </DocPage>
    </TokenThemeScope>
  );
}

function createHeadingPreview(level: (typeof HEADING_LEVELS)[number]) {
  const headings: Record<(typeof HEADING_LEVELS)[number], ReactElement> = {
    h1: <h1 className="whitespace-nowrap">{SAMPLE_TEXT}</h1>,
    h2: <h2 className="whitespace-nowrap">{SAMPLE_TEXT}</h2>,
    h3: <h3 className="whitespace-nowrap">{SAMPLE_TEXT}</h3>,
    h4: <h4 className="whitespace-nowrap">{SAMPLE_TEXT}</h4>,
    h5: <h5 className="whitespace-nowrap">{SAMPLE_TEXT}</h5>,
    h6: <h6 className="whitespace-nowrap">{SAMPLE_TEXT}</h6>,
  };

  return headings[level];
}

function TokenThemeScope({ theme, children }: { theme: TypographyTheme; children: ReactNode }) {
  return (
    <div
      data-token-theme-scope={theme}
      data-theme={theme}
      className="light min-h-screen font-sans [&_article_header_h1]:font-heading [&_article_header_h1]:!font-medium [&_article_header_p]:font-sans [&_article_header_p]:!text-base [&_section]:border-t-0 [&_section>h2]:pl-8 [&_section>h2]:font-heading"
      style={{
        background: "var(--layer-page)",
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function ThemeTypographyScope({
  theme,
  children,
}: {
  theme: TypographyTheme;
  children: ReactNode;
}) {
  return (
    <div
      data-theme={theme}
      className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-[color-mix(in_oklch,var(--foreground-strong)_5%,transparent)]"
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
          <span className="text-foreground-placeholder">{item.label}:</span>{" "}
          <span className="text-foreground-strong">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function TypographySpecRow({ spec }: { spec: TypographySpec }) {
  const lineHeight = spec.leadingPx ?? toLeadingPx(spec.px, spec.leading);

  return (
    <div className="px-8 py-11">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <p className="text-sm font-medium uppercase text-foreground-strong">
          {spec.category ? `${spec.category} / ${spec.name}` : spec.name}
        </p>
        <TypographySpecMeta
          items={[
            { label: "Weight", value: `${spec.weight} / ${spec.weightValue}` },
            { label: "Font size", value: spec.px },
            { label: "Line height", value: lineHeight },
            { label: "Letter spacing", value: formatTracking(spec.tracking) },
          ]}
        />
      </div>
      <div className="mt-[60px] min-w-0 overflow-x-auto text-[var(--foreground-strong)]">
        {spec.preview}
      </div>
    </div>
  );
}

function SpecimenCard({ family }: { family: (typeof FAMILIES)[number] }) {
  return (
    <>
      {family.samples.map((sample) => (
        <div
          key={sample.title}
          className="grid min-w-0 items-end gap-x-10 gap-y-6 px-8 pt-7 pb-3.5 md:grid-cols-[9rem_minmax(0,1fr)_9rem]"
        >
          <div className="grid min-w-0 content-end gap-1 pb-1">
            <p className="text-sm font-medium text-[var(--foreground-strong)]">{sample.title}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{sample.family}</p>
          </div>
          <div className="min-w-0 overflow-x-auto pb-1">
            <p className={`${sample.className} whitespace-nowrap`}>{SAMPLE_TEXT}</p>
          </div>
          <div className="flex items-end justify-start md:justify-end">
            <div
              className={sample.specimenClassName}
              style={{
                color: "var(--foreground-strong)",
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
