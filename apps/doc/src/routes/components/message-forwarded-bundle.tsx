import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ForwardedBundleCompactComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-compact.composition.tsx";
import forwardedBundleCompactSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-compact.composition.tsx?raw";
import { ForwardedBundleLongContentComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-long-content.composition.tsx";
import forwardedBundleLongContentSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-long-content.composition.tsx?raw";
import { ForwardedBundleStaticSourceComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-static-source.composition.tsx";
import forwardedBundleStaticSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-static-source.composition.tsx?raw";
import { ForwardedBundleThreadComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-thread.composition.tsx";
import forwardedBundleThreadSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-thread.composition.tsx?raw";
import {
  ForwardedBundleEmbeddedComposition,
  MessageForwardedBundleShowcaseComposition,
} from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";
import { MessageForwardedBundleSourcePreview } from "#/modules/message-forwarded-bundle/message-forwarded-bundle.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock forwarded-message surface",
    scenes: [
      {
        label: "ForwardedBundleCard.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ForwardedBundleCard.tsx",
      },
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<MessageForwardedBundle>
  <MessageForwardedBundleHeader>
    <MessageForwardedBundleHeaderContent>
      <MessageForwardedBundleHeaderLabel />
      <MessageForwardedBundleHeaderCount />
    </MessageForwardedBundleHeaderContent>
    <MessageForwardedBundleSource />
  </MessageForwardedBundleHeader>
  <MessageForwardedBundleItems collapsed>
    <MessageForwardedBundleItem>
      <MessageForwardedBundleItemMeta>
        <MessageForwardedBundleItemAuthor />
      </MessageForwardedBundleItemMeta>
      <MessageForwardedBundleAttachments>
        <MessageForwardedBundleAttachment>
          <MessageForwardedBundleAttachmentName />
          <MessageForwardedBundleAttachmentMeta />
        </MessageForwardedBundleAttachment>
      </MessageForwardedBundleAttachments>
    </MessageForwardedBundleItem>
  </MessageForwardedBundleItems>
  <MessageForwardedBundleFooter>
    <MessageForwardedBundleFooterAction />
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
    name: "MessageForwardedBundleHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Bundle header row.",
  },
  {
    name: "MessageForwardedBundleHeaderContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Leading header region for the forwarded label and count.",
  },
  {
    name: "MessageForwardedBundleHeaderLabel",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded label.",
  },
  {
    name: "MessageForwardedBundleHeaderCount",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded message count label.",
  },
  {
    name: "MessageForwardedBundleSource",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Interactive public source link; render as an anchor when navigation is available.",
  },
  {
    name: "MessageForwardedBundleSourceLabel",
    type: 'useRender.ComponentProps<"span">',
    description: "Static public source label when the original message cannot be opened.",
  },
  {
    name: "MessageForwardedBundleItems",
    type: 'useRender.ComponentProps<"div"> & { collapsed?: boolean }',
    description: "Item list. Set collapsed to constrain height and show its bottom fade.",
  },
  {
    name: "MessageForwardedBundleItem",
    type: 'useRender.ComponentProps<"article">',
    description: "One forwarded message snapshot.",
  },
  {
    name: "MessageForwardedBundleItemMeta",
    type: 'useRender.ComponentProps<"div">',
    description: "Author and timestamp row for an item.",
  },
  {
    name: "MessageForwardedBundleItemAuthor",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded item author label.",
  },
  {
    name: "MessageForwardedBundleAttachments",
    type: 'useRender.ComponentProps<"div">',
    description: "Attachment-chip region for an item.",
  },
  {
    name: "MessageForwardedBundleAttachment",
    type: 'useRender.ComponentProps<"span">',
    description: "One forwarded attachment chip.",
  },
  {
    name: "MessageForwardedBundleAttachmentName",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated attachment filename.",
  },
  {
    name: "MessageForwardedBundleAttachmentMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Attachment type or other compact metadata.",
  },
  {
    name: "MessageForwardedBundleFooter",
    type: 'useRender.ComponentProps<"div">',
    description: "Footer container for caller-owned actions.",
  },
  {
    name: "MessageForwardedBundleFooterAction",
    type: 'useRender.ComponentProps<"button">',
    description: "Styled action slot for the forwarded bundle footer.",
  },
];

function UsagePreview({
  children,
  code,
  collapsedCode,
}: {
  children: ReactNode;
  code: ReactNode;
  collapsedCode?: ReactNode;
}) {
  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
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
        forwardedBundleCompact: forwardedBundleCompactSource,
        forwardedBundleLongContent: forwardedBundleLongContentSource,
        forwardedBundleStaticSource: forwardedBundleStaticSource,
        forwardedBundleThread: forwardedBundleThreadSource,
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.forwardedBundle} collapsedCode={code.forwardedBundleBody}>
          <MessageForwardedBundleShowcaseComposition />
        </UsagePreview>
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
          <DocSubsection parentId="usage" id="compact" title="Compact bundle">
            <DocNote>
              One to three short forwarded messages render expanded and omit the footer. A DM,
              private channel, or missing target also omits the source label.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleCompact}
              collapsedCode={code.forwardedBundleCompactBody}
            >
              <ForwardedBundleCompactComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="collapsed" title="Collapsed bundle">
            <DocNote>
              More than three messages begin collapsed. The consumer owns the expanded state and
              passes it to MessageForwardedBundleItems; the list then clips and renders its own
              fade. The footer and its action remain caller-owned.
            </DocNote>
            <UsagePreview code={code.forwardedBundle} collapsedCode={code.forwardedBundleBody}>
              <ForwardedBundleEmbeddedComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="long-content" title="Long content and attachments">
            <DocNote>
              A single forwarded item also collapses when its content is long. Attachment labels
              stay caller-owned, including their MIME-derived type text.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleLongContent}
              collapsedCode={code.forwardedBundleLongContentBody}
            >
              <ForwardedBundleLongContentComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="thread-source" title="Thread source">
            <DocNote>
              A public thread source is actionable and adds the thread suffix to its label.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleThread}
              collapsedCode={code.forwardedBundleThreadBody}
            >
              <ForwardedBundleThreadComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="static-source" title="Static source label">
            <DocNote>
              Render a static source label when the original message cannot be opened, such as
              unavailable provenance or a composer preview. An empty forwarded-items list has no
              rendered bundle.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleStaticSource}
              collapsedCode={code.forwardedBundleStaticSourceBody}
            >
              <ForwardedBundleStaticSourceComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Collapsed forwarded bundle",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real ForwardedBundleCard and MessageItem DOM; the three Current panes execute the canonical message composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageForwardedBundleSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <ForwardedBundleEmbeddedComposition />,
              elegant: <ForwardedBundleEmbeddedComposition />,
              elegantDark: <ForwardedBundleEmbeddedComposition />,
              compositionCode: code.forwardedBundle,
              compositionCollapsedCode: code.forwardedBundleBody,
              compositionPath:
                "apps/doc/src/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx",
              compositionSource: forwardedBundleSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
