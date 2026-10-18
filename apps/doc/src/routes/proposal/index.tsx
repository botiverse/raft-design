import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Box, Braces, FileText, Layers, Palette, Scale } from "lucide-react";
import {
  Button,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  MarkdownHeading,
} from "raft-ui";

import { raftUiVersion } from "#/data/raft-ui-release.ts";
import { CATALOG } from "#/proposal/catalog.ts";
import { LATEST_CHANGES } from "#/proposal/generated.ts";
import { PAGES, pageHref, SECTIONS } from "#/proposal/site-map.ts";
import type { SectionId } from "#/proposal/site-map.ts";

const BUTTON_HREF: string = "/proposal/components/button";
const COLOR_HREF: string = "/proposal/foundations/color";

export const Route = createFileRoute("/proposal/")({
  component: ProposalHome,
});

const SECTION_COPY: Record<SectionId, { icon: typeof Box; summary: string; first: string }> = {
  foundations: {
    icon: Palette,
    summary:
      "Color, type, spacing, shape, motion and states: the values and the rules for using them.",
    first: "color",
  },
  components: {
    icon: Box,
    summary:
      "Every raft-ui component: when to use it, live examples in light and dark, and its API.",
    first: "button",
  },
  patterns: {
    icon: Layers,
    summary:
      "How components combine into screens in any Raft product: navigation, agents, forms, feedback.",
    first: "feedback",
  },
  products: {
    icon: BookOpen,
    summary: "Structure that belongs to one product: its destinations and what each screen shows.",
    first: "raft-chat",
  },
  decisions: {
    icon: Scale,
    summary: "Why the system chose one option over another, and the questions still open.",
    first: "log",
  },
};

// Placeholder wording of the seven rules in design/README.md, until the
// English README lands.
const RULES = [
  ["Yellow only on the frame.", "Everything people read sits on white paper."],
  [
    "Three lines, three meanings.",
    "Hairline inside content, seam between regions, ink line on controls.",
  ],
  ["Colored blocks are stickers.", "A 1.5px ink edge, ink text, the same in dark mode."],
  ["Yellow is you, pink is to do.", "One pink primary action per screen at most."],
  ["Status colors are fixed.", "Five task states and five presence lights, none of them animated."],
  ["Square is Raft.", "Identities are square stickers; only switches and radios are round."],
  ["No all caps.", "Title Case for what can be pressed, sentence case for the rest."],
] as const;

const AGENT_SURFACES = [
  {
    icon: FileText,
    path: "/llms.txt",
    text: "Index of every page with a one-line summary, by section.",
  },
  { icon: FileText, path: "/llms-full.txt", text: "Every page in one file, in index order." },
  {
    icon: FileText,
    path: "/components/button.md",
    text: "Any page as Markdown: add .md to its path.",
  },
  {
    icon: Braces,
    path: "/components.json",
    text: "Components with status, aliases, category, import path and doc URL.",
  },
] as const;

/** The three materials and the frame, drawn with the tokens themselves. */
function FrameDiagram() {
  return (
    <div
      aria-hidden
      className="flex h-44 w-full max-w-sm overflow-hidden rounded-container border-[1.5px] border-line-strong"
    >
      <div className="w-10 shrink-0 border-r border-line-seam bg-layer-frame" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-8 shrink-0 border-b border-line-seam bg-layer-frame" />
        <div className="flex min-h-0 flex-1">
          <div className="w-20 shrink-0 border-r border-line-seam bg-layer-canvas-muted p-2">
            <div className="h-5 rounded-control border-[1.5px] border-line-strong bg-primary" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 bg-layer-canvas p-3">
            <div className="h-2 w-3/4 rounded-sticker bg-fill-muted" />
            <div className="h-2 w-1/2 rounded-sticker bg-fill-muted" />
            <div className="mt-auto h-6 w-16 self-end rounded-control border-[1.5px] border-line-strong bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <MarkdownHeading level={2} className="mb-4">
      {children}
    </MarkdownHeading>
  );
}

function ProposalHome() {
  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-14 px-4 pt-10 pb-24 md:px-10">
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-bold">Raft Design System</h1>
          <p className="max-w-xl text-body text-foreground-muted">
            The design language of Raft&apos;s products, and raft-ui, its React implementation. Each
            page covers one foundation, component, pattern or decision, and is also served as
            Markdown.
          </p>
          <CopyableCodeRoot size="sm" className="self-start">
            <CopyableCode>pnpm add raft-ui</CopyableCode>
            <CopyableCodeAction aria-label="Copy install command" />
          </CopyableCodeRoot>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" nativeButton={false} render={<Link to={BUTTON_HREF} />}>
              Browse Components
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link to={COLOR_HREF} />}>
              Read the Foundations
            </Button>
          </div>
        </div>
        <FrameDiagram />
      </section>

      <section>
        <H2>Sections</H2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const { icon: Icon, summary, first } = SECTION_COPY[section.id];
            const count =
              section.id === "components"
                ? CATALOG.length
                : PAGES.filter((page) => page.section === section.id).length;
            return (
              <li key={section.id}>
                <Link
                  to={pageHref({ section: section.id, slug: first })}
                  className="flex h-full flex-col gap-2 rounded-container border border-line-hairline bg-layer-card p-4 outline-none hover:press-overlay focus-visible:shadow-raft-focus"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-5" aria-hidden />
                    <span className="text-headline font-bold">{section.title}</span>
                    <span className="ml-auto font-mono text-mono-meta text-foreground-hint">
                      {count}
                    </span>
                  </span>
                  <span className="text-callout text-foreground-muted">{summary}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href="/playground"
              className="flex h-full flex-col gap-2 rounded-container border border-line-hairline bg-layer-card p-4 outline-none hover:press-overlay focus-visible:shadow-raft-focus"
            >
              <span className="flex items-center gap-2">
                <Box className="size-5" aria-hidden />
                <span className="text-headline font-bold">Playground</span>
              </span>
              <span className="text-callout text-foreground-muted">
                A working mock of Raft Chat built only from raft-ui, for checking components
                together.
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section>
        <H2>Seven rules</H2>
        <ol className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {RULES.map(([rule, detail], index) => (
            <li key={rule} className="flex gap-3">
              <span className="w-5 shrink-0 font-mono text-mono-meta text-foreground-hint">
                {index + 1}
              </span>
              <span className="text-callout">
                <span className="font-bold">{rule}</span>{" "}
                <span className="text-foreground-muted">{detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <H2>For agents</H2>
          <ul className="flex flex-col divide-y divide-line-hairline">
            {AGENT_SURFACES.map(({ icon: Icon, path, text }) => (
              <li key={path} className="flex items-start gap-3 py-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-foreground-muted" aria-hidden />
                <span className="flex min-w-0 flex-col">
                  <a href={path} className="font-mono text-mono-code text-foreground-link">
                    {path}
                  </a>
                  <span className="text-callout text-foreground-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <H2>Latest release</H2>
          <p className="mb-2 font-mono text-mono-meta text-foreground-hint">
            raft-ui {raftUiVersion}
          </p>
          <ul className="flex flex-col divide-y divide-line-hairline">
            {LATEST_CHANGES.map((change) => (
              <li key={change.text} className="py-3 text-callout text-foreground-muted">
                <span className="mr-2 font-bold text-foreground">{change.kind}</span>
                {change.text.replace(/`/g, "").slice(0, 140)}
                {change.text.length > 140 ? "…" : ""}
              </li>
            ))}
          </ul>
          <a href="/changelog" className="mt-2 inline-block text-callout text-foreground-link">
            Full changelog
          </a>
        </div>
      </section>
    </div>
  );
}
