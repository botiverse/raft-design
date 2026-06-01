import { Link } from "@tanstack/react-router";

const NAV = [
  {
    title: "Getting Started",
    items: [{ label: "Introduction", to: "/" }],
  },
  {
    title: "Components",
    items: [
      { label: "AttentionDot" },
      { label: "AvatarListRow" },
      { label: "AvatarSlot" },
      { label: "Badge" },
      { label: "Banner" },
      { label: "BottomSheet" },
      { label: "Button", to: "/components/button" },
      { label: "Checkbox" },
      { label: "CheckMarker" },
      { label: "ContextMenuDivider" },
      { label: "ConversationPreviewCard" },
      { label: "DismissBackdrop" },
      { label: "EmptyState" },
      { label: "ExperimentalBadge" },
      { label: "FormField" },
      { label: "KeyValueRow" },
      { label: "Lightbox" },
      { label: "MenuItem" },
      { label: "NotificationCenter" },
      { label: "PanelHeader" },
      { label: "PreviewShell" },
      { label: "QuotedMessageCard" },
      { label: "ReorderablePanelTabs" },
      { label: "SandboxedPreviewFrame" },
      { label: "SearchInput" },
      { label: "SectionEyebrow" },
      { label: "SectionHeader" },
      { label: "SegmentedControl" },
      { label: "SelectionPopover" },
      { label: "ServerSwitcherMenu" },
      { label: "SlugInput" },
      { label: "Spinner" },
      { label: "StatusDot" },
      { label: "SurfaceListItem" },
      { label: "Textarea" },
    ],
  },
] as const;

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
              {group.items.map((item) => (
                <li key={item.label}>
                  {"to" in item ? (
                    <Link
                      to={item.to}
                      className="block truncate rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      activeProps={{ className: "bg-gray-100 font-medium text-gray-900" }}
                      activeOptions={{ exact: item.to === "/" }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400">
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                        Todo
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
