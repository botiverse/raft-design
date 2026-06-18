import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  InlineCode,
} from "@slock/ui";
import { Hash } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
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

type PlaygroundValues = {
  open: boolean;
  query: string;
};

const COMBOBOX_BODY_SNIPPET = `  <ComboboxInputGroup>
    <ComboboxInput aria-label="Search channels" suppressPasswordManager />
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
  anatomy: `import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@slock/ui";
import { Hash } from "lucide-react";

const channels = [
  { id: "unread", label: "#unread" },
  { id: "general", label: "#general" },
] as const;

<Combobox
  items={channels}
  itemToStringLabel={(channel) => channel.label}
  autoHighlight
>
  <ComboboxTrigger render={<Button variant="outline" size="md" />}>
    Channel
  </ComboboxTrigger>
  <ComboboxContent className="w-[220px]">
    <div className="flex items-center justify-between border-b border-line-muted px-3 py-2">
      <ComboboxLabel>Channels</ComboboxLabel>
    </div>
${COMBOBOX_BODY_SNIPPET}
  </ComboboxContent>
</Combobox>`,
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
    name: "ComboboxPopup",
    type: "div props",
    description: "Static popup shell for docs previews and comparison panes.",
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
    </SourcePanelMount>
  );
}

function SourceMessageSearchSenderComparison() {
  return (
    <SourcePanelMount>
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
    </SourcePanelMount>
  );
}

function SourceTasksChannelFilterComparison() {
  return (
    <SourcePanelMount>
      <LegacySelectionPopover
        title="Channels"
        searchable
        search="des"
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
      <div className="flex items-center justify-between border-b border-line-muted px-3 py-2 [[data-theme=brutal]_&]:border-black">
        <ComboboxLabel>Channels</ComboboxLabel>
        <ComboboxClear>Clear</ComboboxClear>
      </div>
      <ComboboxInputGroup>
        <ComboboxInput aria-label="Search channels" suppressPasswordManager />
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

function PreviewCombobox({ open, query }: PlaygroundValues) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Channel>
        open={open}
        inputValue={query}
        items={channels}
        defaultValue={channels[0]}
        itemToStringLabel={(channel) => channel.label}
        autoHighlight
      >
        <ComboboxTrigger render={<Button variant="outline" size="md" />}>Channel</ComboboxTrigger>
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
            query: "",
          }}
          controls={[
            { name: "open", label: "Open", type: "boolean" },
            { name: "query", label: "Query", type: "text" },
          ]}
          previewClassName="min-h-[24rem] items-start pt-24"
          render={(values) => <PreviewCombobox {...values} />}
        />
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
