import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Spinner } from "raft-ui";
import type { SpinnerProps } from "raft-ui";

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
const SIZES = ["xs", "sm", "md", "lg"] as const;
const VARIANTS = ["default", "inverse"] as const;

const SNIPPETS = {
  preview: `<Spinner size="sm" variant="default" />`,
  anatomy: `import { Spinner } from "raft-ui";

<Spinner />`,
  sizes: `<Spinner size="sm" />
<Spinner size="lg" />`,
  currentColor: `<Spinner className="text-accent-600 dark:text-accent-400" />
<div className="rounded bg-info-soft p-3">
  <Spinner className="text-info-strong" />
</div>
<div className="rounded bg-layer-hud p-3">
  <Spinner className="text-accent-300" variant="inverse" />
</div>`,
  inline: `<Button>
  <Spinner data-icon="inline-start" />
  Loading
</Button>

<Badge>
  <Spinner data-icon="inline-start" />
  Syncing
</Badge>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: '"xs" | "sm" | "md" | "lg"',
    default: '"sm"',
    description:
      "Ring diameter. Brutal scales the ring across all four steps (16px at sm, 32px at lg); elegant keeps a compact 14-18px ring.",
  },
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Use inverse on dark surfaces so the brutal ring keeps enough contrast.",
  },
  {
    name: "aria-label",
    type: "string",
    default: '"Loading"',
    description: "Accessible label announced by screen readers.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description:
      "Native span attributes. Use className for color/positioning and data-icon inline placement.",
  },
];

export const Route = createFileRoute("/components/spinner")({
  component: SpinnerDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

function SpinnerPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  const [size, setSize] = useState<NonNullable<SpinnerProps["size"]>>("sm");
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("default");
  const variantClassName = variant === "inverse" ? "bg-gray-950 text-white" : "text-black";

  return (
    <Preview>
      <Preview.Canvas>
        <div className={`rounded-sm px-4 py-3 ${variantClassName}`}>
          <Spinner size={size} variant={variant} />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="spinner-preview-size">
          <Preview.Select
            id="spinner-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={(value) => setSize(value as NonNullable<SpinnerProps["size"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Variant" htmlFor="spinner-preview-variant">
          <Preview.Select
            id="spinner-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={(value) => setVariant(value as (typeof VARIANTS)[number])}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}

function SpinnerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Spinner"
      description="A theme-aware spinner for indeterminate loading / pending feedback."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SpinnerPreview code={code.preview} />
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
          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="lg" />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="current-color" title="Current color">
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-3">
                  <Spinner className="text-accent-600 dark:text-accent-400" />
                  <div className="rounded-sm bg-info-soft p-3">
                    <Spinner className="text-info-strong" />
                  </div>
                  <div className="rounded-sm bg-layer-hud p-3">
                    <Spinner className="text-accent-300" variant="inverse" />
                  </div>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.currentColor} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="inline" title="Inline">
            <Preview>
              <Preview.Canvas>
                <div className="flex flex-wrap items-center gap-3">
                  <Button>
                    <Spinner data-icon="inline-start" />
                    Loading
                  </Button>
                  <Badge>
                    <Spinner data-icon="inline-start" />
                    Syncing
                  </Badge>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.inline} />
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
