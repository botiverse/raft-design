import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageSystemMessagesComposition } from "#/modules/system-message/compositions/system-messages.composition.tsx";
import systemMessagesSource from "#/modules/system-message/compositions/system-messages.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<SystemMessage>
  <SystemMessageTime />
  <SystemMessageContent />
</SystemMessage>

<SystemMessageGroupDisclosure aria-expanded={expanded} />`;

const PROPS: readonly PropRow[] = [
  {
    name: "SystemMessage",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered system row for archive, reminder, join/leave, and other system events.",
  },
  {
    name: "SystemMessageTime",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline timestamp shown before the system copy.",
  },
  {
    name: "SystemMessageContent",
    type: 'useRender.ComponentProps<"span">',
    description: "System event copy. Consumers own the wording and optional title tooltip.",
  },
  {
    name: "SystemMessageGroupDisclosure",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Caller-controlled summary disclosure for grouped system events. aria-expanded stays caller-owned.",
  },
];

export const Route = createFileRoute("/components/system-message")({
  component: SystemMessageDoc,
  loader: () =>
    highlightSnippets({ data: { anatomy: ANATOMY_SOURCE, systemMessages: systemMessagesSource } }),
});

function SystemMessageDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SystemMessage"
      description="Centered system-event row for archive, reminder, join/leave, and grouped updates."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageSystemMessagesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.systemMessages} />
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
