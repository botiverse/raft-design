import type { ReactNode } from "react";
import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import type { HighlightedSnippets } from "#/lib/highlight.tsx";
import referenceAdaptersSource from "#/modules/message-reference/compositions/reference-adapters.composition.tsx?raw";
import primaryReferencesSource from "#/modules/message-reference/compositions/primary-references.composition.tsx?raw";
import { MessageReferenceAttachmentCommentComposition } from "#/modules/message-reference/compositions/attachment-comment.composition.tsx";
import attachmentCommentSource from "#/modules/message-reference/compositions/attachment-comment.composition.tsx?raw";
import { MessageReferenceConversationDestinationsComposition } from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx";
import conversationDestinationsSource from "#/modules/message-reference/compositions/conversation-destinations.composition.tsx?raw";
import { MessageReferenceExternalReferencesComposition } from "#/modules/message-reference/compositions/external-references.composition.tsx";
import externalReferencesSource from "#/modules/message-reference/compositions/external-references.composition.tsx?raw";
import { MessageReferencePeopleMentionsComposition } from "#/modules/message-reference/compositions/people-mentions.composition.tsx";
import peopleMentionsSource from "#/modules/message-reference/compositions/people-mentions.composition.tsx?raw";
import { MessageReferenceReadIndicatorsComposition } from "#/modules/message-reference/compositions/read-indicators.composition.tsx";
import readIndicatorsSource from "#/modules/message-reference/compositions/read-indicators.composition.tsx?raw";
import { MessageReferenceResolutionStatesComposition } from "#/modules/message-reference/compositions/resolution-states.composition.tsx";
import resolutionStatesSource from "#/modules/message-reference/compositions/resolution-states.composition.tsx?raw";
import { MessageReferenceShowcaseComposition } from "#/modules/message-reference/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-reference/compositions/reference-showcase.composition.tsx?raw";
import { MessageReferenceTaskReferencesComposition } from "#/modules/message-reference/compositions/task-references.composition.tsx";
import taskReferencesSource from "#/modules/message-reference/compositions/task-references.composition.tsx?raw";
import { MessageReferenceMixedLongMessageComposition } from "#/modules/message-reference/compositions/mixed-long-message.composition.tsx";
import { MessageReferenceThreadReferencesComposition } from "#/modules/message-reference/compositions/thread-references.composition.tsx";
import threadReferencesSource from "#/modules/message-reference/compositions/thread-references.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "mixed", title: "Mixed in one long message" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import {
  MessageReferenceChip,
  MessageReferenceIndicator,
  MessageReferenceLabel,
  MessageReferencePending,
  MessageReferenceText,
  MessageReferenceUnavailable,
} from "raft-ui";

<>
  <MessageReferenceText>
    <MessageReferenceIndicator />
  </MessageReferenceText>

  <MessageReferenceChip>
    {/* Caller-owned icon */}
    <MessageReferenceLabel />
  </MessageReferenceChip>

  <MessageReferencePending />
  <MessageReferenceUnavailable />
</>`;

const MESSAGE_REFERENCE_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"primary" | "secondary"',
    description: "Surface tone for the mention. Use primary for the viewer's self-mention.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Inline mention surface. Use primary for the viewer's self-mention; secondary is the default for everyone else. The caller owns entity resolution, navigation, and preview behavior.",
  },
];

const MESSAGE_REFERENCE_CHIP_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"accent" | "muted" | "info" | "link"',
    description: "Visual tone for the chip. Visual only; navigation stays consumer-owned.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Inline chip reference. Variant is visual only; use render={<a href=… />} when the consumer owns navigation.",
  },
];

const MESSAGE_REFERENCE_PENDING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Explicit resolving surface. Loading indicators and resolution copy remain consumer-owned.",
  },
];

const MESSAGE_REFERENCE_UNAVAILABLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Opt-in unavailable surface for consumers that know a target cannot open. Source keeps unresolved tokens as plain text instead of selecting this state automatically.",
  },
];

const MESSAGE_REFERENCE_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional primary-label part that truncates safely inside a structured chip.",
  },
];

const MESSAGE_REFERENCE_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Optional child part that positions caller-owned status content on an inline reference. The consumer decides whether to render it.",
  },
];

const REFERENCE_SHOWCASE_PATH =
  "apps/doc/src/modules/message-reference/compositions/reference-showcase.composition.tsx";
const PRIMARY_REFERENCES_PATH =
  "apps/doc/src/modules/message-reference/compositions/primary-references.composition.tsx";
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

/** Showcase composition plus the message row and the mention/permalink adapters it renders. */
function MessageReferenceSourceFiles({ code }: { code: HighlightedSnippets }) {
  const files = useMemo(
    () => [
      {
        path: REFERENCE_SHOWCASE_PATH,
        source: referenceShowcaseSource,
        html: code.referenceShowcase,
        collapsedHtml: code.referenceShowcaseBody,
      },
      {
        path: PRIMARY_REFERENCES_PATH,
        source: primaryReferencesSource,
        html: code.primaryReferences,
        collapsedHtml: code.primaryReferencesBody,
      },
      {
        path: REFERENCE_ADAPTERS_PATH,
        source: referenceAdaptersSource,
        html: code.referenceAdapters,
        collapsedHtml: code.referenceAdaptersBody,
      },
    ],
    [code],
  );
  return <DocsCodeBlock.Files collapsible={false} showLineNumbers={false} files={files} />;
}

export const Route = createFileRoute("/components/message-reference")({
  component: MessageReferenceDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        attachmentComment: attachmentCommentSource,
        referenceAdapters: referenceAdaptersSource,
        primaryReferences: primaryReferencesSource,
        referenceShowcase: referenceShowcaseSource,
        peopleMentions: peopleMentionsSource,
        readIndicators: readIndicatorsSource,
        conversationDestinations: conversationDestinationsSource,
        externalReferences: externalReferencesSource,
        resolutionStates: resolutionStatesSource,
        taskReferences: taskReferencesSource,
        threadReferences: threadReferencesSource,
      },
    }),
});

function MessageReferenceDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageReference"
      description="Inline message references for people, conversations, tasks, message permalinks, attachment comments, and resolution states."
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

      <DocSection id="mixed" title="Mixed in one long message" showThemeSwitcher>
        <p className="mb-4 text-sm text-foreground-muted">
          Every inline kind in one message. Chips are the body text&apos;s size and sit on its
          baseline, and their letters stay centred in the coloured box; inline code is 0.875em, has
          no border in messages, and breaks inside tokens too long for the line. Shown at a desktop
          width and at a 358px phone width.
        </p>
        <div className="flex flex-wrap items-start gap-6" data-demo="mixed-long-message">
          <div
            className="w-full max-w-[720px] border border-line bg-layer-panel p-3"
            data-demo-width="desktop"
          >
            <MessageReferenceMixedLongMessageComposition />
          </div>
          <div className="w-[358px] border border-line bg-layer-panel p-3" data-demo-width="phone">
            <MessageReferenceMixedLongMessageComposition />
          </div>
        </div>
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
              Resolve a recognized <InlineCode>@name</InlineCode> to an agent or member, then let
              the consumer own profile navigation and preview content. Use the{" "}
              <InlineCode>primary</InlineCode> variant only for the viewing member&apos;s
              self-mention; other resolved mentions use <InlineCode>secondary</InlineCode>. Unknown
              names remain plain text instead of becoming dead controls.
            </p>
            <UsagePreview code={code.peopleMentions}>
              <MessageReferencePeopleMentionsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="read-indicators" title="Agent read state">
            <p className="mb-3 text-sm text-foreground-muted">
              Source shows read state only on an <InlineCode>@agent</InlineCode> mention, only to
              the human who sent that message, and only when read receipts are enabled. Compose a
              caller-owned <InlineCode>Status</InlineCode> inside{" "}
              <InlineCode>MessageReferenceIndicator</InlineCode> for read and unread; omit it for
              human mentions, optimistic messages, unhydrated data, and every other unknown state.
            </p>
            <UsagePreview code={code.readIndicators}>
              <MessageReferenceReadIndicatorsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="conversation-destinations" title="Channels and DMs">
            <p className="mb-3 text-sm text-foreground-muted">
              Use <InlineCode>#channel</InlineCode> for public, private, and joint channels, and{" "}
              <InlineCode>dm:@member</InlineCode> for a direct message. These top-level destinations
              use the accent surface. The resolved destination type chooses the caller-owned icon;
              unrecognized destinations remain verbatim text.
            </p>
            <UsagePreview
              code={code.conversationDestinations}
              collapsedCode={code.conversationDestinationsBody}
            >
              <MessageReferenceConversationDestinationsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="thread-references" title="Thread references">
            <p className="mb-3 text-sm text-foreground-muted">
              Use <InlineCode>#channel:shortId</InlineCode> for a channel thread and{" "}
              <InlineCode>dm:@member:shortId</InlineCode> for a DM thread. Threads use the info
              surface and retain the short ID because navigation needs it to resolve the parent
              message. A missing or unrecognized parent leaves the original token as plain text.
            </p>
            <UsagePreview code={code.threadReferences} collapsedCode={code.threadReferencesBody}>
              <MessageReferenceThreadReferencesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="task-references" title="Task references">
            <p className="mb-3 text-sm text-foreground-muted">
              Source always recognizes the explicit <InlineCode>task #205</InlineCode> form. A bare{" "}
              <InlineCode>#205</InlineCode> becomes interactive only when that task exists in the
              current channel; unknown numbers stay plain text. Render resolved tasks with{" "}
              <InlineCode>TaskChip</InlineCode>, not <InlineCode>MessageReferenceChip</InlineCode>,
              so task status remains owned by its dedicated component.
            </p>
            <UsagePreview code={code.taskReferences} collapsedCode={code.taskReferencesBody}>
              <MessageReferenceTaskReferencesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-comment"
            title="Attachment comment references"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              When a message replies to an attachment comment, place the reference before the
              message body and preserve the source filename plus optional anchor label. Render it as
              a link only when the host message can be opened; otherwise keep the same chip as
              static text. An available anchor quote follows as a blockquote rather than being
              packed into the chip.
            </p>
            <UsagePreview code={code.attachmentComment} collapsedCode={code.attachmentCommentBody}>
              <MessageReferenceAttachmentCommentComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="external-references" title="Message permalinks">
            <p className="mb-3 text-sm text-foreground-muted">
              A recognized Slock message URL becomes a permalink chip labelled with its channel or
              DM destination. Same-server links open in product; cross-server links open externally.
              The full URL belongs in the link title. Ordinary web URLs are not message references;
              render them with <InlineCode>MarkdownLink</InlineCode> instead of this chip surface.
            </p>
            <UsagePreview
              code={code.externalReferences}
              collapsedCode={code.externalReferencesBody}
            >
              <MessageReferenceExternalReferencesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="reference-states"
            title="Resolving and unresolved references"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Keep a clicked thread token visible while its parent resolves, add a spinner, and
              expose the busy state to assistive technology. If resolution fails, source keeps the
              token and lets the message layer announce a temporary unavailable/deleted notice; it
              does not convert the reference into a permanent unavailable chip. Unknown channels,
              DMs, tasks, and bare tokens remain verbatim plain text rather than disabled links.
            </p>
            <UsagePreview code={code.resolutionStates}>
              <MessageReferenceResolutionStatesComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection
            parentId="api"
            id="api-message-reference-text"
            title="MessageReferenceText"
          >
            <PropsTable rows={MESSAGE_REFERENCE_TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-chip"
            title="MessageReferenceChip"
          >
            <PropsTable rows={MESSAGE_REFERENCE_CHIP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-pending"
            title="MessageReferencePending"
          >
            <PropsTable rows={MESSAGE_REFERENCE_PENDING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-unavailable"
            title="MessageReferenceUnavailable"
          >
            <PropsTable rows={MESSAGE_REFERENCE_UNAVAILABLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-label"
            title="MessageReferenceLabel"
          >
            <PropsTable rows={MESSAGE_REFERENCE_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-indicator"
            title="MessageReferenceIndicator"
          >
            <PropsTable rows={MESSAGE_REFERENCE_INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
