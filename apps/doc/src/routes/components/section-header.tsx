import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  SectionHeader,
  SectionHeaderActions,
  SectionHeaderContent,
  SectionHeaderCount,
  SectionHeaderIcon,
  SectionHeaderTitle,
} from "@slock/ui";
import { BellRing, Plus, User } from "lucide-react";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacySectionHeader from "../../../../../packages/ui/src/legacy/SectionHeader.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "slots", title: "Slots" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  SectionHeader,
  SectionHeaderContent,
  SectionHeaderCount,
  SectionHeaderTitle,
} from "@slock/ui";

<SectionHeader>
  <SectionHeaderContent>
    <SectionHeaderTitle>Members</SectionHeaderTitle>
    <SectionHeaderCount>12</SectionHeaderCount>
  </SectionHeaderContent>
</SectionHeader>`,
  slots: `<SectionHeader>
  <SectionHeaderContent>
    <SectionHeaderIcon>
      <BellRing />
    </SectionHeaderIcon>
    <SectionHeaderTitle>Pending Reminders</SectionHeaderTitle>
    <SectionHeaderCount>{reminders.length}</SectionHeaderCount>
  </SectionHeaderContent>

  <SectionHeaderActions>
    <Button size="icon-xs" aria-label="Add">
      <Plus />
    </Button>
  </SectionHeaderActions>
</SectionHeader>`,
  sourceCreatedAgents: `<SectionHeader
  className="mb-3"
  label="Created Agents"
  count={createdAgents.length}
/>`,
  currentCreatedAgents: `<SectionHeader className="mb-3">
  <SectionHeaderContent>
    <SectionHeaderTitle>Created Agents</SectionHeaderTitle>
    <SectionHeaderCount>{createdAgents.length}</SectionHeaderCount>
  </SectionHeaderContent>
</SectionHeader>`,
  sourcePendingReminders: `<SectionHeader
  className="mb-3"
  icon={<BellRing size={14} className="text-black/50" />}
  label="Pending Reminders"
  count={reminders.length}
  action={loading ? <span className="text-xs font-bold text-black/50">Loading...</span> : null}
/>`,
  currentPendingReminders: `<SectionHeader className="mb-3">
  <SectionHeaderContent>
    <SectionHeaderIcon>
      <BellRing />
    </SectionHeaderIcon>
    <SectionHeaderTitle>Pending Reminders</SectionHeaderTitle>
    <SectionHeaderCount>{reminders.length}</SectionHeaderCount>
  </SectionHeaderContent>
  <SectionHeaderActions>
    {loading ? <span className="text-xs font-bold text-black/50">Loading...</span> : null}
  </SectionHeaderActions>
</SectionHeader>`,
  sourceAccount: `<SectionHeader
  className="mb-3"
  icon={<User size={16} />}
  label="Account"
/>`,
  currentAccount: `<SectionHeader className="mb-3">
  <SectionHeaderContent>
    <SectionHeaderIcon>
      <User />
    </SectionHeaderIcon>
    <SectionHeaderTitle>Account</SectionHeaderTitle>
  </SectionHeaderContent>
</SectionHeader>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "SectionHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Outer row. Keeps the left content and right actions apart.",
  },
  {
    name: "SectionHeaderContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Left cluster for icon, title, and count.",
  },
  {
    name: "SectionHeaderIcon",
    type: 'useRender.ComponentProps<"span">',
    description: "Icon wrapper with muted color and CSS-controlled svg size.",
  },
  {
    name: "SectionHeaderTitle",
    type: "SectionLabelProps",
    description: "Title token. Internally reuses SectionLabel and defaults to a div.",
  },
  {
    name: "SectionHeaderCount",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline muted monospace count.",
  },
  {
    name: "SectionHeaderActions",
    type: 'useRender.ComponentProps<"div">',
    description: "Right-aligned action cluster.",
  },
];

export const Route = createFileRoute("/components/section-header")({
  component: SectionHeaderDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SectionHeaderDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SectionHeader"
      description="A section heading row composed from SectionLabel plus optional icon, count, and actions."
      overview={
        <Differences from="SectionHeader">
          <li>
            source props (<code>label</code>, <code>icon</code>, <code>count</code>,{" "}
            <code>action</code>, <code>htmlFor</code>) are now explicit slots
          </li>
          <li>
            <code>SectionHeaderTitle</code> reuses <code>SectionLabel</code>; the old{" "}
            <code>SectionEyebrow</code> name moved to legacy
          </li>
          <li>brutal layout and typography are preserved 1:1</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <div className="w-96">
            <CurrentCreatedAgentsHeader />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="slots" title="Slots">
        <Example html={code.slots}>
          <div className="flex w-96 flex-col gap-4">
            <CurrentCreatedAgentsHeader />
            <CurrentPendingRemindersHeader showAddAction />
            <CurrentAccountHeader />
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Created agents",
              status: "difference",
              note: "Source packed label and count into props. Current composes the title and count slots explicitly.",
              source: <LegacySectionHeader className="mb-3" label="Created Agents" count={3} />,
              current: <CurrentCreatedAgentsHeader />,
              sourceCode: code.sourceCreatedAgents,
              currentCode: code.currentCreatedAgents,
            },
            {
              label: "Pending reminders",
              status: "difference",
              note: "Source accepted icon/count/action props. Current preserves the same row but exposes each part as a slot.",
              source: (
                <LegacySectionHeader
                  className="mb-3"
                  icon={<BellRing size={14} className="text-black/50" />}
                  label="Pending Reminders"
                  count={8}
                  action={<span className="text-xs font-bold text-black/50">Loading...</span>}
                />
              ),
              current: <CurrentPendingRemindersHeader />,
              sourceCode: code.sourcePendingReminders,
              currentCode: code.currentPendingReminders,
            },
            {
              label: "Settings section",
              status: "difference",
              note: "Source used icon and label props in settings panels. Current keeps the exact visual layout with content and icon slots.",
              source: (
                <LegacySectionHeader className="mb-3" icon={<User size={16} />} label="Account" />
              ),
              current: <CurrentAccountHeader />,
              sourceCode: code.sourceAccount,
              currentCode: code.currentAccount,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function CurrentCreatedAgentsHeader() {
  return (
    <SectionHeader className="mb-3">
      <SectionHeaderContent>
        <SectionHeaderTitle>Created Agents</SectionHeaderTitle>
        <SectionHeaderCount>3</SectionHeaderCount>
      </SectionHeaderContent>
    </SectionHeader>
  );
}

function CurrentPendingRemindersHeader({ showAddAction = false }: { showAddAction?: boolean }) {
  return (
    <SectionHeader className="mb-3">
      <SectionHeaderContent>
        <SectionHeaderIcon>
          <BellRing />
        </SectionHeaderIcon>
        <SectionHeaderTitle>Pending Reminders</SectionHeaderTitle>
        <SectionHeaderCount>8</SectionHeaderCount>
      </SectionHeaderContent>
      <SectionHeaderActions>
        <span className="text-xs font-bold text-black/50">Loading...</span>
        {showAddAction ? (
          <Button size="icon-xs" aria-label="Add">
            <Plus />
          </Button>
        ) : null}
      </SectionHeaderActions>
    </SectionHeader>
  );
}

function CurrentAccountHeader() {
  return (
    <SectionHeader className="mb-3">
      <SectionHeaderContent>
        <SectionHeaderIcon>
          <User />
        </SectionHeaderIcon>
        <SectionHeaderTitle>Account</SectionHeaderTitle>
      </SectionHeaderContent>
    </SectionHeader>
  );
}
