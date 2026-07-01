import { createFileRoute } from "@tanstack/react-router";
import { Separator, Text } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import separatorHorizontalCompositionSource from "#/compositions/separator/horizontal-composition.tsx?raw";
import separatorVerticalCompositionSource from "#/compositions/separator/vertical-composition.tsx?raw";
import {
  SEPARATOR_SOURCE_COMPARISON_COMPOSITION,
  SEPARATOR_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/separator-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "orientation", title: "Orientation" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Literal dividers",
    scenes: [
      {
        label: "EditChannelDialog.tsx:208",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:208",
      },
      {
        label: "ContextMenuDivider.tsx:11",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/ContextMenuDivider.tsx:11",
      },
      {
        label: "MarkdownContent.tsx:102",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/markdown/MarkdownContent.tsx:102",
      },
      {
        label: "SettingsPanel.tsx:386,427",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:386,427",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `import { Separator } from "raft-ui";

<div className="grid gap-3">
  <span>Channel settings</span>
  <Separator />
  <Separator>Actions</Separator>
  <span>Visibility actions</span>
</div>`,
  anatomy: `import { Separator } from "raft-ui";

<Separator />
<Separator>Actions</Separator>`,
  orientation: `import { Separator } from "raft-ui";

<Separator />
<Separator orientation="vertical" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: "Separator direction. Vertical separators stretch to the parent height.",
  },
  {
    name: "children",
    type: "ReactNode",
    description:
      "Optional centered content for horizontal separators, such as text, icons, or compact metadata.",
  },
  {
    name: "className",
    type: "string",
    description: "Optional spacing or rare visual override classes.",
  },
  {
    name: "...props",
    type: "Base UI Separator.Props",
    description: "Base UI separator attributes.",
  },
];

const SeparatorCurrent = SEPARATOR_SOURCE_COMPARISON_COMPOSITION;

const SEPARATOR_COMPOSITION_RAW_SOURCES = {
  Horizontal: separatorHorizontalCompositionSource,
  Vertical: separatorVerticalCompositionSource,
} as const;

const SEPARATOR_COMPOSITION_SOURCES = createCompositionSourceMap(SEPARATOR_COMPOSITION_RAW_SOURCES);

const SEPARATOR_COMPOSITION_SNIPPET_IDS = {
  Horizontal: "separatorHorizontalComposition",
  Vertical: "separatorVerticalComposition",
} as const;

type SeparatorCompositionKey = keyof typeof SEPARATOR_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/separator")({
  component: SeparatorDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          SEPARATOR_COMPOSITION_SOURCES,
          SEPARATOR_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function SeparatorDoc() {
  const code = Route.useLoaderData();
  const separatorComposition = (key: SeparatorCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: SEPARATOR_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: SEPARATOR_COMPOSITION_SNIPPET_IDS,
      sources: SEPARATOR_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Separator"
      description="A themed divider for grouping nearby content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview}>
          <div className="grid w-64 gap-3">
            <Text.Sans size="small">Channel settings</Text.Sans>
            <Separator />
            <Separator>Actions</Separator>
            <Text.Sans size="small">Visibility actions</Text.Sans>
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Separator.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="orientation" title="Orientation">
        <div className="space-y-4">
          <DocNote>
            Use horizontal separators between stacked groups. Use vertical separators only inside a
            row with a stable height.
          </DocNote>
          <Example html={code.orientation}>
            <div className="grid gap-8">
              <div className="grid w-64 gap-3">
                <Text.Sans size="small">Channel settings</Text.Sans>
                <Separator />
                <Separator>Actions</Separator>
                <Text.Sans size="small">Visibility actions</Text.Sans>
              </div>
              <div className="flex h-14 items-center gap-4">
                <Text.Sans size="small">Filters</Text.Sans>
                <Separator orientation="vertical" />
                <Text.Sans size="small">Sort</Text.Sans>
              </div>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Horizontal divider",
              status: "match",
              note: "Source used border-t literals. Current centralizes that divider as Separator.",
              source: <div className="w-56 border-t-2 border-black" />,
              brutal: <SeparatorCurrent.Horizontal />,
              elegant: <SeparatorCurrent.Horizontal />,
              elegantDark: <SeparatorCurrent.Horizontal />,
              ...separatorComposition("Horizontal"),
            },
            {
              label: "Vertical divider",
              status: "new",
              note: "Use orientation when a row needs an accessible vertical divider.",
              source: <div className="h-14 border-l-2 border-black" />,
              brutal: <SeparatorCurrent.Vertical />,
              elegant: <SeparatorCurrent.Vertical />,
              elegantDark: <SeparatorCurrent.Vertical />,
              ...separatorComposition("Vertical"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
