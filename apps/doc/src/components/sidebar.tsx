import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Badge, Separator } from "raft-ui";
import { Globe2 } from "lucide-react";

import { raftUiVersion } from "#/data/raft-ui-release.ts";

const SKILLS = {
  title: "Skills",
  items: [{ label: "new-component.md", to: "/skills/new-component" }],
} as const;

const TOKENS = [
  {
    title: "Colors",
    to: "/tokens/colors",
    items: [] as const,
  },
  {
    title: "Typography",
    items: [
      { label: "Brutal", to: "/tokens/typography/brutal" },
      { label: "Elegant", to: "/tokens/typography/elegant" },
    ],
  },
  {
    title: "Shadows",
    items: [
      { label: "Brutal", to: "/tokens/shadows/brutal" },
      { label: "Elegant", to: "/tokens/shadows/elegant" },
    ],
  },
] as const;

const NAV = [
  {
    title: "Layout",
    items: [
      { label: "AppShell", to: "/components/app-shell", status: "wip" },
      { label: "AppRail", to: "/components/app-rail", status: "wip" },
      { label: "MobileNav", to: "/components/mobile-nav", status: "wip" },
      { label: "Logo", to: "/components/logo", status: "wip" },
      { label: "AppPanelStack", to: "/components/app-panel-stack", status: "wip" },
      { label: "Separator", to: "/components/separator", status: "done" },
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
        label: "ScrollArea",
        status: "parked",
        docsHref: "https://base-ui.com/react/components/scroll-area",
        reason: "Prefer native scrolling until custom scrollbar behavior is required.",
      },
      {
        label: "Resizable",
        status: "parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for explicit panel-resize requirements.",
      },
      {
        label: "Sidebar",
        status: "parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Current sidebar is app shell, not a reusable UI primitive.",
      },
    ],
  },
  {
    title: "Chat",
    items: [
      {
        label: "ChatSidebar",
        to: "/components/chat-sidebar",
        status: "wip",
        children: [
          { label: "ChatSidebarItem", to: "/components/chat-sidebar-item", status: "wip" },
        ],
      },
      {
        label: "LiveAgentActivityBar",
        to: "/components/live-agent-activity-bar",
        status: "wip",
      },
      { label: "ChatMainPanel", to: "/components/chat-main-panel", status: "wip" },
      { label: "ChatThreadPanel", to: "/components/chat-thread-panel", status: "wip" },
      { label: "MessageItem", to: "/components/message-item", status: "wip" },
      {
        label: "Composer",
        to: "/components/chat-composer",
        status: "wip",
        children: [
          {
            label: "ComposerSuggestions",
            to: "/components/composer-suggestions",
            status: "wip",
          },
        ],
      },
    ],
  },
  {
    title: "Tasks",
    items: [
      { label: "TasksPanel", to: "/components/tasks", status: "wip" },
      { label: "TaskCard", to: "/components/task-card", status: "wip" },
    ],
  },
  {
    title: "Actions",
    items: [
      { label: "Button", to: "/components/button", status: "done" },
      {
        label: "ButtonGroup",
        status: "later",
        docsHref: "https://base-ui.com/react/components/button",
        reason: "Add after grouped action semantics and spacing rules are defined.",
      },
    ],
  },
  {
    title: "Inputs",
    items: [
      { label: "Checkbox", to: "/components/checkbox", status: "done" },
      { label: "Label", to: "/components/label", status: "done" },
      { label: "Field", to: "/components/field", status: "done" },
      { label: "Input", to: "/components/input", status: "done" },
      { label: "InputGroup", to: "/components/input-group", status: "done" },
      { label: "Combobox", to: "/components/combobox", status: "done" },
      { label: "Select", to: "/components/select", status: "done" },
      { label: "RadioGroup", to: "/components/radio-group", status: "done" },
      { label: "SegmentedControl", to: "/components/segmented-control", status: "done" },
      { label: "Switch", to: "/components/switch", status: "wip" },
      { label: "Textarea", to: "/components/textarea", status: "done" },
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
        label: "Calendar / DatePicker",
        status: "parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for a concrete date-picking workflow.",
      },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Tabs", to: "/components/tabs", status: "done" },
      {
        label: "Menubar",
        status: "parked",
        docsHref: "https://base-ui.com/react/components/menubar",
        reason: "Desktop menu-bar pattern is not part of the current product surface.",
      },
      {
        label: "NavigationMenu",
        status: "parked",
        docsHref: "https://base-ui.com/react/components/navigation-menu",
        reason: "Marketing/header navigation primitive; not useful for the current doc shell.",
      },
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
        label: "Command",
        status: "parked",
        docsHref: "https://base-ui.com/react/components/autocomplete",
        reason: "Command palette behavior is product-specific and should be designed separately.",
      },
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
      { label: "CopyableCode", to: "/components/copyable-code", status: "done" },
      { label: "InlineCode", to: "/components/inline-code", status: "done" },
      { label: "Kbd", to: "/components/kbd", status: "done" },
      { label: "Text", to: "/components/text", status: "done" },
      { label: "Status", to: "/components/status", status: "done" },
      {
        label: "Meter",
        status: "later",
        docsHref: "https://base-ui.com/react/components/meter",
        reason: "Wait for bounded metric displays distinct from Progress.",
      },
    ],
  },
  {
    title: "Data Display",
    items: [
      { label: "Avatar", to: "/components/avatar", status: "done" },
      { label: "FilePreview", to: "/components/file-preview", status: "wip" },
      {
        label: "DescriptionList",
        to: "/components/description-list",
        status: "parked",
        reason: "Generic key-value primitive without a real consumer yet; revisit with a use case.",
      },
      {
        label: "Table / DataGrid",
        status: "parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Likely app-specific; design from a real dense-data use case.",
      },
      {
        label: "Carousel",
        status: "parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Not relevant to the current product interface.",
      },
    ],
  },
] as const;

type NavStatus = "done" | "wip" | "todo" | "later" | "parked" | "internal" | "skipped";

type NavItem = {
  label: string;
  to?: string;
  docsHref?: string;
  hash?: string;
  status?: NavStatus;
  reason?: string;
  children?: readonly NavItem[];
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

const sectionTitleClassName = "mb-2.5 pl-[8px] text-[13px] font-medium text-foreground-strong";
const sidebarItemFocusClassName =
  "outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500";
const sidebarItemActiveClassName = "bg-layer-muted text-foreground-strong";
const sidebarItemInactiveClassName = "text-foreground-muted";
const sidebarItemActiveProps = { className: sidebarItemActiveClassName };
const sidebarItemInactiveProps = { className: sidebarItemInactiveClassName };
const sidebarPathActiveOptions = { exact: true, includeSearch: false };
const sidebarHashActiveOptions = { exact: true, includeHash: true, includeSearch: false };

function NavRow({ item, badge, depth = 0 }: { item: NavItem; badge?: ReactNode; depth?: 0 | 1 }) {
  const className = `flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong ${
    depth === 1 ? "text-xs" : "text-[13px]"
  } ${item.to || item.docsHref ? sidebarItemFocusClassName : "cursor-default"} ${
    item.to || item.docsHref ? "" : "text-foreground-muted"
  }`;
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
  const titleClassName =
    items.length > 0
      ? sectionTitleClassName
      : "block rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground-strong transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong";

  return (
    <div>
      {title ? (
        to ? (
          <Link
            to={to}
            activeOptions={sidebarPathActiveOptions}
            activeProps={sidebarItemActiveProps}
            inactiveProps={{ className: "text-foreground-strong" }}
            className={`${titleClassName} ${sidebarItemFocusClassName}`}
          >
            {title}
          </Link>
        ) : (
          <p className={titleClassName}>{title}</p>
        )
      ) : null}
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.label}>
              <NavRow item={item} badge={<StatusBadge status={item.status} />} />
              {item.children ? (
                <ul className="mt-1 ml-2 space-y-1 border-l border-line-subtle pl-2">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <NavRow
                        item={child}
                        depth={1}
                        badge={<StatusBadge status={child.status} />}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-[var(--sidebar-w)] overflow-y-auto px-5 py-6 [scrollbar-width:none] lg:block [&::-webkit-scrollbar]:hidden">
      <Link to="/" className="flex items-center gap-2 text-foreground-strong">
        <img src="/raft-logo.svg" alt="" className="h-5 w-auto shrink-0" />
      </Link>
      <nav className="mt-8 space-y-8">
        <ul className="space-y-1">
          <li>
            <NavRow item={{ label: "Home", to: "/" }} />
          </li>
          <li>
            <NavRow item={{ label: "Installation", to: "/installation" }} />
          </li>
          <li>
            <NavRow item={{ label: "Changelog", to: "/changelog" }} badge={<VersionBadge />} />
          </li>
          <li>
            <NavRow item={{ label: "Playground", to: "/playground" }} />
          </li>
          <li>
            <NavRow item={{ label: "Migration", to: "/migration" }} />
          </li>
        </ul>

        <NavGroup title={SKILLS.title} items={SKILLS.items} />

        {TOKENS.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}

        <Separator className="h-0 bg-transparent border-t border-dashed border-line-muted data-[orientation=horizontal]:w-[65%]" />

        {NAV.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </nav>
    </aside>
  );
}
