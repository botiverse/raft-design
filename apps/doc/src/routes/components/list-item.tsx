import { createFileRoute } from "@tanstack/react-router";
import {
  ListItem,
  ListItemActionGroup,
  ListItemBody,
  ListItemDescription,
  ListItemRow,
  ListItemMeta,
  ListItemTitle,
} from "@slock/ui";
import { Clock3, ExternalLink, Link2, Play, Repeat, RotateCcw, Square } from "lucide-react";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacySectionEyebrow from "../../../../../packages/ui/src/legacy/SectionEyebrow.tsx";
import LegacySurfaceListItem from "../../../../../packages/ui/src/legacy/SurfaceListItem.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  ListItem,
  ListItemActionGroup,
  ListItemBody,
  ListItemDescription,
  ListItemRow,
  ListItemMeta,
  ListItemTitle,
} from "@slock/ui";

<ListItem>
  <ListItemBody>
    <ListItemRow>
      <ListItemTitle>Web Search</ListItemTitle>
      <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
        /web
      </span>
    </ListItemRow>
    <ListItemDescription>Search the web from a running agent.</ListItemDescription>
    <ListItemMeta>Global skill</ListItemMeta>
    <ListItemActionGroup>...</ListItemActionGroup>
  </ListItemBody>
</ListItem>`,
  states: `<ListItem>Resting (interactive)</ListItem>
<ListItem selected>Selected</ListItem>
<ListItem interactive={false}>Static</ListItem>`,
  sourceApi: `import SurfaceListItem from "../ui/SurfaceListItem";

<SurfaceListItem selected interactive={false}>
  # general
</SurfaceListItem>`,
  currentApi: `import { ListItem } from "@slock/ui";

<ListItem selected interactive={false}>
  # general
</ListItem>`,
  sourceSkill: `<SurfaceListItem>
  <div className="flex items-center gap-2">
    <span className="font-bold text-sm text-black">{skill.displayName}</span>
    {skill.userInvocable && (
      <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
        /{skill.name}
      </span>
    )}
  </div>
  {skill.description && (
    <p className="text-xs text-black/60 mt-1 line-clamp-2">{skill.description}</p>
  )}
</SurfaceListItem>`,
  currentSkill: `<ListItem>
  <ListItemBody>
    <ListItemRow>
      <ListItemTitle>Web Search</ListItemTitle>
      <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
        /web
      </span>
    </ListItemRow>
    <ListItemDescription className="line-clamp-2">
      Search the web from a running agent.
    </ListItemDescription>
  </ListItemBody>
</ListItem>`,
  sourceReminder: `<SurfaceListItem>
  <div className="min-w-0">
    <div className="text-sm font-bold text-black break-words">{reminder.title}</div>
    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/50">
      <span className="inline-flex items-center gap-1 font-medium text-black/60">
        <Clock3 size={12} />
        {formatRelativeTime(reminder.fireAt)}
      </span>
      <span className="font-mono">{formatShortDateTime(reminder.fireAt)}</span>
      <span className="inline-flex items-center gap-1 border border-black bg-brutal-lavender/30 px-1.5 py-0.5 font-mono text-[11px] text-black">
        <Repeat size={11} />
        every weekday
      </span>
    </div>
  </div>
</SurfaceListItem>`,
  currentReminder: `<ListItem>
  <ListItemBody>
    <ListItemTitle>Send weekly deploy report</ListItemTitle>
    <ListItemMeta>
      <span className="inline-flex items-center gap-1 font-medium text-black/60">
        <Clock3 />
        tomorrow
      </span>
      <span className="font-mono">Jun 6, 09:00</span>
      <span className="inline-flex items-center gap-1 border border-black bg-brutal-lavender/30 px-1.5 py-0.5 font-mono text-[11px] text-black">
        <Repeat />
        every weekday
      </span>
    </ListItemMeta>
  </ListItemBody>
</ListItem>`,
  sourceConnectedApp: `<SurfaceListItem key={item.id} className="space-y-2" interactive={false}>
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="font-bold text-black">{item.clientName}</div>
      <div className="text-xs text-black/60">{formatShortDateTime(item.createdAt)}</div>
    </div>
    <span className="inline-flex border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">
      Active
    </span>
  </div>
  {item.clientDescription && <div className="text-sm text-black/70">{item.clientDescription}</div>}
  <div className="flex flex-wrap gap-1">{item.scopes.map(...)}</div>
  <div className="flex flex-wrap gap-2">{actions}</div>
</SurfaceListItem>`,
  currentConnectedApp: `<ListItem className="space-y-2" interactive={false}>
  <ListItemRow className="justify-between gap-3">
    <ListItemBody>
      <ListItemTitle className="text-base">Linear</ListItemTitle>
      <ListItemDescription>Jun 5, 09:14</ListItemDescription>
    </ListItemBody>
    <span className="inline-flex border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">
      Active
    </span>
  </ListItemRow>
  <ListItemDescription className="text-sm text-black/70">
    Create and update issues from the agent.
  </ListItemDescription>
  <ListItemMeta className="gap-1">{scopes}</ListItemMeta>
  <ListItemActionGroup>{actions}</ListItemActionGroup>
</ListItem>`,
  sourceBulkSelection: `<SurfaceListItem selected interactive={false} className="bg-gray-100 px-3 py-2">
  <div className="flex flex-wrap items-center gap-2">
    <SectionEyebrow className="mr-auto !text-black">
      {selectedCount} selected
    </SectionEyebrow>
    <button className="btn-brutal-sm flex items-center gap-1 bg-brutal-lime px-2 py-1 text-xs">
      <Play size={12} />
      Start
    </button>
    <button className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs">
      <Square size={12} />
      Stop
    </button>
    <button className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs">
      <RotateCcw size={12} />
      Restart / Reset
    </button>
  </div>
</SurfaceListItem>`,
  currentBulkSelection: `<ListItem selected interactive={false} className="bg-gray-100 px-3 py-2">
  <ListItemActionGroup className="mt-0 items-center">
    <span className="mr-auto text-xs font-bold uppercase tracking-widest text-black">
      3 selected
    </span>
    <button className="btn-brutal-sm flex items-center gap-1 bg-brutal-lime px-2 py-1 text-xs">
      <Play />
      Start
    </button>
    <button className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs">
      <Square />
      Stop
    </button>
    <button className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs">
      <RotateCcw />
      Restart / Reset
    </button>
  </ListItemActionGroup>
</ListItem>`,
} as const;

type PlaygroundValues = {
  selected: boolean;
  interactive: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    default: "false",
    description: "Selected look: black border, cyan/15 fill, shadow.",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "true",
    description: "When unselected, adds the hover border + shadow.",
  },
  {
    name: "render",
    type: "useRender render prop",
    description: "Optional element composition hook; defaults to div.",
  },
  {
    name: "ListItemBody",
    type: "div slot",
    description: "Main content container inside the frame.",
  },
  {
    name: "ListItemRow",
    type: "div slot",
    description: "Flexible inline row for titles, badges, status labels, and aligned metadata.",
  },
  {
    name: "ListItemTitle",
    type: "div slot",
    description: "Bold title text matching the source list item callsites.",
  },
  {
    name: "ListItemDescription",
    type: "p slot",
    description: "Muted secondary text. Callers can override the tag with render.",
  },
  {
    name: "ListItemMeta",
    type: "div slot",
    description: "Wrapped inline metadata row for times, links, recurrence chips, and scopes.",
  },
  {
    name: "ListItemActionGroup",
    type: "div slot",
    description: "Wrapped action group for source callsites that had inline button clusters.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes.",
  },
];

export const Route = createFileRoute("/components/list-item")({
  component: ListItemDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ListItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ListItem"
      description="A bordered selectable list item frame with composition slots for title, metadata, and actions."
      overview={
        <Differences from="SurfaceListItem">
          <li>
            renamed to <code>ListItem</code>; source name described the visual surface rather than
            the primitive role
          </li>
          <li>brutal styling reproduced 1:1 (selected cyan fill, hover border + shadow)</li>
          <li>
            source <code>shadow-brutal-sm</code> maps to the brutal <code>--shadow</code> token
          </li>
          <li>
            current implementation exposes compound slots instead of adding business props for
            skill, reminder, connected app, or bulk action variants
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ selected: false, interactive: true }}
          controls={[
            { name: "selected", label: "Selected", type: "boolean" },
            { name: "interactive", label: "Interactive", type: "boolean" },
          ]}
          render={(values) => (
            <ListItem selected={values.selected} interactive={values.interactive} className="w-72">
              <ListItemBody>
                <ListItemRow>
                  <ListItemTitle>Web Search</ListItemTitle>
                  <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
                    /web
                  </span>
                </ListItemRow>
                <ListItemDescription>Search the web from a running agent.</ListItemDescription>
              </ListItemBody>
            </ListItem>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <div className="flex w-64 flex-col gap-3">
            <ListItem>Resting (interactive)</ListItem>
            <ListItem selected>Selected</ListItem>
            <ListItem interactive={false}>Static</ListItem>
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
              label: "API name",
              status: "difference",
              note: "Source used SurfaceListItem. Current uses ListItem because the primitive is a selectable list item frame, not a generic surface.",
              source: <LegacySurfaceListItemPreview />,
              current: <ListItemPreview />,
              sourceCode: code.sourceApi,
              currentCode: code.currentApi,
            },
            {
              label: "Skill card",
              status: "match",
              note: "Source AgentSkills rendered title, invocation chip, and optional description directly inside SurfaceListItem. Current keeps the exact visual contract through row/title/description slots.",
              source: <LegacySkillCardPreview />,
              current: <ListItemSkillCardPreview />,
              sourceCode: code.sourceSkill,
              currentCode: code.currentSkill,
            },
            {
              label: "Reminder metadata",
              status: "match",
              note: "Source AgentRemindersSection used a nested body block plus inline metadata chips. Current maps that shape to ListItemBody, ListItemTitle, and ListItemMeta.",
              source: <LegacyReminderCardPreview />,
              current: <ListItemReminderCardPreview />,
              sourceCode: code.sourceReminder,
              currentCode: code.currentReminder,
            },
            {
              label: "Connected app actions",
              status: "match",
              note: "Source AgentDetailPanel used SurfaceListItem as a static card with a top row, description, scope chips, and actions. Current keeps the same layout using composition slots instead of connected-app props.",
              source: <LegacyConnectedAppPreview />,
              current: <ListItemConnectedAppPreview />,
              sourceCode: code.sourceConnectedApp,
              currentCode: code.currentConnectedApp,
            },
            {
              label: "Selected action bar",
              status: "match",
              note: "Source MachineDetailPanel reused SurfaceListItem as a selected bulk-action bar. Current keeps selected/interactive as root states and uses ListItemActionGroup for the action group.",
              source: <LegacyBulkSelectionPreview />,
              current: <ListItemBulkSelectionPreview />,
              sourceCode: code.sourceBulkSelection,
              currentCode: code.currentBulkSelection,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LegacySurfaceListItemPreview() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <LegacySurfaceListItem>Resting (interactive)</LegacySurfaceListItem>
      <LegacySurfaceListItem selected>Selected</LegacySurfaceListItem>
      <LegacySurfaceListItem interactive={false}>Static</LegacySurfaceListItem>
    </div>
  );
}

function ListItemPreview() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <ListItem>Resting (interactive)</ListItem>
      <ListItem selected>Selected</ListItem>
      <ListItem interactive={false}>Static</ListItem>
    </div>
  );
}

function LegacySkillCardPreview() {
  return (
    <LegacySurfaceListItem className="w-80">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-black">Web Search</span>
        <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
          /web
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-black/60">
        Search the web from a running agent.
      </p>
    </LegacySurfaceListItem>
  );
}

function ListItemSkillCardPreview() {
  return (
    <ListItem className="w-80">
      <ListItemBody>
        <ListItemRow>
          <ListItemTitle>Web Search</ListItemTitle>
          <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
            /web
          </span>
        </ListItemRow>
        <ListItemDescription className="line-clamp-2">
          Search the web from a running agent.
        </ListItemDescription>
      </ListItemBody>
    </ListItem>
  );
}

function LegacyReminderCardPreview() {
  return (
    <LegacySurfaceListItem className="w-96">
      <div className="min-w-0">
        <div className="break-words text-sm font-bold text-black">Send weekly deploy report</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/50">
          <span className="inline-flex items-center gap-1 font-medium text-black/60">
            <Clock3 size={12} />
            tomorrow
          </span>
          <span className="font-mono">Jun 6, 09:00</span>
          <span className="inline-flex items-center gap-1 border border-black bg-brutal-lavender/30 px-1.5 py-0.5 font-mono text-[11px] text-black">
            <Repeat size={11} />
            every weekday
          </span>
        </div>
        <div className="mt-2">
          <span className="inline-flex max-w-full items-center gap-1 truncate border border-black bg-white px-1.5 py-0.5 font-mono text-[11px] text-black/70">
            <Link2 size={11} className="shrink-0" />
            <span className="truncate">#ops/deploys/42</span>
          </span>
        </div>
      </div>
    </LegacySurfaceListItem>
  );
}

function ListItemReminderCardPreview() {
  return (
    <ListItem className="w-96">
      <ListItemBody>
        <ListItemTitle>Send weekly deploy report</ListItemTitle>
        <ListItemMeta>
          <span className="inline-flex items-center gap-1 font-medium text-black/60">
            <Clock3 />
            tomorrow
          </span>
          <span className="font-mono">Jun 6, 09:00</span>
          <span className="inline-flex items-center gap-1 border border-black bg-brutal-lavender/30 px-1.5 py-0.5 font-mono text-[11px] text-black">
            <Repeat />
            every weekday
          </span>
        </ListItemMeta>
        <ListItemActionGroup>
          <span className="inline-flex max-w-full items-center gap-1 truncate border border-black bg-white px-1.5 py-0.5 font-mono text-[11px] text-black/70">
            <Link2 size={11} className="shrink-0" />
            <span className="truncate">#ops/deploys/42</span>
          </span>
        </ListItemActionGroup>
      </ListItemBody>
    </ListItem>
  );
}

function LegacyConnectedAppPreview() {
  return (
    <LegacySurfaceListItem className="w-96 space-y-2" interactive={false}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-black">Linear</div>
          <div className="text-xs text-black/60">Jun 5, 09:14</div>
        </div>
        <span className="inline-flex border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">
          Active
        </span>
      </div>
      <div className="text-sm text-black/70">Create and update issues from the agent.</div>
      <div className="flex flex-wrap gap-1">
        <ScopeChip>read</ScopeChip>
        <ScopeChip>write</ScopeChip>
        <ScopeChip>issues</ScopeChip>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-brutal bg-white px-3 py-1.5 text-xs">
          Revoke
        </button>
        <a
          href="#source-comparison"
          className="self-center text-xs font-bold text-black/70 underline"
        >
          View service
        </a>
      </div>
    </LegacySurfaceListItem>
  );
}

function ListItemConnectedAppPreview() {
  return (
    <ListItem className="w-96 space-y-2" interactive={false}>
      <ListItemRow className="justify-between gap-3">
        <ListItemBody>
          <ListItemTitle className="text-base">Linear</ListItemTitle>
          <ListItemDescription>Jun 5, 09:14</ListItemDescription>
        </ListItemBody>
        <span className="inline-flex border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold uppercase">
          Active
        </span>
      </ListItemRow>
      <ListItemDescription className="text-sm text-black/70">
        Create and update issues from the agent.
      </ListItemDescription>
      <ListItemMeta className="gap-1">
        <ScopeChip>read</ScopeChip>
        <ScopeChip>write</ScopeChip>
        <ScopeChip>issues</ScopeChip>
      </ListItemMeta>
      <ListItemActionGroup>
        <button type="button" className="btn-brutal bg-white px-3 py-1.5 text-xs">
          Revoke
        </button>
        <a
          href="#source-comparison"
          className="inline-flex self-center text-xs font-bold text-black/70 underline"
        >
          View service
          <ExternalLink size={12} className="ml-1" />
        </a>
      </ListItemActionGroup>
    </ListItem>
  );
}

function LegacyBulkSelectionPreview() {
  return (
    <LegacySurfaceListItem selected interactive={false} className="w-96 bg-gray-100 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <LegacySectionEyebrow className="mr-auto !text-black">3 selected</LegacySectionEyebrow>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-brutal-lime px-2 py-1 text-xs"
        >
          <Play size={12} />
          Start
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs"
        >
          <Square size={12} />
          Stop
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs"
        >
          <RotateCcw size={12} />
          Restart / Reset
        </button>
      </div>
    </LegacySurfaceListItem>
  );
}

function ListItemBulkSelectionPreview() {
  return (
    <ListItem selected interactive={false} className="w-96 bg-gray-100 px-3 py-2">
      <ListItemActionGroup className="mt-0 items-center">
        <span className="mr-auto text-xs font-bold uppercase tracking-widest text-black">
          3 selected
        </span>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-brutal-lime px-2 py-1 text-xs"
        >
          <Play />
          Start
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs"
        >
          <Square />
          Stop
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs"
        >
          <RotateCcw />
          Restart / Reset
        </button>
      </ListItemActionGroup>
    </ListItem>
  );
}

function ScopeChip({ children }: { children: string }) {
  return (
    <span className="inline-flex border border-black bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
      {children}
    </span>
  );
}
