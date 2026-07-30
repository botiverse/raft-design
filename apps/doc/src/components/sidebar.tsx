import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Badge, Separator } from "raft-ui";
import { Globe2, Menu, X } from "lucide-react";

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
    title: "Shell",
    items: [
      { label: "AppShell", to: "/components/app-shell", status: "done" },
      { label: "AppRail", to: "/components/app-rail", status: "done" },
      { label: "MobileNav", to: "/components/mobile-nav", status: "done" },
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
        to: "/components/scroll-area",
        status: "done",
      },
    ],
  },
  {
    title: "Message",
    items: [
      { label: "MessageItem", to: "/components/message-item", status: "wip" },
      { label: "Translation", to: "/components/message-translation", status: "done" },
      { label: "Replies", to: "/components/message-replies", status: "done" },
      { label: "Reference", to: "/components/message-reference", status: "done" },
      { label: "TaskChip", to: "/components/task-chip", status: "done" },
      {
        label: "QuotedPreview",
        to: "/components/message-quoted-preview",
        status: "wip",
      },
      {
        label: "ForwardedBundle",
        to: "/components/message-forwarded-bundle",
        status: "wip",
      },
      { label: "ActionCard", to: "/components/message-action-card", status: "wip" },
      { label: "Attachment", to: "/components/message-attachment", status: "done" },
      { label: "System message", to: "/components/system-message", status: "wip" },
    ],
  },
  {
    title: "Chat",
    items: [
      {
        label: "ChatSidebar",
        to: "/components/chat-sidebar",
      },
      { label: "ChatSidebarItem", to: "/components/chat-sidebar-item" },
      {
        label: "LiveAgentActivityBar",
        to: "/components/live-agent-activity-bar",
        status: "done",
      },
      {
        label: "ConversationPanel",
        to: "/components/conversation-panel",
        status: "done",
      },
      { label: "FilesPanel", to: "/components/files", status: "done" },
      { label: "ThreadPanel", to: "/components/thread-panel", status: "done" },
      {
        label: "Composer",
        to: "/components/chat-composer",
        status: "done",
      },
      {
        label: "ComposerSuggestions",
        to: "/components/composer-suggestions",
        status: "done",
      },
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
      { label: "Label", to: "/components/label", status: "done" },
      { label: "Field", to: "/components/field", status: "done" },
      { label: "Input", to: "/components/input", status: "done" },
      { label: "InputGroup", to: "/components/input-group", status: "done" },
      { label: "Textarea", to: "/components/textarea", status: "done" },
      { label: "Checkbox", to: "/components/checkbox", status: "done" },
      { label: "RadioGroup", to: "/components/radio-group", status: "done" },
      { label: "Switch", to: "/components/switch", status: "done" },
      { label: "Select", to: "/components/select", status: "done" },
      { label: "Combobox", to: "/components/combobox", status: "done" },
      { label: "SegmentedControl", to: "/components/segmented-control", status: "done" },
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
    title: "Status",
    items: [
      { label: "Badge", to: "/components/badge", status: "done" },
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
    title: "Content",
    items: [
      { label: "Text", to: "/components/text", status: "done" },
      { label: "Markdown", to: "/components/markdown", status: "done" },
      { label: "InlineCode", to: "/components/inline-code", status: "done" },
      { label: "CodeBlock", to: "/components/code-block", status: "done" },
      { label: "Kbd", to: "/components/kbd", status: "done" },
      { label: "CopyableCode", to: "/components/copyable-code", status: "done" },
    ],
  },
  {
    title: "Brand",
    items: [{ label: "Logo", to: "/components/logo", status: "done" }],
  },
  {
    title: "Data Display",
    items: [
      { label: "Avatar", to: "/components/avatar", status: "done" },
      { label: "FilePreview", to: "/components/file-preview", status: "done" },
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

function NavRow({ item, badge }: { item: NavItem; badge?: ReactNode }) {
  const className = `flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-layer-muted/80 hover:text-foreground-strong ${
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
            inactiveProps={{ className: "text-foreground-strong" }}
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
          {items.map((item) => (
            <li key={item.label}>
              <NavRow item={item} badge={<StatusBadge status={item.status} />} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const className = `flex min-h-12 items-center justify-start rounded-md px-3 py-2.5 text-left text-base leading-5 font-semibold text-foreground-muted transition-colors hover:bg-layer-muted hover:text-foreground-strong active:bg-layer-strong ${sidebarItemFocusClassName}`;
  const title = item.reason
    ? `${item.label}: ${item.status ? statusMeta[item.status].label : "Note"}. ${item.reason}`
    : undefined;

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
        {item.label}
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
        {item.label}
      </a>
    );
  }

  return (
    <span
      title={title}
      className="flex min-h-12 items-center justify-start px-3 py-2.5 text-left text-base leading-5 font-semibold text-foreground-muted"
    >
      {item.label}
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
        {items.map((item) => (
          <MobileNavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
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
  const primaryItems: readonly NavItem[] = [
    { label: "Home", to: "/" },
    { label: "Installation", to: "/installation" },
    { label: "Changelog", to: "/changelog" },
    { label: "Playground", to: "/playground" },
    { label: "Lab", to: "/lab" },
    { label: "Migration", to: "/migration" },
  ];

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
          className={`flex min-h-11 items-center rounded-md px-2 text-foreground-strong ${sidebarItemFocusClassName}`}
          onClick={close}
        >
          <img src="/raft-logo.svg" alt="" className="h-5 w-auto shrink-0" />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-docs-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className={`flex size-11 items-center justify-center rounded-md text-foreground-strong transition-colors hover:bg-layer-muted active:bg-layer-strong ${sidebarItemFocusClassName}`}
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
            <div className="flex flex-col gap-2">
              {primaryItems.map((item) => (
                <MobileNavItem key={item.label} item={item} onNavigate={close} />
              ))}
            </div>

            <MobileNavGroup title={SKILLS.title} items={SKILLS.items} onNavigate={close} />

            {TOKENS.map((group) => (
              <MobileNavGroup key={group.title} {...group} onNavigate={close} />
            ))}

            {NAV.map((group) => (
              <MobileNavGroup key={group.title} {...group} onNavigate={close} />
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <MobileSidebar />
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
              <NavRow item={{ label: "Lab", to: "/lab" }} />
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
    </>
  );
}
