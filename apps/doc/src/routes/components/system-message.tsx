import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
  <SystemMessageContent content={message.content} />
</SystemMessage>

const states = buildSystemMessageRenderStates(messages);

<SystemMessageGroup open={open} onOpenChange={setOpen}>
  <SystemMessageGroupHeader>
    <SystemMessageGroupDisclosure title={summary}>
      <SystemMessageGroupSummary>{summary}</SystemMessageGroupSummary>
      <SystemMessageGroupChevron />
    </SystemMessageGroupDisclosure>
  </SystemMessageGroupHeader>
  <SystemMessageGroupPanel>
    <SystemMessage>...</SystemMessage>
  </SystemMessageGroupPanel>
</SystemMessageGroup>`;

const PROPS: readonly PropRow[] = [
  {
    name: "SystemMessage",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered system row for archive, reminder, task, and other system events.",
  },
  {
    name: "SystemMessageTime",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline timestamp shown before the system copy.",
  },
  {
    name: "SystemMessageContent",
    type: "span props & { content?: string; timeFormat?; timeZone?; locale?; now? }",
    description:
      "System event copy. Pass content to parse reminder fire-at spans into relative times and tooltips; children remain available for plain text.",
  },
  {
    name: "SystemMessageGroup",
    type: "Collapsible.Root props",
    description: "Base UI Collapsible root for an adjacent-run system-message group.",
  },
  {
    name: "SystemMessageGroupHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Centered wrap around the group disclosure trigger.",
  },
  {
    name: "SystemMessageGroupDisclosure",
    type: 'useRender.ComponentProps<"button"> (Collapsible.Trigger)',
    description: "Collapsible trigger for the group summary row.",
  },
  {
    name: "SystemMessageGroupSummary",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated summary copy inside the disclosure.",
  },
  {
    name: "SystemMessageGroupChevron",
    type: 'useRender.ComponentProps<"svg">',
    description: "Chevron indicator; rotates via data-panel-open on the disclosure.",
  },
  {
    name: "SystemMessageGroupPanel",
    type: "Collapsible.Panel props",
    description: "Expanded details slot that hosts the grouped SystemMessage rows.",
  },
  {
    name: "buildSystemMessageRenderStates",
    type: "(messages) => Array<SystemMessageRenderState | null>",
    description:
      "Adjacent-run grouping for system messages. Returns summary/hide states and source-faithful summary copy by category (task / reminder / system).",
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
      description="Centered system-event rows, reminder fire-at rendering, and adjacent-run grouping."
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
        <DocSubsection parentId="api" id="api-parts" title="Parts">
          <PropsTable rows={PROPS} />
        </DocSubsection>
      </DocSection>
    </DocPage>
  );
}
