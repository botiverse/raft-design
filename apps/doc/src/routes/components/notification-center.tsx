import { createFileRoute } from "@tanstack/react-router";
import { useId, useRef, type ReactNode, type RefObject } from "react";
import { AlertTriangle, CheckCircle2, CircleGauge } from "lucide-react";
import {
  Button,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InlineCode,
  NotificationCenter,
  NotificationCenterActionButton,
  NotificationCenterCount,
  NotificationCenterEmptyState,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemBody,
  NotificationCenterItemContent,
  NotificationCenterItemIcon,
  NotificationCenterItemRow,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterPopup,
  NotificationCenterScroller,
  NotificationCenterTitle,
  NotificationCenterTrigger,
  Status,
  useThemeFamily,
} from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import notificationCenterCompositionSource from "#/modules/notification-center/notification-center.composition.tsx?raw";
import {
  NOTIFICATION_CENTER_COMPOSITION_PATH,
  NotificationCenterComposition,
  NotificationCenterSourcePreview,
} from "#/modules/notification-center/notification-center.source-comparison.tsx";
import { DocNote } from "#/components/doc-note.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Notification trigger wrappers",
    scenes: [
      {
        label: "NotificationTrigger.tsx:125,165",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/NotificationTrigger.tsx:125,165",
      },
      {
        label: "LeftRail.tsx:162",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LeftRail.tsx:162",
      },
      {
        label: "Sidebar.tsx:1226",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1226",
      },
      {
        label: "layout/NotificationCenter.tsx",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/NotificationCenter.tsx",
      },
    ],
  },
] as const;

const NOTIFICATION_CENTER_COMPOSITION_SOURCES = createCompositionSourceMap({
  notificationCenterComposition: notificationCenterCompositionSource,
} as const);

type DemoStatus = "error" | "warning" | "info" | "success";

type DemoAction = {
  id?: string;
  label: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

type DemoEntry = {
  id: string;
  status: DemoStatus;
  icon?: ReactNode;
  title: string;
  body?: string;
  actions?: DemoAction[];
  read?: boolean;
};

const ENTRIES: DemoEntry[] = [
  {
    id: "runtime-stalled",
    status: "warning",
    icon: <CircleGauge />,
    title: "Runtime stalled",
    body: "Atlas has not reported activity for 15 minutes.",
    actions: [{ label: "View", variant: "primary" }, { label: "Dismiss" }],
  },
  {
    id: "storage-full",
    status: "warning",
    title: "Storage almost full",
    body: "92% of the workspace quota is used.",
    actions: [{ label: "Manage" }],
  },
  {
    id: "deploy-complete",
    status: "success",
    title: "Deploy completed",
    body: "raft-ui shipped to production.",
  },
  {
    id: "backup-finished",
    status: "success",
    title: "Backup finished",
    body: "Nightly snapshot stored to cold storage.",
    read: true,
  },
  {
    id: "token-expiring",
    status: "warning",
    title: "Token expiring",
    body: "API key rotates in 3 days.",
    read: true,
  },
];

const SNIPPETS = {
  anatomy: `<NotificationCenter>
  <NotificationCenterTrigger />
  <NotificationCenterPopup>
    <NotificationCenterHeader>
      <NotificationCenterTitle />
      <NotificationCenterCount />
    </NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterList>
        <NotificationCenterItem>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle />
              <NotificationCenterItemBody />
              <NotificationCenterItemActions>
                <NotificationCenterActionButton />
              </NotificationCenterItemActions>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
      </NotificationCenterList>
    </NotificationCenterScroller>
  </NotificationCenterPopup>
</NotificationCenter>`,
  preview: `import { Bell, CircleGauge } from "lucide-react";

<NotificationCenter open modal={false} triggerId={triggerId}>
  <div className="relative size-9">
    <NotificationCenterTrigger
      id={triggerId}
      render={<button type="button" aria-label="Notification center" />}
    >
      <Bell aria-hidden />
    </NotificationCenterTrigger>
    <Status
      aria-hidden
      variant="accent"
      size="sm"
      className="pointer-events-none absolute top-[7px] right-[8px] border-0 ring-2 ring-white"
    />
  </div>
  <NotificationCenterPopup
    viewport="desktop"
    side="bottom"
    align="center"
  >
    <NotificationCenterHeader>
      <NotificationCenterTitle>Notifications</NotificationCenterTitle>
      <NotificationCenterCount>5 items</NotificationCenterCount>
    </NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterList>
        <NotificationCenterItem>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="warning">
              <CircleGauge />
            </NotificationCenterItemIcon>
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Runtime stalled</NotificationCenterItemTitle>
              <NotificationCenterItemBody>
                Atlas has not reported activity for 15 minutes.
              </NotificationCenterItemBody>
              <NotificationCenterItemActions>
                <NotificationCenterActionButton variant="primary">View</NotificationCenterActionButton>
                <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
              </NotificationCenterItemActions>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
        <NotificationCenterItem>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="warning" />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Storage almost full</NotificationCenterItemTitle>
              <NotificationCenterItemBody>
                92% of the workspace quota is used.
              </NotificationCenterItemBody>
              <NotificationCenterItemActions>
                <NotificationCenterActionButton>Manage</NotificationCenterActionButton>
              </NotificationCenterItemActions>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
        <NotificationCenterItem>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="success" />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Deploy completed</NotificationCenterItemTitle>
              <NotificationCenterItemBody>raft-ui shipped to production.</NotificationCenterItemBody>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
        <NotificationCenterItem read>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="success" />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Backup finished</NotificationCenterItemTitle>
              <NotificationCenterItemBody>
                Nightly snapshot stored to cold storage.
              </NotificationCenterItemBody>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
        <NotificationCenterItem read>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="warning" />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Token expiring</NotificationCenterItemTitle>
              <NotificationCenterItemBody>API key rotates in 3 days.</NotificationCenterItemBody>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
      </NotificationCenterList>
    </NotificationCenterScroller>
  </NotificationCenterPopup>
</NotificationCenter>`,
  empty: `<NotificationCenter open modal={false} triggerId={triggerId}>
  <div className="relative size-9">
    <NotificationCenterTrigger
      id={triggerId}
      render={<button type="button" aria-label="Notification center" />}
    >
      <Bell aria-hidden />
    </NotificationCenterTrigger>
    <Status
      aria-hidden
      variant="accent"
      size="sm"
      className="pointer-events-none absolute top-[7px] right-[8px] border-0 ring-2 ring-white"
    />
  </div>
  <NotificationCenterPopup viewport="desktop" size="sm" side="bottom" align="center">
    <NotificationCenterHeader>
      <NotificationCenterTitle>Notifications</NotificationCenterTitle>
      <NotificationCenterCount>Clear all</NotificationCenterCount>
    </NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterEmptyState>
        <EmptyStateContent>
          <EmptyStateIcon>
            <CheckCircle2 />
          </EmptyStateIcon>
          <EmptyStateTitle>No notifications right now</EmptyStateTitle>
          <EmptyStateDescription>
            You'll see things here that need your attention.
          </EmptyStateDescription>
        </EmptyStateContent>
      </NotificationCenterEmptyState>
    </NotificationCenterScroller>
  </NotificationCenterPopup>
</NotificationCenter>`,
  sourceApi: `<NotificationCenter
  viewport="desktop"
  entries={entries}
  emptyState={<NotificationCenterEmptyState />}
/>`,
  sourceOverlay: `const [open, setOpen] = useState(false);
const triggerRef = useRef<HTMLButtonElement | null>(null);
const popoverRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!open) return;
  const onDown = (event: MouseEvent) => {
    const target = event.target as Node;
    if (popoverRef.current?.contains(target)) return;
    if (triggerRef.current?.contains(target)) return;
    setOpen(false);
  };
  document.addEventListener("mousedown", onDown);
  return () => document.removeEventListener("mousedown", onDown);
}, [open]);

<button
  ref={triggerRef}
  aria-haspopup="dialog"
  aria-expanded={open}
  onClick={() => setOpen((value) => !value)}
/>
{open ? (
  <NotificationCenter
    ref={popoverRef}
    notifications={notifications}
    onClose={() => setOpen(false)}
    style={popoverStyle}
  />
) : null}`,
  currentOverlay: `<NotificationCenter modal={false}>
  <NotificationCenterTrigger render={<button type="button" />}>
    Notifications
  </NotificationCenterTrigger>
  <NotificationCenterPopup viewport="desktop" side="bottom" align="center">
    ...
  </NotificationCenterPopup>
</NotificationCenter>`,
  currentApi: `<NotificationCenter modal={false}>
  <NotificationCenterTrigger render={<button type="button" />}>Notifications</NotificationCenterTrigger>
  <NotificationCenterPopup viewport="desktop" side="bottom" align="center">
    <NotificationCenterHeader>...</NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterList>
        {entries.map((entry) => (
          <NotificationCenterItem key={entry.id} read={entry.read}>
            ...
          </NotificationCenterItem>
        ))}
      </NotificationCenterList>
    </NotificationCenterScroller>
  </NotificationCenterPopup>
</NotificationCenter>`,
  sourceItem: `function NotificationCenterItem({ entry }) {
  return (
    <li className={\`px-3 py-3 \${entry.read ? "opacity-70" : ""}\`}>
      <div className="flex items-start gap-2">
        <div className={\`... \${KIND_DOT_BG[entry.kind]}\`}>
          {entry.icon ?? DEFAULT_KIND_ICON[entry.kind]}
        </div>
        <div>{entry.title}{entry.body}{entry.actions}</div>
      </div>
    </li>
  );
}`,
  currentItem: `<NotificationCenterItem read={entry.read}>
  <NotificationCenterItemRow>
    <NotificationCenterItemIcon status={entry.status} />
    <NotificationCenterItemContent>
      <NotificationCenterItemTitle>{entry.title}</NotificationCenterItemTitle>
      <NotificationCenterItemBody>{entry.body}</NotificationCenterItemBody>
      <NotificationCenterItemActions>...</NotificationCenterItemActions>
    </NotificationCenterItemContent>
  </NotificationCenterItemRow>
</NotificationCenterItem>`,
  sourceAction: `<button
  type="button"
  className={\`btn-brutal px-3 py-1.5 text-xs \${isPrimary ? "bg-brutal-pink" : "bg-white"}\`}
>
  {action.label}
</button>`,
  currentAction: `<NotificationCenterActionButton variant="primary">
  View
</NotificationCenterActionButton>`,
  sourceEmpty: `function NotificationCenterEmptyState({
  title = "No notifications right now",
  body = "You'll see things here that need your attention.",
}) {
  return <EmptyState icon={<CheckCircle2 size={36} />} title={title} description={body} />;
}`,
  currentEmpty: `<NotificationCenterEmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <CheckCircle2 />
    </EmptyStateIcon>
    <EmptyStateTitle>No notifications right now</EmptyStateTitle>
    <EmptyStateDescription>
      You'll see things here that need your attention.
    </EmptyStateDescription>
  </EmptyStateContent>
</NotificationCenterEmptyState>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "open / defaultOpen",
    type: "boolean",
    description: "Popover open state owned by Base UI Popover.Root.",
  },
  {
    name: "modal",
    type: 'boolean | "trap-focus"',
    default: "false",
    description: "Defaults to non-modal to match the source rail/navbar floating popup.",
  },
  {
    name: "onOpenChange",
    type: "Popover.Root.Props['onOpenChange']",
    description: "Called when trigger, Escape, or outside press changes open state.",
  },
  {
    name: "...props",
    type: "Base UI Popover.Root.Props",
    description: "Root popover props. Compose trigger, popup, and notification parts as children.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Trigger.Props",
    description:
      "Trigger affordance and positioning anchor. Use render to compose a custom icon button; defaults to the themed bell/attention control.",
  },
];

const POPUP_PROPS: readonly PropRow[] = [
  {
    name: "viewport",
    type: '"desktop" | "mobile"',
    default: '"desktop"',
    description: "desktop = fixed width; mobile = viewport-capped width.",
  },
  {
    name: "size",
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: "Frame height token. Desktop uses fixed heights; mobile uses max-height tokens.",
  },
  {
    name: "side / align",
    type: '"top" | "bottom" | "left" | "right" / "start" | "center" | "end"',
    default: '"bottom" / "center"',
    description:
      "Anchored placement relative to the trigger, forwarded to Base UI Popover.Positioner.",
  },
  {
    name: "positionMethod / sideOffset / collisionAvoidance",
    type: '"fixed" | "absolute" / number / CollisionAvoidance',
    description: "Positioner tuning. The popup bundles Portal, Positioner, and Popup internally.",
  },
  {
    name: "portalProps",
    type: "Base UI Popover.Portal.Props",
    description: "Optional portal options (e.g. container) forwarded to the internal portal.",
  },
  {
    name: "...props",
    type: "Base UI Popover.Popup.Props",
    description:
      "The visual card. Popup owns the border, shadow, background, portal, and positioner.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Header row for title and count.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Panel title text.",
  },
];

const COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Trailing count or clear-all label in the header.",
  },
];

const SCROLLER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Scroll boundary for the list or empty state.",
  },
];

const LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"ul">',
    description: "Notification list. Defaults to aria-label='Notifications'.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "read",
    type: "boolean",
    default: "false",
    description: "Applies the source read opacity treatment.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"li">',
    description: "List item root. Compose row, icon, and content parts as children.",
  },
];

const ITEM_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal layout for icon and content.",
  },
];

const ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: '"error" | "warning" | "info" | "success"',
    default: '"info"',
    description:
      "Applies the notification status color and default icon when children are omitted.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Status icon slot. Pass children to replace the default glyph.",
  },
];

const ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Flexible column for title, body, and actions.",
  },
];

const ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Notification title text.",
  },
];

const ITEM_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Supporting body copy under the title.",
  },
];

const ITEM_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing action row for NotificationCenterActionButton children.",
  },
];

const ACTION_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"primary" | "secondary"',
    default: '"secondary"',
    description: "Maps notification actions to the shared Button primary/outline variants.",
  },
  {
    name: "...props",
    type: "ButtonProps",
    description: "Button attributes. Size is fixed to xs; className merges with the action recipe.",
  },
];

const EMPTY_STATE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "EmptyStateProps",
    description:
      "Semantic empty-state root. Compose EmptyStateContent with EmptyStateIcon, EmptyStateTitle, and EmptyStateDescription.",
  },
];

export const Route = createFileRoute("/components/notification-center")({
  component: NotificationCenterDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...NOTIFICATION_CENTER_COMPOSITION_SOURCES,
      },
    }),
});

function NotificationCenterDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="NotificationCenter"
      description="A notification-center frame composed from header, scroller, list, item, and action parts."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="!min-h-[38rem] items-start pt-16">
          <Preview.Canvas>
            <NotificationCenterBasicExample />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="grid gap-4">
          <DocNote>
            NotificationCenterPopup is the surface. Header, scroller, list, and item parts are
            content slots and should live inside the popup unless you intentionally provide your own
            shell.
          </DocNote>
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <DocSubsection
          parentId="usage"
          id="empty"
          title="Empty state"
          badge={<StatusBadge status="in-progress" />}
        >
          <Preview>
            <Preview.Canvas>
              <NotificationCenterExample entries={[]} size="sm" />
            </Preview.Canvas>
            <Preview.Code html={code.empty} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="NotificationCenter">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="NotificationCenterTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popup" title="NotificationCenterPopup">
            <PropsTable rows={POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header" title="NotificationCenterHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="NotificationCenterTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-count" title="NotificationCenterCount">
            <PropsTable rows={COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-scroller" title="NotificationCenterScroller">
            <PropsTable rows={SCROLLER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-list" title="NotificationCenterList">
            <PropsTable rows={LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item" title="NotificationCenterItem">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-row" title="NotificationCenterItemRow">
            <PropsTable rows={ITEM_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-icon" title="NotificationCenterItemIcon">
            <PropsTable rows={ITEM_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-content" title="NotificationCenterItemContent">
            <PropsTable rows={ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-title" title="NotificationCenterItemTitle">
            <PropsTable rows={ITEM_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-body" title="NotificationCenterItemBody">
            <PropsTable rows={ITEM_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-actions" title="NotificationCenterItemActions">
            <PropsTable rows={ITEM_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-action-button"
            title="NotificationCenterActionButton"
          >
            <PropsTable rows={ACTION_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state" title="NotificationCenterEmptyState">
            <PropsTable rows={EMPTY_STATE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          previewSize="popover"
          items={[
            {
              id: "source-comparison-notification-trigger",
              label: "Notification trigger",
              status: "difference",
              note: (
                <>
                  <InlineCode>NotificationTrigger.tsx</InlineCode> +{" "}
                  <InlineCode>NotificationCenter.tsx</InlineCode>. Source keeps trigger, viewport
                  clamp, data mapping, and primitive UI split across product files. Current keeps
                  the real trigger/popup interaction on Base UI Popover and composes the
                  notification body from NotificationCenter slots.
                </>
              ),
              source: <NotificationCenterSourcePreview />,
              brutal: <NotificationCenterComposition />,
              elegant: <NotificationCenterComposition />,
              elegantDark: <NotificationCenterComposition />,
              compositionCode: code.notificationCenterComposition,
              compositionCollapsedCode: code.notificationCenterCompositionBody,
              compositionPath: NOTIFICATION_CENTER_COMPOSITION_PATH,
              compositionSource:
                NOTIFICATION_CENTER_COMPOSITION_SOURCES.notificationCenterComposition,
              compositionShowLineNumbers: false,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function NotificationCenterExample({
  entries,
  size = "md",
  framed = true,
}: {
  entries: DemoEntry[];
  size?: "sm" | "md" | "lg";
  framed?: boolean;
}) {
  const triggerId = useId();
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={
        framed
          ? "relative flex min-h-72 w-full items-start justify-center pt-8"
          : "relative flex w-full items-start justify-center pt-8"
      }
    >
      <NotificationCenter open modal={false} triggerId={triggerId}>
        <NotificationCenterDemoTrigger triggerId={triggerId} />
        <NotificationCenterPopup
          viewport="desktop"
          size={size}
          positionMethod="absolute"
          side="bottom"
          align="center"
          collisionAvoidance={{ side: "none", align: "none" }}
          initialFocus={false}
          finalFocus={false}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
        >
          <NotificationCenterHeader>
            <NotificationCenterTitle>Notifications</NotificationCenterTitle>
            <NotificationCenterCount>{defaultCountLabel(entries.length)}</NotificationCenterCount>
          </NotificationCenterHeader>
          <NotificationCenterScroller>
            {entries.length === 0 ? (
              <NotificationCenterEmptyState>
                <EmptyStateContent>
                  <EmptyStateIcon>
                    <CheckCircle2 />
                  </EmptyStateIcon>
                  <EmptyStateTitle>No notifications right now</EmptyStateTitle>
                  <EmptyStateDescription>
                    You'll see things here that need your attention.
                  </EmptyStateDescription>
                </EmptyStateContent>
              </NotificationCenterEmptyState>
            ) : (
              <NotificationCenterList>
                {entries.map((entry) => (
                  <NotificationCenterItem key={entry.id} read={entry.read}>
                    <NotificationCenterItemRow>
                      <NotificationCenterItemIcon status={entry.status}>
                        {entry.icon}
                      </NotificationCenterItemIcon>
                      <NotificationCenterItemContent>
                        <NotificationCenterItemTitle>{entry.title}</NotificationCenterItemTitle>
                        {entry.body ? (
                          <NotificationCenterItemBody>{entry.body}</NotificationCenterItemBody>
                        ) : null}
                        {entry.actions && entry.actions.length > 0 ? (
                          <NotificationCenterItemActions>
                            {entry.actions.map((action) => (
                              <NotificationCenterActionButton
                                key={action.id ?? `${entry.id}-${action.label}`}
                                disabled={action.disabled}
                                variant={action.variant}
                              >
                                {action.label}
                              </NotificationCenterActionButton>
                            ))}
                          </NotificationCenterItemActions>
                        ) : null}
                      </NotificationCenterItemContent>
                    </NotificationCenterItemRow>
                  </NotificationCenterItem>
                ))}
              </NotificationCenterList>
            )}
          </NotificationCenterScroller>
        </NotificationCenterPopup>
      </NotificationCenter>
    </div>
  );
}

function NotificationCenterBasicExample() {
  return <NotificationCenterExample entries={ENTRIES} />;
}

function NotificationCenterDemoTrigger({ triggerId }: { triggerId: string }) {
  const theme = useThemeFamily();

  if (theme === "brutal") {
    return (
      <div className="relative size-9">
        <NotificationCenterTrigger
          id={triggerId}
          render={
            <Button
              variant="outline"
              size="icon-md"
              className="size-9 overflow-visible bg-brutal-orange p-0 text-black hover:bg-brutal-orange"
            />
          }
        >
          <AlertTriangle aria-hidden size={18} />
        </NotificationCenterTrigger>
        <Status
          aria-hidden
          variant="primary"
          size="md"
          className="pointer-events-none absolute -top-1 -right-1"
        />
      </div>
    );
  }

  return (
    <NotificationCenterTrigger id={triggerId} type="button" aria-label="Notification center" />
  );
}

function defaultCountLabel(count: number) {
  return count === 0 ? "Clear all" : `${count} ${count === 1 ? "item" : "items"}`;
}
