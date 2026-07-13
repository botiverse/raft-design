import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Spinner, type SpinnerProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
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
  { id: "sizes", title: "Sizes" },
  { id: "current-color", title: "Current color" },
  { id: "inline", title: "Inline" },
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

const SIZES = ["sm", "lg"] as const;
const VARIANTS = ["default", "inverse"] as const;

const SNIPPETS = {
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

type PlaygroundValues = {
  size: NonNullable<SpinnerProps["size"]>;
  variant: (typeof VARIANTS)[number];
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "sm mirrors source h-4/text-base; lg mirrors source h-6/text-xl.",
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

function SpinnerDoc() {
  const code = Route.useLoaderData();
  const spinnerComposition = (key: SpinnerCompositionKey) => {
    const snippetId = SPINNER_COMPOSITION_SNIPPET_IDS[key];

    return {
      compositionCode: code[snippetId],
      compositionCollapsedCode: code[`${snippetId}Body`],
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
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{ size: "sm", variant: "default" }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            {
              name: "variant",
              label: "Variant",
              type: "select",
              options: VARIANTS,
            },
          ]}
          render={(values) => {
            const variantClassName =
              values.variant === "inverse" ? "bg-gray-950 text-white" : "text-black";
            return (
              <div className={`rounded px-4 py-3 ${variantClassName}`}>
                <Spinner size={values.size} />
              </div>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="sizes" title="Sizes" showThemeSwitcher>
        <Example html={code.sizes}>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="lg" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="current-color" title="Current color" showThemeSwitcher>
        <Example html={code.currentColor}>
          <div className="flex items-center gap-3">
            <Spinner className="text-primary-400" />
            <div className="rounded bg-primary-50 p-3">
              <Spinner className="text-primary-500" />
            </div>
            <div className="rounded bg-primary-950 p-3">
              <Spinner className="text-primary-400" />
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="inline" title="Inline" showThemeSwitcher>
        <Example html={code.inline}>
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
        </Example>
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
              note: "Brutal keeps the source braille glyph; elegant intentionally switches to the currentColor SVG ring.",
              source: <SpinnerSource.Default />,
              brutal: <SpinnerCurrent.Default />,
              elegant: <SpinnerCurrent.Default />,
              elegantDark: <SpinnerCurrent.Default />,
              ...spinnerComposition("Default"),
            },
            {
              label: "Large",
              status: "difference",
              note: "The size API is shared while elegant uses the ring form.",
              source: <SpinnerSource.Large />,
              brutal: <SpinnerCurrent.Large />,
              elegant: <SpinnerCurrent.Large />,
              elegantDark: <SpinnerCurrent.Large />,
              ...spinnerComposition("Large"),
            },
            {
              label: "Inverse context",
              status: "difference",
              note: "Both forms inherit the surrounding text color; elegant applies it through ring opacity layers.",
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
