import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

const TOC = [
  { id: "specimens", title: "Theme specimens" },
  { id: "scale", title: "Type scale" },
  { id: "weights", title: "Weights" },
] as const;

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
    display: "Space Grotesk",
    sans: "Space Grotesk",
    mono: "Space Mono",
    samples: [
      {
        title: "Headline",
        family: "Space Grotesk",
        utility: "font-display",
        px: "36px",
        className:
          "truncate font-display text-4xl font-semibold leading-[1.24] text-[var(--foreground-strong)]",
        specimenClassName: "font-display text-[5.5rem] font-semibold leading-none",
      },
      {
        title: "Body",
        family: "Space Grotesk",
        utility: "font-sans",
        px: "14px",
        className: "truncate font-sans text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-sans text-[4.75rem] leading-none",
      },
      {
        title: "Mono",
        family: "Space Mono",
        utility: "font-mono",
        px: "14px",
        className: "truncate font-mono text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-mono text-[4.25rem] leading-none",
      },
    ],
  },
  {
    theme: "Elegant",
    themeId: "elegant",
    status: "in-progress",
    display: "Instrument Sans",
    sans: "Geist",
    mono: "Geist Mono",
    samples: [
      {
        title: "Headline",
        family: "Instrument Sans",
        utility: "font-display",
        px: "36px",
        className:
          "truncate font-display text-4xl font-medium leading-[1.24] text-[var(--foreground-strong)]",
        specimenClassName: "font-display text-[5.5rem] font-medium leading-none",
      },
      {
        title: "Body",
        family: "Geist",
        utility: "font-sans",
        px: "14px",
        className: "truncate font-sans text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-sans text-[4.75rem] leading-none",
      },
      {
        title: "Mono",
        family: "Geist Mono",
        utility: "font-mono",
        px: "14px",
        className: "truncate font-mono text-sm leading-5 text-[var(--foreground-muted)]",
        specimenClassName: "font-mono text-[4.25rem] leading-none",
      },
    ],
  },
] as const;

const SAMPLE_TEXT = "Where humans and AI agents build together.";

const TYPE_SCALE = [
  { className: "text-xs", px: "12px" },
  { className: "text-sm", px: "14px" },
  { className: "text-base", px: "16px" },
  { className: "text-lg", px: "18px" },
  { className: "text-xl", px: "20px" },
  { className: "text-2xl", px: "24px" },
  { className: "text-3xl", px: "30px" },
] as const;

const WEIGHTS = [
  { name: "regular", className: "font-normal", value: 400 },
  { name: "medium", className: "font-medium", value: 500 },
  { name: "semibold", className: "font-semibold", value: 600 },
  { name: "bold", className: "font-bold", value: 700 },
] as const;

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
  const title = `${THEME_LABELS[theme]} typography`;

  return (
    <TokenThemeScope theme={theme}>
      <DocPage title={title} description="The font contract and type scale." toc={TOC}>
        <DocSection id="specimens" title="Theme specimens">
          <div className="grid gap-4">
            {families.map((family) => (
              <SpecimenCard key={family.theme} family={family} />
            ))}
          </div>
        </DocSection>

        <DocSection id="scale" title="Type scale">
          <div className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-line-subtle">
            {TYPE_SCALE.map((item) => (
              <div
                key={item.className}
                className="grid items-end gap-x-10 gap-y-4 px-8 pt-5 pb-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
              >
                <div className="grid content-end gap-1 pb-1">
                  <p className="font-mono text-[0.6875rem] text-foreground-muted/60">
                    {item.className}
                  </p>
                  <p className="font-mono text-[0.6875rem] text-foreground-muted/60">{item.px}</p>
                </div>
                <p className={`${item.className} truncate font-sans font-semibold text-gray-950`}>
                  {SAMPLE_TEXT}
                </p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="weights" title="Weights">
          <div className="grid gap-3 sm:grid-cols-2">
            {WEIGHTS.map((weight) => (
              <div key={weight.name} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className={`${weight.className} font-sans text-2xl text-gray-950`}>
                  {weight.name}
                </p>
                <p className="mt-2 font-mono text-xs text-gray-500">
                  {weight.className} / {weight.value}
                </p>
              </div>
            ))}
          </div>
        </DocSection>
      </DocPage>
    </TokenThemeScope>
  );
}

function TokenThemeScope({ theme, children }: { theme: TypographyTheme; children: ReactNode }) {
  return (
    <div
      data-token-theme-scope={theme}
      data-theme={theme}
      className="light min-h-screen font-sans [&_article_header_h1]:font-display [&_article_header_h1]:!font-medium [&_article_header_p]:font-sans [&_article_header_p]:!text-base [&_section]:border-t-0 [&_section_h2]:font-display"
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

function SpecimenCard({ family }: { family: (typeof FAMILIES)[number] }) {
  return (
    <div
      data-theme={family.themeId}
      className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-line-subtle"
      style={{
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {family.samples.map((sample) => (
        <div
          key={sample.title}
          className="grid min-w-0 items-end gap-x-10 gap-y-6 px-8 pt-7 pb-3.5 md:grid-cols-[9rem_minmax(0,1fr)_9rem]"
        >
          <div className="grid min-w-0 content-end gap-1 pb-1">
            <p className="text-sm font-medium text-[var(--foreground-strong)]">{sample.title}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{sample.family}</p>
          </div>
          <div className="grid min-w-0 content-end pb-1">
            <p className={sample.className}>{SAMPLE_TEXT}</p>
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
    </div>
  );
}
