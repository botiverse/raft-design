// Proposal mock (B3). In the implementation this whole file is generated from
// the front matter of packages/ui/src/components/<x>/<x>.md: `title`, `summary`,
// `status`, `aliases`, `category`, `related`. Until those docs exist, the
// categories and aliases below are copied from design/authoring/migration.md,
// and `status` follows the export (raft-ui/wip = experimental).

export type ComponentStatus = "experimental" | "stable" | "deprecated";

export type CatalogEntry = {
  slug: string;
  title: string;
  category: CategoryId;
  status: ComponentStatus;
  aliases: readonly string[];
};

export const CATEGORIES = [
  { id: "actions", title: "Actions" },
  { id: "inputs", title: "Inputs" },
  { id: "navigation", title: "Navigation" },
  { id: "identity", title: "Identity" },
  { id: "status", title: "Status" },
  { id: "content", title: "Content" },
  { id: "agents", title: "Agents" },
  { id: "overlays", title: "Overlays" },
  { id: "feedback", title: "Feedback" },
  { id: "layout", title: "Layout" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

type Row = [
  slug: string,
  category: CategoryId,
  aliases?: readonly string[],
  status?: ComponentStatus,
];

const ROWS: readonly Row[] = [
  ["button", "actions", ["IconButton"]],
  ["float-button", "actions"],
  ["toggle-group", "actions"],
  ["input", "inputs", ["TextField"]],
  ["field", "inputs"],
  ["input-group", "inputs"],
  ["textarea", "inputs"],
  ["label", "inputs"],
  ["checkbox", "inputs"],
  ["radio-group", "inputs", ["Radio"]],
  ["switch", "inputs", ["Toggle"]],
  ["select", "inputs"],
  ["combobox", "inputs", ["Autocomplete"]],
  ["combobox-select", "inputs", [], "experimental"],
  ["picker-trigger-button", "inputs"],
  ["segmented-control", "inputs"],
  ["composer", "inputs", ["Message input"]],
  ["app-rail", "navigation", ["Rail"]],
  ["sidebar", "navigation"],
  ["mobile-nav", "navigation", ["TabBar", "Bottom navigation"]],
  ["tabs", "navigation"],
  ["steps", "navigation", ["Stepper"]],
  ["search", "navigation"],
  ["avatar", "identity"],
  ["icon-tile", "identity", ["ChannelIcon"]],
  ["logo", "identity"],
  ["badge", "status", ["Count", "Unread"]],
  ["status", "status", ["StatusChip", "Presence"]],
  ["tasks", "status", ["TaskChip", "TaskStatusBadge"]],
  ["message-item", "content", ["Message"]],
  ["system-message", "content", ["Event row"]],
  ["message-replies", "content"],
  ["message-attachment", "content", ["Attachment"]],
  ["message-embed", "content"],
  ["message-quoted-preview", "content", ["Quote"]],
  ["message-forwarded-bundle", "content"],
  ["message-translation", "content"],
  ["message-list", "content"],
  ["file-preview", "content"],
  ["files", "content"],
  ["inline-code", "content", ["Code"]],
  ["copyable-code", "content", ["Command"]],
  ["code-block", "content"],
  ["description-list", "content", ["PropertyList"]],
  ["list-row", "content", ["ListRow", "Cell"]],
  ["task-card", "content", ["TaskCard"]],
  ["task-board", "content", ["Kanban"]],
  ["task-list", "content"],
  ["timeline", "content"],
  ["table", "content"],
  ["markdown", "content"],
  ["kbd", "content", ["Shortcut"]],
  ["text", "content", ["Typography"]],
  ["icons", "content"],
  ["inbox-item", "content", ["Inbox"]],
  ["activity-inbox", "content", ["Activity"]],
  ["notification-center", "content", ["Notifications", "Bell"]],
  ["message-action-card", "agents", ["ActionCard"]],
  ["live-agent-activity-bar", "agents", [], "deprecated"],
  ["dialog", "overlays", ["Modal"]],
  ["alert-dialog", "overlays", ["Confirm"]],
  ["announcement-dialog", "overlays", [], "experimental"],
  ["drawer", "overlays", ["Sheet", "BottomSheet"]],
  ["popover", "overlays"],
  ["preview-card", "overlays", ["Hover card", "Profile card"]],
  ["dropdown-menu", "overlays", ["Menu"]],
  ["context-menu", "overlays", ["Right-click menu"]],
  ["tooltip", "overlays"],
  ["lightbox", "overlays", ["Image viewer"]],
  ["banner", "feedback", ["Alert", "Callout"]],
  ["toast", "feedback", ["Snackbar", "Notification"]],
  ["empty-state", "feedback", ["EmptyState"]],
  ["skeleton", "feedback", ["Loading"]],
  ["spinner", "feedback", ["Loading", "Pixel loader"]],
  ["progress", "feedback", ["Progress bar"]],
  ["app-shell", "layout"],
  ["panel", "layout", ["NavBar", "Header"]],
  ["conversation-panel", "layout"],
  ["thread-panel", "layout"],
  ["profile-panel", "layout"],
  ["form-section", "layout"],
  ["card", "layout"],
  ["resizable", "layout", ["Split view"]],
  ["scroll-area", "layout"],
  ["separator", "layout", ["Divider"]],
  ["legacy-task-panel", "layout", [], "deprecated"],
  ["task-dnd", "layout", [], "deprecated"],
];

export function titleOf(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

export const CATALOG: readonly CatalogEntry[] = ROWS.map(
  ([slug, category, aliases = [], status = "stable"]) => ({
    slug,
    title: titleOf(slug),
    category,
    status,
    aliases,
  }),
);

export function catalogEntry(slug: string) {
  return CATALOG.find((entry) => entry.slug === slug);
}
