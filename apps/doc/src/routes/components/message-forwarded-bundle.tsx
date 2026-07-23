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
import { MessageForwardedBundleShowcaseComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";
import { MessageForwardedBundleSourcePreview } from "#/modules/message-forwarded-bundle/message-forwarded-bundle.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
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
    <MessageForwardedBundleHeaderLabel />
    <MessageForwardedBundleHeaderCount />
    <MessageForwardedBundleSource />
  </MessageForwardedBundleHeader>
  <MessageForwardedBundleCollapsedItems>
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
  </MessageForwardedBundleCollapsedItems>
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
    name: "MessageForwardedBundleItems / CollapsedItems / Item / ItemMeta / ItemAuthor / Content",
    type: "div, article, or span props",
    description:
      "Expanded and source-faithful clipped list variants. Each item is an article with author meta and body content.",
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.forwardedBundle}>
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
              brutal: <MessageForwardedBundleShowcaseComposition />,
              elegant: <MessageForwardedBundleShowcaseComposition />,
              elegantDark: <MessageForwardedBundleShowcaseComposition />,
              compositionCode: code.forwardedBundle,
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
