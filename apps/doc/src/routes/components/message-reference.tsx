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
import primaryReferencesSource from "#/modules/message-reference/compositions/primary-references.composition.tsx?raw";
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
import { MessageReferenceTooltipHintComposition } from "#/modules/message-reference/compositions/tooltip-hint.composition.tsx";
import tooltipHintSource from "#/modules/message-reference/compositions/tooltip-hint.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "reference-states", title: "Reference states" },
  { id: "api", title: "API" },
] as const;

const SURFACES: readonly PropRow[] = [
  {
    name: "MessageReferenceText",
    type: 'useRender.ComponentProps<"span"> & { variant?: "primary" | "secondary" }',
    description:
      "Inline mention surface. Use primary for the current member; secondary is the default for everyone else. The caller owns navigation and preview behavior.",
  },
  {
    name: "MessageReferenceChip",
    type: 'useRender.ComponentProps<"span"> & { variant?: "accent" | "muted" | "info" | "link" }',
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
    type: 'useRender.ComponentProps<"span">',
    description:
      "Optional caption naming the reference type. Elegant reveals it to the left of the chip icon on hover or focus; Brutal keeps it hidden.",
  },
  {
    name: "MessageReferenceLabel",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional primary-label part that truncates safely inside a structured chip.",
  },
  {
    name: "MessageReferenceIndicator",
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
      ]}
    />
  );
}

export const Route = createFileRoute("/components/message-reference")({
  component: MessageReferenceDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: primaryReferencesSource,
        referenceAdapters: referenceAdaptersSource,
        primaryReferences: primaryReferencesSource,
        referenceShowcase: referenceShowcaseSource,
        peopleMentions: peopleMentionsSource,
        readIndicators: readIndicatorsSource,
        conversationDestinations: conversationDestinationsSource,
        tooltipHint: tooltipHintSource,
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
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="people-mentions" title="People mentions">
            <p className="mb-3 text-sm text-foreground-muted">
              Type <InlineCode>@Atlas</InlineCode> or <InlineCode>@Ada</InlineCode>. The consumer
              owns member-preview behavior; use the <InlineCode>primary</InlineCode> variant for the
              current member and <InlineCode>secondary</InlineCode> for everyone else.
            </p>
            <UsagePreview code={code.peopleMentions} collapsedCode={code.peopleMentionsBody}>
              <MessageReferencePeopleMentionsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="read-indicators" title="Agent read state">
            <p className="mb-3 text-sm text-foreground-muted">
              The consumer owns each mentioned agent&apos;s read state. Compose a caller-owned{" "}
              <InlineCode>Status</InlineCode> inside{" "}
              <InlineCode>MessageReferenceIndicator</InlineCode> for read and not-yet-read states;
              omit the indicator when the state is unknown.
            </p>
            <UsagePreview code={code.readIndicators}>
              <MessageReferenceReadIndicatorsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="conversation-destinations"
            title="Conversation destinations"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Use <InlineCode>#channel</InlineCode> for a channel,{" "}
              <InlineCode>dm:@member</InlineCode> for a DM, or a thread reference for a resolved
              parent. The visible label may omit its internal short ID. A resolved message reference
              can include its destination badge and label directly. In Elegant, hovering or focusing
              the chip expands the badge leftwards to name the destination type without moving
              surrounding text; Brutal keeps the badge hidden.
            </p>
            <UsagePreview
              code={code.conversationDestinations}
              collapsedCode={code.conversationDestinationsBody}
            >
              <MessageReferenceConversationDestinationsComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="tooltip-hint" title="Tooltip hint">
            <p className="mb-3 text-sm text-foreground-muted">
              Wrap the whole reference with <InlineCode>TooltipTrigger</InlineCode>, then anchor the
              tooltip to its leading icon. In Elegant, without{" "}
              <InlineCode>MessageReferenceBadge</InlineCode>, hovering the chip shows its type above
              the icon instead of expanding the icon area. Brutal keeps the badge hidden.
            </p>
            <UsagePreview code={code.tooltipHint} collapsedCode={code.tooltipHintBody}>
              <MessageReferenceTooltipHintComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="external-references"
            title="Permalinks and external links"
          >
            <p className="mb-3 text-sm text-foreground-muted">
              Use the link chip for both an in-product permalink and a target outside the workspace.
              The source qualifier lives in <InlineCode>MessageReferenceBadge</InlineCode>. Elegant
              reveals it on hover or focus so the resting chip stays a plain label; Brutal keeps it
              hidden. The consumer owns <InlineCode>target</InlineCode> and{" "}
              <InlineCode>rel</InlineCode>.
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
