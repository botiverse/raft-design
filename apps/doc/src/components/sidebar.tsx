import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Badge,
  Button,
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  Kbd,
  Separator,
} from "raft-ui";
import { Globe2, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";

import { raftUiVersion } from "#/data/raft-ui-release.ts";

const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Installation", to: "/installation" },
  { label: "Changelog", to: "/changelog" },
  { label: "Playground", to: "/playground" },
  { label: "Lab", to: "/lab" },
];

const FOUNDATIONS = {
  title: "Foundations",
  items: [
    { label: "Colors", to: "/tokens/colors" },
    {
      label: "Typography",
      items: [
        { label: "Brutal", to: "/tokens/typography/brutal" },
        { label: "Elegant", to: "/tokens/typography/elegant" },
      ],
    },
    {
      label: "Shadows",
      items: [
        { label: "Brutal", to: "/tokens/shadows/brutal" },
        { label: "Elegant", to: "/tokens/shadows/elegant" },
      ],
    },
    { label: "Icons", to: "/components/icons", status: "wip" },
  ],
} as const;

const COMPONENT_NAV = [
  {
    title: "Layout",
    items: [
      { label: "AppShell", to: "/components/app-shell", status: "done" },
      { label: "AppRail", to: "/components/app-rail", status: "done" },
      { label: "Panel", to: "/components/panel", status: "done" },
      {
        label: "ProfilePanel",
        to: "/components/profile-panel",
        status: "done",
      },
      { label: "ScrollArea", to: "/components/scroll-area", status: "done" },
      { label: "Separator", to: "/components/separator", status: "done" },
      { label: "Sidebar", to: "/components/sidebar", status: "done" },
      { label: "SidebarItem", to: "/components/sidebar-item", status: "done" },
    ],
  },
  {
    title: "Actions",
    items: [
      { label: "Button", to: "/components/button", status: "done" },
      { label: "ToggleGroup", to: "/components/toggle-group", status: "done" },
    ],
  },
  {
    title: "Forms",
    items: [
      { label: "Field", to: "/components/field", status: "done" },
      { label: "Label", to: "/components/label", status: "done" },
      { label: "Input", to: "/components/input", status: "done" },
      { label: "InputGroup", to: "/components/input-group", status: "done" },
      { label: "Textarea", to: "/components/textarea", status: "done" },
      { label: "Checkbox", to: "/components/checkbox", status: "done" },
      { label: "RadioGroup", to: "/components/radio-group", status: "done" },
      { label: "Switch", to: "/components/switch", status: "done" },
      { label: "Select", to: "/components/select", status: "done" },
      {
        label: "PickerTriggerButton",
        to: "/components/picker-trigger-button",
        status: "done",
      },
      { label: "Combobox", to: "/components/combobox", status: "done" },
      { label: "SegmentedControl", to: "/components/segmented-control", status: "done" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "MobileNav", to: "/components/mobile-nav", status: "done" },
      { label: "Tabs", to: "/components/tabs", status: "done" },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "AlertDialog", to: "/components/alert-dialog", status: "done" },
      { label: "Drawer", to: "/components/drawer", status: "done" },
      { label: "ContextMenu", to: "/components/context-menu", status: "done" },
      { label: "Dialog", to: "/components/dialog", status: "done" },
      { label: "DropdownMenu", to: "/components/dropdown-menu", status: "done" },
      { label: "Lightbox", to: "/components/lightbox", status: "done" },
      { label: "Popover", to: "/components/popover", status: "done" },
      { label: "PreviewCard", to: "/components/preview-card", status: "done" },
      { label: "Tooltip", to: "/components/tooltip", status: "done" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { label: "Banner", to: "/components/banner", status: "done" },
      { label: "EmptyState", to: "/components/empty-state", status: "done" },
      { label: "NotificationCenter", to: "/components/notification-center", status: "done" },
      { label: "Progress", to: "/components/progress", status: "done" },
      { label: "Skeleton", to: "/components/skeleton", status: "done" },
      { label: "Spinner", to: "/components/spinner", status: "done" },
      { label: "Toast", to: "/components/toast", status: "done" },
    ],
  },
  {
    title: "Status & Indicators",
    items: [
      { label: "Badge", to: "/components/badge", status: "done" },
      { label: "Status", to: "/components/status", status: "done" },
    ],
  },
  {
    title: "Data Display",
    items: [
      { label: "Card", to: "/components/card", status: "done" },
      { label: "Avatar", to: "/components/avatar", status: "done" },
      { label: "DescriptionList", to: "/components/description-list", status: "done" },
      { label: "FilePreview", to: "/components/file-preview", status: "done" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Text", to: "/components/text", status: "done" },
      { label: "Markdown Parts", to: "/components/markdown", status: "done" },
      { label: "InlineCode", to: "/components/inline-code", status: "done" },
      { label: "CodeBlock", to: "/components/code-block", status: "done" },
      { label: "CopyableCode", to: "/components/copyable-code", status: "done" },
      { label: "Kbd", to: "/components/kbd", status: "done" },
    ],
  },
  {
    title: "Brand",
    items: [{ label: "Logo", to: "/components/logo", status: "done" }],
  },
] as const;

const PATTERN_NAV = [
  {
    title: "Messaging",
    items: [
      { label: "MessageItem", to: "/components/message-item", status: "done" },
      { label: "MessageTranslation", to: "/components/message-translation", status: "done" },
      { label: "MessageReplies", to: "/components/message-replies", status: "done" },
      { label: "MessageReference", to: "/components/message-reference", status: "done" },
      { label: "TaskChip", to: "/components/task-chip", status: "done" },
      {
        label: "MessageQuotedPreview",
        to: "/components/message-quoted-preview",
        status: "done",
      },
      {
        label: "MessageForwardedBundle",
        to: "/components/message-forwarded-bundle",
        status: "done",
      },
      {
        label: "MessageActionCard",
        to: "/components/message-action-card",
        status: "done",
      },
      {
        label: "MessageAttachment",
        to: "/components/message-attachment",
        status: "done",
      },
      { label: "SystemMessage", to: "/components/system-message", status: "done" },
    ],
  },
  {
    title: "Chat",
    items: [
      {
        label: "ConversationPanel",
        to: "/components/conversation-panel",
        status: "done",
      },
      { label: "Composer", to: "/components/chat-composer", status: "done" },
      {
        label: "ComposerSuggestions",
        to: "/components/composer-suggestions",
        status: "done",
      },
      {
        label: "LiveAgentActivityBar",
        to: "/components/live-agent-activity-bar",
        status: "done",
      },
      { label: "Search", to: "/components/search", status: "done" },
      { label: "ActivityInbox", to: "/components/activity", status: "done" },
      { label: "FilesPanel", to: "/components/files", status: "done" },
      { label: "ThreadPanel", to: "/components/thread-panel", status: "done" },
    ],
  },
  {
    title: "Tasks",
    items: [
      { label: "TasksPanel", to: "/components/tasks", status: "done" },
      { label: "TaskBoard", to: "/components/task-board", status: "done" },
      { label: "TaskList", to: "/components/task-list", status: "done" },
      { label: "TaskDnd", to: "/components/task-dnd", status: "done" },
      { label: "TaskCard", to: "/components/task-card", status: "done" },
    ],
  },
] as const;

export type ComponentSearchItem = {
  label: string;
  to: string;
  group: string;
};

function createComponentSearchItems(): readonly ComponentSearchItem[] {
  return [FOUNDATIONS, ...COMPONENT_NAV, ...PATTERN_NAV].flatMap((group) =>
    group.items.flatMap((item) => {
      if (!("to" in item)) {
        return [];
      }

      return [{ label: item.label, to: item.to, group: group.title }];
    }),
  );
}

export const COMPONENT_SEARCH_ITEMS = createComponentSearchItems();

export function filterComponentSearchItems(query: string): readonly ComponentSearchItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return COMPONENT_SEARCH_ITEMS;
  }

  return COMPONENT_SEARCH_ITEMS.filter((item) =>
    `${item.label} ${item.group} ${item.to}`.toLocaleLowerCase().includes(normalizedQuery),
  );
}

const ROADMAP = {
  title: "Roadmap",
  items: [
    {
      label: "Next",
      items: [
        {
          label: "Collapsible",
          status: "later",
          docsHref: "https://base-ui.com/react/components/collapsible",
          reason: "Low-level expand/collapse primitive for settings and dense docs sections.",
        },
        {
          label: "Accordion",
          status: "later",
          docsHref: "https://base-ui.com/react/components/accordion",
          reason: "Grouped disclosure pattern; build after Collapsible settles.",
        },
        {
          label: "ButtonGroup",
          status: "later",
          docsHref: "https://base-ui.com/react/components/button",
          reason: "Add after grouped action semantics and spacing rules are defined.",
        },
        {
          label: "NumberField",
          status: "later",
          docsHref: "https://base-ui.com/react/components/number-field",
          reason: "Wait for real numeric settings with stepper behavior.",
        },
        {
          label: "Slider",
          status: "later",
          docsHref: "https://base-ui.com/react/components/slider",
          reason: "Wait for range controls such as volume, threshold, or tuning parameters.",
        },
        {
          label: "Meter",
          status: "later",
          docsHref: "https://base-ui.com/react/components/meter",
          reason: "Wait for bounded metric displays distinct from Progress.",
        },
      ],
    },
    {
      label: "Parked",
      items: [
        {
          label: "Breadcrumb",
          status: "parked",
          docsHref: "https://base-ui.com/react/components",
          reason: "Wait for deeper routed information architecture.",
        },
        {
          label: "Pagination",
          status: "parked",
          docsHref: "https://base-ui.com/react/components",
          reason: "Wait for paged data surfaces.",
        },
        {
          label: "Table / DataGrid",
          status: "parked",
          docsHref: "https://base-ui.com/react/components",
          reason: "Likely app-specific; design from a real dense-data use case.",
        },
        {
          label: "Calendar / DatePicker",
          status: "parked",
          docsHref: "https://base-ui.com/react/components",
          reason: "Wait for a concrete date-picking workflow.",
        },
        {
          label: "Command",
          status: "parked",
          docsHref: "https://base-ui.com/react/components/autocomplete",
          reason: "Command palette behavior is product-specific and should be designed separately.",
        },
        {
          label: "NavigationMenu",
          status: "parked",
          docsHref: "https://base-ui.com/react/components/navigation-menu",
          reason: "Marketing/header navigation primitive; not useful for the current doc shell.",
        },
        {
          label: "Menubar",
          status: "parked",
          docsHref: "https://base-ui.com/react/components/menubar",
          reason: "Desktop menu-bar pattern is not part of the current product surface.",
        },
        {
          label: "Carousel",
          status: "parked",
          docsHref: "https://base-ui.com/react/components",
          reason: "Not relevant to the current product interface.",
        },
      ],
    },
  ],
} as const;

type NavStatus = "done" | "wip" | "todo" | "later" | "parked" | "internal" | "skipped";

type NavItem = {
  label: string;
  to?: string;
  docsHref?: string;
  hash?: string;
  status?: NavStatus;
  reason?: string;
  items?: readonly NavItem[];
};

type BadgeVariant =
  | "default"
  | "primary"
  | "information"
  | "muted"
  | "accent"
  | "success"
  | "danger";

const statusMeta = {
  done: { label: "Done", short: "Done", variant: "primary" },
  wip: { label: "In progress", short: "WIP", variant: "primary" },
  todo: { label: "Todo", short: "TODO", variant: "default" },
  later: { label: "Later", short: "Later", variant: "accent" },
  parked: { label: "Parked", short: "Park", variant: "default" },
  internal: { label: "Internal", short: "INT", variant: "information" },
  skipped: { label: "Skipped", short: "Skip", variant: "muted" },
} satisfies Record<NavStatus, { label: string; short: string; variant: BadgeVariant }>;

const sectionTitleClassName = "mb-2.5 pl-[8px] text-[13px] font-medium text-foreground";
const sidebarItemFocusClassName =
  "outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500";
const sidebarItemActiveClassName = "bg-fill-muted text-foreground";
const sidebarItemInactiveClassName = "text-foreground-muted";
const sidebarItemActiveProps = { className: sidebarItemActiveClassName };
const sidebarItemInactiveProps = { className: sidebarItemInactiveClassName };
const sidebarPathActiveOptions = { exact: true, includeSearch: false };
const sidebarHashActiveOptions = { exact: true, includeHash: true, includeSearch: false };

function ComponentSearch({
  onNavigate,
  autoFocus,
  focusSignal = 0,
}: {
  onNavigate?: () => void;
  autoFocus?: boolean;
  focusSignal?: number;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filteredItems = query.trim() ? filterComponentSearchItems(query) : [];
  const comboboxItems = query.trim() ? filteredItems : COMPONENT_SEARCH_ITEMS.slice(0, 1);

  useEffect(() => {
    if (focusSignal === 0) {
      return;
    }

    setOpen(true);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [focusSignal]);

  return (
    <Combobox<ComponentSearchItem>
      items={comboboxItems}
      value={null}
      open={open}
      inputValue={query}
      itemToStringLabel={(item) => item.label}
      autoHighlight
      onOpenChange={setOpen}
      onInputValueChange={(nextQuery, eventDetails) => {
        const nextValue = eventDetails.reason === "item-press" ? "" : nextQuery;
        setQuery(nextValue);
        setOpen(true);
      }}
      onValueChange={(item) => {
        if (!item) {
          return;
        }

        setQuery("");
        setOpen(false);
        onNavigate?.();
        void navigate({ to: item.to });
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            size="md"
            aria-label="Search components"
            title="Search components"
            className="w-full justify-start font-normal text-foreground-muted"
          />
        }
      >
        <Search aria-hidden />
        <span>Search components</span>
        <Kbd className="ml-auto">⌘ K</Kbd>
      </ComboboxTrigger>
      <ComboboxContent
        side="bottom"
        align="start"
        initialFocus={false}
        finalFocus={false}
        className="w-[min(360px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]"
      >
        <ComboboxInputGroup>
          <ComboboxInput
            ref={inputRef}
            autoFocus={autoFocus}
            aria-label="Search components"
            placeholder="Search components..."
            suppressPasswordManager
          />
          <ComboboxClear aria-label="Clear component search" />
        </ComboboxInputGroup>
        {query.trim() ? (
          <ComboboxList>
            {(item: ComponentSearchItem) => (
              <ComboboxItem key={item.to} value={item}>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="max-w-[42%] shrink-0 truncate text-xs text-foreground-muted">
                  {item.group}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        ) : null}
        <ComboboxEmpty>{query.trim() ? "No components found" : null}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

function NavRow({ item, badge }: { item: NavItem; badge?: ReactNode }) {
  const className = `flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-fill-muted/80 hover:text-foreground ${
    item.to || item.docsHref ? sidebarItemFocusClassName : "cursor-default"
  } ${item.to || item.docsHref ? "" : "text-foreground-muted"}`;
  const title = item.reason
    ? `${item.label}: ${item.status ? statusMeta[item.status].label : "Note"}. ${item.reason}`
    : undefined;
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="min-w-0 truncate">{item.label}</span>
        {item.docsHref ? <Globe2 className="size-3 shrink-0 opacity-50" aria-hidden /> : null}
      </span>
      {badge}
    </>
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        hash={item.hash}
        title={title}
        aria-label={title}
        activeOptions={item.hash ? sidebarHashActiveOptions : sidebarPathActiveOptions}
        activeProps={sidebarItemActiveProps}
        inactiveProps={sidebarItemInactiveProps}
        className={className}
      >
        {content}
      </Link>
    );
  }

  if (item.docsHref) {
    return (
      <a
        href={item.docsHref}
        target="_blank"
        rel="noreferrer"
        title={title}
        aria-label={title ? `${title} Open Base UI docs.` : `${item.label}. Open Base UI docs.`}
        className={`${className} text-foreground-muted`}
      >
        {content}
      </a>
    );
  }

  return (
    <span title={title} aria-label={title} className={className}>
      {content}
    </span>
  );
}

function StatusBadge({ status }: { status?: NavStatus }) {
  if (!status || status === "done") {
    return null;
  }

  const meta = statusMeta[status];

  return (
    <Badge
      appearance="solid"
      variant={meta.variant}
      title={meta.label}
      aria-label={meta.label}
      uppercase
      className="h-4 min-w-9 shrink-0 justify-center px-1 text-[9px]"
    >
      {meta.short}
    </Badge>
  );
}

function VersionBadge() {
  return (
    <Badge
      appearance="soft"
      variant="muted"
      aria-label={`raft-ui version ${raftUiVersion}`}
      className="h-4 shrink-0 px-1.5 font-mono text-[9px]"
    >
      v{raftUiVersion}
    </Badge>
  );
}

function NavGroup({
  title,
  to,
  items,
}: {
  title?: string;
  to?: string;
  items: readonly NavItem[];
}) {
  if (title && to && items.length === 0) {
    return <NavRow item={{ label: title, to }} />;
  }

  return (
    <div>
      {title ? (
        to ? (
          <Link
            to={to}
            activeOptions={sidebarPathActiveOptions}
            activeProps={sidebarItemActiveProps}
            inactiveProps={{ className: "text-foreground" }}
            className={`${sectionTitleClassName} ${sidebarItemFocusClassName}`}
          >
            {title}
          </Link>
        ) : (
          <p className={sectionTitleClassName}>{title}</p>
        )
      ) : null}
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item) => {
            if (item.items) {
              return (
                <li key={item.label} className="pt-1">
                  <p className="px-2 py-1 text-xs font-medium text-foreground-muted">
                    {item.label}
                  </p>
                  <ul className="ml-2 space-y-1">
                    {item.items.map((child) => (
                      <li key={child.label}>
                        <NavRow item={child} badge={<StatusBadge status={child.status} />} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <NavRow item={item} badge={<StatusBadge status={item.status} />} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function MobileNavItem({
  item,
  badge,
  onNavigate,
}: {
  item: NavItem;
  badge?: ReactNode;
  onNavigate: () => void;
}) {
  const className = `flex min-h-12 items-center justify-start rounded-md px-3 py-2.5 text-left text-base leading-5 font-semibold text-foreground-muted transition-colors hover:bg-fill-muted hover:text-foreground active:bg-fill-strong ${sidebarItemFocusClassName}`;
  const title = item.reason
    ? `${item.label}: ${item.status ? statusMeta[item.status].label : "Note"}. ${item.reason}`
    : undefined;
  const content = badge ? (
    <>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge}
    </>
  ) : (
    item.label
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        hash={item.hash}
        title={title}
        aria-label={title}
        activeOptions={item.hash ? sidebarHashActiveOptions : sidebarPathActiveOptions}
        activeProps={sidebarItemActiveProps}
        className={className}
        onClick={onNavigate}
      >
        {content}
      </Link>
    );
  }

  if (item.docsHref) {
    return (
      <a
        href={item.docsHref}
        target="_blank"
        rel="noreferrer"
        title={title}
        aria-label={title ? `${title} Open Base UI docs.` : `${item.label}. Open Base UI docs.`}
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      title={title}
      className="flex min-h-12 items-center justify-start px-3 py-2.5 text-left text-base leading-5 font-semibold text-foreground-muted"
    >
      {content}
    </span>
  );
}

function MobileNavGroup({
  title,
  to,
  items,
  onNavigate,
}: {
  title: string;
  to?: string;
  items: readonly NavItem[];
  onNavigate: () => void;
}) {
  if (to && items.length === 0) {
    return <MobileNavItem item={{ label: title, to }} onNavigate={onNavigate} />;
  }

  return (
    <section>
      <h2 className="mb-3 text-left text-xs font-medium text-foreground-muted/70">
        {to ? (
          <Link
            to={to}
            activeOptions={sidebarPathActiveOptions}
            activeProps={sidebarItemActiveProps}
            className={`flex min-h-12 items-center justify-start rounded-md px-3 ${sidebarItemFocusClassName}`}
            onClick={onNavigate}
          >
            {title}
          </Link>
        ) : (
          <span className="block px-3">{title}</span>
        )}
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          if (item.items) {
            return (
              <div key={item.label}>
                <p className="px-3 py-2 text-sm font-medium text-foreground-muted">{item.label}</p>
                <div className="ml-3 flex flex-col gap-2">
                  {item.items.map((child) => (
                    <MobileNavItem key={child.label} item={child} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            );
          }

          return <MobileNavItem key={item.label} item={item} onNavigate={onNavigate} />;
        })}
      </div>
    </section>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 lg:hidden ${
        open
          ? "h-dvh bg-layer-panel/70 backdrop-blur-2xl"
          : "h-[calc(5rem+env(safe-area-inset-top))] bg-[linear-gradient(to_bottom,var(--layer-panel)_0%,color-mix(in_oklch,var(--layer-panel)_70%,transparent)_55%,transparent_100%)]"
      }`}
    >
      <header className="flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <Link
          to="/"
          aria-label="Raft UI home"
          className={`flex min-h-11 items-center rounded-md px-2 text-foreground ${sidebarItemFocusClassName}`}
          onClick={close}
        >
          <img src="/raft-logo.svg" alt="" className="h-5 w-auto shrink-0" />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-docs-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className={`flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-fill-muted active:bg-fill-strong ${sidebarItemFocusClassName}`}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </header>

      {open ? (
        <nav
          id="mobile-docs-navigation"
          aria-label="Documentation"
          className="h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-xl space-y-9">
            <ComponentSearch onNavigate={close} />

            <div className="flex flex-col gap-2">
              {PRIMARY_NAV.map((item) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  badge={"status" in item ? <StatusBadge status={item.status} /> : undefined}
                  onNavigate={close}
                />
              ))}
            </div>

            <MobileNavGroup {...FOUNDATIONS} onNavigate={close} />

            {COMPONENT_NAV.map((group) => (
              <MobileNavGroup key={group.title} {...group} onNavigate={close} />
            ))}

            {PATTERN_NAV.map((group) => (
              <MobileNavGroup key={group.title} {...group} onNavigate={close} />
            ))}

            <MobileNavGroup {...ROADMAP} onNavigate={close} />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export type SidebarProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const [focusSearchSignal, setFocusSearchSignal] = useState(0);
  const toggleCollapsed = () => onCollapsedChange?.(!collapsed);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onCollapsedChange?.(false);
        setFocusSearchSignal((signal) => signal + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCollapsedChange]);

  return (
    <>
      <MobileSidebar />
      {collapsed ? (
        <div className="fixed left-4 top-4 z-40 hidden items-center gap-0.5 rounded-xl border border-line-muted bg-layer-panel p-1 shadow-raft-md lg:flex">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="size-8 p-0"
            onClick={toggleCollapsed}
          >
            <PanelLeftOpen aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Search components"
            title="Search components"
            className="size-8 p-0"
            onClick={() => {
              onCollapsedChange?.(false);
              setFocusSearchSignal((signal) => signal + 1);
            }}
          >
            <Search aria-hidden />
          </Button>
        </div>
      ) : null}
      {!collapsed ? (
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-(--sidebar-w) overflow-y-auto px-5 py-6 scrollbar-none lg:block [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <img src="/raft-logo.svg" alt="" className="h-5 w-auto shrink-0" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="size-8 shrink-0 p-0"
              onClick={toggleCollapsed}
            >
              <PanelLeftClose aria-hidden />
            </Button>
          </div>
          <div className="mt-6">
            <ComponentSearch autoFocus={focusSearchSignal > 0} focusSignal={focusSearchSignal} />
          </div>
          <nav className="mt-8 space-y-8">
            <ul className="space-y-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.label}>
                  <NavRow
                    item={item}
                    badge={
                      item.to === "/changelog" ? (
                        <VersionBadge />
                      ) : "status" in item ? (
                        <StatusBadge status={item.status} />
                      ) : null
                    }
                  />
                </li>
              ))}
            </ul>

            <NavGroup {...FOUNDATIONS} />

            <Separator className="h-0 bg-transparent border-t border-dashed border-line-hairline data-[orientation=horizontal]:w-[65%]" />

            {COMPONENT_NAV.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}

            <Separator className="h-0 bg-transparent border-t border-dashed border-line-hairline data-[orientation=horizontal]:w-[65%]" />

            {PATTERN_NAV.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}

            <NavGroup {...ROADMAP} />
          </nav>
        </aside>
      ) : null}
    </>
  );
}
