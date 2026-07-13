import { createFileRoute } from "@tanstack/react-router";
import {
  Combobox,
  ComboboxClear,
  ComboboxControl,
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
  ComboboxTriggerIndicator,
  Field,
  FieldLabel,
  InlineCode,
} from "raft-ui";
import {
  AtSign,
  Check,
  ChevronDown,
  CircleAlert,
  Folder,
  GitBranch,
  Hash,
  Loader,
  Megaphone,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  mockMutationOptions,
  mockQueryOptions,
  runMockMutation,
  useMockQuery,
} from "#/lib/mock-query.ts";
import { models, type Model } from "#/modules/combobox/combobox.constants.ts";
import { PreviewCombobox } from "#/modules/combobox/combobox.preview.tsx";
import composerMentionComboboxCompositionSource from "#/modules/combobox/compositions/composer-mention-combobox.composition.tsx?raw";
import { ComposerMentionComboboxComposition } from "#/modules/combobox/compositions/composer-mention-combobox.composition.tsx";
import messageSearchChannelFilterCompositionSource from "#/modules/combobox/compositions/message-search-channel-filter.composition.tsx?raw";
import { MessageSearchChannelFilterComposition } from "#/modules/combobox/compositions/message-search-channel-filter.composition.tsx";
import messageSearchSenderFilterCompositionSource from "#/modules/combobox/compositions/message-search-sender-filter.composition.tsx?raw";
import { MessageSearchSenderFilterComposition } from "#/modules/combobox/compositions/message-search-sender-filter.composition.tsx";
import selectionPopoverComboboxCompositionSource from "#/modules/combobox/compositions/selection-popover-combobox.composition.tsx?raw";
import { SelectionPopoverComboboxComposition } from "#/modules/combobox/compositions/selection-popover-combobox.composition.tsx";
import tasksChannelFilterCompositionSource from "#/modules/combobox/compositions/tasks-channel-filter.composition.tsx?raw";
import { TasksChannelFilterComposition } from "#/modules/combobox/compositions/tasks-channel-filter.composition.tsx";
import tasksIdentityFilterCompositionSource from "#/modules/combobox/compositions/tasks-identity-filter.composition.tsx?raw";
import { TasksIdentityFilterComposition } from "#/modules/combobox/compositions/tasks-identity-filter.composition.tsx";
import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";
import { SelectionPopover as LegacySelectionPopover } from "../../../../../packages/ui/src/legacy/selection-popover.tsx";

const TOC = [
  {
    id: "searchable-combobox",
    title: "Searchable combobox",
    children: [
      { id: "preview", title: "Preview" },
      { id: "anatomy", title: "Anatomy" },
      { id: "async-search", title: "Async search" },
    ],
  },
  {
    id: "dropdown-combobox",
    title: "Dropdown combobox",
    children: [
      { id: "button-trigger", title: "Button trigger" },
      { id: "async-load-options", title: "Load options" },
      { id: "async-select", title: "Async select" },
    ],
  },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-message-channel", title: "Message channel" },
      { id: "source-comparison-message-sender", title: "Message sender" },
      { id: "source-comparison-composer-mention", title: "Composer mention" },
      { id: "source-comparison-selection-popover", title: "Selection popover" },
      { id: "source-comparison-tasks-channel", title: "Tasks channel" },
      { id: "source-comparison-tasks-identity", title: "Tasks identity" },
    ],
  },
] as const;
const SOURCE_SCENES = [
  {
    label: "Message search filters",
    scenes: [
      {
        label: "MessageSearchPage.tsx:742",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:742",
      },
      {
        label: "MessageSearchPage.tsx:816",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:816",
      },
    ],
  },
  {
    label: "Task filters",
    scenes: [
      {
        label: "TasksPanel.tsx:442",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TasksPanel.tsx:442",
      },
      {
        label: "TasksPanel.tsx:865",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TasksPanel.tsx:865",
      },
    ],
  },
  {
    label: "Composer and selection popovers",
    scenes: [
      {
        label: "MessageInput.tsx:928",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:928",
      },
      {
        label: "InlineBadgeEditor.tsx:209",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/InlineBadgeEditor.tsx:209",
      },
      {
        label: "SelectionPopover.tsx:105,157",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SelectionPopover.tsx:105,157",
      },
    ],
  },
] as const;

const channels = [
  { id: "all", label: "All messages", Icon: MessagesSquare },
  { id: "mentions", label: "Mentions", Icon: AtSign },
  { id: "incidents", label: "Incidents", Icon: CircleAlert },
  { id: "releases", label: "Releases", Icon: Megaphone },
] as const;

type Channel = (typeof channels)[number];

type Repository = {
  id: string;
  label: string;
  description: string;
};

type Branch = {
  id: string;
  label: string;
  description: string;
};

const repositories: readonly Repository[] = [
  { id: "raft-ui", label: "raft-ui", description: "Design system" },
  { id: "raft", label: "raft", description: "Workspace app" },
  { id: "source", label: "source", description: "Reference repo" },
];

const branches: readonly Branch[] = [
  { id: "main", label: "main", description: "Production" },
  { id: "ui", label: "ui", description: "Current branch" },
  { id: "docs-combobox", label: "docs/combobox", description: "Docs patch" },
];

const repositoryQuery = mockQueryOptions({
  queryKey: ["combobox", "repositories"],
  delayMs: 700,
  shouldFail: false,
  queryFn: () => repositories,
});

const modelSearchQuery = mockQueryOptions({
  queryKey: ["combobox", "model-search"],
  delayMs: 450,
  shouldFail: false,
  queryFn: (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return models.slice(0, 3);
    }

    return models.filter((model) =>
      `${model.label} ${model.description}`.toLowerCase().includes(normalizedQuery),
    );
  },
});

const branchChangeMutation = mockMutationOptions({
  mutationKey: ["combobox", "branch-change"],
  delayMs: 750,
  shouldFail: false,
  mutationFn: () => undefined,
});

function requestBranchChange() {
  return runMockMutation(branchChangeMutation);
}

const CHANNEL_LIST_SNIPPET = `  <ComboboxList>
    {(channel) => {
      const ChannelIcon = channel.Icon;

      return (
        <ComboboxItem key={channel.id} value={channel}>
          <span className="flex min-w-0 items-center gap-1.5">
            <ChannelIcon />
            <span className="truncate leading-6">{channel.label}</span>
          </span>
          <ComboboxItemIndicator />
        </ComboboxItem>
      );
    }}
  </ComboboxList>
  <ComboboxEmpty>No channels found</ComboboxEmpty>`;

const COMBOBOX_BODY_SNIPPET = `  <ComboboxInputGroup>
    <ComboboxInput aria-label="Search scopes" placeholder="Search scope..." suppressPasswordManager />
  </ComboboxInputGroup>
${CHANNEL_LIST_SNIPPET}`;

const SNIPPETS = {
  anatomy: `<Combobox>
  <Field>
    <FieldLabel />
    <ComboboxControl>
      <ComboboxInput />
      <ComboboxClear />
      <ComboboxTriggerIndicator />
    </ComboboxControl>
  </Field>
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem>
        <ComboboxItemIndicator />
      </ComboboxItem>
    </ComboboxList>
    <ComboboxEmpty />
  </ComboboxContent>
</Combobox>`,
  buttonTrigger: `import { useState } from "react";
import {
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
  ComboboxTriggerIndicator,
} from "raft-ui";

const channels = [
  { id: "all", label: "All messages", Icon: MessagesSquare },
  { id: "mentions", label: "Mentions", Icon: AtSign },
  { id: "incidents", label: "Incidents", Icon: CircleAlert },
  { id: "releases", label: "Releases", Icon: Megaphone },
] as const;

function ChannelFilterCombobox() {
  const [value, setValue] = useState<typeof channels[number] | null>(channels[0]);

  return (
    <Combobox
      items={channels}
      value={value}
      itemToStringLabel={(channel) => channel.label}
      onValueChange={setValue}
      autoHighlight
    >
      <ComboboxTrigger className="h-8 w-36 py-0">
        <MessagesSquare />
        {value?.label ?? "Channel"}
        <ComboboxTriggerIndicator>
          <ChevronDown aria-hidden />
        </ComboboxTriggerIndicator>
      </ComboboxTrigger>
      <ComboboxContent className="w-[220px]">
        <ComboboxHeader>
          <ComboboxLabel>Search scope</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
${COMBOBOX_BODY_SNIPPET}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncOptions: `import { useState } from "react";
import {
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
  ComboboxTriggerIndicator,
} from "raft-ui";
import { mockQueryOptions, useMockQuery } from "#/lib/mock-query.ts";

const repositories = [
  { id: "raft-ui", label: "raft-ui", description: "Design system" },
  { id: "raft", label: "raft", description: "Workspace app" },
  { id: "source", label: "source", description: "Reference repo" },
] as const;

const repositoryQuery = mockQueryOptions({
  queryKey: ["combobox", "repositories"],
  delayMs: 700,
  shouldFail: false,
  queryFn: () => repositories,
});

function RepositoryPicker() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<typeof repositories[number] | null>(null);
  const { data: items = [], isLoading } = useMockQuery({
    query: repositoryQuery,
    enabled: open,
    clearOnFetch: true,
  });

  function renderRepositoryItems() {
    if (isLoading) {
      return (
        <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black/60">
          <Loader aria-hidden className="size-3.5 animate-spin" />
          Loading
        </div>
      );
    }

    if (items.length === 0) {
      return <ComboboxEmpty>No repositories</ComboboxEmpty>;
    }

    return (
      <ComboboxList>
        {(repository: Repository) => (
          <ComboboxItem key={repository.id} value={repository}>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-4 shrink-0 items-center justify-center">
                <Folder className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
              </span>
              <span className="truncate leading-6">{repository.label}</span>
            </span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
    );
  }

  return (
    <Combobox
      open={open}
      items={items}
      value={value}
      itemToStringLabel={(item) => item.label}
      onOpenChange={setOpen}
      onValueChange={setValue}
      autoHighlight
    >
      <ComboboxTrigger className="h-8 w-36 py-0">
        <Folder />
        <span className="min-w-0 truncate text-left">
          {value ? \`Repository: \${value.label}\` : "Choose repository"}
        </span>
        <ComboboxTriggerIndicator>
          <ChevronDown aria-hidden />
        </ComboboxTriggerIndicator>
      </ComboboxTrigger>
      <ComboboxContent className="w-[220px]">
        <ComboboxHeader>
          <ComboboxLabel>Repository</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
        <ComboboxInputGroup>
          <ComboboxInput aria-label="Search repositories" placeholder="Search..." />
        </ComboboxInputGroup>
        {renderRepositoryItems()}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncSearch: `import { useState } from "react";
import {
  Combobox,
  ComboboxClear,
  ComboboxControl,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTriggerIndicator,
  Field,
  FieldLabel,
} from "raft-ui";
import { mockQueryOptions, useMockQuery } from "#/lib/mock-query.ts";

const models = [
  { id: "reasoning", label: "Raft Reasoning", description: "Long-context planning" },
  { id: "fast", label: "Raft Fast", description: "Low-latency responses" },
  { id: "vision", label: "Raft Vision", description: "Image understanding" },
  { id: "code", label: "Raft Code", description: "Repository-aware coding" },
] as const;

const modelSearchQuery = mockQueryOptions({
  queryKey: ["combobox", "model-search"],
  delayMs: 450,
  shouldFail: false,
  queryFn: (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return models.slice(0, 3);
    }

    return models.filter((model) =>
      \`\${model.label} \${model.description}\`.toLowerCase().includes(normalizedQuery),
    );
  },
});

function AsyncModelSearch() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [value, setValue] = useState<typeof models[number] | null>(null);
  const { data: items = [], isLoading } = useMockQuery({
    query: modelSearchQuery,
    variables: searchQuery,
    clearOnFetch: true,
  });

  function renderModelItems() {
    if (isLoading) {
      return (
        <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted">
          <Loader className="size-3.5 animate-spin" />
          Searching
        </div>
      );
    }

    if (items.length === 0) {
      return <ComboboxEmpty>No models found</ComboboxEmpty>;
    }

    return (
      <ComboboxList>
        {(model) => (
          <ComboboxItem key={model.id} value={model}>
            <span className="truncate leading-6">{model.label}</span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
    );
  }

  return (
    <Combobox
      open
      inputValue={inputValue}
      value={value}
      items={items}
      itemToStringLabel={(model) => model.label}
      onInputValueChange={(nextQuery, eventDetails) => {
        if (eventDetails.reason !== "item-press") {
          setInputValue(nextQuery);
          setSearchQuery(nextQuery);
        }
      }}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        if (nextValue) {
          setInputValue(nextValue.label);
        }
      }}
      autoHighlight
    >
      <Field className="w-56 gap-1.5">
        <FieldLabel>Model</FieldLabel>
        <ComboboxControl>
          <Sparkles aria-hidden className="text-foreground-muted" />
          <ComboboxInput aria-label="Search models" placeholder="Search models..." />
          <ComboboxClear aria-label="Clear model" />
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxControl>
      </Field>
      <ComboboxContent className="w-[var(--anchor-width)]">
        {renderModelItems()}
      </ComboboxContent>
    </Combobox>
  );
}`,
  asyncSelect: `import { useEffect, useRef, useState } from "react";
import {
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
  ComboboxTriggerIndicator,
} from "raft-ui";
import { mockMutationOptions, runMockMutation } from "#/lib/mock-query.ts";

const branches = [
  { id: "main", label: "main", description: "Production" },
  { id: "ui", label: "ui", description: "Current branch" },
  { id: "docs-combobox", label: "docs/combobox", description: "Docs patch" },
] as const;

const branchChangeMutation = mockMutationOptions({
  mutationKey: ["combobox", "branch-change"],
  delayMs: 750,
  shouldFail: false,
  mutationFn: () => undefined,
});

function requestBranchChange() {
  return runMockMutation(branchChangeMutation);
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
      <ComboboxTrigger className="h-8 w-36 py-0">
        <GitBranch />
        <span className="min-w-0 truncate text-left">
          {value ? \`Branch: \${value.label}\` : "Choose branch"}
        </span>
        <ComboboxTriggerIndicator>
          <ChevronDown aria-hidden />
        </ComboboxTriggerIndicator>
      </ComboboxTrigger>
      <ComboboxContent className="w-[220px]">
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
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <GitBranch />
                </span>
                <span className="truncate leading-6">{branch.label}</span>
              </span>
              {pendingId === branch.id ? (
                <Loader className="ml-auto size-3.5 animate-spin" />
              ) : confirmedId === branch.id ? (
                <Check className="ml-auto size-3.5" />
              ) : (
                <ComboboxItemIndicator />
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No branches found</ComboboxEmpty>
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
    name: "ComboboxControl",
    type: "Base UI Combobox.InputGroup.Props",
    description:
      "Input-first control surface. Use it when the visible combobox trigger should be searchable; plain SVG children get the component's default icon size.",
  },
  {
    name: "ComboboxTrigger",
    type: "Base UI Combobox.Trigger.Props",
    description:
      "Button trigger for picker-style filters where the search input lives inside the popup.",
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

const HASH_LEADING = <Hash className="text-black/50" />;

const MESSAGE_SEARCH_CHANNEL_FILTER_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/message-search-channel-filter.composition.tsx" as const;
const MESSAGE_SEARCH_SENDER_FILTER_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/message-search-sender-filter.composition.tsx" as const;
const COMPOSER_MENTION_COMBOBOX_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/composer-mention-combobox.composition.tsx" as const;
const SELECTION_POPOVER_COMBOBOX_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/selection-popover-combobox.composition.tsx" as const;
const TASKS_CHANNEL_FILTER_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/tasks-channel-filter.composition.tsx" as const;
const TASKS_IDENTITY_FILTER_COMPOSITION_PATH =
  "apps/doc/src/modules/combobox/compositions/tasks-identity-filter.composition.tsx" as const;

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
        composerMentionComboboxComposition: composerMentionComboboxCompositionSource,
        messageSearchChannelFilterComposition: messageSearchChannelFilterCompositionSource,
        messageSearchSenderFilterComposition: messageSearchSenderFilterCompositionSource,
        selectionPopoverComboboxComposition: selectionPopoverComboboxCompositionSource,
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

function SourceComposerMentionComparison() {
  return (
    <SourcePanelMount contentClassName="w-[18rem]">
      <LegacySelectionPopover
        title="Mentions"
        searchable
        search="at"
        onSearchChange={noop}
        options={[
          {
            key: "atlas",
            checked: true,
            label: "Atlas",
            reserveLeadingSlot: true,
            avatar: COMPACT_LIST_AVATAR,
            onClick: noop,
          },
          {
            key: "avery",
            checked: false,
            label: "Avery",
            reserveLeadingSlot: true,
            avatar: COMPACT_LIST_AVATAR,
            onClick: noop,
          },
          {
            key: "design-notes",
            checked: false,
            label: "Design notes",
            reserveLeadingSlot: true,
            onClick: noop,
          },
        ]}
      />
    </SourcePanelMount>
  );
}

function SourceSelectionPopoverComparison() {
  return (
    <SourcePanelMount contentClassName="w-[18rem]">
      <LegacySelectionPopover
        title="Labels"
        searchable
        search=""
        onSearchChange={noop}
        showClear
        onClear={noop}
        options={[
          { key: "design", checked: true, label: "Design", leading: HASH_LEADING, onClick: noop },
          { key: "bug", checked: false, label: "Bug", leading: HASH_LEADING, onClick: noop },
          { key: "review", checked: false, label: "Review", leading: HASH_LEADING, onClick: noop },
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
        <ComboboxLabel>Search scope</ComboboxLabel>
        <ComboboxClear>Clear</ComboboxClear>
      </ComboboxHeader>
      <ComboboxSeparator />
      <ComboboxInputGroup>
        <ComboboxInput
          aria-label="Search scopes"
          placeholder="Search scope..."
          suppressPasswordManager
        />
      </ComboboxInputGroup>
      <ComboboxChannelList />
    </>
  );
}

function ComboboxChannelList() {
  return (
    <>
      <ComboboxList>
        {(channel: Channel) => {
          const ChannelIcon = channel.Icon;

          return (
            <ComboboxItem key={channel.id} value={channel}>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <ChannelIcon className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
                </span>
                <span className="truncate leading-6">{channel.label}</span>
              </span>
              <ComboboxItemIndicator />
            </ComboboxItem>
          );
        }}
      </ComboboxList>
      <ComboboxEmpty>No channels found</ComboboxEmpty>
    </>
  );
}

function ButtonTriggerCombobox() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(channels[0]);
  const SelectedChannelIcon = selectedChannel?.Icon ?? MessagesSquare;

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Channel>
        open
        items={channels}
        value={selectedChannel}
        itemToStringLabel={(channel) => channel.label}
        onValueChange={setSelectedChannel}
        autoHighlight
      >
        <ComboboxTrigger className="h-8 w-36 py-0">
          <SelectedChannelIcon aria-hidden />
          {selectedChannel?.label ?? "Channel"}
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
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
  const [value, setValue] = useState<Repository | null>(null);
  const { data: items = [], isLoading } = useMockQuery({
    query: repositoryQuery,
    enabled: open,
    clearOnFetch: true,
  });

  function renderRepositoryItems() {
    if (isLoading) {
      return (
        <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black/60">
          <Loader aria-hidden className="size-3.5 animate-spin" />
          Loading
        </div>
      );
    }

    if (items.length === 0) {
      return <ComboboxEmpty>No repositories</ComboboxEmpty>;
    }

    return (
      <ComboboxList>
        {(repository: Repository) => (
          <ComboboxItem key={repository.id} value={repository}>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-4 shrink-0 items-center justify-center">
                <Folder className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
              </span>
              <span className="truncate leading-6">{repository.label}</span>
            </span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
    );
  }

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
        <ComboboxTrigger className="h-8 w-36 py-0">
          <Folder aria-hidden />
          <span className="min-w-0 truncate text-left">
            {value ? `Repository: ${value.label}` : "Choose repository"}
          </span>
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
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
          {renderRepositoryItems()}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function AsyncSearchCombobox() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [value, setValue] = useState<Model | null>(null);
  const { data: items = [], isLoading } = useMockQuery({
    query: modelSearchQuery,
    variables: searchQuery,
    clearOnFetch: true,
  });

  function renderModelItems() {
    if (isLoading) {
      return (
        <div className="flex h-24 items-center justify-center gap-2 text-sm text-foreground-muted [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black/60">
          <Loader aria-hidden className="size-3.5 animate-spin" />
          Searching
        </div>
      );
    }

    if (items.length === 0) {
      return <ComboboxEmpty>No models found</ComboboxEmpty>;
    }

    return (
      <ComboboxList>
        {(model: Model) => (
          <ComboboxItem key={model.id} value={model}>
            <span className="truncate leading-6">{model.label}</span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
    );
  }

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Model>
        open
        inputValue={inputValue}
        value={value}
        items={items}
        itemToStringLabel={(model) => model.label}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setInputValue(nextQuery);
            setSearchQuery(nextQuery);
          }
        }}
        onValueChange={(nextValue) => {
          setValue(nextValue);
          if (nextValue) {
            setInputValue(nextValue.label);
          }
        }}
        autoHighlight
      >
        <Field className="w-56 gap-1.5">
          <FieldLabel>Model</FieldLabel>
          <ComboboxControl>
            <Sparkles
              aria-hidden
              className="text-foreground-muted [[data-theme=brutal]_&]:text-black/60"
            />
            <ComboboxInput
              aria-label="Search models"
              placeholder="Search models..."
              suppressPasswordManager
            />
            <ComboboxClear aria-label="Clear model" />
            <ComboboxTriggerIndicator>
              <ChevronDown aria-hidden />
            </ComboboxTriggerIndicator>
          </ComboboxControl>
        </Field>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[var(--anchor-width)]"
        >
          {renderModelItems()}
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
        <ComboboxTrigger className="h-8 w-36 py-0">
          <GitBranch aria-hidden />
          <span className="min-w-0 truncate text-left">
            {value ? `Branch: ${value.label}` : "Choose branch"}
          </span>
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
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
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <GitBranch className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
                  </span>
                  <span className="truncate leading-6">{branch.label}</span>
                </span>
                {pendingId === branch.id ? (
                  <Loader aria-hidden className="ml-auto size-3.5 animate-spin" />
                ) : confirmedId === branch.id ? (
                  <Check aria-hidden className="ml-auto size-3.5 stroke-[1.5]" />
                ) : (
                  <ComboboxItemIndicator />
                )}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No branches found</ComboboxEmpty>
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
      description="Use Combobox when the user searches, highlights, and selects structured options. Use Popover only for generic floating panels."
      toc={TOC}
    >
      <DocSection id="searchable-combobox" title="Searchable combobox" showThemeSwitcher>
        <div className="space-y-8">
          <DocNote>
            ComboboxControl owns the searchable field surface. Compose leading icons, input, clear,
            and trigger indicator as children; icons without an explicit size class are normalized
            by the component.
          </DocNote>
          <div className="space-y-3">
            <h3 id="preview" className="scroll-mt-24 text-sm font-medium">
              Preview
            </h3>
            <ComponentDemoFrame previewClassName="min-h-[24rem] items-start pt-24">
              <PreviewCombobox />
            </ComponentDemoFrame>
          </div>
          <div className="space-y-3">
            <h3 id="anatomy" className="scroll-mt-24 text-sm font-medium">
              Anatomy
            </h3>
            <DocsCodeBlock>
              <DocsCodeBlock.Body>
                <DocsCodeBlock.Content html={code.anatomy} />
              </DocsCodeBlock.Body>
            </DocsCodeBlock>
          </div>
          <div className="space-y-3">
            <h3 id="async-search" className="scroll-mt-24 text-sm font-medium">
              Async search
            </h3>
            <Example
              html={code.asyncSearch}
              collapsedHtml={code.asyncSearchBody}
              previewClassName="min-h-[22rem] items-start pt-24"
            >
              <AsyncSearchCombobox />
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="dropdown-combobox" title="Dropdown combobox" showThemeSwitcher>
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 id="button-trigger" className="scroll-mt-24 text-sm font-medium">
              Button trigger
            </h3>
            <Example
              html={code.buttonTrigger}
              collapsedHtml={code.buttonTriggerBody}
              previewClassName="min-h-[24rem] items-start pt-24"
            >
              <ButtonTriggerCombobox />
            </Example>
          </div>
          <div className="space-y-3">
            <h3 id="async-load-options" className="scroll-mt-24 text-sm font-medium">
              Load options
            </h3>
            <Example
              html={code.asyncOptions}
              collapsedHtml={code.asyncOptionsBody}
              previewClassName="min-h-[22rem] items-start pt-24"
            >
              <AsyncOptionsCombobox />
            </Example>
          </div>
          <div className="space-y-3">
            <h3 id="async-select" className="scroll-mt-24 text-sm font-medium">
              Async select
            </h3>
            <Example
              html={code.asyncSelect}
              collapsedHtml={code.asyncSelectBody}
              previewClassName="min-h-[22rem] items-start pt-24"
            >
              <AsyncSelectCombobox />
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
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
              id: "source-comparison-composer-mention",
              label: "Composer — mention autocomplete",
              status: "difference",
              note: (
                <>
                  <InlineCode>MessageInput.tsx</InlineCode>. Mention suggestions need search text,
                  active row, and selected value ownership.
                </>
              ),
              source: <SourceComposerMentionComparison />,
              brutal: <ComposerMentionComboboxComposition />,
              elegant: <ComposerMentionComboboxComposition />,
              elegantDark: <ComposerMentionComboboxComposition />,
              compositionCode: code.composerMentionComboboxComposition,
              compositionCollapsedCode: code.composerMentionComboboxCompositionBody,
              compositionPath: COMPOSER_MENTION_COMBOBOX_COMPOSITION_PATH,
              compositionSource: composerMentionComboboxCompositionSource,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-selection-popover",
              label: "Selection popover",
              status: "difference",
              note: (
                <>
                  <InlineCode>SelectionPopover.tsx</InlineCode> /{" "}
                  <InlineCode>InlineBadgeEditor.tsx</InlineCode>. Searchable option lists map to
                  Combobox, not Popover.
                </>
              ),
              source: <SourceSelectionPopoverComparison />,
              brutal: <SelectionPopoverComboboxComposition />,
              elegant: <SelectionPopoverComboboxComposition />,
              elegantDark: <SelectionPopoverComboboxComposition />,
              compositionCode: code.selectionPopoverComboboxComposition,
              compositionCollapsedCode: code.selectionPopoverComboboxCompositionBody,
              compositionPath: SELECTION_POPOVER_COMBOBOX_COMPOSITION_PATH,
              compositionSource: selectionPopoverComboboxCompositionSource,
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
