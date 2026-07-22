import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageActionCardShowcaseComposition } from "#/modules/message-action-card/compositions/action-card.composition.tsx";
import actionCardSource from "#/modules/message-action-card/compositions/action-card.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageActionCard>
  <MessageActionCardContent>
    <MessageActionCardHeader />
    <MessageActionCardDetails />
    <MessageActionCardHint />
    <MessageActionCardActions>
      <Button />
    </MessageActionCardActions>
    <MessageActionCardCompletion />
  </MessageActionCardContent>
</MessageActionCard>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageActionCard",
    type: "compound slots",
    description:
      "Action-card structure for caller-provided action metadata, callbacks, and completion content.",
  },
  {
    name: "MessageActionCardContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Card body wrapping header, details, hint, and either actions or completion.",
  },
  {
    name: "MessageActionCardHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Primary action label row. Consumers append status badges as trailing children.",
  },
  {
    name: "MessageActionCardDetails",
    type: 'useRender.ComponentProps<"div">',
    description: "Secondary metadata line, such as target channel and members.",
  },
  {
    name: "MessageActionCardHint",
    type: 'useRender.ComponentProps<"div">',
    description: "Muted supporting copy explaining why the action was suggested.",
  },
  {
    name: "MessageActionCardActions",
    type: 'useRender.ComponentProps<"div">',
    description: "Action-button row. Execution and its resulting state stay caller-owned.",
  },
  {
    name: "MessageActionCardCompletion",
    type: 'useRender.ComponentProps<"div">',
    description: "Completion copy shown once the caller marks the action as executed.",
  },
];

export const Route = createFileRoute("/components/message-action-card")({
  component: MessageActionCardDoc,
  loader: () =>
    highlightSnippets({ data: { anatomy: ANATOMY_SOURCE, actionCard: actionCardSource } }),
});

function MessageActionCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageActionCard"
      description="Action-card structure for suggested actions, embedded inside a message body."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageActionCardShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.actionCard} />
        </Preview>
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
    </DocPage>
  );
}
