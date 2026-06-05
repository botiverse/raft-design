import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./status-badge.tsx";

const SKILLS = {
  title: "Skills",
  items: [
    { label: "migration.md", to: "/skills/migration" },
    { label: "new-component.md", to: "/skills/new-component" },
  ],
} as const;

const TOKENS = {
  title: "Tokens",
  items: [
    { label: "Colors", to: "/tokens/colors", status: "wip" },
    { label: "Typography", to: "/tokens/typography", status: "wip" },
    { label: "Shadows", to: "/tokens/shadows", status: "wip" },
  ],
} as const;

const NAV = [
  {
    title: "Actions",
    items: [{ label: "Button", to: "/components/button", progress: { structure: "done" } }],
  },
  {
    title: "Inputs",
    items: [
      { label: "Checkbox", to: "/components/checkbox", progress: { structure: "done" } },
      {
        label: "CheckIndicator",
        to: "/components/check-indicator",
        progress: { structure: "done" },
      },
      { label: "Field", to: "/components/field", progress: { structure: "done" } },
      { label: "Input", to: "/components/input", progress: { structure: "done" } },
      { label: "InputGroup", to: "/components/input-group", progress: { structure: "done" } },
      { label: "Textarea", to: "/components/textarea", progress: { structure: "done" } },
      { label: "ToggleGroup", to: "/components/toggle-group", progress: { structure: "done" } },
    ],
  },
  {
    title: "Navigation",
    items: [
      {
        label: "Tabs",
        to: "/components/tabs",
        progress: { structure: "done" },
      },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "BottomSheet", to: "/components/bottom-sheet", progress: { structure: "done" } },
      { label: "ContextMenu", to: "/components/context-menu", progress: { structure: "done" } },
      { label: "DropdownMenu", to: "/components/dropdown-menu", progress: { structure: "done" } },
      { label: "Lightbox", to: "/components/lightbox", progress: { structure: "done" } },
      { label: "Popover", to: "/components/popover", progress: { structure: "done" } },
    ],
  },
  {
    title: "Feedback",
    items: [
      { label: "Banner", to: "/components/banner", progress: { structure: "done" } },
      { label: "EmptyState", to: "/components/empty-state", progress: { structure: "done" } },
      {
        label: "NotificationCenter",
        to: "/components/notification-center",
        progress: { structure: "done" },
      },
      { label: "Spinner", to: "/components/spinner", progress: { structure: "done" } },
    ],
  },
  {
    title: "Status & Indicators",
    items: [
      { label: "Badge", to: "/components/badge", progress: { structure: "done" } },
      { label: "Status", to: "/components/status", progress: { structure: "done" } },
    ],
  },
  {
    title: "Data Display",
    items: [
      {
        label: "Avatar",
        to: "/components/avatar",
        progress: { structure: "done" },
      },
      {
        label: "MediaListItem",
        to: "/components/media-list-item",
        progress: { structure: "done" },
      },
      {
        label: "ConversationPreviewCard",
        to: "/components/conversation-preview-card",
        progress: { structure: "done" },
      },
      { label: "KeyValueRow", to: "/components/key-value-row" },
      { label: "ListItem", to: "/components/list-item", progress: { structure: "done" } },
      { label: "QuotedMessageCard", to: "/components/quoted-message-card" },
    ],
  },
  {
    title: "Layout",
    items: [
      { label: "PanelHeader", to: "/components/panel-header" },
      { label: "PreviewShell", to: "/components/preview-shell" },
      {
        label: "SandboxedPreviewFrame",
        to: "/components/sandboxed-preview-frame",
      },
      { label: "SectionEyebrow", to: "/components/section-eyebrow" },
      { label: "SectionHeader", to: "/components/section-header" },
    ],
  },
] as const;

const MIGRATED = {
  title: "Migrated",
  items: [
    {
      label: "MenuItem",
      to: "/components/context-menu",
      hash: "migration",
      target: "ContextMenuItem",
    },
    {
      label: "ContextMenuDivider",
      to: "/components/context-menu",
      hash: "migration",
      target: "ContextMenuSeparator",
    },
    {
      label: "DismissBackdrop",
      to: "/components/bottom-sheet",
      hash: "source-comparison",
      target: "overlay-owned dismiss behavior",
    },
    {
      label: "ServerSwitcherMenu",
      to: "/components/dropdown-menu",
      hash: "migration",
      target: "DropdownMenu + DropdownMenuActionItem",
    },
    {
      label: "ExperimentalBadge",
      to: "/components/badge",
      hash: "experimental",
      target: "Badge.Experimental",
    },
    {
      label: "BadgeButton",
      to: "/components/badge",
      hash: "badge-button",
      target: 'Badge render={<button type="button" />}',
    },
    {
      label: "CheckMarker",
      to: "/components/check-indicator",
      hash: "source-comparison",
      target: "CheckIndicator",
    },
    {
      label: "AttentionDot",
      to: "/components/status",
      hash: "attention",
      target: "Status.Attention",
    },
    {
      label: "StatusDot",
      to: "/components/status",
      hash: "source-comparison",
      target: "Status",
    },
    {
      label: "SelectionPopover",
      to: "/components/popover",
      hash: "migration",
      target: "Popover",
    },
    {
      label: "SegmentedControl",
      to: "/components/toggle-group",
      hash: "source-comparison",
      target: "ToggleGroup",
    },
    {
      label: "ReorderablePanelTabs",
      to: "/components/tabs",
      hash: "source-comparison",
      target: "Tabs + SortableTabsList",
    },
    {
      label: "AvatarSlot",
      to: "/components/avatar",
      target: "Avatar",
    },
    {
      label: "AgentAvatar",
      to: "/components/avatar",
      target: "AvatarImage + AvatarFallback",
    },
    {
      label: "GravatarAvatar",
      to: "/components/avatar",
      target: "AvatarImage + AvatarFallback",
    },
    {
      label: "AvatarListRow",
      to: "/components/media-list-item",
      hash: "source-comparison",
      target: "MediaListItem",
    },
    {
      label: "SurfaceListItem",
      to: "/components/list-item",
      hash: "source-comparison",
      target: "ListItem",
    },
  ],
} as const;

type TaskKey = "migration" | "structure" | "elegant";
type TaskStatus = "done" | "in-progress" | "todo";
type Progress = Partial<Record<TaskKey, TaskStatus>>;

const DEFAULT_PROGRESS = {
  migration: "done",
  structure: "in-progress",
  elegant: "todo",
} as const satisfies Record<TaskKey, TaskStatus>;

const TASKS = {
  migration: { short: "Mig", label: "Migration" },
  structure: { short: "Struct", label: "Structure" },
  elegant: { short: "Theme", label: "Elegant theme" },
} as const satisfies Record<TaskKey, { short: string; label: string }>;

const TASK_STATUS = {
  done: { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "in-progress": { label: "In progress", className: "border-amber-200 bg-amber-50 text-amber-700" },
  todo: { label: "Todo", className: "border-gray-200 bg-gray-50 text-gray-400" },
} as const satisfies Record<TaskStatus, { label: string; className: string }>;

type NavItem = {
  label: string;
  to: string;
  hash?: string;
  progress?: Progress;
  status?: "wip";
  children?: readonly NavItem[];
};

type MigratedItem = {
  label: string;
  to: string;
  hash?: string;
  target: string;
};

function NavLink({ to, label, hash, badge }: NavItem & { badge?: ReactNode }) {
  return (
    <Link
      to={to}
      hash={hash}
      // Match the hash too, so anchor sub-links don't all light up on the same page.
      activeOptions={{ includeHash: true }}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      activeProps={{ className: "bg-gray-100 font-medium text-gray-900" }}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}

function ProgressBadges({ progress }: { progress?: Progress }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1" aria-label="Component status">
      {(Object.keys(TASKS) as TaskKey[]).map((task) => {
        const status = progress?.[task] ?? DEFAULT_PROGRESS[task];
        const taskLabel = TASKS[task].label;
        const statusLabel = TASK_STATUS[status].label;
        return (
          <span
            key={task}
            title={`${taskLabel}: ${statusLabel}`}
            aria-label={`${taskLabel}: ${statusLabel}`}
            className={`inline-flex h-4 min-w-9 items-center justify-center border px-1 text-[9px] font-bold leading-none ${TASK_STATUS[status].className}`}
          >
            {TASKS[task].short}
          </span>
        );
      })}
    </span>
  );
}

function NavItemBadge({ item }: { item: NavItem }) {
  if (item.status === "wip") {
    return <StatusBadge status="in-progress" />;
  }

  return <ProgressBadges progress={item.progress} />;
}

function MigratedLink({ to, label, hash, target }: MigratedItem) {
  const [tooltip, setTooltip] = useState<{ left: number; top: number } | null>(null);

  const showTooltip = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTooltip({
      left: rect.right + 8,
      top: rect.top + rect.height / 2,
    });
  };

  return (
    <>
      <Link
        to={to}
        hash={hash}
        title={`${label} migrated to ${target}`}
        aria-label={`${label} migrated to ${target}`}
        onMouseEnter={(event) => showTooltip(event.currentTarget)}
        onMouseMove={(event) => showTooltip(event.currentTarget)}
        onMouseLeave={() => setTooltip(null)}
        onPointerEnter={(event) => showTooltip(event.currentTarget)}
        onPointerMove={(event) => showTooltip(event.currentTarget)}
        onPointerLeave={() => setTooltip(null)}
        onFocus={(event) => showTooltip(event.currentTarget)}
        onBlur={() => setTooltip(null)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400 line-through decoration-gray-400 decoration-2 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
      {tooltip
        ? createPortal(
            <span
              className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 no-underline shadow-lg"
              style={{ left: tooltip.left, top: tooltip.top }}
            >
              Migrated to {target}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}

function NavGroup({ title, items }: { title: string; items: readonly NavItem[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink {...item} badge={<NavItemBadge item={item} />} />
            {item.children ? (
              <ul className="mt-1 space-y-1 pl-3">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <NavLink {...child} badge={<NavItemBadge item={child} />} />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MigratedGroup({ title, items }: { title: string; items: readonly MigratedItem[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <MigratedLink {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 h-screen w-[var(--rail-w)] overflow-y-auto border-r border-gray-200 px-5 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link to="/" className="flex items-center gap-2 text-gray-900">
        <img src="/favicon-32x32.png" alt="" className="size-5 shrink-0 rounded-sm" />
        <span className="text-sm font-semibold leading-tight tracking-tight">
          Slock Design System
        </span>
      </Link>
      <nav className="mt-8 space-y-7">
        <ul className="space-y-1">
          <li>
            <NavLink to="/setup" label="Setup" />
          </li>
          <li>
            <span className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-gray-900">
              {SKILLS.title}
            </span>
            <ul className="mt-1 space-y-1 pl-3">
              {SKILLS.items.map((item) => (
                <li key={item.label}>
                  <NavLink to={item.to} label={item.label} />
                </li>
              ))}
            </ul>
          </li>
          <li>
            <NavLink to="/playground" label="Playground" />
          </li>
        </ul>

        <hr className="border-gray-200" />

        <NavGroup title={TOKENS.title} items={TOKENS.items} />

        <hr className="border-gray-200" />

        {NAV.map((group) => (
          <NavGroup key={group.title} title={group.title} items={group.items} />
        ))}

        <hr className="border-gray-200" />

        <MigratedGroup title={MIGRATED.title} items={MIGRATED.items} />
      </nav>
    </aside>
  );
}
