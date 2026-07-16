import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { PanelBasicComposition } from "#/modules/panel/compositions/basic.composition.tsx";
import basicCompositionSource from "#/modules/panel/compositions/basic.composition.tsx?raw";
import { PanelResizableComposition } from "#/modules/panel/compositions/resizable.composition.tsx";
import resizableCompositionSource from "#/modules/panel/compositions/resizable.composition.tsx?raw";

const TOC = [
  { id: "basic", title: "Panel" },
  { id: "resizable", title: "Resizable panels" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  basic: basicCompositionSource,
  resizable: resizableCompositionSource,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Panel",
    type: 'useRender.ComponentProps<"section">',
    description: "Container root. It owns no placement, width, resize behavior, or product state.",
  },
  {
    name: "PanelHeader / PanelBody / PanelFooter",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Named structural slots. Consumers choose their visible content and can omit unused slots.",
  },
  {
    name: "PanelScrollViewport / Content / Scrollbar / Thumb",
    type: 'useRender.ComponentProps<"div">',
    description: "Styling parts that compose with a ScrollArea primitive through render.",
  },
];

export const Route = createFileRoute("/components/panel")({
  component: PanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Panel"
      description="A single panel’s header, body, scrolling, and footer slots. Layout interaction stays outside the panel."
      toc={TOC}
    >
      <DocSection id="basic" title="Panel">
        <Example html={code.basic} previewClassName="items-stretch p-4">
          <PanelBasicComposition />
        </Example>
      </DocSection>

      <DocSection id="resizable" title="Resizable panels">
        <Example html={code.resizable} previewClassName="items-stretch p-4">
          <PanelResizableComposition />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
