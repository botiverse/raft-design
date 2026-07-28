import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Spinner, type SpinnerProps } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import spinnerDefaultCompositionSource from "#/modules/spinner/compositions/default.composition.tsx?raw";
import spinnerInverseCompositionSource from "#/modules/spinner/compositions/inverse.composition.tsx?raw";
import spinnerLargeCompositionSource from "#/modules/spinner/compositions/large.composition.tsx?raw";
import {
  SPINNER_SOURCE_COMPARISON_COMPOSITION,
  SPINNER_SOURCE_COMPARISON_COMPOSITION_PATHS,
  SPINNER_SOURCE_COMPARISON_SOURCE,
} from "#/modules/spinner/spinner.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Loading indicators",
    scenes: [
      {
        label: "AttachmentChip.tsx:81,103",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/AttachmentChip.tsx:81,103",
      },
      {
        label: "MessageInput.tsx:151,1165",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:151,1165",
      },
      {
        label: "ImageLightbox.tsx:194",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ImageLightbox.tsx:194",
      },
      {
        label: "MessageItem.tsx:579,2584",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:579,2584",
      },
      {
        label: "SelectModeToolbar.tsx:118",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/SelectModeToolbar.tsx:118",
      },
      {
        label: "AgentWorkspace.tsx:92",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentWorkspace.tsx:92",
      },
      {
        label: "MermaidDiagram.tsx:87",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/markdown/MermaidDiagram.tsx:87",
      },
    ],
  },
] as const;

const SIZES = ["xs", "sm", "md", "lg"] as const;
const VARIANTS = ["default", "inverse"] as const;

const SNIPPETS = {
  preview: `<Spinner size="sm" variant="default" />`,
  anatomy: `<Spinner />`,
  sizes: `<Spinner size="sm" />
<Spinner size="lg" />`,
  currentColor: `<Spinner className="text-primary-400" />
<div className="rounded bg-primary-50 p-3">
  <Spinner className="text-primary-500" />
</div>
<div className="rounded bg-primary-950 p-3">
  <Spinner className="text-primary-400" />
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

const SpinnerSource = SPINNER_SOURCE_COMPARISON_SOURCE;
const SpinnerCurrent = SPINNER_SOURCE_COMPARISON_COMPOSITION;
const SpinnerCompositionPaths = SPINNER_SOURCE_COMPARISON_COMPOSITION_PATHS;

const SPINNER_COMPOSITION_SOURCES = {
  Default: stripSourceCodeBlocks(spinnerDefaultCompositionSource),
  Inverse: stripSourceCodeBlocks(spinnerInverseCompositionSource),
  Large: stripSourceCodeBlocks(spinnerLargeCompositionSource),
} as const;

const SPINNER_COMPOSITION_SNIPPET_IDS = {
  Default: "spinnerDefaultComposition",
  Inverse: "spinnerInverseComposition",
  Large: "spinnerLargeComposition",
} as const;

type SpinnerCompositionKey = keyof typeof SPINNER_COMPOSITION_SOURCES;

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
        spinnerDefaultComposition: SPINNER_COMPOSITION_SOURCES.Default,
        spinnerInverseComposition: SPINNER_COMPOSITION_SOURCES.Inverse,
        spinnerLargeComposition: SPINNER_COMPOSITION_SOURCES.Large,
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
        <div className={`rounded px-4 py-3 ${variantClassName}`}>
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
  const spinnerComposition = (key: SpinnerCompositionKey) => {
    const snippetId = SPINNER_COMPOSITION_SNIPPET_IDS[key];

    return {
      compositionCode: code[snippetId],
      compositionPath: SpinnerCompositionPaths[key],
      compositionSource: SPINNER_COMPOSITION_SOURCES[key],
      compositionShowLineNumbers: false,
    };
  };

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
                  <Spinner className="text-primary-400" />
                  <div className="rounded bg-primary-50 p-3">
                    <Spinner className="text-primary-500" />
                  </div>
                  <div className="rounded bg-primary-950 p-3">
                    <Spinner className="text-primary-400" />
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Default",
              status: "difference",
              note: "Brutal keeps the source CSS ring; elegant uses a currentColor SVG ring with a softer arc animation.",
              source: <SpinnerSource.Default />,
              brutal: <SpinnerCurrent.Default />,
              elegant: <SpinnerCurrent.Default />,
              elegantDark: <SpinnerCurrent.Default />,
              ...spinnerComposition("Default"),
            },
            {
              label: "Large",
              status: "difference",
              note: "Brutal keeps the source 32px ring while elegant uses its compact 18px ring.",
              source: <SpinnerSource.Large />,
              brutal: <SpinnerCurrent.Large />,
              elegant: <SpinnerCurrent.Large />,
              elegantDark: <SpinnerCurrent.Large />,
              ...spinnerComposition("Large"),
            },
            {
              label: "Inverse context",
              status: "difference",
              note: "Brutal keeps the source inverse border colors; elegant applies currentColor through SVG opacity layers.",
              source: <SpinnerSource.Inverse />,
              brutal: <SpinnerCurrent.Inverse />,
              elegant: <SpinnerCurrent.Inverse />,
              elegantDark: <SpinnerCurrent.Inverse />,
              ...spinnerComposition("Inverse"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
