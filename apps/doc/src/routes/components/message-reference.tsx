import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageReferenceShowcaseComposition } from "#/modules/message-item/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-item/compositions/reference-showcase.composition.tsx?raw";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageReference variant="muted" render={<a href="…" />}>
  #channel
</MessageReference>

<MessageReference variant="panel" render={<a href="…" />}>
  <MessageReferenceLabel>message #222</MessageReferenceLabel>
  <MessageReferenceMeta>msg</MessageReferenceMeta>
</MessageReference>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageReference",
    type: 'useRender.ComponentProps<"span"> & Omit<MessageReferenceVariantProps, "theme">',
    description:
      "Inline message reference (default span). Variants: plain, accent, highlight, muted, info, subtle, panel, external, pending, unavailable. Use render={<a href=… />} for links. Label/Meta compose inside chip variants.",
  },
  {
    name: "MessageReferenceLabel / MessageReferenceMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional label and meta slots for chip-style references (e.g. permalink).",
  },
];

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewMode="light" previewClassName="items-stretch">
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
      <DocNote>
        Compose inside <Link to="/components/message-markdown">MessageMarkdown</Link> or{" "}
        <Link to="/components/message-item">MessageItem</Link> body content. Exported from{" "}
        <code>raft-ui/wip</code>.
      </DocNote>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="references" title="MessageReference">
          <UsagePreview code={code.referenceShowcase}>
            <div className="w-full max-w-3xl">
              <MessageReferenceShowcaseComposition />
            </div>
          </UsagePreview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
