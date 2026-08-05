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
  Loader,
  Megaphone,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  mockMutationOptions,
  mockQueryOptions,
  runMockMutation,
  useMockQuery,
} from "#/lib/mock-query.ts";
import { models, type Model } from "#/modules/combobox/combobox.constants.ts";
import { PreviewCombobox } from "#/modules/combobox/combobox.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
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
  preview: `const models = [
  { id: "reasoning", label: "Raft Reasoning", description: "Long-context planning" },
  { id: "fast", label: "Raft Fast", description: "Low-latency responses" },
  { id: "vision", label: "Raft Vision", description: "Image understanding" },
  { id: "code", label: "Raft Code", description: "Repository-aware coding" },
] as const;

function ModelCombobox() {
  const [selectedModel, setSelectedModel] = useState<typeof models[number] | null>(models[0]);

  return (
    <Combobox
      items={models}
      value={selectedModel}
      itemToStringLabel={(model) => model.label}
      onValueChange={setSelectedModel}
      autoHighlight
    >
      <Field className="w-56 gap-1.5">
        <FieldLabel>Model</FieldLabel>
        <ComboboxControl>
          <Sparkles aria-hidden />
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
      <ComboboxContent className="w-[var(--anchor-width)]">
        <ComboboxList>
          {(model) => (
            <ComboboxItem key={model.id} value={model}>
              <span className="truncate leading-6">{model.label}</span>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No models found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}`,
  anatomy: `import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTriggerIndicator,
  Field,
  FieldLabel,
} from "raft-ui";

<Combobox>
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
      <ComboboxItem value="option">
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
import { ChevronDown, Folder, Loader } from "lucide-react";
import { mockQueryOptions, useMockQuery } from "#/lib/mock-query.ts";

const repositories = [
  { id: "raft-ui", label: "raft-ui", description: "Design system" },
  { id: "raft", label: "raft", description: "Workspace app" },
  { id: "source", label: "source", description: "Reference repo" },
] as const;

type Repository = (typeof repositories)[number];

const repositoryQuery = mockQueryOptions({
  queryKey: ["combobox", "repositories"],
  delayMs: 700,
  shouldFail: false,
  queryFn: () => repositories,
});

function RepositoryPicker() {
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
      filter={null}
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

const COMBOBOX_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.Root.Props",
    description:
      "Owns selected value, input value, filtering, highlighted item, Escape, and Enter selection.",
  },
];

const COMBOBOX_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.InputGroup.Props",
    description:
      "Input-first control surface. Use it when the visible combobox trigger should be searchable; plain SVG children get the component's default icon size.",
  },
];

const COMBOBOX_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.Trigger.Props",
    description:
      "Button trigger for picker-style filters where the search input lives inside the popup.",
  },
];

const COMBOBOX_INPUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.Input.Props",
    description: "Search input. Supports password-manager suppression for compact filter panels.",
  },
];

const COMBOBOX_CLEAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.Clear.Props",
    description: "Clears the current input and selected value through the primitive.",
  },
];

const COMBOBOX_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled popup shell. Defaults to side=bottom, align=start, sideOffset=4, and local collision props.",
  },
];

const COMBOBOX_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Header row for picker titles and trailing actions.",
  },
];

const COMBOBOX_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Horizontal divider between composed combobox regions.",
  },
];

const COMBOBOX_POPUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Unpositioned popup shell for advanced static rendering. Prefer ComboboxContent for trigger-anchored pickers.",
  },
];

const COMBOBOX_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.List.Props",
    description: "Renders filtered items, usually through the list render function.",
  },
];

const COMBOBOX_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.Item.Props",
    description:
      "Selectable option row. Selection/highlight state is exposed through data attributes.",
  },
];

const COMBOBOX_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Combobox.ItemIndicator.Props",
    description: "Selected-state indicator for single and multiple selection.",
  },
];

export const Route = createFileRoute("/components/combobox")({
  component: ComboboxDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

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
        filter={null}
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="min-h-[24rem] items-start pt-24">
          <Preview.Canvas>
            <PreviewCombobox />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="async-search" title="Async search">
            <DocNote>
              For async or server-provided results, use <InlineCode>filter={"{null}"}</InlineCode>{" "}
              to avoid re-filtering them while keeping <InlineCode>inputValue</InlineCode>{" "}
              controlled. <InlineCode>ComboboxControl</InlineCode>
              owns the searchable field surface; compose its icons, input, clear, and trigger
              indicator as children.
            </DocNote>
            <Preview previewClassName="min-h-[22rem] items-start pt-24">
              <Preview.Canvas>
                <AsyncSearchCombobox />
              </Preview.Canvas>
              <Preview.Code html={code.asyncSearch} collapsedHtml={code.asyncSearchBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="button-trigger" title="Button trigger">
            <Preview previewClassName="min-h-[24rem] items-start pt-24">
              <Preview.Canvas>
                <ButtonTriggerCombobox />
              </Preview.Canvas>
              <Preview.Code html={code.buttonTrigger} collapsedHtml={code.buttonTriggerBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="async-load-options" title="Load options">
            <Preview previewClassName="min-h-[22rem] items-start pt-24">
              <Preview.Canvas>
                <AsyncOptionsCombobox />
              </Preview.Canvas>
              <Preview.Code html={code.asyncOptions} collapsedHtml={code.asyncOptionsBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="async-select" title="Async select">
            <Preview previewClassName="min-h-[22rem] items-start pt-24">
              <Preview.Canvas>
                <AsyncSelectCombobox />
              </Preview.Canvas>
              <Preview.Code html={code.asyncSelect} collapsedHtml={code.asyncSelectBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-combobox" title="Combobox">
            <PropsTable rows={COMBOBOX_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-control" title="ComboboxControl">
            <PropsTable rows={COMBOBOX_CONTROL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-trigger" title="ComboboxTrigger">
            <PropsTable rows={COMBOBOX_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-input" title="ComboboxInput">
            <PropsTable rows={COMBOBOX_INPUT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-clear" title="ComboboxClear">
            <PropsTable rows={COMBOBOX_CLEAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-content" title="ComboboxContent">
            <PropsTable rows={COMBOBOX_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-header" title="ComboboxHeader">
            <PropsTable rows={COMBOBOX_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-separator" title="ComboboxSeparator">
            <PropsTable rows={COMBOBOX_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-popup" title="ComboboxPopup">
            <PropsTable rows={COMBOBOX_POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-list" title="ComboboxList">
            <PropsTable rows={COMBOBOX_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-combobox-item" title="ComboboxItem">
            <PropsTable rows={COMBOBOX_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-combobox-item-indicator"
            title="ComboboxItemIndicator"
          >
            <PropsTable rows={COMBOBOX_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
