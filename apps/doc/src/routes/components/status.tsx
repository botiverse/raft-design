import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import { InlineCode, Status } from "raft-ui";
import type { StatusProps } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
const VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const SIZES = ["xs", "sm", "md", "lg"] as const;

const ATTENTION_PREVIEW_COPY =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore";

// Maps playground variants to token colors for the content-glow layer
// (same role as NotificationCenter triggerBellGlow over the bell icon).
const ATTENTION_GLOW_COLOR: Record<(typeof VARIANTS)[number], string> = {
  default: "var(--color-gray-400)",
  primary: "var(--color-primary-400)",
  information: "var(--color-info)",
  muted: "var(--color-secondary-400)",
  accent: "var(--color-accent-400)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

const SNIPPETS = {
  preview: `<Status variant="success" size="md" />`,
  anatomy: `import { Status } from "raft-ui";

<Status />`,
  variants: `<Status />
<Status variant="primary" />
<Status variant="information" />
<Status variant="muted" />
<Status variant="accent" />
<Status variant="success" />
<Status variant="warning" />
<Status variant="danger" />`,
  sizes: `<Status size="xs" variant="success" />
<Status size="sm" variant="success" />
<Status size="md" variant="success" />
<Status size="lg" variant="success" />`,
  pulse: `<Status size="xs" variant="primary" pulse />
<Status size="sm" variant="primary" pulse />
<Status size="md" variant="primary" pulse />
<Status size="lg" variant="primary" pulse />`,
  attention: `<Status variant="accent" attention />
<Status variant="primary" attention />
<Status variant="warning" attention />
<Status variant="danger" attention />`,
  contentGlow: `import { Bell } from "lucide-react";
import { Status } from "raft-ui";

{/* Same stack as NotificationCenterTrigger (elegant):
    1. base icon
    2. tinted duplicate + radial mask toward the dot
    3. Status attention as the unread marker */}
<span className="relative inline-flex size-9 items-center justify-center">
  <span className="relative inline-flex size-4 items-center justify-center">
    <Bell className="size-4 shrink-0 text-foreground-muted" strokeWidth={2} />
    <Bell
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 size-4 shrink-0",
        "text-primary-400",
        "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--color-primary-400)_82%,transparent)]",
        "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
      ].join(" ")}
      strokeWidth={2}
    />
  </span>
  <Status
    aria-hidden
    variant="primary"
    size="sm"
    attention
    className="pointer-events-none absolute top-[7px] right-[8px]"
  />
</span>`,
  customize: `<Status className="[--status-color:var(--color-brutal-purple-300)]" />
<Status
  pulse
  className="[--status-color:var(--color-brutal-purple-300)]"
/>
<Status
  attention
  className="[--status-color:var(--color-brutal-purple-300)]"
/>
<Status
  attention
  pulse
  className="[--status-color:var(--color-brutal-purple-300)]"
/>

<Status className="[--status-color:oklch(0.72_0.14_200)]" />
<Status attention className="[--status-color:oklch(0.72_0.14_200)]" />
<Status size="lg" attention pulse className="[--status-color:oklch(0.78_0.12_145)]" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Semantic status color.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description: "Dot diameter. xs is the old compact AttentionDot size.",
  },
  {
    name: "pulse",
    type: "boolean",
    default: "false",
    description: "Animated status marker.",
  },
  {
    name: "attention",
    type: "boolean",
    default: "false",
    description:
      "Elegant-only glow ring. Used by NotificationCenterTrigger. No visual effect on brutal.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes plus className. Set --status-color for custom colors.",
  },
];

export const Route = createFileRoute("/components/status")({
  component: StatusDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function StatusPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  const [variant, setVariant] = useState<NonNullable<StatusProps["variant"]>>("success");
  const [size, setSize] = useState<NonNullable<StatusProps["size"]>>("md");
  const [pulse, setPulse] = useState(false);
  const [attention, setAttention] = useState(false);

  return (
    <Preview>
      <Preview.Canvas>
        {attention ? (
          <span
            className="relative inline-grid size-28 place-items-center"
            style={{ "--status-glow-color": ATTENTION_GLOW_COLOR[variant] } as CSSProperties}
          >
            <span
              aria-hidden
              className="pointer-events-none col-start-1 row-start-1 max-w-[7rem] text-center text-[9px] leading-[1.15] text-foreground-muted/70"
            >
              {ATTENTION_PREVIEW_COPY}
            </span>
            <span
              aria-hidden
              className={[
                "pointer-events-none col-start-1 row-start-1 max-w-[7rem] text-center text-[9px] leading-[1.15]",
                "text-[var(--status-glow-color)]",
                "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--status-glow-color)_82%,transparent)]",
                "[mask-image:radial-gradient(circle,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
                "[-webkit-mask-image:radial-gradient(circle,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
              ].join(" ")}
            >
              {ATTENTION_PREVIEW_COPY}
            </span>
            <Status
              className="col-start-1 row-start-1"
              variant={variant}
              size={size}
              pulse={pulse}
              attention
            />
          </span>
        ) : (
          <Status variant={variant} size={size} pulse={pulse} attention={attention} />
        )}
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="status-preview-variant">
          <Preview.Select
            id="status-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={(value) => setVariant(value as NonNullable<StatusProps["variant"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="status-preview-size">
          <Preview.Select
            id="status-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={(value) => setSize(value as NonNullable<StatusProps["size"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Pulse" htmlFor="status-preview-pulse">
          <Preview.Checkbox
            id="status-preview-pulse"
            label="Pulse"
            checked={pulse}
            onCheckedChange={setPulse}
          />
        </Preview.Control>
        <Preview.Control label="Attention" htmlFor="status-preview-attention">
          <Preview.Checkbox
            id="status-preview-attention"
            label="Attention"
            checked={attention}
            onCheckedChange={setAttention}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}

function StatusDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Status"
      description="Presence, progress, unread, and compact status markers."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <StatusPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
                {VARIANTS.map((variant) => (
                  <Status key={variant} variant={variant} />
                ))}
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <Status size="xs" variant="success" />
                <Status size="sm" variant="success" />
                <Status size="md" variant="success" />
                <Status size="lg" variant="success" />
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="pulse" title="Pulse">
            <Preview>
              <Preview.Canvas>
                <Status size="xs" variant="primary" pulse />
                <Status size="sm" variant="primary" pulse />
                <Status size="md" variant="primary" pulse />
                <Status size="lg" variant="primary" pulse />
              </Preview.Canvas>
              <Preview.Code html={code.pulse} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="attention" title="Attention">
            <Preview>
              <Preview.Canvas>
                <Status variant="accent" attention />
                <Status variant="primary" attention />
                <Status variant="warning" attention />
                <Status variant="danger" attention />
              </Preview.Canvas>
              <Preview.Code html={code.attention} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="content-glow" title="Content glow">
            <DocNote>
              <InlineCode>attention</InlineCode> only styles the dot. Soft wash on the icon comes
              from a tinted duplicate of the underlying content, masked toward the marker. Same
              stack as elegant <InlineCode>NotificationCenterTrigger</InlineCode>.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <span className="relative inline-flex size-9 items-center justify-center">
                  <span className="relative inline-flex size-4 items-center justify-center">
                    <Bell className="size-4 shrink-0 text-foreground-muted" strokeWidth={2} />
                    <Bell
                      aria-hidden
                      className={[
                        "pointer-events-none absolute inset-0 size-4 shrink-0",
                        "text-primary-400",
                        "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--color-primary-400)_82%,transparent)]",
                        "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
                      ].join(" ")}
                      strokeWidth={2}
                    />
                  </span>
                  <Status
                    aria-hidden
                    variant="primary"
                    size="sm"
                    attention
                    className="pointer-events-none absolute top-[7px] right-[8px]"
                  />
                </span>
              </Preview.Canvas>
              <Preview.Code html={code.contentGlow} collapsedHtml={code.contentGlowBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customize" title="Customize">
            <Preview>
              <Preview.Canvas>
                <div className="flex w-full flex-col items-center gap-6">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Status className="[--status-color:var(--color-brutal-purple-300)]" />
                    <Status pulse className="[--status-color:var(--color-brutal-purple-300)]" />
                    <Status attention className="[--status-color:var(--color-brutal-purple-300)]" />
                    <Status
                      attention
                      pulse
                      className="[--status-color:var(--color-brutal-purple-300)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Status className="[--status-color:oklch(0.72_0.14_200)]" />
                    <Status attention className="[--status-color:oklch(0.72_0.14_200)]" />
                    <Status
                      size="lg"
                      attention
                      pulse
                      className="[--status-color:oklch(0.78_0.12_145)]"
                    />
                  </div>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.customize} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
