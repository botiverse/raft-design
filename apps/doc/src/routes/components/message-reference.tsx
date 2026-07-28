import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageReferenceComparisonComposition } from "#/modules/message-reference/compositions/reference-comparison.composition.tsx";
import referenceComparisonSource from "#/modules/message-reference/compositions/reference-comparison.composition.tsx?raw";
import { MessageReferenceAttachmentCommentsComposition } from "#/modules/message-reference/compositions/attachment-comments.composition.tsx";
import attachmentCommentsSource from "#/modules/message-reference/compositions/attachment-comments.composition.tsx?raw";
import { MessageReferenceConversationDestinationsComposition } from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx";
import conversationDestinationsSource from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx?raw";
import { MessageReferencePeopleMentionsComposition } from "#/modules/message-reference/compositions/people-mentions.composition.tsx";
import peopleMentionsSource from "#/modules/message-reference/compositions/people-mentions.composition.tsx?raw";
import { MessageReferenceResolutionStatesComposition } from "#/modules/message-reference/compositions/resolution-states.composition.tsx";
import resolutionStatesSource from "#/modules/message-reference/compositions/resolution-states.composition.tsx?raw";
import { MessageReferenceShowcaseComposition } from "#/modules/message-reference/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-reference/compositions/reference-showcase.composition.tsx?raw";
import { TaskChipUsageComposition } from "#/modules/message-reference/compositions/task-references.composition.tsx";
import taskReferencesSource from "#/modules/message-reference/compositions/task-references.composition.tsx?raw";
import { MessageReferenceSourcePreview } from "#/modules/message-reference/message-reference.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "usage", title: "Usage" },
  { id: "reference-states", title: "Reference states" },
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
      {
        label: "AttachmentCommentRefChip.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/AttachmentCommentRefChip.tsx",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<MessageReferenceText render={<button type="button" />}>
  @Ada
</MessageReferenceText>

<MessageReferenceChip variant="muted" render={<a href="…" />}>
  #channel
</MessageReferenceChip>

<MessageReferenceChip variant="muted" render={<a href="…" />}>
  <MessageReferenceLabel>message #222</MessageReferenceLabel>
  <MessageReferenceMeta>msg</MessageReferenceMeta>
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

function UsagePreview({
  children,
  code,
  stretch = false,
}: {
  children: ReactNode;
  code: ReactNode;
  stretch?: boolean;
}) {
  return (
    <Preview previewClassName={stretch ? "items-stretch" : undefined}>
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
        peopleMentions: peopleMentionsSource,
        conversationDestinations: conversationDestinationsSource,
        taskReferences: taskReferencesSource,
        attachmentComments: attachmentCommentsSource,
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
        <UsagePreview code={code.referenceShowcase} stretch>
          <MessageReferenceShowcaseComposition />
        </UsagePreview>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="people-mentions" title="People mentions">
            <p className="mb-3 text-sm text-foreground-muted">
              Type <InlineCode>@Atlas</InlineCode> or <InlineCode>@you</InlineCode>. The consumer
              owns member-preview behavior; use the text surface for another member and the primary
              chip for the current member.
            </p>
            <UsagePreview code={code.peopleMentions}>
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
              include its destination icon and label directly.
            </p>
            <UsagePreview code={code.conversationDestinations}>
              <MessageReferenceConversationDestinationsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="task-references" title="Tasks">
            <p className="mb-3 text-sm text-foreground-muted">
              Use <InlineCode>TaskChip</InlineCode> for a resolved task. Its status controls the
              status icon and task surface; task state remains consumer-owned.
            </p>
            <UsagePreview code={code.taskReferences}>
              <TaskChipUsageComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-comment-context"
            title="Attachment comment context"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Compose the neutral chip with the attachment-comment icon and resolved target owned by
              the message consumer.
            </p>
            <UsagePreview code={code.attachmentComments}>
              <MessageReferenceAttachmentCommentsComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="reference-states" title="Reference states">
        <p className="mb-3 text-sm text-foreground-muted">
          Use explicit pending and unavailable surfaces only after the consumer has resolved the
          reference state. Unknown bare tokens remain plain text.
        </p>
        <UsagePreview code={code.resolutionStates}>
          <MessageReferenceResolutionStatesComposition />
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Inline references in a message row",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real MessageItem, MentionLink, ReferenceChip, and AttachmentCommentRefChip DOM; the three Current panes execute the canonical message composition.",
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
