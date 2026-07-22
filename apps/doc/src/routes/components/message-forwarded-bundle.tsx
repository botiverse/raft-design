import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageForwardedBundleShowcaseComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageForwardedBundle>
  <MessageForwardedBundleHeader>
    <MessageForwardedBundleHeaderLabel />
    <MessageForwardedBundleHeaderCount />
    <MessageForwardedBundleSource />
  </MessageForwardedBundleHeader>
  <MessageForwardedBundleItems>
    <MessageForwardedBundleItem>
      <MessageForwardedBundleItemMeta>
        <MessageForwardedBundleItemAuthor />
      </MessageForwardedBundleItemMeta>
      <MessageForwardedBundleContent />
      <MessageForwardedBundleAttachments>
        <MessageForwardedBundleAttachment>
          <MessageForwardedBundleAttachmentName />
          <MessageForwardedBundleAttachmentMeta />
        </MessageForwardedBundleAttachment>
      </MessageForwardedBundleAttachments>
    </MessageForwardedBundleItem>
    <MessageForwardedBundleCollapsedFade />
  </MessageForwardedBundleItems>
  <MessageForwardedBundleFooter>
    <MessageForwardedBundleToggle />
  </MessageForwardedBundleFooter>
</MessageForwardedBundle>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageForwardedBundle",
    type: "compound slots",
    description:
      "Source-faithful forwarded-message structure. Provenance, permissions, and source navigation stay caller-owned.",
  },
  {
    name: "MessageForwardedBundleHeader / HeaderLabel / HeaderCount / Source",
    type: 'useRender.ComponentProps<"div"> / <"span"> / <"button">',
    description: "Forwarded label, message count, and the caller-wired source-message link.",
  },
  {
    name: "MessageForwardedBundleItems / MessageForwardedBundleItem",
    type: 'useRender.ComponentProps<"div">',
    description: "Scroll region and per-message row for the forwarded bundle.",
  },
  {
    name: "MessageForwardedBundleItemMeta / MessageForwardedBundleItemAuthor",
    type: 'useRender.ComponentProps<"div"> / <"span">',
    description: "Per-item author and timestamp meta line.",
  },
  {
    name: "MessageForwardedBundleContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Per-item message content slot, typically rendering MessageMarkdown.",
  },
  {
    name: "MessageForwardedBundleAttachments / Attachment / AttachmentName / AttachmentMeta",
    type: 'useRender.ComponentProps<"div"> / <"span">',
    description: "Compact attachment summary row for a forwarded item.",
  },
  {
    name: "MessageForwardedBundleCollapsedFade",
    type: 'useRender.ComponentProps<"div">',
    description: "Fade overlay shown while the bundle is collapsed.",
  },
  {
    name: "MessageForwardedBundleFooter / MessageForwardedBundleToggle",
    type: 'useRender.ComponentProps<"div"> / <"button">',
    description: "Footer row and expand/collapse toggle. Expanded state stays caller-owned.",
  },
];

export const Route = createFileRoute("/components/message-forwarded-bundle")({
  component: MessageForwardedBundleDoc,
  loader: () =>
    highlightSnippets({
      data: { anatomy: ANATOMY_SOURCE, forwardedBundle: forwardedBundleSource },
    }),
});

function MessageForwardedBundleDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageForwardedBundle"
      description="Source-faithful forwarded-message bundle with collapsible items and attachments."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageForwardedBundleShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.forwardedBundle} />
        </Preview>
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
    </DocPage>
  );
}
