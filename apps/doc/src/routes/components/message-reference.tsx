import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageReferenceComparisonComposition } from "#/modules/message-reference/compositions/reference-comparison.composition.tsx";
import referenceComparisonSource from "#/modules/message-reference/compositions/reference-comparison.composition.tsx?raw";
import { MessageReferenceShowcaseComposition } from "#/modules/message-reference/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-reference/compositions/reference-showcase.composition.tsx?raw";
import { MessageReferenceSourcePreview } from "#/modules/message-reference/message-reference.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock message references",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
      {
        label: "MentionLink.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MentionLink.tsx",
      },
      {
        label: "ReferenceChip.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ReferenceChip.tsx",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<MessageReferenceText render={<button type="button" />}>
  @Ada
</MessageReferenceText>

<MessageReferenceChip tone="muted" render={<a href="…" />}>
  #channel
</MessageReferenceChip>

<MessageReferenceChip tone="panel" render={<a href="…" />}>
  <MessageReferenceLabel>message #222</MessageReferenceLabel>
  <MessageReferenceMeta>msg</MessageReferenceMeta>
</MessageReferenceChip>

<MessageReferencePending>Resolving…</MessageReferencePending>
<MessageReferenceUnavailable>Unavailable</MessageReferenceUnavailable>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageReferenceText",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Inline text-reference surface, for example a mention. The caller owns navigation and preview behavior.",
  },
  {
    name: "MessageReferenceChip",
    type: 'useRender.ComponentProps<"span"> & { tone?: "primary" | "accent" | "muted" | "info" | "neutral" | "panel" | "external" }',
    description:
      "Inline chip reference. Tone is visual only; use render={<a href=… />} when the consumer owns navigation.",
  },
  {
    name: "MessageReferenceLabel / MessageReferenceMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label and meta slots for chip-style references (e.g. permalink).",
  },
  {
    name: "MessageReferencePending / MessageReferenceUnavailable",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit resolution-state surfaces. Loading indicators and failure copy remain consumer-owned.",
  },
];

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/message-reference")({
  component: MessageReferenceDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        referenceComparison: referenceComparisonSource,
        referenceShowcase: referenceShowcaseSource,
      },
    }),
});

function MessageReferenceDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageReference"
      description="Inline message references — mentions, permalinks, channel chips, and pending/unavailable states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.referenceShowcase}>
          <MessageReferenceShowcaseComposition />
        </UsagePreview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Inline references in a message row",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real MessageItem, MentionLink, and ReferenceChip DOM; the three Current panes execute the canonical message composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageReferenceSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <MessageReferenceComparisonComposition />,
              elegant: <MessageReferenceComparisonComposition />,
              elegantDark: <MessageReferenceComparisonComposition />,
              compositionCode: code.referenceComparison,
              compositionPath:
                "apps/doc/src/modules/message-reference/compositions/reference-comparison.composition.tsx",
              compositionSource: referenceComparisonSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
