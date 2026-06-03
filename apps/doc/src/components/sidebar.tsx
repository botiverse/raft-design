import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { StatusBadge, type StatusKey } from "#/components/status-badge.tsx";

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
    { label: "Colors", to: "/tokens/colors" },
    { label: "Typography", to: "/tokens/typography" },
    { label: "Shadows", to: "/tokens/shadows" },
  ],
} as const;

const NAV = [
  {
    title: "Actions",
    items: [{ label: "Button", to: "/components/button", status: "in-progress" }],
  },
  {
    title: "Inputs",
    items: [
      { label: "Checkbox", to: "/components/checkbox", status: "in-progress" },
      { label: "Field", to: "/components/field", status: "in-progress" },
      { label: "Input", to: "/components/input", status: "in-progress" },
      { label: "InputGroup", to: "/components/input-group", status: "in-progress" },
      { label: "SegmentedControl", to: "/components/segmented-control", status: "in-progress" },
      { label: "Textarea", to: "/components/textarea", status: "in-progress" },
    ],
  },
  {
    title: "Navigation",
    items: [
      {
        label: "ReorderablePanelTabs",
        to: "/components/reorderable-panel-tabs",
        status: "in-progress",
      },
      {
        label: "ServerSwitcherMenu",
        to: "/components/server-switcher-menu",
        status: "in-progress",
      },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "BottomSheet", to: "/components/bottom-sheet", status: "in-progress" },
      { label: "ContextMenu", to: "/components/context-menu", status: "in-progress" },
      { label: "DismissBackdrop", to: "/components/dismiss-backdrop", status: "in-progress" },
      { label: "DropdownMenu", to: "/components/dropdown-menu", status: "in-progress" },
      { label: "Lightbox", to: "/components/lightbox", status: "in-progress" },
      { label: "SelectionPopover", to: "/components/selection-popover", status: "in-progress" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { label: "Banner", to: "/components/banner", status: "in-progress" },
      { label: "EmptyState", to: "/components/empty-state", status: "in-progress" },
      { label: "NotificationCenter", to: "/components/notification-center", status: "in-progress" },
      { label: "Spinner", to: "/components/spinner", status: "in-progress" },
    ],
  },
  {
    title: "Status & Indicators",
    items: [
      { label: "AttentionDot", to: "/components/attention-dot", status: "in-progress" },
      { label: "Badge", to: "/components/badge", status: "in-progress" },
      { label: "BadgeButton", to: "/components/badge-button", status: "in-progress" },
      { label: "CheckMarker", to: "/components/check-marker", status: "in-progress" },
      { label: "StatusDot", to: "/components/status-dot", status: "in-progress" },
    ],
  },
  {
    title: "Data Display",
    items: [
      {
        label: "Avatar",
        to: "/components/avatar",
        status: "in-progress",
        children: [
          { label: "AvatarImage", to: "/components/avatar", hash: "image", status: "in-progress" },
          { label: "AvatarBadge", to: "/components/avatar", hash: "badge", status: "in-progress" },
          { label: "AvatarGroup", to: "/components/avatar", hash: "group", status: "in-progress" },
        ],
      },
      { label: "AvatarListRow", to: "/components/avatar-list-row", status: "in-progress" },
      {
        label: "ConversationPreviewCard",
        to: "/components/conversation-preview-card",
        status: "in-progress",
      },
      { label: "KeyValueRow", to: "/components/key-value-row", status: "in-progress" },
      { label: "QuotedMessageCard", to: "/components/quoted-message-card", status: "in-progress" },
      { label: "SurfaceListItem", to: "/components/surface-list-item", status: "in-progress" },
    ],
  },
  {
    title: "Layout",
    items: [
      { label: "PanelHeader", to: "/components/panel-header", status: "in-progress" },
      { label: "PreviewShell", to: "/components/preview-shell", status: "in-progress" },
      {
        label: "SandboxedPreviewFrame",
        to: "/components/sandboxed-preview-frame",
        status: "in-progress",
      },
      { label: "SectionEyebrow", to: "/components/section-eyebrow", status: "in-progress" },
      { label: "SectionHeader", to: "/components/section-header", status: "in-progress" },
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
      label: "ExperimentalBadge",
      to: "/components/badge",
      hash: "experimental",
      target: "Badge.Experimental",
    },
  ],
} as const;

type NavItem = {
  label: string;
  to: string;
  status?: StatusKey;
  hash?: string;
  children?: readonly NavItem[];
};

type MigratedItem = {
  label: string;
  to: string;
  hash: string;
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

function MigratedLink({ to, label, hash, target }: MigratedItem) {
  return (
    <Link
      to={to}
      hash={hash}
      title={`${label} migrated to ${target}`}
      aria-label={`${label} migrated to ${target}`}
      className="group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400 line-through decoration-gray-400 decoration-2 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 no-underline shadow-lg group-hover:block">
        Migrated to {target}
      </span>
    </Link>
  );
}

function NavGroup({ title, items }: { title: string; items: readonly NavItem[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink {...item} badge={<StatusBadge status={item.status} />} />
            {item.children ? (
              <ul className="mt-1 space-y-1 pl-3">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <NavLink {...child} badge={<StatusBadge status={child.status} />} />
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
