import { createFileRoute } from "@tanstack/react-router";
import { Badge, ConversationPreviewCard } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const TODOS = [
  "Add elegant family styling",
  "Confirm the preview / avatar slot API (markdown was app domain)",
] as const;

const SNIPPETS = {
  anatomy: `import { ConversationPreviewCard } from "@slock-ui/ui";

<ConversationPreviewCard
  channelLabel="#general"
  author={{ kind: "agent", name: "Atlas", subtitle: "claude-opus" }}
  timestamp="2:14 PM"
  preview="Shipped the migration — take a look when you can."
  onClick={() => open()}
/>`,
  states: `<ConversationPreviewCard ... />            // resting
<ConversationPreviewCard ... active />     // currently open
<ConversationPreviewCard ... focused />    // transient jump flash`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "channelLabel", type: "string", description: "Bold muted channel label." },
  {
    name: "author",
    type: "{ kind: 'agent'|'user'; name; subtitle?; avatar? }",
    description: "Rendered when previewAuthor is absent. avatar is a slot for Avatar.",
  },
  { name: "timestamp", type: "string", description: "Mono timestamp." },
  {
    name: "preview",
    type: "ReactNode",
    description: "Message preview (app passes rendered markdown).",
  },
  {
    name: "previewAuthor",
    type: "string",
    description: "Inline 'Author:' prefix; replaces the author row.",
  },
  {
    name: "previewLeading",
    type: "ReactNode",
    description: "Inline node before the preview text.",
  },
  {
    name: "previewLineClampClassName",
    type: '"line-clamp-2" | "line-clamp-3"',
    default: '"line-clamp-3"',
    description: "Preview clamp.",
  },
  {
    name: "secondaryPreview",
    type: "ReactNode",
    description: "Optional second muted preview line.",
  },
  {
    name: "marker / footer / action",
    type: "ReactNode",
    description: "Header marker, footer row, trailing action.",
  },
  {
    name: "emphasized",
    type: "boolean",
    default: "false",
    description: "Bolds the preview (unread).",
  },
  { name: "focused", type: "boolean", default: "false", description: "Transient cyan jump flash." },
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: "Sticky currently-open highlight.",
  },
  {
    name: "onClick / onContextMenu",
    type: "handlers",
    description: "Make the card an interactive button.",
  },
];

export const Route = createFileRoute("/components/conversation-preview-card")({
  component: ConversationPreviewCardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ConversationPreviewCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ConversationPreviewCard"
      description="A conversation list-row preview with channel, author, timestamp, and message."
      overview={
        <Differences from="ConversationPreviewCard">
          <li>brutal styling reproduced 1:1 (focused / active / resting states, shadows)</li>
          <li>
            <code>preview</code> is now a ReactNode and the avatar a slot — markdown rendering and
            avatar fetching were app domain
          </li>
          <li>
            interactive rows are built on Base UI&rsquo;s <code>Button</code> via the render hook
          </li>
          <li>
            <code>shadow-brutal</code> → <code>--shadow-hover</code>, <code>shadow-brutal-sm</code>{" "}
            → <code>--shadow</code>
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <Example html={code.states}>
            <div className="flex w-96 flex-col gap-3">
              <ConversationPreviewCard
                channelLabel="#general"
                author={{ kind: "agent", name: "Atlas", subtitle: "claude-opus" }}
                timestamp="2:14 PM"
                preview="Shipped the migration — take a look when you can."
                onClick={() => {}}
              />
              <ConversationPreviewCard
                channelLabel="#design"
                author={{ kind: "user", name: "Ada" }}
                timestamp="1:02 PM"
                preview="Currently-open conversation."
                active
                marker={<Badge tone="cyan">Open</Badge>}
                onClick={() => {}}
              />
              <ConversationPreviewCard
                channelLabel="#random"
                author={{ kind: "user", name: "Grace" }}
                timestamp="11:30 AM"
                preview="Jumped here from a permalink."
                emphasized
                focused
                onClick={() => {}}
              />
            </div>
          </Example>
          <Callout>
            <code>focused</code> is a transient flash (clear it after the user notices);{" "}
            <code>active</code> is the sticky highlight while the matching panel is open.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
