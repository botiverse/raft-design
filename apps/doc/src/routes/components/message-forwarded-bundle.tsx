import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageForwardedBundleShowcaseComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
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
    type: 'useRender.ComponentProps<"div">',
    description:
      "Forwarded messages card root. Compose inside MessageItemEmbedded; expand/collapse state stays consumer-owned.",
  },
  {
    name: "MessageForwardedBundleHeader / Label / Count / Source",
    type: "div or span props",
    description: "Forwarded chrome, count label, and optional source affordance.",
  },
  {
    name: "MessageForwardedBundleItems / Item / ItemMeta / ItemAuthor / Content",
    type: "div, article, or span props",
    description: "Scrollable item list. Each item is an article with author meta and body content.",
  },
  {
    name: "MessageForwardedBundleAttachments / Attachment / Name / Meta",
    type: "div or span props",
    description: "Per-item attachment chips. Filenames and icons stay consumer-owned.",
  },
  {
    name: "MessageForwardedBundleCollapsedFade / Footer / Toggle",
    type: "div or button props",
    description: "Collapsed overflow fade and expand/collapse control. Labels stay consumer-owned.",
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

export const Route = createFileRoute("/components/message-forwarded-bundle")({
  component: MessageForwardedBundleDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        forwardedBundle: forwardedBundleSource,
      },
    }),
});

function MessageForwardedBundleDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageForwardedBundle"
      description="Collapsed forwarded-message bundle composed inside a MessageItem body."
      toc={TOC}
    >
      <DocNote>
        Body block for <Link to="/components/message-item">MessageItem</Link>. Exported from{" "}
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
        <DocSubsection parentId="usage" id="forwarded-bundle" title="Forwarded bundle">
          <UsagePreview code={code.forwardedBundle}>
            <MessageForwardedBundleShowcaseComposition />
          </UsagePreview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
