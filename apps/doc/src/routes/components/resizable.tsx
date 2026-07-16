import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ResizableHorizontalComposition } from "#/modules/resizable/compositions/horizontal.composition.tsx";
import horizontalCompositionSource from "#/modules/resizable/compositions/horizontal.composition.tsx?raw";
import { ResizableVerticalComposition } from "#/modules/resizable/compositions/vertical.composition.tsx";
import verticalCompositionSource from "#/modules/resizable/compositions/vertical.composition.tsx?raw";

const TOC = [
  { id: "horizontal", title: "Horizontal" },
  { id: "vertical", title: "Vertical" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  horizontal: horizontalCompositionSource,
  vertical: verticalCompositionSource,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ResizableGroup",
    type: "react-resizable-panels Group props",
    description: "Layout and resize owner. Set orientation to horizontal or vertical.",
  },
  {
    name: "ResizablePanel",
    type: "react-resizable-panels Panel props",
    description:
      "One resizable sibling. Define id, defaultSize, minSize, and maxSize in the consumer.",
  },
  {
    name: "ResizableHandle",
    type: "react-resizable-panels Separator props",
    description: "Keyboard-focusable separator with Raft theme styling.",
  },
];

export const Route = createFileRoute("/components/resizable")({
  component: ResizableDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ResizableDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Resizable"
      description="Composable pane resizing for layouts that own their own panel order, sizing, and responsive behavior."
      toc={TOC}
    >
      <DocSection id="horizontal" title="Horizontal">
        <Example html={code.horizontal} previewClassName="items-stretch p-4">
          <ResizableHorizontalComposition />
        </Example>
      </DocSection>

      <DocSection id="vertical" title="Vertical">
        <Example html={code.vertical} previewClassName="items-stretch p-4">
          <ResizableVerticalComposition />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
