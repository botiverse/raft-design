import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverSurface,
  PopoverTitle,
  PopoverTrigger,
} from "@slock/ui";
import { Check, Hash, SlidersHorizontal } from "lucide-react";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { useId, useRef, useState } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";
import { SelectionPopover as LegacySelectionPopover } from "../../../../../packages/ui/src/legacy/selection-popover.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "searchable", title: "Searchable" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const TODOS = [
  "Add app-level command/listbox helpers only if source callsites repeat the same row behavior",
] as const;

type PlaygroundValues = {
  open: boolean;
  label: string;
};

const CHANNEL_FILTER_ROWS_SNIPPET = `    <PopoverHeader>
      <PopoverTitle>Channels</PopoverTitle>
      <button type="button" className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black">
        Clear
      </button>
    </PopoverHeader>
    <div className="border-b border-black px-2 py-2">
      <Input
        aria-label="Search channels"
        placeholder="Search…"
        suppressPasswordManager
        className="px-2 py-1 font-mono text-xs shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)]"
      />
    </div>
    <div className="max-h-64 overflow-y-auto">
      <button type="button" className="flex h-9 w-full items-center justify-between gap-2 border-b border-black/10 bg-white px-3 text-left text-xs font-bold hover:bg-brutal-yellow/30">
        <span className="flex min-w-0 items-center gap-2">
          <Hash size={12} className="shrink-0 text-black/50" />
          <span className="truncate leading-6">#unread</span>
        </span>
        <Check size={12} className="shrink-0" />
      </button>
    </div>`;

const SNIPPETS = {
  anatomy: `import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@slock/ui";
import { Check, Hash, SlidersHorizontal } from "lucide-react";

<Popover>
  <PopoverTrigger render={<Button variant="outline" size="md" />}>
    <SlidersHorizontal />
    Channels
  </PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
${CHANNEL_FILTER_ROWS_SNIPPET}
  </PopoverContent>
</Popover>`,
  searchable: `<Popover open modal={false} triggerId="searchable-popover-trigger">
  <PopoverTrigger id="searchable-popover-trigger" render={<Button variant="outline" size="md" />}>
    Channels
  </PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
${CHANNEL_FILTER_ROWS_SNIPPET}
  </PopoverContent>
</Popover>`,
  migrationChannelFilter: `// Source — MessageSearchPage.tsx
<SelectionPopover
  title="Channels"
  searchable
  search={channelFilterQuery}
  onSearchChange={setChannelFilterQuery}
  options={filteredChannels.map((ch) => ({
    key: ch.id,
    checked: false,
    label: \`#\${ch.name}\`,
    leading: <Hash size={12} className="text-black/50" />,
    onClick: () => updateSearchParam("channelId", ch.id),
  }))}
/>

// Current
<Popover open={channelMenuOpen} onOpenChange={setChannelMenuOpen}>
  <PopoverTrigger render={<FilterChip />}>Channel</PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
${CHANNEL_FILTER_ROWS_SNIPPET}
  </PopoverContent>
</Popover>`,
} as const;

const HASH_LEADING = <Hash size={12} className="text-black/50" />;

const COMPACT_LIST_AVATAR = (
  <LegacyAvatarSlot
    context="compact-list"
    type="human"
    humanAvatarUrl={null}
    gravatarHash={null}
    email={null}
  />
);

const PROPS: readonly PropRow[] = [
  {
    name: "Popover",
    type: "Base UI Popover.Root.Props",
    description: "Owns open state, Escape, outside press, focus handoff, and modal behavior.",
  },
  {
    name: "PopoverTrigger",
    type: "Base UI Popover.Trigger.Props",
    description: "Trigger part. Compose custom controls with Base UI's render prop.",
  },
  {
    name: "PopoverContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled card shell. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=true, and forwards anchor/collision/sticky/inline-side positioning props.",
  },
  {
    name: "PopoverHeader",
    type: "div props",
    description: "Source SelectionPopover header styling: border-b, px-3, py-2.",
  },
  {
    name: "PopoverTitle",
    type: "Base UI Popover.Title.Props",
    description: "Accessible heading styled as the source uppercase eyebrow.",
  },
  {
    name: "PopoverDescription",
    type: "Base UI Popover.Description.Props",
    description: "Accessible supporting copy. Optional in compact selection popovers.",
  },
  {
    name: "PopoverClose",
    type: "Base UI Popover.Close.Props",
    description: "Closes the popover. Compose your own visual affordance with render/className.",
  },
  {
    name: "PopoverViewport",
    type: "Base UI Popover.Viewport.Props",
    description:
      "Optional transition viewport for one popover whose content changes between multiple triggers.",
  },
];

export const Route = createFileRoute("/components/popover")({
  component: PopoverDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

const noop = () => undefined;

type SelectionRow = {
  key: string;
  label: string;
  checked?: boolean;
  leading?: ReactNode;
  reserveLeadingSlot?: boolean;
  italic?: boolean;
};

function SelectionRows({ rows }: { rows: readonly SelectionRow[] }) {
  return (
    <div className="max-h-64 overflow-y-auto">
      {rows.map((row) => (
        <button
          key={row.key}
          type="button"
          className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden border-b border-black/10 bg-white px-3 text-left text-xs font-bold last:border-b-0 hover:bg-brutal-yellow/30"
        >
          <span className="flex min-w-0 items-center gap-2">
            {(row.reserveLeadingSlot || row.leading) && (
              <span className="flex size-5 shrink-0 items-center justify-center">
                {row.leading}
              </span>
            )}
            <span
              className={
                row.italic
                  ? "-mx-1 truncate whitespace-nowrap px-1 leading-6 italic text-black/70"
                  : "truncate leading-6"
              }
            >
              {row.label}
            </span>
          </span>
          {row.checked ? <Check size={12} className="shrink-0" /> : null}
        </button>
      ))}
    </div>
  );
}

const SOURCE_ALIGNED_POPOVER_SEARCH_INPUT_CLASS =
  "px-2 py-1 font-mono text-xs shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)]";

function PopoverSearchField(props: ComponentProps<typeof Input>) {
  return (
    <div className="border-b border-black px-2 py-2">
      <Input suppressPasswordManager {...props} />
    </div>
  );
}

function SearchableFilterRows() {
  const [search, setSearch] = useState("");

  return (
    <>
      <PopoverHeader>
        <PopoverTitle>Channels</PopoverTitle>
        <button
          type="button"
          onClick={() => setSearch("")}
          className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"
        >
          Clear
        </button>
      </PopoverHeader>
      <PopoverSearchField
        aria-label="Search channels"
        value={search}
        onValueChange={setSearch}
        placeholder="Search…"
        className={SOURCE_ALIGNED_POPOVER_SEARCH_INPUT_CLASS}
      />
      <SelectionRows
        rows={[
          { key: "unread", label: "#unread", checked: true, leading: HASH_LEADING },
          { key: "general", label: "#general", leading: HASH_LEADING },
        ].filter((row) => row.label.toLowerCase().includes(search.toLowerCase()))}
      />
    </>
  );
}

function OpenPopoverExample({
  triggerId,
  label,
  children,
  contentClassName = "min-w-[220px]",
}: {
  triggerId: string;
  label: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Popover open modal={false} triggerId={triggerId}>
        <PopoverTrigger id={triggerId} render={<Button variant="outline" size="md" />}>
          {label}
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className={contentClassName}
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FilterPreviewPopover({ open, label }: { open: boolean; label: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Popover open={open} modal={false} triggerId="preview-filter-trigger">
        <PopoverTrigger id="preview-filter-trigger" render={<Button variant="outline" size="md" />}>
          <SlidersHorizontal />
          {label}
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="min-w-[220px]"
        >
          <SearchableFilterRows />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SourcePopoverMount({
  contentClassName = "w-[220px]",
  children,
}: {
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div
        className={["relative shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]", contentClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function ComparisonPopoverMount({
  frameClassName = "w-[220px]",
  contentClassName = "min-w-[220px]",
  children,
}: {
  frameClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const triggerId = useId();

  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <Popover open modal={false} triggerId={triggerId}>
        <PopoverTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <PopoverSurface className={[contentClassName, frameClassName].filter(Boolean).join(" ")}>
          {children}
        </PopoverSurface>
      </Popover>
    </div>
  );
}

function ComparisonSearchField({ value, className }: { value: string; className?: string }) {
  return (
    <PopoverSearchField
      aria-label="Search preview"
      readOnly
      value={value}
      className={[SOURCE_ALIGNED_POPOVER_SEARCH_INPUT_CLASS, className].filter(Boolean).join(" ")}
    />
  );
}

function SourceMessageSearchChannelComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="Channels"
        searchable
        search="un"
        onSearchChange={noop}
        options={[
          {
            key: "unread",
            checked: false,
            label: "#unread",
            leading: HASH_LEADING,
            onClick: noop,
          },
          {
            key: "general",
            checked: false,
            label: "#general",
            leading: HASH_LEADING,
            onClick: noop,
          },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentMessageSearchChannelComparison() {
  return (
    <ComparisonPopoverMount>
      <PopoverHeader>
        <PopoverTitle>Channels</PopoverTitle>
      </PopoverHeader>
      <ComparisonSearchField value="un" />
      <SelectionRows
        rows={[
          { key: "unread", label: "#unread", leading: HASH_LEADING },
          { key: "general", label: "#general", leading: HASH_LEADING },
        ]}
      />
    </ComparisonPopoverMount>
  );
}

function SourceMessageSearchSenderComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="From"
        searchable
        search="at"
        onSearchChange={noop}
        showClear
        onClear={noop}
        options={[
          {
            key: "me",
            checked: true,
            label: "Me",
            reserveLeadingSlot: true,
            avatar: COMPACT_LIST_AVATAR,
            onClick: noop,
          },
          {
            key: "atlas",
            checked: false,
            label: "Atlas",
            reserveLeadingSlot: true,
            avatar: COMPACT_LIST_AVATAR,
            onClick: noop,
          },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentMessageSearchSenderComparison() {
  return (
    <ComparisonPopoverMount>
      <PopoverHeader>
        <PopoverTitle>From</PopoverTitle>
        <button
          type="button"
          className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"
        >
          Clear
        </button>
      </PopoverHeader>
      <ComparisonSearchField value="at" />
      <SelectionRows
        rows={[
          {
            key: "me",
            label: "Me",
            checked: true,
            reserveLeadingSlot: true,
            leading: COMPACT_LIST_AVATAR,
          },
          {
            key: "atlas",
            label: "Atlas",
            reserveLeadingSlot: true,
            leading: COMPACT_LIST_AVATAR,
          },
        ]}
      />
    </ComparisonPopoverMount>
  );
}

function SourceTasksChannelFilterComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="Channels"
        searchable
        search="des"
        onSearchChange={noop}
        showClear
        onClear={noop}
        options={[
          { key: "design", checked: true, label: "#design", onClick: noop },
          { key: "dev", checked: false, label: "#dev", onClick: noop },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentTasksChannelFilterComparison() {
  return (
    <ComparisonPopoverMount>
      <PopoverHeader>
        <PopoverTitle>Channels</PopoverTitle>
        <button
          type="button"
          className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"
        >
          Clear
        </button>
      </PopoverHeader>
      <ComparisonSearchField value="des" />
      <SelectionRows
        rows={[
          { key: "design", label: "#design", checked: true },
          { key: "dev", label: "#dev" },
        ]}
      />
    </ComparisonPopoverMount>
  );
}

function SourceTasksIdentityFilterComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="Assignee"
        searchable
        search=""
        onSearchChange={noop}
        showClear
        onClear={noop}
        options={[
          {
            key: "me",
            checked: false,
            label: "Assigned to me",
            italic: true,
            reserveLeadingSlot: true,
            onClick: noop,
          },
          {
            key: "unassigned",
            checked: false,
            label: "Unassigned",
            italic: true,
            reserveLeadingSlot: true,
            onClick: noop,
          },
          {
            key: "atlas",
            checked: true,
            label: "Atlas",
            reserveLeadingSlot: true,
            avatar: COMPACT_LIST_AVATAR,
            onClick: noop,
          },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentTasksIdentityFilterComparison() {
  return (
    <ComparisonPopoverMount>
      <PopoverHeader>
        <PopoverTitle>Assignee</PopoverTitle>
        <button
          type="button"
          className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"
        >
          Clear
        </button>
      </PopoverHeader>
      <ComparisonSearchField value="" />
      <SelectionRows
        rows={[
          {
            key: "me",
            label: "Assigned to me",
            italic: true,
            reserveLeadingSlot: true,
          },
          {
            key: "unassigned",
            label: "Unassigned",
            italic: true,
            reserveLeadingSlot: true,
          },
          {
            key: "atlas",
            label: "Atlas",
            checked: true,
            reserveLeadingSlot: true,
            leading: COMPACT_LIST_AVATAR,
          },
        ]}
      />
    </ComparisonPopoverMount>
  );
}

function PopoverDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Popover"
      description="A trigger-positioned floating panel built on Base UI Popover for searchable filter surfaces with composed headers, search fields, and selection rows."
      headerAction={
        <Button
          render={<a href="/components/popover/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview models a searchable channel filter from message search. Header, search field,
          Clear, row hover, and trailing checks are composed as children so product code can reuse
          the same selection-family behavior without an options prop.
        </p>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            open: true,
            label: "Channels",
          }}
          controls={[
            { name: "open", label: "Open", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
          ]}
          previewClassName="min-h-[30rem] items-start pt-24"
          render={(values) => <FilterPreviewPopover open={values.open} label={values.label} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="searchable" title="Searchable">
        <Example html={code.searchable} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenPopoverExample triggerId="searchable-popover-trigger" label="Channels">
            <SearchableFilterRows />
          </OpenPopoverExample>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Message search — channel filter",
              status: "difference",
              note: "`MessageSearchPage.tsx`. Searchable channel picker on the filter row. Rows use a Hash leading icon; search handles Escape and Enter on the first match.",
              source: <SourceMessageSearchChannelComparison />,
              brutal: <CurrentMessageSearchChannelComparison />,
              elegant: <CurrentMessageSearchChannelComparison />,
              elegantDark: <CurrentMessageSearchChannelComparison />,
            },
            {
              label: "Message search — sender filter",
              status: "difference",
              note: "`MessageSearchPage.tsx`. Searchable identity filter with compact-list avatars, reserved leading slot, and Clear when a sender is active.",
              source: <SourceMessageSearchSenderComparison />,
              brutal: <CurrentMessageSearchSenderComparison />,
              elegant: <CurrentMessageSearchSenderComparison />,
              elegantDark: <CurrentMessageSearchSenderComparison />,
            },
            {
              label: "Tasks — channel filter",
              status: "difference",
              note: "`TasksPanel.tsx` server-wide board. Searchable `#channel` rows with multi-select toggling and Clear when any channel is selected.",
              source: <SourceTasksChannelFilterComparison />,
              brutal: <CurrentTasksChannelFilterComparison />,
              elegant: <CurrentTasksChannelFilterComparison />,
              elegantDark: <CurrentTasksChannelFilterComparison />,
            },
            {
              label: "Tasks — identity filter",
              status: "difference",
              note: "`TasksPanel.tsx` via `IdentityFilterChip`. Searchable assignee/creator filter with italic sentinel rows (`Assigned to me`, `Unassigned`), avatar rows, and reserved leading slot alignment.",
              source: <SourceTasksIdentityFilterComparison />,
              brutal: <CurrentTasksIdentityFilterComparison />,
              elegant: <CurrentTasksIdentityFilterComparison />,
              elegantDark: <CurrentTasksIdentityFilterComparison />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-strong">
              Channel filter composition
            </h3>
            <p className="text-sm text-foreground-muted">
              Replace the business-shaped SelectionPopover with a generic Base UI popover
              composition. Filter state, row derivation, Clear behavior, and keyboard handling stay
              app-owned.
            </p>
            <CodeBlock html={code.migrationChannelFilter} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
