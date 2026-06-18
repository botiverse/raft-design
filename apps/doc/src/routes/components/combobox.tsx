import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  InlineCode,
} from "@slock/ui";
import { Check, Hash, LoaderCircle } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import messageSearchChannelFilterCompositionSource from "#/compositions/message-search-channel-filter-composition.tsx?raw";
import { MessageSearchChannelFilterComposition } from "#/compositions/message-search-channel-filter-composition.tsx";
import messageSearchSenderFilterCompositionSource from "#/compositions/message-search-sender-filter-composition.tsx?raw";
import { MessageSearchSenderFilterComposition } from "#/compositions/message-search-sender-filter-composition.tsx";
import tasksChannelFilterCompositionSource from "#/compositions/tasks-channel-filter-composition.tsx?raw";
import { TasksChannelFilterComposition } from "#/compositions/tasks-channel-filter-composition.tsx";
import tasksIdentityFilterCompositionSource from "#/compositions/tasks-identity-filter-composition.tsx?raw";
import { TasksIdentityFilterComposition } from "#/compositions/tasks-identity-filter-composition.tsx";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";
import { SelectionPopover as LegacySelectionPopover } from "../../../../../packages/ui/src/legacy/selection-popover.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  {
    id: "async-examples",
    title: "Async examples",
    children: [
      { id: "async-load-options", title: "Load options" },
      { id: "async-search", title: "Async search" },
      { id: "async-select", title: "Async select" },
    ],
  },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-message-channel", title: "Message channel" },
      { id: "source-comparison-message-sender", title: "Message sender" },
      { id: "source-comparison-tasks-channel", title: "Tasks channel" },
      { id: "source-comparison-tasks-identity", title: "Tasks identity" },
    ],
  },
] as const;

const TODOS = [
  "Add grouped rows only when a source callsite needs grouped search results",
] as const;

const channels = [
  { id: "unread", label: "#unread" },
  { id: "general", label: "#general" },
] as const;

type Channel = (typeof channels)[number];

type Repository = {
  id: string;
  label: string;
  description: string;
};

type Person = {
  id: string;
  label: string;
  handle: string;
};

type Branch = {
  id: string;
  label: string;
  description: string;
};

type PlaygroundValues = {
  open: boolean;
};

const repositories: readonly Repository[] = [
  { id: "raft-ui", label: "raft-ui", description: "Design system" },
  { id: "slock", label: "slock", description: "Workspace app" },
  { id: "source", label: "source", description: "Reference repo" },
];

const people: readonly Person[] = [
  { id: "me", label: "Me", handle: "@me" },
  { id: "atlas", label: "Atlas", handle: "@atlas" },
  { id: "emil", label: "Emil", handle: "@emil" },
  { id: "mika", label: "Mika", handle: "@mika" },
];

const branches: readonly Branch[] = [
  { id: "main", label: "main", description: "Production" },
  { id: "ui", label: "ui", description: "Current branch" },
  { id: "docs-combobox", label: "docs/combobox", description: "Docs patch" },
];

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function loadRepositories() {
  await wait(700);
  return repositories;
}

async function searchPeople(query: string) {
  await wait(450);

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return people.slice(0, 3);
  }

  return people.filter((person) =>
    `${person.label} ${person.handle}`.toLowerCase().includes(normalizedQuery),
  );
}

async function requestBranchChange() {
  await wait(750);
}

const COMBOBOX_BODY_SNIPPET = `  <ComboboxInputGroup>
    <ComboboxInput aria-label="Search channels" placeholder="Search..." suppressPasswordManager />
  </ComboboxInputGroup>
  <ComboboxList>
    {(channel) => (
      <ComboboxItem key={channel.id} value={channel}>
        <span className="flex min-w-0 items-center gap-2">
          <Hash size={12} />
          <span className="truncate leading-6">{channel.label}</span>
        </span>
        <ComboboxItemIndicator />
      </ComboboxItem>
    )}
  </ComboboxList>`;

const SNIPPETS = {
  anatomy: `import { useState } from "react";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@slock/ui";
import { Hash } from "lucide-react";

const channels = [
  { id: "unread", label: "#unread" },
  { id: "general", label: "#general" },
] as const;

function ChannelCombobox() {
  const [value, setValue] = useState<typeof channels[number] | null>(null);

  return (
    <Combobox
      items={channels}
      value={value}
      itemToStringLabel={(channel) => channel.label}
      onValueChange={setValue}
      autoHighlight
    >
      <ComboboxTrigger
        render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}
      >
        <Hash size={14} />
        {value?.label ?? "Channel"}
      </ComboboxTrigger>
      <ComboboxContent className="w-[220px]">
        <ComboboxHeader>
          <ComboboxLabel>Channels</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
${COMBOBOX_BODY_SNIPPET}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncOptions: `import { useEffect, useState } from "react";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@slock/ui";
import { LoaderCircle } from "lucide-react";

const repositories = [
  { id: "raft-ui", label: "raft-ui", description: "Design system" },
  { id: "slock", label: "slock", description: "Workspace app" },
  { id: "source", label: "source", description: "Reference repo" },
] as const;

async function loadRepositories() {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return repositories;
}

function RepositoryPicker() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<typeof repositories[number][]>([]);
  const [value, setValue] = useState<typeof repositories[number] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadRepositories().then((nextItems) => {
      if (!cancelled) {
        setItems([...nextItems]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Combobox
      items={items}
      value={value}
      itemToStringLabel={(item) => item.label}
      onValueChange={setValue}
      autoHighlight
    >
      <ComboboxTrigger
        render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}
      >
        {value?.label ?? "Repository"}
      </ComboboxTrigger>
      <ComboboxContent className="w-[240px]">
        <ComboboxHeader>
          <ComboboxLabel>Repository</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
        <ComboboxInputGroup>
          <ComboboxInput aria-label="Search repositories" placeholder="Search..." />
        </ComboboxInputGroup>
        {loading ? (
          <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted">
            <LoaderCircle className="size-3.5 animate-spin" />
            Loading
          </div>
        ) : items.length === 0 ? (
          <ComboboxEmpty>No repositories</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.id} value={item}>
                <span className="min-w-0">
                  <span className="block truncate leading-5">{item.label}</span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {item.description}
                  </span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncSearch: `import { useEffect, useState } from "react";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@slock/ui";
import { LoaderCircle } from "lucide-react";

const people = [
  { id: "me", label: "Me", handle: "@me" },
  { id: "atlas", label: "Atlas", handle: "@atlas" },
  { id: "emil", label: "Emil", handle: "@emil" },
  { id: "mika", label: "Mika", handle: "@mika" },
] as const;

async function searchPeople(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return people.slice(0, 3);
  }

  return people.filter((person) =>
    \`\${person.label} \${person.handle}\`.toLowerCase().includes(normalizedQuery),
  );
}

function AsyncSenderSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<typeof people[number][]>([]);
  const [value, setValue] = useState<typeof people[number] | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    void searchPeople(query).then((nextItems) => {
      if (!cancelled) {
        setItems([...nextItems]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <Combobox
      open
      inputValue={query}
      value={value}
      items={items}
      itemToStringLabel={(person) => person.label}
      onInputValueChange={(nextQuery, eventDetails) => {
        if (eventDetails.reason !== "item-press") {
          setQuery(nextQuery);
        }
      }}
      onValueChange={setValue}
      autoHighlight
    >
      <ComboboxTrigger
        render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}
      >
        {value?.label ?? "Sender"}
      </ComboboxTrigger>
      <ComboboxContent className="w-[240px]">
        <ComboboxHeader>
          <ComboboxLabel>Sender</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
        <ComboboxInputGroup>
          <ComboboxInput aria-label="Search senders" placeholder="Search..." />
        </ComboboxInputGroup>
        {loading ? (
          <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted">
            <LoaderCircle className="size-3.5 animate-spin" />
            Searching
          </div>
        ) : items.length === 0 ? (
          <ComboboxEmpty>No senders</ComboboxEmpty>
        ) : (
          <ComboboxList>
            {(person) => (
              <ComboboxItem key={person.id} value={person}>
                <span className="min-w-0">
                  <span className="block truncate leading-5">{person.label}</span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {person.handle}
                  </span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncSelect: `import { useEffect, useRef, useState } from "react";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@slock/ui";
import { Check, LoaderCircle } from "lucide-react";

const branches = [
  { id: "main", label: "main", description: "Production" },
  { id: "ui", label: "ui", description: "Current branch" },
  { id: "docs-combobox", label: "docs/combobox", description: "Docs patch" },
] as const;

async function requestBranchChange() {
  await new Promise((resolve) => setTimeout(resolve, 750));
}

function AsyncBranchSelect() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<typeof branches[number] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const lockCloseRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function handleValueChange(nextValue: typeof branches[number] | null) {
    if (!nextValue || pendingId) {
      return;
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    lockCloseRef.current = true;
    setPendingId(nextValue.id);
    setConfirmedId(null);
    await requestBranchChange();
    setValue(nextValue);
    setPendingId(null);
    setConfirmedId(nextValue.id);

    closeTimerRef.current = setTimeout(() => {
      lockCloseRef.current = false;
      setOpen(false);
      setConfirmedId(null);
    }, 500);
  }

  return (
    <Combobox
      open={open}
      value={value}
      items={branches}
      itemToStringLabel={(branch) => branch.label}
      onOpenChange={(nextOpen) => {
        if (!lockCloseRef.current) {
          setOpen(nextOpen);
        }
      }}
      onValueChange={handleValueChange}
      autoHighlight
    >
      <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
        {value?.label ?? "Branch"}
      </ComboboxTrigger>
      <ComboboxContent className="w-[240px]">
        <ComboboxHeader>
          <ComboboxLabel>Branch</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
        <ComboboxInputGroup>
          <ComboboxInput aria-label="Search branches" placeholder="Search..." />
        </ComboboxInputGroup>
        <ComboboxList>
          {(branch) => (
            <ComboboxItem
              key={branch.id}
              value={branch}
              disabled={pendingId !== null && pendingId !== branch.id}
            >
              <span className="min-w-0">
                <span className="block truncate leading-5">{branch.label}</span>
                <span className="block truncate text-xs text-foreground-muted">
                  {branch.description}
                </span>
              </span>
              {pendingId === branch.id ? (
                <LoaderCircle className="ml-auto size-3.5 animate-spin" />
              ) : confirmedId === branch.id ? (
                <Check className="ml-auto size-3.5" />
              ) : (
                <ComboboxItemIndicator />
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Combobox",
    type: "Base UI Combobox.Root.Props",
    description:
      "Owns selected value, input value, filtering, highlighted item, Escape, and Enter selection.",
  },
  {
    name: "ComboboxTrigger",
    type: "Base UI Combobox.Trigger.Props",
    description: "Optional trigger part for opening a picker from a button-like control.",
  },
  {
    name: "ComboboxInput",
    type: "Base UI Combobox.Input.Props",
    description: "Search input. Supports password-manager suppression for compact filter panels.",
  },
  {
    name: "ComboboxContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled popup shell. Defaults to side=bottom, align=start, sideOffset=4, and local collision props.",
  },
  {
    name: "ComboboxHeader",
    type: "div props",
    description: "Header row for picker titles and trailing actions.",
  },
  {
    name: "ComboboxSeparator",
    type: "div props",
    description: "Horizontal divider between composed combobox regions.",
  },
  {
    name: "ComboboxPopup",
    type: "div props",
    description:
      "Unpositioned popup shell for advanced static rendering. Prefer ComboboxContent for trigger-anchored pickers.",
  },
  {
    name: "ComboboxList",
    type: "Base UI Combobox.List.Props",
    description: "Renders filtered items, usually through the list render function.",
  },
  {
    name: "ComboboxItem",
    type: "Base UI Combobox.Item.Props",
    description:
      "Selectable option row. Selection/highlight state is exposed through data attributes.",
  },
  {
    name: "ComboboxItemIndicator",
    type: "Base UI Combobox.ItemIndicator.Props",
    description: "Selected-state indicator for single and multiple selection.",
  },
  {
    name: "ComboboxClear",
    type: "Base UI Combobox.Clear.Props",
    description: "Clears the current input and selected value through the primitive.",
  },
];

const HASH_LEADING = <Hash size={12} className="text-black/50" />;

const MESSAGE_SEARCH_CHANNEL_FILTER_COMPOSITION_PATH =
  "apps/doc/src/compositions/message-search-channel-filter-composition.tsx" as const;
const MESSAGE_SEARCH_SENDER_FILTER_COMPOSITION_PATH =
  "apps/doc/src/compositions/message-search-sender-filter-composition.tsx" as const;
const TASKS_CHANNEL_FILTER_COMPOSITION_PATH =
  "apps/doc/src/compositions/tasks-channel-filter-composition.tsx" as const;
const TASKS_IDENTITY_FILTER_COMPOSITION_PATH =
  "apps/doc/src/compositions/tasks-identity-filter-composition.tsx" as const;

const COMPACT_LIST_AVATAR = (
  <LegacyAvatarSlot
    context="compact-list"
    type="human"
    humanAvatarUrl={null}
    gravatarHash={null}
    email={null}
  />
);

export const Route = createFileRoute("/components/combobox")({
  component: ComboboxDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        messageSearchChannelFilterComposition: messageSearchChannelFilterCompositionSource,
        messageSearchSenderFilterComposition: messageSearchSenderFilterCompositionSource,
        tasksChannelFilterComposition: tasksChannelFilterCompositionSource,
        tasksIdentityFilterComposition: tasksIdentityFilterCompositionSource,
      },
    }),
});

const noop = () => undefined;

function SourcePanelMount({
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

function SourceMessageSearchChannelComparison() {
  return (
    <SourcePanelMount>
      <LegacySelectionPopover
        title="Channels"
        searchable
        search=""
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
    </SourcePanelMount>
  );
}

function SourceMessageSearchSenderComparison() {
  return (
    <SourcePanelMount>
      <LegacySelectionPopover
        title="From"
        searchable
        search=""
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
    </SourcePanelMount>
  );
}

function SourceTasksChannelFilterComparison() {
  return (
    <SourcePanelMount>
      <LegacySelectionPopover
        title="Channels"
        searchable
        search=""
        onSearchChange={noop}
        showClear
        onClear={noop}
        options={[
          { key: "design", checked: true, label: "#design", leading: HASH_LEADING, onClick: noop },
          { key: "dev", checked: false, label: "#dev", leading: HASH_LEADING, onClick: noop },
        ]}
      />
    </SourcePanelMount>
  );
}

function SourceTasksIdentityFilterComparison() {
  return (
    <SourcePanelMount>
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
    </SourcePanelMount>
  );
}

function ComboboxBody() {
  return (
    <>
      <ComboboxHeader>
        <ComboboxLabel>Channels</ComboboxLabel>
        <ComboboxClear>Clear</ComboboxClear>
      </ComboboxHeader>
      <ComboboxSeparator />
      <ComboboxInputGroup>
        <ComboboxInput
          aria-label="Search channels"
          placeholder="Search..."
          suppressPasswordManager
        />
      </ComboboxInputGroup>
      <ComboboxList>
        {(channel: Channel) => (
          <ComboboxItem key={channel.id} value={channel}>
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center">
                <Hash
                  size={12}
                  className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50"
                />
              </span>
              <span className="truncate leading-6">{channel.label}</span>
            </span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );
}

function PreviewCombobox({ open }: PlaygroundValues) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(channels[0]);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Channel>
        open={open}
        items={channels}
        value={selectedChannel}
        itemToStringLabel={(channel) => channel.label}
        onValueChange={setSelectedChannel}
        autoHighlight
      >
        <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
          <Hash aria-hidden size={14} />
          {selectedChannel?.label ?? "Channel"}
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <ComboboxBody />
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function AsyncOptionsCombobox() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Repository[]>([]);
  const [value, setValue] = useState<Repository | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    void loadRepositories().then((nextItems) => {
      if (!cancelled) {
        setItems([...nextItems]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Repository>
        open={open}
        value={value}
        items={items}
        itemToStringLabel={(repository) => repository.label}
        onOpenChange={setOpen}
        onValueChange={setValue}
        autoHighlight
      >
        <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
          {value?.label ?? "Repository"}
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[240px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Repository</ComboboxLabel>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search repositories"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          {loading ? (
            <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black/60">
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
              Loading
            </div>
          ) : items.length === 0 ? (
            <ComboboxEmpty>No repositories</ComboboxEmpty>
          ) : (
            <ComboboxList>
              {(repository: Repository) => (
                <ComboboxItem key={repository.id} value={repository}>
                  <span className="min-w-0">
                    <span className="block truncate leading-5">{repository.label}</span>
                    <span className="block truncate text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/50">
                      {repository.description}
                    </span>
                  </span>
                  <ComboboxItemIndicator />
                </ComboboxItem>
              )}
            </ComboboxList>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function AsyncSearchCombobox() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Person[]>([]);
  const [value, setValue] = useState<Person | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    void searchPeople(query).then((nextItems) => {
      if (!cancelled) {
        setItems([...nextItems]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Person>
        open
        inputValue={query}
        value={value}
        items={items}
        itemToStringLabel={(person) => person.label}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setQuery(nextQuery);
          }
        }}
        onValueChange={setValue}
        autoHighlight
      >
        <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
          {value?.label ?? "Sender"}
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[240px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Sender</ComboboxLabel>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search senders"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          {loading ? (
            <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black/60">
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
              Searching
            </div>
          ) : items.length === 0 ? (
            <ComboboxEmpty>No senders</ComboboxEmpty>
          ) : (
            <ComboboxList>
              {(person: Person) => (
                <ComboboxItem key={person.id} value={person}>
                  <span className="min-w-0">
                    <span className="block truncate leading-5">{person.label}</span>
                    <span className="block truncate text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/50">
                      {person.handle}
                    </span>
                  </span>
                  <ComboboxItemIndicator />
                </ComboboxItem>
              )}
            </ComboboxList>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function AsyncSelectCombobox() {
  const portalRef = useRef<HTMLDivElement>(null);
  const lockCloseRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Branch | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function handleValueChange(nextValue: Branch | null) {
    if (!nextValue || pendingId) {
      return;
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    lockCloseRef.current = true;
    setPendingId(nextValue.id);
    setConfirmedId(null);
    await requestBranchChange();
    setValue(nextValue);
    setPendingId(null);
    setConfirmedId(nextValue.id);

    closeTimerRef.current = setTimeout(() => {
      lockCloseRef.current = false;
      setOpen(false);
      setConfirmedId(null);
    }, 500);
  }

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Branch>
        open={open}
        value={value}
        items={branches}
        itemToStringLabel={(branch) => branch.label}
        onOpenChange={(nextOpen) => {
          if (!lockCloseRef.current) {
            setOpen(nextOpen);
          }
        }}
        onValueChange={handleValueChange}
        autoHighlight
      >
        <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
          {value?.label ?? "Branch"}
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[240px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Branch</ComboboxLabel>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search branches"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(branch: Branch) => (
              <ComboboxItem
                key={branch.id}
                value={branch}
                disabled={pendingId !== null && pendingId !== branch.id}
              >
                <span className="min-w-0">
                  <span className="block truncate leading-5">{branch.label}</span>
                  <span className="block truncate text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/50">
                    {branch.description}
                  </span>
                </span>
                {pendingId === branch.id ? (
                  <LoaderCircle aria-hidden className="ml-auto size-3.5 animate-spin" />
                ) : confirmedId === branch.id ? (
                  <Check aria-hidden className="ml-auto size-3.5 stroke-[1.5]" />
                ) : (
                  <ComboboxItemIndicator />
                )}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function ComboboxDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Combobox"
      description="A searchable selection primitive for typed option picking."
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Use Combobox when the user searches, highlights, and selects structured options. Use
          Popover only for generic floating panels.
        </p>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            open: true,
          }}
          controls={[{ name: "open", label: "Open", type: "boolean" }]}
          previewClassName="min-h-[24rem] items-start pt-24"
          render={(values) => <PreviewCombobox {...values} />}
        />
      </DocSection>

      <DocSection id="async-examples" title="Async examples">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 id="async-load-options" className="scroll-mt-24 text-sm font-medium">
              Load options
            </h3>
            <Example html={code.asyncOptions} previewClassName="min-h-[22rem] items-start pt-24">
              <AsyncOptionsCombobox />
            </Example>
          </div>
          <div className="space-y-3">
            <h3 id="async-search" className="scroll-mt-24 text-sm font-medium">
              Async search
            </h3>
            <Example html={code.asyncSearch} previewClassName="min-h-[20rem]">
              <AsyncSearchCombobox />
            </Example>
          </div>
          <div className="space-y-3">
            <h3 id="async-select" className="scroll-mt-24 text-sm font-medium">
              Async select
            </h3>
            <Example html={code.asyncSelect} previewClassName="min-h-[22rem] items-start pt-24">
              <AsyncSelectCombobox />
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Combobox.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="popover"
          items={[
            {
              id: "source-comparison-message-channel",
              label: "Message search — channel filter",
              status: "difference",
              note: (
                <>
                  <InlineCode>MessageSearchPage.tsx</InlineCode>. Searchable channel picker. Hash
                  rows. Enter selects the first match.
                </>
              ),
              source: <SourceMessageSearchChannelComparison />,
              brutal: <MessageSearchChannelFilterComposition />,
              elegant: <MessageSearchChannelFilterComposition />,
              elegantDark: <MessageSearchChannelFilterComposition />,
              compositionCode: code.messageSearchChannelFilterComposition,
              compositionCollapsedCode: code.messageSearchChannelFilterCompositionBody,
              compositionPath: MESSAGE_SEARCH_CHANNEL_FILTER_COMPOSITION_PATH,
              compositionSource: messageSearchChannelFilterCompositionSource,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-message-sender",
              label: "Message search — sender filter",
              status: "difference",
              note: (
                <>
                  <InlineCode>MessageSearchPage.tsx</InlineCode>. Searchable sender picker. Avatar
                  rows. Clear resets the value.
                </>
              ),
              source: <SourceMessageSearchSenderComparison />,
              brutal: <MessageSearchSenderFilterComposition />,
              elegant: <MessageSearchSenderFilterComposition />,
              elegantDark: <MessageSearchSenderFilterComposition />,
              compositionCode: code.messageSearchSenderFilterComposition,
              compositionCollapsedCode: code.messageSearchSenderFilterCompositionBody,
              compositionPath: MESSAGE_SEARCH_SENDER_FILTER_COMPOSITION_PATH,
              compositionSource: messageSearchSenderFilterCompositionSource,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-tasks-channel",
              label: "Tasks — channel filter",
              status: "difference",
              note: (
                <>
                  <InlineCode>TasksPanel.tsx</InlineCode>. Searchable multi-select channel picker.
                  Selected rows stay visible.
                </>
              ),
              source: <SourceTasksChannelFilterComparison />,
              brutal: <TasksChannelFilterComposition />,
              elegant: <TasksChannelFilterComposition />,
              elegantDark: <TasksChannelFilterComposition />,
              compositionCode: code.tasksChannelFilterComposition,
              compositionCollapsedCode: code.tasksChannelFilterCompositionBody,
              compositionPath: TASKS_CHANNEL_FILTER_COMPOSITION_PATH,
              compositionSource: tasksChannelFilterCompositionSource,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-tasks-identity",
              label: "Tasks — identity filter",
              status: "difference",
              note: (
                <>
                  <InlineCode>TasksPanel.tsx</InlineCode>. Searchable assignee picker. Sentinel and
                  avatar rows share one list.
                </>
              ),
              source: <SourceTasksIdentityFilterComparison />,
              brutal: <TasksIdentityFilterComposition />,
              elegant: <TasksIdentityFilterComposition />,
              elegantDark: <TasksIdentityFilterComposition />,
              compositionCode: code.tasksIdentityFilterComposition,
              compositionCollapsedCode: code.tasksIdentityFilterCompositionBody,
              compositionPath: TASKS_IDENTITY_FILTER_COMPOSITION_PATH,
              compositionSource: tasksIdentityFilterCompositionSource,
              compositionShowLineNumbers: false,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
