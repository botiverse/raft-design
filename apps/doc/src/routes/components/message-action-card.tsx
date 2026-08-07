import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ActionCardMessageComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import actionCardComparisonSource from "#/modules/message-action-card/compositions/action-card-message.composition.tsx?raw";
import { ActionCardChannelAndAgentComposition } from "#/modules/message-action-card/compositions/channel-agent-actions.composition.tsx";
import actionCardChannelAndAgentSource from "#/modules/message-action-card/compositions/channel-agent-actions.composition.tsx?raw";
import { ActionCardIntegrationComposition } from "#/modules/message-action-card/compositions/integration-actions.composition.tsx";
import actionCardIntegrationSource from "#/modules/message-action-card/compositions/integration-actions.composition.tsx?raw";
import { ActionCardResolutionStatesComposition } from "#/modules/message-action-card/compositions/resolution-states.composition.tsx";
import actionCardResolutionStatesSource from "#/modules/message-action-card/compositions/resolution-states.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import {
  Banner,
  BannerDescription,
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCompletion,
  MessageActionCardContent,
  MessageActionCardHeader,
  MessageActionCardHeaderStatus,
  MessageActionCardHint,
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
  MessageActionCardScope,
  MessageActionCardScopeDescription,
  MessageActionCardScopeList,
  MessageActionCardScopeListLabel,
  MessageActionCardScopeName,
} from "raft-ui";

<MessageActionCard>
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

const MESSAGE_ACTION_CARD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Suggested-action card root. Compose inside MessageItemBody; execution state stays consumer-owned.",
  },
];

const MESSAGE_ACTION_CARD_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Outer title row. Compose the action title and any trailing status here.",
  },
];

const MESSAGE_ACTION_CARD_HEADER_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Trailing header region. Use render to apply its alignment to a caller-owned badge or status.",
  },
];

const MESSAGE_ACTION_CARD_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "White inner content stack for details, hint, actions, and completion.",
  },
];

const MESSAGE_ACTION_CARD_PROPERTIES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"dl">',
    description: "Optional aligned definition list for compact action properties.",
  },
];

const MESSAGE_ACTION_CARD_PROPERTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Semantic label/value pair in the shared Properties grid; it does not create its own surface.",
  },
];

const MESSAGE_ACTION_CARD_PROPERTY_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"dt">',
    description: "Muted metadata label with a shared column width.",
  },
];

const MESSAGE_ACTION_CARD_PROPERTY_VALUE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"dd">',
    description: "Metadata value that wraps without widening the card.",
  },
];

const MESSAGE_ACTION_CARD_SCOPE_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional named scope section rendered directly in the content stack.",
  },
];

const MESSAGE_ACTION_CARD_SCOPE_LIST_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Theme-aware heading for a scope list.",
  },
];

const MESSAGE_ACTION_CARD_SCOPE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "One bordered scope explanation block.",
  },
];

const MESSAGE_ACTION_CARD_SCOPE_NAME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Scope identifier.",
  },
];

const MESSAGE_ACTION_CARD_SCOPE_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Scope capability explanation.",
  },
];

const MESSAGE_ACTION_CARD_HINT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional agent-provided rationale or guidance.",
  },
];

const MESSAGE_ACTION_CARD_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Pre-commit action area. Buttons and dialog state stay consumer-owned.",
  },
];

const MESSAGE_ACTION_CARD_COMPLETION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-message-action-card" title="MessageActionCard">
            <PropsTable rows={MESSAGE_ACTION_CARD_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-header"
            title="MessageActionCardHeader"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-header-status"
            title="MessageActionCardHeaderStatus"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_HEADER_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-content"
            title="MessageActionCardContent"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-properties"
            title="MessageActionCardProperties"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_PROPERTIES_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-property"
            title="MessageActionCardProperty"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_PROPERTY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-property-label"
            title="MessageActionCardPropertyLabel"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_PROPERTY_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-property-value"
            title="MessageActionCardPropertyValue"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_PROPERTY_VALUE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-scope-list"
            title="MessageActionCardScopeList"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_SCOPE_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-scope-list-label"
            title="MessageActionCardScopeListLabel"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_SCOPE_LIST_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-scope"
            title="MessageActionCardScope"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_SCOPE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-scope-name"
            title="MessageActionCardScopeName"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_SCOPE_NAME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-scope-description"
            title="MessageActionCardScopeDescription"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_SCOPE_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-hint"
            title="MessageActionCardHint"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_HINT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-actions"
            title="MessageActionCardActions"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-action-card-completion"
            title="MessageActionCardCompletion"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_COMPLETION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
