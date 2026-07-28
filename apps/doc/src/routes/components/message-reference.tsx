import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import referenceAdaptersSource from "#/modules/message-reference/compositions/reference-adapters.composition.tsx?raw";
import referenceComparisonSource from "#/modules/message-reference/compositions/reference-comparison.composition.tsx?raw";
import { MessageReferenceAttachmentCommentsComposition } from "#/modules/message-reference/compositions/attachment-comments.composition.tsx";
import attachmentCommentsSource from "#/modules/message-reference/compositions/attachment-comments.composition.tsx?raw";
import { MessageReferenceConversationDestinationsComposition } from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx";
import conversationDestinationsSource from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx?raw";
import { MessageReferenceExternalReferencesComposition } from "#/modules/message-reference/compositions/external-references.composition.tsx";
import externalReferencesSource from "#/modules/message-reference/compositions/external-references.composition.tsx?raw";
import { MessageReferencePeopleMentionsComposition } from "#/modules/message-reference/compositions/people-mentions.composition.tsx";
import peopleMentionsSource from "#/modules/message-reference/compositions/people-mentions.composition.tsx?raw";
import { MessageReferenceResolutionStatesComposition } from "#/modules/message-reference/compositions/resolution-states.composition.tsx";
import resolutionStatesSource from "#/modules/message-reference/compositions/resolution-states.composition.tsx?raw";
import { MessageReferenceShowcaseComposition } from "#/modules/message-reference/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-reference/compositions/reference-showcase.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "reference-states", title: "Reference states" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageReferenceText render={<button type="button" />}>
  @Ada
</MessageReferenceText>

<MessageReferenceChip variant="muted" render={<a href="…" />}>
  #channel
</MessageReferenceChip>

<MessageReferenceChip variant="muted" render={<a href="…" />}>
  <MessageReferenceBadge label="message">
    <MessageSquareText />
  </MessageReferenceBadge>
  <MessageReferenceLabel>message #222</MessageReferenceLabel>
</MessageReferenceChip>

<MessageReferencePending>Resolving…</MessageReferencePending>
<MessageReferenceUnavailable>Unavailable</MessageReferenceUnavailable>`;

const SURFACES: readonly PropRow[] = [
  {
    name: "MessageReferenceText",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Inline text-reference surface, for example a mention. The caller owns navigation and preview behavior.",
  },
  {
    name: "MessageReferenceChip",
    type: 'useRender.ComponentProps<"span"> & { variant?: "primary" | "accent" | "muted" | "info" | "neutral" | "link" }',
    description:
      "Inline chip reference. Variant is visual only; use render={<a href=… />} when the consumer owns navigation.",
  },
  {
    name: "MessageReferencePending",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit resolving surface. Loading indicators and resolution copy remain consumer-owned.",
  },
  {
    name: "MessageReferenceUnavailable",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit unavailable surface. Failure icons and fallback copy remain consumer-owned.",
  },
];

const PARTS: readonly PropRow[] = [
  {
    name: "MessageReferenceBadge",
    type: 'useRender.ComponentProps<"span"> & { label?: ReactNode }',
    description:
      "Optional leading badge that overlays the chip. Children hold the reference icon; label adds the hover caption.",
  },
  {
    name: "MessageReferenceBadgeLabel",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Badge caption behind the badge label prop. Compose it directly when the caption needs more than plain text.",
  },
  {
    name: "MessageReferenceLabel",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional primary-label part that truncates safely inside a structured chip.",
  },
  {
    name: "MessageReferenceMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional secondary metadata part for permalink and external-reference chips.",
  },
];

const REFERENCE_SHOWCASE_PATH =
  "apps/doc/src/modules/message-reference/compositions/reference-showcase.composition.tsx";
const REFERENCE_COMPARISON_PATH =
  "apps/doc/src/modules/message-reference/compositions/reference-comparison.composition.tsx";
const REFERENCE_ADAPTERS_PATH =
  "apps/doc/src/modules/message-reference/compositions/reference-adapters.composition.tsx";

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
    <Preview>
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

/** Showcase composition plus the message row and the mention/target adapters it renders. */
function MessageReferenceSourceFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
      collapsible={false}
      showLineNumbers={false}
      files={[
        {
          path: REFERENCE_SHOWCASE_PATH,
          source: referenceShowcaseSource,
          html: code.referenceShowcase,
          collapsedHtml: code.referenceShowcaseBody,
        },
        {
          path: REFERENCE_COMPARISON_PATH,
          source: referenceComparisonSource,
          html: code.referenceComparison,
          collapsedHtml: code.referenceComparisonBody,
        },
        {
          path: REFERENCE_ADAPTERS_PATH,
          source: referenceAdaptersSource,
          html: code.referenceAdapters,
          collapsedHtml: code.referenceAdaptersBody,
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/components/message-reference")({
  component: MessageReferenceDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        referenceAdapters: referenceAdaptersSource,
        referenceComparison: referenceComparisonSource,
        referenceShowcase: referenceShowcaseSource,
        peopleMentions: peopleMentionsSource,
        conversationDestinations: conversationDestinationsSource,
        attachmentComments: attachmentCommentsSource,
        externalReferences: externalReferencesSource,
        resolutionStates: resolutionStatesSource,
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
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageReferenceShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code codeBlock={<MessageReferenceSourceFiles code={code} />} />
        </Preview>
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
          <DocSubsection parentId="usage" id="people-mentions" title="People mentions">
            <p className="mb-3 text-sm text-foreground-muted">
              Type <InlineCode>@Atlas</InlineCode> or <InlineCode>@you</InlineCode>. The consumer
              owns member-preview behavior; use the text surface for another member and the primary
              chip for the current member.
            </p>
            <UsagePreview code={code.peopleMentions} collapsedCode={code.peopleMentionsBody}>
              <MessageReferencePeopleMentionsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="conversation-destinations"
            title="Conversation destinations"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Use <InlineCode>#channel</InlineCode> for a channel,{" "}
              <InlineCode>{"<dm:@member>"}</InlineCode> for a DM, or append{" "}
              <InlineCode>:short-id</InlineCode> for a thread. A resolved message reference can
              include its destination badge and label directly. Hovering the chip expands the badge
              leftwards to name the destination type, without moving surrounding text.
            </p>
            <UsagePreview
              code={code.conversationDestinations}
              collapsedCode={code.conversationDestinationsBody}
            >
              <MessageReferenceConversationDestinationsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-comment-context"
            title="Attachment comment context"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Compose the neutral chip with the attachment-comment badge and resolved target owned
              by the message consumer.
            </p>
            <UsagePreview
              code={code.attachmentComments}
              collapsedCode={code.attachmentCommentsBody}
            >
              <MessageReferenceAttachmentCommentsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="external-references"
            title="Permalinks and external links"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Use the muted chip for an in-product permalink and the link chip for a target outside
              the workspace. The source qualifier lives in{" "}
              <InlineCode>MessageReferenceBadge</InlineCode> and is revealed on hover, so the
              resting chip stays a plain label; the consumer owns <InlineCode>target</InlineCode>{" "}
              and <InlineCode>rel</InlineCode>.
            </p>
            <UsagePreview
              code={code.externalReferences}
              collapsedCode={code.externalReferencesBody}
            >
              <MessageReferenceExternalReferencesComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="reference-states" title="Reference states">
        <p className="mb-3 text-sm text-foreground-muted">
          Use explicit pending and unavailable surfaces only after the consumer has resolved the
          reference state. Unknown bare tokens remain plain text.
        </p>
        <UsagePreview code={code.resolutionStates} collapsedCode={code.resolutionStatesBody}>
          <MessageReferenceResolutionStatesComposition />
        </UsagePreview>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-8">
          <DocSubsection parentId="api" id="api-surfaces" title="Surfaces">
            <PropsTable rows={SURFACES} />
          </DocSubsection>

          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <p className="mb-3 text-sm text-foreground-muted">
              Use these parts only when a chip needs structured text beside its icon.
            </p>
            <PropsTable rows={PARTS} nameColumnLabel="Part" />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
