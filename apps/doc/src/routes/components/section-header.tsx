import { createFileRoute } from "@tanstack/react-router";
import { Button } from "raft-ui";
import {
  SectionHeader,
  SectionHeaderActions,
  SectionHeaderContent,
  SectionHeaderCount,
  SectionHeaderIcon,
  SectionHeaderTitle,
} from "raft-ui/wip";
import { BellRing, Plus, User } from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
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
} from "raft-ui";

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

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.anatomy}>
          <div className="w-96">
            <CurrentCreatedAgentsHeader />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="SectionHeader.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="slots" title="Slots" showThemeSwitcher>
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
              source: (
                <SectionHeaderListFrame>
                  <LegacySectionHeader className="mb-3" label="Created Agents" count={3} />
                </SectionHeaderListFrame>
              ),
              current: (
                <SectionHeaderListFrame>
                  <CurrentCreatedAgentsHeader />
                </SectionHeaderListFrame>
              ),
              sourceCode: code.sourceCreatedAgents,
              currentCode: code.currentCreatedAgents,
              compositionCode: code.currentCreatedAgents,
              compositionPath:
                "apps/doc/src/compositions/section-header/created-agents-composition.tsx",
              compositionSource: SNIPPETS.currentCreatedAgents,
            },
            {
              label: "Pending reminders",
              status: "difference",
              note: "Source accepted icon/count/action props. Current preserves the same row but exposes each part as a slot.",
              source: (
                <SectionHeaderReminderFrame>
                  <LegacySectionHeader
                    className="mb-3"
                    icon={<BellRing size={14} className="text-black/50" />}
                    label="Pending Reminders"
                    count={8}
                    action={<span className="text-xs font-bold text-black/50">Loading...</span>}
                  />
                </SectionHeaderReminderFrame>
              ),
              current: (
                <SectionHeaderReminderFrame>
                  <CurrentPendingRemindersHeader />
                </SectionHeaderReminderFrame>
              ),
              sourceCode: code.sourcePendingReminders,
              currentCode: code.currentPendingReminders,
              compositionCode: code.currentPendingReminders,
              compositionPath:
                "apps/doc/src/compositions/section-header/pending-reminders-composition.tsx",
              compositionSource: SNIPPETS.currentPendingReminders,
            },
            {
              label: "Settings section",
              status: "difference",
              note: "Source used icon and label props in settings panels. Current keeps the exact visual layout with content and icon slots.",
              source: (
                <SectionHeaderSettingsFrame>
                  <LegacySectionHeader className="mb-3" icon={<User size={16} />} label="Account" />
                </SectionHeaderSettingsFrame>
              ),
              current: (
                <SectionHeaderSettingsFrame>
                  <CurrentAccountHeader />
                </SectionHeaderSettingsFrame>
              ),
              sourceCode: code.sourceAccount,
              currentCode: code.currentAccount,
              compositionCode: code.currentAccount,
              compositionPath:
                "apps/doc/src/compositions/section-header/settings-section-composition.tsx",
              compositionSource: SNIPPETS.currentAccount,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function SectionHeaderListFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-sm border-2 border-black bg-white p-4 shadow-brutal-sm [[data-theme=elegant]_&]:rounded-lg [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:shadow-sm">
      {children}
      <div className="grid gap-px border-2 border-black bg-black [[data-theme=elegant]_&]:overflow-hidden [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-line-subtle">
        {["Atlas", "Avery", "Design notes"].map((name) => (
          <div
            key={name}
            className="flex items-center justify-between bg-white px-3 py-2 text-xs font-medium text-black [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:text-foreground"
          >
            <span>{name}</span>
            <span className="font-mono text-black/40 [[data-theme=elegant]_&]:text-foreground-muted">
              active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeaderReminderFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-sm border-2 border-black bg-white p-4 shadow-brutal-sm [[data-theme=elegant]_&]:rounded-lg [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:shadow-sm">
      {children}
      <div className="grid gap-2">
        {["Review dialog source comparison", "Ship release notes"].map((title) => (
          <div
            key={title}
            className="border border-black/20 bg-black/[0.03] px-3 py-2 [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-muted"
          >
            <div className="text-xs font-medium text-black [[data-theme=elegant]_&]:text-foreground">
              {title}
            </div>
            <div className="mt-1 font-mono text-[10px] text-black/45 [[data-theme=elegant]_&]:text-foreground-muted">
              Today at 09:30
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeaderSettingsFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-sm border-2 border-black bg-white p-4 shadow-brutal-sm [[data-theme=elegant]_&]:rounded-lg [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:shadow-sm">
      {children}
      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-black [[data-theme=elegant]_&]:font-medium [[data-theme=elegant]_&]:text-foreground">
            Workspace
          </span>
          <input
            value="raft-design"
            readOnly
            className="h-9 border-2 border-black bg-white px-3 text-sm text-black outline-none [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:text-foreground"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-black [[data-theme=elegant]_&]:font-medium [[data-theme=elegant]_&]:text-foreground">
            Project URL
          </span>
          <input
            value="raft.local"
            readOnly
            className="h-9 border-2 border-black bg-white px-3 text-sm text-black outline-none [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel [[data-theme=elegant]_&]:text-foreground"
          />
        </label>
      </div>
    </div>
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
