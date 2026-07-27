import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageActionCardTypesComposition } from "#/modules/message-action-card/compositions/action-card.composition.tsx";
import actionCardTypesSource from "#/modules/message-action-card/compositions/action-card.composition.tsx?raw";
import { ActionCardMessageComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import actionCardComparisonSource from "#/modules/message-action-card/compositions/action-card-message.composition.tsx?raw";
import { MessageActionCardStatesComposition } from "#/modules/message-action-card/compositions/action-card-states.composition.tsx";
import actionCardStatesSource from "#/modules/message-action-card/compositions/action-card-states.composition.tsx?raw";
import { MessageActionCardPreview } from "#/modules/message-action-card/message-action-card.preview.tsx";
import { MessageActionCardSourcePreview } from "#/modules/message-action-card/message-action-card.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock action-card message",
    scenes: [
      {
        label: "ActionCard.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/actions/ActionCard.tsx",
      },
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<MessageActionCard>
  <MessageActionCardContent>
    <MessageActionCardHeader />
    <MessageActionCardDetails />
    <MessageActionCardHint />
    <MessageActionCardActions />
    <MessageActionCardCompletion />
  </MessageActionCardContent>
</MessageActionCard>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageActionCard",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Suggested-action card root. Compose inside MessageItemBody; execution state stays consumer-owned.",
  },
  {
    name: "MessageActionCardContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Inner content stack for header, details, hint, actions, and completion.",
  },
  {
    name: "MessageActionCardHeader / Details / Hint",
    type: 'useRender.ComponentProps<"div">',
    description: "Title, supporting details, and hint copy. Product labels stay consumer-owned.",
  },
  {
    name: "MessageActionCardActions / Completion",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Pre-commit action slot and post-commit completion slot. Buttons and badges stay consumer-owned.",
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

export const Route = createFileRoute("/components/message-action-card")({
  component: MessageActionCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        actionCardTypes: actionCardTypesSource,
        actionCardStates: actionCardStatesSource,
        actionCardComparison: actionCardComparisonSource,
        anatomy: ANATOMY_SOURCE,
      },
    }),
});

function MessageActionCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageActionCard"
      description="Suggested action card composed inside a MessageItem body for commit-style workflows."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <MessageActionCardPreview code={code.actionCardComparison} />
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
          <DocSubsection parentId="usage" id="action-card-types" title="Action types">
            <UsagePreview code={code.actionCardTypes}>
              <MessageActionCardTypesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="action-card-states" title="Lifecycle states">
            <UsagePreview code={code.actionCardStates}>
              <MessageActionCardStatesComposition />
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
              label: "Channel action",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real ActionCard and MessageItem DOM; the three Current panes execute the canonical message composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageActionCardSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <ActionCardMessageComposition />,
              elegant: <ActionCardMessageComposition />,
              elegantDark: <ActionCardMessageComposition />,
              compositionCode: code.actionCardComparison,
              compositionPath:
                "apps/doc/src/modules/message-action-card/compositions/action-card-message.composition.tsx",
              compositionSource: actionCardComparisonSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
