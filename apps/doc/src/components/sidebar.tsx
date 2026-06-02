import { Link } from "@tanstack/react-router";

const NAV = [
  {
    title: "Getting Started",
    items: [{ label: "Introduction", to: "/" }],
  },
  {
    title: "Actions",
    items: [{ label: "Button", to: "/components/button", status: "in-progress" }],
  },
  {
    title: "Inputs",
    items: [
      { label: "Checkbox", to: "/components/checkbox", status: "in-progress" },
      { label: "FormField" },
      { label: "SearchInput" },
      { label: "SegmentedControl" },
      { label: "SlugInput" },
      { label: "Textarea" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "MenuItem" },
      { label: "ReorderablePanelTabs" },
      { label: "ServerSwitcherMenu" },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "BottomSheet" },
      { label: "ContextMenuDivider" },
      { label: "DismissBackdrop" },
      { label: "Lightbox" },
      { label: "SelectionPopover" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { label: "Banner" },
      { label: "EmptyState" },
      { label: "NotificationCenter" },
      { label: "Spinner" },
    ],
  },
  {
    title: "Status & Indicators",
    items: [
      { label: "AttentionDot" },
      { label: "Badge", to: "/components/badge", status: "in-progress" },
      { label: "BadgeButton", to: "/components/badge-button", status: "in-progress" },
      { label: "CheckMarker", to: "/components/check-marker", status: "in-progress" },
      { label: "ExperimentalBadge" },
      { label: "StatusDot" },
    ],
  },
  {
    title: "Data Display",
    items: [
      { label: "AvatarListRow" },
      { label: "AvatarSlot" },
      { label: "ConversationPreviewCard" },
      { label: "KeyValueRow" },
      { label: "QuotedMessageCard" },
      { label: "SurfaceListItem" },
    ],
  },
  {
    title: "Layout",
    items: [
      { label: "PanelHeader" },
      { label: "PreviewShell" },
      { label: "SandboxedPreviewFrame" },
      { label: "SectionEyebrow" },
      { label: "SectionHeader" },
    ],
  },
] as const;

// Progress badges. Unbuilt entries (no page) fall back to "planned"; a built page
// keeps its explicit status until it drops the badge once done.
const STATUS = {
  planned: { label: "Planned", className: "bg-gray-100 text-gray-500" },
  "in-progress": { label: "WIP", className: "bg-amber-100 text-amber-700" },
  review: { label: "Review", className: "bg-violet-100 text-violet-700" },
} as const;

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 h-screen w-[var(--rail-w)] overflow-y-auto border-r border-gray-200 px-5 py-6">
      <Link to="/" className="block text-sm font-semibold tracking-tight text-gray-900">
        slock-ui
      </Link>
      <nav className="mt-8 space-y-7">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const key = "status" in item ? item.status : "to" in item ? null : "planned";
                const badge = key ? (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS[key].className}`}
                  >
                    {STATUS[key].label}
                  </span>
                ) : null;

                return (
                  <li key={item.label}>
                    {"to" in item ? (
                      <Link
                        to={item.to}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        activeProps={{ className: "bg-gray-100 font-medium text-gray-900" }}
                        activeOptions={{ exact: item.to === "/" }}
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {badge}
                      </Link>
                    ) : (
                      <span className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400">
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {badge}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
