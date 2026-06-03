import { createFileRoute } from "@tanstack/react-router";
import { QuotedMessageCard } from "@slock-ui/ui";

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
  "Confirm the content / avatar slot API (markdown was app domain)",
] as const;

const SNIPPETS = {
  anatomy: `import { QuotedMessageCard } from "@slock-ui/ui";

<QuotedMessageCard
  channelName="general"
  timestamp="2:14 PM"
  author={{ name: "Atlas", kind: "agent", subtitle: "claude-opus" }}
  content="Shipped the migration — take a look when you can."
  onClick={() => jumpToMessage()}
/>`,
  states: `<QuotedMessageCard ... isThread isArchived attachments={[{ label: "diff.patch" }]} />
<QuotedMessageCard ... unavailable />`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "channelName", type: "string", description: "Channel / DM name." },
  {
    name: "channelKind",
    type: '"channel" | "dm"',
    default: '"channel"',
    description: "dm prefixes @, hides the hash.",
  },
  { name: "isThread", type: "boolean", default: "false", description: "Shows the Thread marker." },
  { name: "isArchived", type: "boolean", default: "false", description: "Shows the Archived tag." },
  { name: "timestamp", type: "string", description: "Right-aligned mono timestamp." },
  {
    name: "author",
    type: "{ name; kind: 'agent'|'user'; subtitle?; avatar? }",
    description: "avatar is a resolved node passed to Avatar.",
  },
  {
    name: "content",
    type: "ReactNode",
    description: "Message body (app passes a rendered markdown preview).",
  },
  {
    name: "attachments",
    type: "{ label: string }[]",
    description: "Renders lavender attachment tags.",
  },
  { name: "onClick", type: "() => void", description: "Makes the card a button." },
  {
    name: "unavailable",
    type: "boolean",
    default: "false",
    description: "Muted 'Message unavailable' variant.",
  },
];

export const Route = createFileRoute("/components/quoted-message-card")({
  component: QuotedMessageCardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function QuotedMessageCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="QuotedMessageCard"
      description="A quoted-message preview routed through PreviewShell."
      overview={
        <Differences from="QuotedMessageCard">
          <li>brutal styling reproduced 1:1 (PreviewShell skin, tags, attachment chips)</li>
          <li>
            <code>content</code> is now a ReactNode and the avatar a slot — the original&rsquo;s
            markdown rendering and avatar fetching were app domain
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
              <QuotedMessageCard
                channelName="general"
                timestamp="2:14 PM"
                author={{ name: "Atlas", kind: "agent", subtitle: "claude-opus" }}
                content="Shipped the migration — take a look when you can."
                onClick={() => {}}
              />
              <QuotedMessageCard
                channelName="design"
                timestamp="Yesterday"
                isThread
                isArchived
                author={{ name: "Ada", kind: "user" }}
                content="Archived thread with an attachment."
                attachments={[{ label: "diff.patch" }]}
                onClick={() => {}}
              />
              <QuotedMessageCard
                channelName="general"
                timestamp=""
                author={{ name: "", kind: "user" }}
                content=""
                unavailable
                onClick={() => {}}
              />
            </div>
          </Example>
          <Callout>
            Pass <code>content</code> as a pre-rendered node — the source rendered markdown via an
            app-domain <code>InlineMarkdownPreview</code> that the library intentionally drops.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
