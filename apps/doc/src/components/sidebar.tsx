import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "@tanstack/react-router";
import { Badge } from "@raft/ui";
import { IconGlobe3Outline18 } from "nucleo-ui-outline-18";

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
    {
      label: "Colors",
      children: [
        { label: "Brutal", to: "/tokens/colors/brutal" },
        { label: "Elegant", to: "/tokens/colors/elegant", status: "wip" },
      ],
    },
    {
      label: "Typography",
      children: [
        { label: "Brutal", to: "/tokens/typography/brutal" },
        { label: "Elegant", to: "/tokens/typography/elegant" },
      ],
    },
    {
      label: "Shadows",
      children: [
        { label: "Brutal", to: "/tokens/shadows/brutal" },
        { label: "Elegant", to: "/tokens/shadows/elegant" },
      ],
    },
  ],
} as const;

const NAV = [
  {
    title: "Actions",
    items: [
      {
        label: "Button",
        to: "/components/button",
        progress: { theme: "done" },
      },
    ],
    planned: [
      {
        label: "ButtonGroup",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/button",
        reason: "Add after grouped action semantics and spacing rules are defined.",
      },
    ],
  },
  {
    title: "Inputs",
    items: [
      {
        label: "Checkbox",
        to: "/components/checkbox",
        progress: { theme: "done" },
      },
      { label: "Label", to: "/components/label", progress: { theme: "done" } },
      { label: "Field", to: "/components/field", progress: { theme: "done" } },
      { label: "Input", to: "/components/input", progress: { theme: "done" } },
      { label: "InputGroup", to: "/components/input-group", progress: { theme: "done" } },
      { label: "Combobox", to: "/components/combobox", progress: { theme: "done" } },
      { label: "Select", to: "/components/select", progress: { theme: "done" } },
      { label: "Textarea", to: "/components/textarea", progress: { theme: "done" } },
      { label: "ToggleGroup", to: "/components/toggle-group", progress: { theme: "todo" } },
    ],
    planned: [
      {
        label: "Switch",
        priority: "P1",
        docsHref: "https://base-ui.com/react/components/switch",
        reason: "Use for binary settings where Checkbox is the wrong semantic control.",
      },
      {
        label: "RadioGroup",
        priority: "P1",
        docsHref: "https://base-ui.com/react/components/radio",
        reason:
          "Use for mutually exclusive options; do not overload ToggleGroup for radio semantics.",
      },
      {
        label: "NumberField",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/number-field",
        reason: "Wait for real numeric settings with stepper behavior.",
      },
      {
        label: "Slider",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/slider",
        reason: "Wait for range controls such as volume, threshold, or tuning parameters.",
      },
      {
        label: "Calendar / DatePicker",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for a concrete date-picking workflow.",
      },
    ],
  },
  {
    title: "Navigation",
    items: [
      {
        label: "Tabs",
        to: "/components/tabs",
        progress: { theme: "done" },
      },
    ],
    planned: [
      {
        label: "Menubar",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components/menubar",
        reason: "Desktop menu-bar pattern is not part of the current product surface.",
      },
      {
        label: "NavigationMenu",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components/navigation-menu",
        reason: "Marketing/header navigation primitive; not useful for the current doc shell.",
      },
      {
        label: "Breadcrumb",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for deeper routed information architecture.",
      },
      {
        label: "Pagination",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for paged data surfaces.",
      },
      {
        label: "Command",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components/autocomplete",
        reason: "Command palette behavior is product-specific and should be designed separately.",
      },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "BottomSheet", to: "/components/bottom-sheet", progress: { theme: "todo" } },
      { label: "ContextMenu", to: "/components/context-menu", progress: { theme: "done" } },
      { label: "DropdownMenu", to: "/components/dropdown-menu", progress: { theme: "done" } },
      { label: "Lightbox", to: "/components/lightbox", progress: { theme: "todo" } },
      { label: "Popover", to: "/components/popover", progress: { theme: "done" } },
    ],
    planned: [
      {
        label: "Tooltip",
        priority: "P0",
        docsHref: "https://base-ui.com/react/components/tooltip",
        reason: "Replace hand-rolled tooltip positioning and cover icon/status hints.",
      },
      {
        label: "Dialog",
        priority: "P0",
        docsHref: "https://base-ui.com/react/components/dialog",
        reason: "Expose the generic modal primitive behind several current overlay surfaces.",
      },
      {
        label: "AlertDialog",
        priority: "P0",
        docsHref: "https://base-ui.com/react/components/alert-dialog",
        reason: "Use for destructive confirmations instead of app-specific confirm shells.",
      },
      {
        label: "Drawer",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/drawer",
        reason: "Current BottomSheet covers mobile bottom panels; add when side panels need it.",
      },
      {
        label: "PreviewCard",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/preview-card",
        reason: "Useful for hover user/link/message previews, but not a base form gap.",
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      { label: "Banner", to: "/components/banner", progress: { theme: "done" } },
      { label: "EmptyState", to: "/components/empty-state", progress: { theme: "todo" } },
      {
        label: "NotificationCenter",
        to: "/components/notification-center",
        progress: { theme: "done" },
      },
      { label: "Spinner", to: "/components/spinner", progress: { theme: "done" } },
    ],
    planned: [
      {
        label: "Progress",
        priority: "P1",
        docsHref: "https://base-ui.com/react/components/progress",
        reason: "Represent long-running task, upload, and generation progress.",
      },
      {
        label: "Toast",
        priority: "P2",
        docsHref: "https://base-ui.com/react/components/toast",
        reason: "Transient feedback only; keep it separate from NotificationCenter history.",
      },
    ],
  },
  {
    title: "Status & Indicators",
    items: [
      { label: "Badge", to: "/components/badge", progress: { theme: "done" } },
      { label: "InlineCode", to: "/components/inline-code", progress: { theme: "done" } },
      { label: "Kbd", to: "/components/kbd", progress: { theme: "todo" } },
      {
        label: "Status",
        to: "/components/status",
        progress: { theme: "done" },
      },
    ],
    planned: [
      {
        label: "Meter",
        priority: "Later",
        docsHref: "https://base-ui.com/react/components/meter",
        reason: "Wait for bounded metric displays distinct from Progress.",
      },
    ],
  },
  {
    title: "Data Display",
    items: [
      {
        label: "Avatar",
        to: "/components/avatar",
      },
      {
        label: "MediaListItem",
        to: "/components/media-list-item",
        progress: { theme: "todo" },
      },
      {
        label: "ConversationPreviewCard",
        to: "/components/conversation-preview-card",
        progress: { theme: "todo" },
      },
      {
        label: "DescriptionList",
        to: "/components/description-list",
        progress: { theme: "todo" },
      },
      { label: "ListItem", to: "/components/list-item", progress: { theme: "todo" } },
      {
        label: "QuotedMessageCard",
        to: "/components/quoted-message-card",
        progress: { theme: "todo" },
      },
    ],
    planned: [
      {
        label: "Table / DataGrid",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Likely app-specific; design from a real dense-data use case.",
      },
      {
        label: "Carousel",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Not relevant to the current product interface.",
      },
    ],
  },
  {
    title: "Layout",
    items: [
      { label: "PanelHeader", to: "/components/panel-header", progress: { theme: "todo" } },
      { label: "PreviewShell", to: "/components/preview-shell", progress: { theme: "todo" } },
      { label: "SectionLabel", to: "/components/section-label", progress: { theme: "todo" } },
      {
        label: "SectionHeader",
        to: "/components/section-header",
        progress: { theme: "todo" },
      },
    ],
    planned: [
      {
        label: "Separator",
        priority: "P1",
        docsHref: "https://base-ui.com/react/components/separator",
        reason: "Centralize menu, list, and dialog dividers instead of border literals.",
      },
      {
        label: "Collapsible",
        priority: "P2",
        docsHref: "https://base-ui.com/react/components/collapsible",
        reason: "Low-level expand/collapse primitive for settings and dense docs sections.",
      },
      {
        label: "Accordion",
        priority: "P2",
        docsHref: "https://base-ui.com/react/components/accordion",
        reason: "Grouped disclosure pattern; build after Collapsible settles.",
      },
      {
        label: "ScrollArea",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components/scroll-area",
        reason: "Prefer native scrolling until custom scrollbar behavior is required.",
      },
      {
        label: "Resizable",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Wait for explicit panel-resize requirements.",
      },
      {
        label: "Sidebar",
        priority: "Parked",
        docsHref: "https://base-ui.com/react/components",
        reason: "Current sidebar is app shell, not a reusable UI primitive.",
      },
    ],
  },
] as const;

const MIGRATED = {
  title: "Migrated",
  items: [
    {
      label: "MenuItem",
      to: "/components/context-menu",
      hash: "source-comparison",
      target: "ContextMenuItem",
    },
    {
      label: "ContextMenuDivider",
      to: "/components/context-menu",
      hash: "source-comparison",
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
      hash: "source-comparison",
      target: "DropdownMenu composition",
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
      label: "SearchInput",
      to: "/components/input-group",
      hash: "source-comparison",
      target: "InputGroupAddon + Search",
    },
    {
      label: "SlugInput",
      to: "/components/input-group",
      hash: "source-comparison",
      target: "InputGroupAddon.Text",
    },
    {
      label: "FormField",
      to: "/components/field",
      hash: "source-comparison",
      target: "Field + FieldControl + FieldValidity",
    },
    {
      label: "CheckMarker",
      to: "/components/checkbox",
      hash: "migration",
      target: "Checkbox",
    },
    {
      label: "AttentionDot",
      to: "/components/status",
      hash: "migration",
      target: 'Status variant="accent"',
    },
    {
      label: "StatusDot",
      to: "/components/status",
      hash: "source-comparison",
      target: "Status",
    },
    {
      label: "MessageSearchPage filters",
      to: "/components/combobox",
      hash: "source-comparison",
      target: "Combobox",
    },
    {
      label: "TasksPanel filters",
      to: "/components/combobox",
      hash: "source-comparison",
      target: "Combobox",
    },
    {
      label: "NotificationTrigger",
      to: "/components/notification-center",
      hash: "source-comparison-notification-trigger",
      target: "NotificationCenter",
    },
    {
      label: "SelectionPopover",
      to: "/components/dropdown-menu",
      hash: "source-comparison",
      target: "DropdownMenu (plain pickers)",
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
    {
      label: "KeyValueRow",
      to: "/components/description-list",
      hash: "source-comparison",
      target: "DescriptionList",
    },
    {
      label: "SectionEyebrow",
      to: "/components/section-label",
      hash: "source-comparison",
      target: "SectionLabel",
    },
  ],
} as const;

const SOURCE_HOLDS = {
  title: "Deferred",
  items: [
    {
      label: "floatingOverlayPosition",
      status: "skipped",
      reason: "Covered by Base UI Positioner; revisit only for pointer-anchored overlays.",
    },
    {
      label: "useFloatingOverlayPosition",
      status: "skipped",
      reason: "Covered by Base UI Positioner; avoid a second overlay positioning layer.",
    },
    {
      label: "TaskCard",
      status: "deferred",
      reason: "Store, auth, permissions, and thread-panel coupled; extract visual subparts first.",
    },
    {
      label: "TaskItem",
      status: "deferred",
      reason: "Store, auth, permissions, and thread-panel coupled; extract visual subparts first.",
    },
    {
      label: "TaskBoard",
      status: "deferred",
      reason: "Task store and view-state coupled; not a reusable UI primitive yet.",
    },
    {
      label: "ActionCard",
      status: "deferred",
      reason: "Action metadata, dialogs, stores, and side effects are app-bound.",
    },
    {
      label: "MessageItem",
      status: "deferred",
      reason: "Large app surface with router, stores, reactions, and mobile overlays.",
    },
    {
      label: "CardSurface",
      status: "deferred",
      reason:
        "Potential shared surface layer for ListItem, PreviewShell, ConversationPreviewCard, and QuotedMessageCard; extract only the skin/state contract, not the content slots.",
    },
    {
      label: "SandboxedPreviewFrame",
      status: "skipped",
      reason:
        "Security utility, not a design-system component: keep it app-local with fixed iframe sandbox/referrer policy.",
    },
  ],
} as const;

type TaskStatus = "done" | "in-progress" | "todo";
type Progress = {
  theme?: TaskStatus;
};

const DEFAULT_PROGRESS = {
  theme: "todo",
} as const satisfies Progress;

const TASK_STATUS = {
  done: { label: "Done", short: "Done" },
  "in-progress": { label: "In progress", short: "WIP" },
  todo: { label: "Todo", short: "TODO" },
} as const satisfies Record<TaskStatus, { label: string; short: string }>;

type NavItem = {
  label: string;
  to?: string;
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

type SourceHoldItem = {
  label: string;
  status: "deferred" | "skipped";
  reason: string;
};

type PlannedPriority = "P0" | "P1" | "P2" | "Later" | "Parked";

type PlannedItem = {
  label: string;
  priority: PlannedPriority;
  docsHref: string;
  reason: string;
};

type BadgeVariant =
  | "default"
  | "primary"
  | "information"
  | "muted"
  | "accent"
  | "success"
  | "danger";

const sectionTitleClassName = "mb-2.5 text-[13px] font-medium text-foreground-strong";
const sidebarItemFocusClassName =
  "outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500";

function NavLink({
  to,
  label,
  hash,
  badge,
  depth = 0,
}: NavItem & { to: string; badge?: ReactNode; depth?: 0 | 1 }) {
  const location = useLocation();
  const isActive = location.pathname === to && (hash ? location.hash === hash : !location.hash);

  return (
    <Link
      to={to}
      hash={hash}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong ${
        depth === 1 ? "text-xs" : "text-[13px]"
      } ${isActive ? "bg-layer-muted text-foreground-strong" : "text-foreground-muted"} ${sidebarItemFocusClassName}`}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}

function NavGroupLabel({ label, badge }: { label: string; badge?: ReactNode }) {
  return (
    <span className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground-strong">
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </span>
  );
}

function ProgressBadge({ progress }: { progress?: Progress }) {
  const status = progress?.theme ?? DEFAULT_PROGRESS.theme;
  const variant = status === "todo" ? "default" : "primary";

  if (status === "done") {
    return null;
  }

  return (
    <Badge
      appearance="solid"
      variant={variant}
      title={`Theme: ${TASK_STATUS[status].label}`}
      aria-label={`Theme: ${TASK_STATUS[status].label}`}
      uppercase
      className="h-4 min-w-9 shrink-0 justify-center px-1 text-[9px]"
    >
      {TASK_STATUS[status].short}
    </Badge>
  );
}

function NavItemBadge({ item }: { item: NavItem }) {
  if (item.status === "wip") {
    return (
      <Badge appearance="solid" variant="primary" uppercase className="h-4 px-1.5 text-[9px]">
        WIP
      </Badge>
    );
  }

  if (!item.progress) {
    return null;
  }

  return <ProgressBadge progress={item.progress} />;
}

function MigratedLink({ to, label, hash, target }: MigratedItem) {
  const location = useLocation();
  const [tooltip, setTooltip] = useState<{ left: number; top: number } | null>(null);
  const isActive = location.pathname === to && (hash ? location.hash === hash : !location.hash);

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
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={(event) => showTooltip(event.currentTarget)}
        onMouseMove={(event) => showTooltip(event.currentTarget)}
        onMouseLeave={() => setTooltip(null)}
        onPointerEnter={(event) => showTooltip(event.currentTarget)}
        onPointerMove={(event) => showTooltip(event.currentTarget)}
        onPointerLeave={() => setTooltip(null)}
        onFocus={(event) => showTooltip(event.currentTarget)}
        onBlur={() => setTooltip(null)}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] line-through decoration-foreground-placeholder decoration-2 transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong ${
          isActive ? "bg-layer-muted text-foreground-strong" : "text-foreground-muted"
        } ${sidebarItemFocusClassName}`}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
      {tooltip
        ? createPortal(
            <span
              className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap border border-line-subtle bg-layer-panel px-2 py-1 text-xs font-medium text-foreground-muted no-underline shadow-lg"
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

function NavGroup({
  title,
  items,
  planned,
}: {
  title?: string;
  items: readonly NavItem[];
  planned?: readonly PlannedItem[];
}) {
  return (
    <div>
      {title ? <p className={sectionTitleClassName}>{title}</p> : null}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <NavLink {...item} to={item.to} badge={<NavItemBadge item={item} />} />
            ) : (
              <NavGroupLabel label={item.label} badge={<NavItemBadge item={item} />} />
            )}
            {item.children ? (
              <ul className="mt-1 space-y-1 pl-3">
                {item.children.map((child) => (
                  <li key={child.label}>
                    {child.to ? (
                      <NavLink
                        {...child}
                        to={child.to}
                        depth={1}
                        badge={<NavItemBadge item={child} />}
                      />
                    ) : (
                      <NavGroupLabel label={child.label} badge={<NavItemBadge item={child} />} />
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
        {planned?.map((item) => (
          <li key={item.label}>
            <PlannedRow {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MigratedGroup({ title, items }: { title: string; items: readonly MigratedItem[] }) {
  return (
    <div>
      <p className={sectionTitleClassName}>{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={`${item.label}-${item.to}-${item.hash ?? ""}`}>
            <MigratedLink {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceHoldGroup({ title, items }: { title: string; items: readonly SourceHoldItem[] }) {
  return (
    <div>
      <p className={sectionTitleClassName}>{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <SourceHoldRow {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceHoldRow({ label, status, reason }: SourceHoldItem) {
  const [tooltip, setTooltip] = useState<{ left: number; top: number } | null>(null);
  const statusLabel = status === "deferred" ? "Deferred" : "Skipped";
  const statusVariant = status === "deferred" ? "primary" : "muted";

  const showTooltip = (element: HTMLElement) => {
    if (status !== "skipped") return;
    const rect = element.getBoundingClientRect();
    setTooltip({
      left: rect.right + 8,
      top: rect.top + rect.height / 2,
    });
  };

  return (
    <>
      <span
        title={status === "skipped" ? undefined : `${statusLabel}: ${reason}`}
        aria-label={`${label}: ${statusLabel}. ${reason}`}
        onMouseEnter={(event) => showTooltip(event.currentTarget)}
        onMouseMove={(event) => showTooltip(event.currentTarget)}
        onMouseLeave={() => setTooltip(null)}
        onPointerEnter={(event) => showTooltip(event.currentTarget)}
        onPointerMove={(event) => showTooltip(event.currentTarget)}
        onPointerLeave={() => setTooltip(null)}
        onFocus={(event) => showTooltip(event.currentTarget)}
        onBlur={() => setTooltip(null)}
        className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground-muted transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong"
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <Badge
          appearance="solid"
          variant={statusVariant}
          uppercase
          className="h-4 shrink-0 px-1 text-[9px]"
        >
          {statusLabel}
        </Badge>
      </span>
      {tooltip
        ? createPortal(
            <span
              className="pointer-events-none fixed z-50 max-w-72 -translate-y-1/2 border border-line-subtle bg-layer-panel px-2 py-1 text-xs font-medium text-foreground-muted shadow-lg"
              style={{ left: tooltip.left, top: tooltip.top }}
            >
              {reason}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}

function PlannedRow({ label, priority, docsHref, reason }: PlannedItem) {
  return (
    <a
      href={docsHref}
      target="_blank"
      rel="noreferrer"
      title={`${priority}: ${reason}`}
      aria-label={`${label}: ${priority}. ${reason} Open Base UI docs.`}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground-muted transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong ${sidebarItemFocusClassName}`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="min-w-0 truncate">{label}</span>
        <IconGlobe3Outline18 className="size-3 shrink-0 opacity-50" aria-hidden />
      </span>
      <PriorityBadge priority={priority} />
    </a>
  );
}

function PriorityBadge({ priority }: { priority: PlannedPriority }) {
  const variants = {
    P0: "danger",
    P1: "primary",
    P2: "information",
    Later: "accent",
    Parked: "default",
  } satisfies Record<PlannedPriority, BadgeVariant>;
  const variant = variants[priority];

  return (
    <Badge appearance="solid" variant={variant} uppercase className="h-4 shrink-0 px-1 text-[9px]">
      {priority}
    </Badge>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-[var(--rail-w)] overflow-y-auto px-5 py-6 [scrollbar-width:none] lg:block [&::-webkit-scrollbar]:hidden">
      <Link to="/" className="flex items-center gap-2 text-foreground-strong">
        <img src="/raft-logo.svg" alt="" className="h-5 w-auto shrink-0" />
      </Link>
      <nav className="mt-8 space-y-8">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" label="Home" />
          </li>
          <li>
            <NavLink to="/setup" label="Installation" />
          </li>
          <li>
            <NavLink to="/playground" label="Playground" />
          </li>
        </ul>

        <NavGroup title={SKILLS.title} items={SKILLS.items} />

        {TOKENS.items.map((group) => (
          <NavGroup key={group.label} title={group.label} items={group.children} />
        ))}

        {NAV.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}

        <MigratedGroup title={MIGRATED.title} items={MIGRATED.items} />

        <SourceHoldGroup title={SOURCE_HOLDS.title} items={SOURCE_HOLDS.items} />
      </nav>
    </aside>
  );
}
