import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Button, PanelHeader, Status } from "@slock-ui/ui";
import { Bookmark, Settings } from "lucide-react";

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
  { id: "icon", title: "Icon + actions" },
  { id: "identity", title: "Identity + subtitle" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { PanelHeader } from "@slock-ui/ui";

<PanelHeader title="Settings" />`,
  icon: `<PanelHeader
  title="Saved"
  icon={<Bookmark size={18} />}
  iconBg="bg-brutal-yellow"
  actions={<Button size="icon-sm" aria-label="Settings"><Settings /></Button>}
/>`,
  identity: `<PanelHeader
  iconSlot={<Avatar size="lg" type="agent" />}
  iconAlwaysVisible
  title="Atlas"
  titleSuffix={<Status fill="lime" />}
  subtitle="claude-opus · online"
/>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "title", type: "ReactNode", description: "Primary title (wrapped in a truncating h2)." },
  {
    name: "titleSlot",
    type: "ReactNode",
    description: "Replaces the whole title block (e.g. a search input).",
  },
  {
    name: "titleSuffix",
    type: "ReactNode",
    description: "Inline node beside the title, outside the truncate envelope.",
  },
  {
    name: "subtitle",
    type: "ReactNode",
    description: "Mono subtitle line (truncates unless subtitleMultiline).",
  },
  {
    name: "subtitleMultiline",
    type: "boolean",
    default: "false",
    description: "Allow the subtitle to wrap.",
  },
  {
    name: "icon",
    type: "ReactNode",
    description: "Icon inside the bordered iconBg container (desktop-only).",
  },
  {
    name: "iconBg",
    type: "string",
    default: '"bg-brutal-yellow"',
    description: "Icon container bg token.",
  },
  {
    name: "iconSlot",
    type: "ReactNode",
    description: "Pre-wrapped icon, bypasses the bordered wrapper.",
  },
  {
    name: "iconAlwaysVisible",
    type: "boolean",
    default: "false",
    description: "Keep the icon visible on mobile (identity surfaces).",
  },
  { name: "onMobileBack", type: "() => void", description: "Shows a mobile back chevron." },
  {
    name: "mobileBreakpoint",
    type: '"md" | "lg"',
    default: '"md"',
    description: "Where the back chevron hides.",
  },
  { name: "actions", type: "ReactNode", description: "Right-aligned action slot." },
];

export const Route = createFileRoute("/components/panel-header")({
  component: PanelHeaderDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PanelHeaderDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="PanelHeader"
      description="The canonical panel column header — icon, title / subtitle, and actions."
      overview={
        <Differences from="PanelHeader">
          <li>brutal styling reproduced 1:1 (62px header, 36px icon container, border-b-2)</li>
          <li>
            app utilities mapped to literals: <code>h-panel-header</code> → <code>h-[62px]</code>,{" "}
            <code>size-icon-header</code> → <code>size-9</code>
          </li>
          <li>
            the mobile back button uses the migrated Button&rsquo;s <code>size="icon-sm"</code>
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

      <DocSection id="icon" title="Icon + actions">
        <Example html={code.icon}>
          <div className="w-full max-w-md border-2 border-black">
            <PanelHeader
              title="Saved"
              icon={<Bookmark size={18} />}
              iconAlwaysVisible
              actions={
                <Button size="icon-sm" aria-label="Settings">
                  <Settings />
                </Button>
              }
            />
          </div>
        </Example>
      </DocSection>

      <DocSection id="identity" title="Identity + subtitle">
        <div className="space-y-4">
          <Example html={code.identity}>
            <div className="w-full max-w-md border-2 border-black">
              <PanelHeader
                iconSlot={<Avatar size="lg" type="agent" />}
                iconAlwaysVisible
                title="Atlas"
                titleSuffix={<Status fill="lime" />}
                subtitle="claude-opus · online"
                actions={<Badge tone="lime">Experimental</Badge>}
              />
            </div>
          </Example>
          <Callout>
            <code>titleSuffix</code> lives outside the truncate envelope so a status dot never gets
            clipped with the title text. Set <code>iconAlwaysVisible</code> on identity surfaces.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
