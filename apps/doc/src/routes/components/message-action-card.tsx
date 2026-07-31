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
import { ActionCardMessageComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import actionCardComparisonSource from "#/modules/message-action-card/compositions/action-card-message.composition.tsx?raw";
import { ActionCardChannelAndAgentComposition } from "#/modules/message-action-card/compositions/channel-agent-actions.composition.tsx";
import actionCardChannelAndAgentSource from "#/modules/message-action-card/compositions/channel-agent-actions.composition.tsx?raw";
import { ActionCardIntegrationComposition } from "#/modules/message-action-card/compositions/integration-actions.composition.tsx";
import actionCardIntegrationSource from "#/modules/message-action-card/compositions/integration-actions.composition.tsx?raw";
import { ActionCardResolutionStatesComposition } from "#/modules/message-action-card/compositions/resolution-states.composition.tsx";
import actionCardResolutionStatesSource from "#/modules/message-action-card/compositions/resolution-states.composition.tsx?raw";
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
  <MessageActionCardHeader>
    <MessageActionCardHeaderStatus />
  </MessageActionCardHeader>
  <MessageActionCardContent>
    <MessageActionCardProperties>
      <MessageActionCardProperty>
        <MessageActionCardPropertyLabel />
        <MessageActionCardPropertyValue />
      </MessageActionCardProperty>
    </MessageActionCardProperties>
    <MessageActionCardScopeList>
      <MessageActionCardScopeListLabel />
      <MessageActionCardScope>
        <MessageActionCardScopeName />
        <MessageActionCardScopeDescription />
      </MessageActionCardScope>
    </MessageActionCardScopeList>
    <Banner status="warning">
      <BannerDescription />
    </Banner>
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
    name: "MessageActionCardHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Outer title row. Compose the action title and any trailing status here.",
  },
  {
    name: "MessageActionCardHeaderStatus",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Trailing header region. Use render to apply its alignment to a caller-owned badge or status.",
  },
  {
    name: "MessageActionCardContent",
    type: 'useRender.ComponentProps<"div">',
    description: "White inner content stack for details, hint, actions, and completion.",
  },
  {
    name: "MessageActionCardProperties",
    type: 'useRender.ComponentProps<"dl">',
    description: "Optional aligned definition list for compact action properties.",
  },
  {
    name: "MessageActionCardProperty",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Semantic label/value pair in the shared Properties grid; it does not create its own surface.",
  },
  {
    name: "MessageActionCardPropertyLabel",
    type: 'useRender.ComponentProps<"dt">',
    description: "Muted metadata label with a shared column width.",
  },
  {
    name: "MessageActionCardPropertyValue",
    type: 'useRender.ComponentProps<"dd">',
    description: "Metadata value that wraps without widening the card.",
  },
  {
    name: "MessageActionCardScopeList",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional named scope section rendered directly in the content stack.",
  },
  {
    name: "MessageActionCardScopeListLabel",
    type: 'useRender.ComponentProps<"div">',
    description: "Theme-aware heading for a scope list.",
  },
  {
    name: "MessageActionCardScope",
    type: 'useRender.ComponentProps<"div">',
    description: "One bordered scope explanation block.",
  },
  {
    name: "MessageActionCardScopeName",
    type: 'useRender.ComponentProps<"div">',
    description: "Scope identifier.",
  },
  {
    name: "MessageActionCardScopeDescription",
    type: 'useRender.ComponentProps<"div">',
    description: "Scope capability explanation.",
  },
  {
    name: "MessageActionCardHint",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional agent-provided rationale or guidance.",
  },
  {
    name: "MessageActionCardActions",
    type: 'useRender.ComponentProps<"div">',
    description: "Pre-commit action area. Buttons and dialog state stay consumer-owned.",
  },
  {
    name: "MessageActionCardCompletion",
    type: 'useRender.ComponentProps<"div">',
    description: "Post-commit result and actor summary supplied by the consumer.",
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

export const Route = createFileRoute("/components/message-action-card")({
  component: MessageActionCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        actionCardComparison: actionCardComparisonSource,
        actionCardChannelAndAgent: actionCardChannelAndAgentSource,
        actionCardIntegration: actionCardIntegrationSource,
        actionCardResolutionStates: actionCardResolutionStatesSource,
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
        <UsagePreview
          code={code.actionCardComparison}
          collapsedCode={code.actionCardComparisonBody}
        >
          <ActionCardMessageComposition />
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
          <DocSubsection
            parentId="usage"
            id="channel-and-agent-actions"
            title="Channel and agent actions"
            showThemeSwitcher
          >
            <p className="text-sm leading-6 text-foreground-muted">
              These three prepared-card shapes cover channel creation, agent creation, and member
              changes. The caller owns the dialog and execution path; this usage keeps the card
              itself static.
            </p>
            <UsagePreview
              code={code.actionCardChannelAndAgent}
              collapsedCode={code.actionCardChannelAndAgentBody}
            >
              <ActionCardChannelAndAgentComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="integration-actions"
            title="Connected App actions"
            showThemeSwitcher
          >
            <p className="text-sm leading-6 text-foreground-muted">
              Login approval, Connected App registration, legacy update, and owner recovery each
              provide their own prepared-card content. Their execute policy remains product-owned.
            </p>
            <UsagePreview
              code={code.actionCardIntegration}
              collapsedCode={code.actionCardIntegrationBody}
            >
              <ActionCardIntegrationComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="resolution-states"
            title="Completion and failure"
            showThemeSwitcher
          >
            <p className="text-sm leading-6 text-foreground-muted">
              A completed card replaces its action area with result content. A rejected card keeps
              its prepared structure and lets the product choose whether retry is permitted.
            </p>
            <UsagePreview
              code={code.actionCardResolutionStates}
              collapsedCode={code.actionCardResolutionStatesBody}
            >
              <ActionCardResolutionStatesComposition />
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
              compositionCollapsedCode: code.actionCardComparisonBody,
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
