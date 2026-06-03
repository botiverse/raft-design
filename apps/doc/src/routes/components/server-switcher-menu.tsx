import { createFileRoute } from "@tanstack/react-router";
import { ServerSwitcherMenu } from "@slock-ui/ui";
import { useState } from "react";

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
  { id: "demo", title: "Demo" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { ServerSwitcherMenu } from "@slock-ui/ui";

<ServerSwitcherMenu
  open={open}
  onClose={() => setOpen(false)}
  servers={servers}
  currentServerId={current.id}
  serverUnreadCounts={unread}
  onSelectServer={(s) => navigate(\`/s/\${s.slug}\`)}
  joinOptions={[{ slug: "community", label: "Join Community" }]}
  onJoinCommunity={join}
  onSwitchOrCreate={openSwitcher}
/>`,
} as const;

const SERVERS = [
  { id: "1", name: "Slock", slug: "slock" },
  { id: "2", name: "Design Guild", slug: "design" },
  { id: "3", name: "Open Source", slug: "oss" },
];

const PROPS: readonly PropRow[] = [
  { name: "servers", type: "ServerSwitcherServer[]", description: "Each: { id, name, slug }." },
  {
    name: "currentServerId",
    type: "string",
    description: "Marks the current row (✓, hides its unread).",
  },
  {
    name: "serverUnreadCounts",
    type: "Record<string, number>",
    description: "Unread badge per server id.",
  },
  { name: "open", type: "boolean", default: "true", description: "Source-compatible render gate." },
  {
    name: "onClose",
    type: "() => void",
    description: "Outside click, ESC, select, switch/create close.",
  },
  { name: "onSelectServer", type: "(server) => void", description: "Row click handler." },
  { name: "joinOptions", type: "{ slug, label }[]", description: "Community join actions." },
  { name: "onJoinCommunity", type: "(slug) => void", description: "Join action handler." },
  { name: "onSwitchOrCreate", type: "() => void", description: "Switch-or-create action handler." },
  { name: "className / testId", type: "string", description: "Positioning + sizing; test id." },
];

export const Route = createFileRoute("/components/server-switcher-menu")({
  component: ServerSwitcherMenuDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ServerSwitcherMenuDoc() {
  const code = Route.useLoaderData();
  const [current, setCurrent] = useState("1");

  return (
    <DocPage
      title="ServerSwitcherMenu"
      description="Dropdown content for switching servers — server list, join, switch-or-create."
      overview={
        <Differences from="ServerSwitcherMenu">
          <li>
            brutal styling reproduced 1:1 (yellow server hover, pink action hover, unread badge)
          </li>
          <li>
            server and action rows are built on Base UI&rsquo;s <code>Button</code> (the source used
            native buttons)
          </li>
          <li>
            app domain is caller-owned (server store, navigation, join flow), while source UI
            dismissal (<code>open</code>, outside click, ESC) is preserved
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

      <DocSection id="demo" title="Demo">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <ServerSwitcherMenu
              className="w-64"
              servers={SERVERS}
              currentServerId={current}
              serverUnreadCounts={{ "2": 4, "3": 12 }}
              onSelectServer={(server) => setCurrent(server.id)}
              joinOptions={[{ slug: "community", label: "Join Community" }]}
              onJoinCommunity={() => {}}
              onSwitchOrCreate={() => {}}
            />
          </Example>
          <Callout>
            The current server hides its own unread badge — it&rsquo;s redundant inside its own
            switcher. Positioning is still owned by the callsite; dismiss is available through{" "}
            <code>open</code> / <code>onClose</code>.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
