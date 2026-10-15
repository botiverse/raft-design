import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ActionCardPlaygroundComposition } from "#/modules/message-action-card/compositions/action-card-playground.composition.tsx";
import actionCardComparisonSource from "#/modules/message-action-card/compositions/action-card-playground.composition.tsx?raw";
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
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardActionsNote,
  MessageActionCardCollapseTrigger,
  MessageActionCardContent,
  MessageActionCardHeader,
  MessageActionCardHeaderIcon,
  MessageActionCardHeaderDescription,
  MessageActionCardHeaderTitle,
  MessageActionCardHint,
  MessageActionCardHintLabel,
  MessageActionCardNotice,
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
  MessageActionCardScope,
  MessageActionCardScopeDescription,
  MessageActionCardScopeList,
  MessageActionCardScopeListLabel,
  MessageActionCardScopeListViewport,
  MessageActionCardScopeName,
  MessageActionCardStatus,
} from "raft-ui";

<MessageActionCard defaultOpen>
  <MessageActionCardHeader>
    <MessageActionCardHeaderIcon />
    <MessageActionCardHeaderTitle>
      <MessageActionCardHeaderDescription />
    </MessageActionCardHeaderTitle>
    <MessageActionCardStatus />
    <MessageActionCardCollapseTrigger aria-label="Show or hide details" />
  </MessageActionCardHeader>
  <MessageActionCardContent>
    <MessageActionCardNotice />
    <MessageActionCardProperties>
      <MessageActionCardProperty>
        <MessageActionCardPropertyLabel />
        <MessageActionCardPropertyValue />
      </MessageActionCardProperty>
    </MessageActionCardProperties>
    <MessageActionCardHintLabel>Reason</MessageActionCardHintLabel>
    <MessageActionCardHint />
    <MessageActionCardScopeList>
      <MessageActionCardScopeListLabel />
      <MessageActionCardScopeListViewport aria-label="Permissions">
        <MessageActionCardScope>
          <MessageActionCardScopeName />
          <MessageActionCardScopeDescription />
        </MessageActionCardScope>
      </MessageActionCardScopeListViewport>
    </MessageActionCardScopeList>
    <MessageActionCardActions>
      <MessageActionCardActionsNote />
    </MessageActionCardActions>
  </MessageActionCardContent>
</MessageActionCard>`;

const MESSAGE_ACTION_CARD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Suggested-action card root. Compose inside MessageItemBody; execution state stays consumer-owned.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    description: "Start open (default) or folded to the header. Fold resolved and view-only cards.",
  },
  {
    name: "open / onOpenChange",
    type: "boolean / (open: boolean) => void",
    description: "Controlled fold state. The content height animates; reduced motion skips it.",
  },
];

const MESSAGE_ACTION_CARD_NEW_PARTS: readonly PropRow[] = [
  {
    name: "MessageActionCardHeaderIcon",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Leading type icon box in the header band. Pass one lucide icon; without children it shows a generic action icon (Zap).",
  },
  {
    name: "MessageActionCardHeaderTitle",
    type: 'useRender.ComponentProps<"span">',
    description: "Title text; takes the remaining width so status and toggle sit at the end.",
  },
  {
    name: "MessageActionCardHeaderDescription",
    type: 'useRender.ComponentProps<"span">',
    description:
      "A line under the title, placed inside MessageActionCardHeaderTitle: what happened on a Done or Declined card, or why you cannot act on a View only one. It stays visible while the card is folded.",
  },
  {
    name: "MessageActionCardStatus",
    type: "BadgeProps",
    description:
      "State label. Brutal: solid and uppercase. Elegant: soft. Override with appearance.",
  },
  {
    name: "MessageActionCardCollapseTrigger",
    type: 'Collapsible.Trigger props & { "aria-label": string }',
    description: "Chevron toggle that folds the card to its header and back.",
  },
  {
    name: "MessageActionCardScopeListViewport",
    type: 'useRender.ComponentProps<"div"> & { "aria-label": string }',
    description:
      "Scroll area for the scopes; the cap cuts through the third row. aria-label is required; it is a Tab stop only while the list overflows.",
  },
  {
    name: "MessageActionCardActionsNote",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Left side of the actions row on an open card: why it needs you now (Confirm again) or why it is paused. A card that folds by default puts its line in MessageActionCardHeaderDescription instead.",
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
    description: "White inner content stack for details, notice, actions, and completion.",
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

const MESSAGE_ACTION_CARD_HINT_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Label above the agent's reason, e.g. Reason.",
  },
];

const MESSAGE_ACTION_CARD_HINT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "The agent's own reason for the card, shown as an italic quote under MessageActionCardHintLabel.",
  },
];

const MESSAGE_ACTION_CARD_NOTICE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Raft's standing note about what the action does or who may run it. A tinted block with a leading icon that opens the content, above the properties; only for the cards that need one. The agent's own reason goes in MessageActionCardHint, not a notice.",
  },
  {
    name: "icon",
    type: "ReactNode",
    description: "Replaces the default leading info icon.",
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
    description:
      "Legacy result line at the end of the content. Prefer MessageActionCardHeaderDescription, which stays visible when the card is folded.",
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
          <ActionCardPlaygroundComposition />
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
            title="Review pattern"
            showThemeSwitcher
          >
            <p className="text-sm leading-6 text-foreground-muted">
              Creating a channel, creating an agent and adding members open the regular dialog with
              the agent's values filled in, so the person can change anything before it is created.
              The primary button is therefore "Review", not the action itself.
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
            title="Approve pattern"
            showThemeSwitcher
          >
            <p className="text-sm leading-6 text-foreground-muted">
              App login, install, registration, update and owner recovery run in one click, so the
              primary button names the action. Permissions sit in a small scrolling area so a long
              list never stretches the card; a standing notice is neutral, never a warning colour.
            </p>
            <UsagePreview
              code={code.actionCardIntegration}
              collapsedCode={code.actionCardIntegrationBody}
            >
              <ActionCardIntegrationComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="resolution-states" title="States" showThemeSwitcher>
            <p className="text-sm leading-6 text-foreground-muted">
              Paused and confirm-again cards stay open because they still wait on the reader. Done,
              declined and view-only cards fold to their header with defaultOpen=false; the header
              toggle opens them again. An open card's note left of the buttons says why it needs you
              now or why it is paused; a folded card says what happened, or why you cannot act,
              under its title, so the line shows while folded. A failed click is temporary: the
              product shows a toast and the card stays as it was, ready to retry.
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
            id="api-message-action-card-parts"
            title="Header, status, fold and notes"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_NEW_PARTS} />
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
            id="api-message-action-card-hint-label"
            title="MessageActionCardHintLabel"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_HINT_LABEL_PROPS} />
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
            id="api-message-action-card-notice"
            title="MessageActionCardNotice"
          >
            <PropsTable rows={MESSAGE_ACTION_CARD_NOTICE_PROPS} />
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
