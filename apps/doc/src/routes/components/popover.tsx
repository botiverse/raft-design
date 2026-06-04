import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Field,
  FieldLabel,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@slock/ui";
import { Check, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

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
  { id: "searchable", title: "Searchable" },
  { id: "form", title: "Form" },
  { id: "inline", title: "Inline" },
  { id: "opened", title: "Opened" },
  { id: "migration", title: "Migration" },
  { id: "api", title: "API" },
] as const;

const TODOS = [
  "Add elegant family styling",
  "Add app-level command/listbox helpers only if source callsites repeat the same row behavior",
] as const;

const OPTIONS = ["All", "Unread", "Mentions", "Archived"] as const;

const SNIPPETS = {
  anatomy: `import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@slock/ui";

<Popover>
  <PopoverTrigger render={<Button />}>Filter</PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
    <PopoverHeader>
      <PopoverTitle>Filter</PopoverTitle>
    </PopoverHeader>
    <div className="max-h-64 overflow-y-auto">
      <button className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden border-b border-black/10 bg-white px-3 text-left text-xs font-bold hover:bg-brutal-yellow/30">
        <span className="truncate leading-6">All</span>
        <Check size={12} />
      </button>
    </div>
  </PopoverContent>
</Popover>`,
  searchable: `<Popover>
  <PopoverTrigger render={<Button />}>Channels</PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
    <PopoverHeader>
      <PopoverTitle>Channels</PopoverTitle>
      <button className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black">
        Clear
      </button>
    </PopoverHeader>
    <div className="border-b border-black px-2 py-2">
      <input className="w-full border-2 border-black bg-white px-2 py-1 font-mono text-xs shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)] focus:outline-none" />
    </div>
  </PopoverContent>
</Popover>`,
  opened: `<Popover open modal={false} triggerId="opened-popover-trigger">
  <PopoverTrigger id="opened-popover-trigger" render={<Button />}>
    Filter
  </PopoverTrigger>
  <PopoverContent className="min-w-[220px]">
    <PopoverHeader>
      <PopoverTitle>Filter</PopoverTitle>
    </PopoverHeader>
  </PopoverContent>
</Popover>`,
  form: `<Popover>
  <PopoverTrigger render={<Button />}>Invite</PopoverTrigger>
  <PopoverContent className="w-72">
    <PopoverHeader className="items-start">
      <div>
        <PopoverTitle>Invite member</PopoverTitle>
        <PopoverDescription>Add a teammate by email.</PopoverDescription>
      </div>
      <PopoverClose>Close</PopoverClose>
    </PopoverHeader>
    <form className="space-y-3 p-3">
      <Field>
        <FieldLabel htmlFor="invite-email" size="sm" className="uppercase tracking-wide">
          Email
        </FieldLabel>
        <Input id="invite-email" type="email" placeholder="you@example.com" />
      </Field>
      <Button type="button" size="sm" className="w-full">Send invite</Button>
    </form>
  </PopoverContent>
</Popover>`,
  inline: `<Popover>
  <PopoverTrigger render={<Button />}>Open</PopoverTrigger>
  <PopoverContent side="inline-end" align="start" className="w-56">
    <PopoverHeader>
      <PopoverTitle>Inline end</PopoverTitle>
    </PopoverHeader>
    <div className="p-3 text-xs leading-5 text-black/60">
      Uses Base UI's logical inline side while keeping the same shell.
    </div>
  </PopoverContent>
</Popover>`,
} as const;

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

function OptionRows({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="max-h-64 overflow-y-auto">
      {options.length === 0 ? (
        <div className="p-3 text-center font-mono text-[11px] text-black/40">No matches</div>
      ) : (
        options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden border-b border-black/10 bg-white px-3 text-left text-xs font-bold last:border-b-0 hover:bg-brutal-yellow/30"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate leading-6">{option}</span>
            </span>
            {selected === option && <Check size={12} className="shrink-0" />}
          </button>
        ))
      )}
    </div>
  );
}

function SearchableSelectionPopover() {
  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => OPTIONS.filter((option) => option.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <Popover>
      <PopoverTrigger render={<Button size="md" />}>
        <SlidersHorizontal />
        Channels
      </PopoverTrigger>
      <PopoverContent className="min-w-[220px]">
        <PopoverHeader>
          <PopoverTitle>Channels</PopoverTitle>
          <button
            type="button"
            onClick={() => {
              setSelected("All");
              setSearch("");
            }}
            className="text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"
          >
            Clear
          </button>
        </PopoverHeader>
        <div className="border-b border-black p-2">
          <input
            type="text"
            aria-label="Search channels"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            className="w-full border-2 border-black bg-white px-2 py-1 font-mono text-xs shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)] focus:outline-none"
          />
        </div>
        <OptionRows options={filtered} selected={selected} onSelect={setSelected} />
      </PopoverContent>
    </Popover>
  );
}

function FormPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button size="md" />}>Invite</PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader className="items-start">
          <div>
            <PopoverTitle>Invite member</PopoverTitle>
            <PopoverDescription>Add a teammate by email.</PopoverDescription>
          </div>
          <PopoverClose>Close</PopoverClose>
        </PopoverHeader>
        <form className="space-y-3 p-3">
          <Field>
            <FieldLabel htmlFor="invite-email" size="sm" className="uppercase tracking-wide">
              Email
            </FieldLabel>
            <Input id="invite-email" type="email" placeholder="you@example.com" />
          </Field>
          <Button type="button" size="sm" className="w-full">
            Send invite
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function InlinePopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button size="md" />}>Open</PopoverTrigger>
      <PopoverContent side="inline-end" align="start" className="w-56">
        <PopoverHeader>
          <PopoverTitle>Inline end</PopoverTitle>
        </PopoverHeader>
        <div className="p-3 text-xs leading-5 text-black/60">
          Uses Base UI&apos;s logical inline side while keeping the same shell.
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PopoverDoc() {
  const code = Route.useLoaderData();
  const [selected, setSelected] = useState("All");

  return (
    <DocPage
      title="Popover"
      description="A trigger-positioned floating panel built on Base UI Popover."
      overview={
        <Differences from="SelectionPopover">
          <li>
            source shell styling is preserved: min-w-[220px], border-2, shadow-hover, header border,
            search field shadow, max-h list, row height, yellow/30 hover, and trailing check
          </li>
          <li>
            difference from source: open state, focus handoff, Escape, outside press, portal, and
            positioning are owned by Base UI Popover instead of being caller-positioned
          </li>
          <li>
            difference from Base UI: <code>disableAnchorTracking</code> defaults to{" "}
            <code>true</code> so the panel does not follow trigger hover/layout movement after it
            opens; pass <code>false</code> to restore live anchor tracking
          </li>
          <li>
            difference from source: rows, filtering, Clear behavior, checked state, disabled rows,
            avatars, and italic labels are composed by the caller instead of passed through an
            options prop
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
            <Popover>
              <PopoverTrigger render={<Button size="md" />}>
                <SlidersHorizontal />
                Filter
              </PopoverTrigger>
              <PopoverContent className="min-w-[220px]">
                <PopoverHeader>
                  <PopoverTitle>Filter</PopoverTitle>
                </PopoverHeader>
                <OptionRows options={OPTIONS} selected={selected} onSelect={setSelected} />
              </PopoverContent>
            </Popover>
          </Example>
          <Callout>
            Selection behavior is intentionally app-owned. The component owns the popover mechanics
            and shell; callers compose the rows they need.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="searchable" title="Searchable">
        <Example html={code.searchable}>
          <SearchableSelectionPopover />
        </Example>
      </DocSection>

      <DocSection id="form" title="Form">
        <Example html={code.form}>
          <FormPopover />
        </Example>
      </DocSection>

      <DocSection id="inline" title="Inline">
        <Example html={code.inline}>
          <InlinePopover />
        </Example>
      </DocSection>

      <DocSection id="opened" title="Opened">
        <Example html={code.opened}>
          <Popover open modal={false} triggerId="opened-popover-trigger">
            <PopoverTrigger id="opened-popover-trigger" render={<Button size="md" />}>
              <SlidersHorizontal />
              Filter
            </PopoverTrigger>
            <PopoverContent className="min-w-[220px]">
              <PopoverHeader>
                <PopoverTitle>Filter</PopoverTitle>
                <PopoverClose>Close</PopoverClose>
              </PopoverHeader>
              <OptionRows options={OPTIONS} selected="Unread" onSelect={() => undefined} />
            </PopoverContent>
          </Popover>
        </Example>
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="overflow-hidden rounded-sm border border-gray-200 text-sm">
          <div className="grid grid-cols-[1fr_1.4fr] bg-gray-50">
            <div className="border-r border-gray-200 px-3 py-2 text-gray-500">Old source entry</div>
            <div className="px-3 py-2 text-gray-500">New composition</div>
          </div>
          <div className="grid grid-cols-[1fr_1.4fr] border-t border-gray-200">
            <div className="border-r border-gray-200 p-3 text-gray-400 line-through">
              SelectionPopover
            </div>
            <div className="p-3">
              Popover + PopoverContent + PopoverHeader + PopoverTitle + composed rows/search
            </div>
          </div>
          <div className="border-t border-gray-200 p-3 text-gray-500">
            Source difference: the old component accepted an options prop and rendered a
            presentational floating panel. The new primitive preserves the UI shell while Base UI
            owns positioning/dismiss/focus and the caller composes filtering, rows, and selection.
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
