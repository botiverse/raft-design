import { createFileRoute } from "@tanstack/react-router";
import { useId, useRef, type ReactNode, type RefObject } from "react";
import { AlertTriangle, CheckCircle2, CircleGauge } from "lucide-react";
import {
  Button,
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
} from "@raft/ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import notificationCenterCompositionSource from "#/compositions/notification-center-composition.tsx?raw";
import {
  NOTIFICATION_CENTER_COMPOSITION_PATH,
  NotificationCenterComposition,
  NotificationCenterSourcePreview,
} from "#/compositions/notification-center-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "empty", title: "Empty" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [{ id: "source-comparison-notification-trigger", title: "Notification trigger" }],
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
  anatomy: `import {
  NotificationCenter,
  NotificationCenterTrigger,
  NotificationCenterPopup,
  NotificationCenterHeader,
  NotificationCenterTitle,
  NotificationCenterCount,
  NotificationCenterScroller,
  NotificationCenterList,
  NotificationCenterItem,
  NotificationCenterItemRow,
  NotificationCenterItemIcon,
  NotificationCenterItemContent,
  NotificationCenterItemTitle,
  NotificationCenterItemBody,
  NotificationCenterItemActions,
  NotificationCenterActionButton,
} from "@raft/ui";

<NotificationCenter modal={false}>
  <NotificationCenterTrigger render={<button type="button" />}>
    Notifications
  </NotificationCenterTrigger>
  <NotificationCenterPopup viewport="desktop" side="bottom" align="center">
    <NotificationCenterHeader>
      <NotificationCenterTitle>Notifications</NotificationCenterTitle>
      <NotificationCenterCount>3 items</NotificationCenterCount>
    </NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterList>
        <NotificationCenterItem>
          <NotificationCenterItemRow>
            <NotificationCenterItemIcon status="success" />
            <NotificationCenterItemContent>
              <NotificationCenterItemTitle>Deploy succeeded</NotificationCenterItemTitle>
              <NotificationCenterItemBody>raft-ui shipped to production.</NotificationCenterItemBody>
              <NotificationCenterItemActions>
                <NotificationCenterActionButton variant="primary">View</NotificationCenterActionButton>
                <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
              </NotificationCenterItemActions>
            </NotificationCenterItemContent>
          </NotificationCenterItemRow>
        </NotificationCenterItem>
      </NotificationCenterList>
    </NotificationCenterScroller>
  </NotificationCenterPopup>
</NotificationCenter>`,
  preview: `import { AlertTriangle, CircleGauge } from "lucide-react";

<NotificationCenter open modal={false} triggerId={triggerId}>
  <NotificationCenterTrigger id={triggerId} render={<Button variant="outline" size="icon-md" />}>
    <AlertTriangle aria-hidden size={18} />
  </NotificationCenterTrigger>
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
  <NotificationCenterTrigger id={triggerId} render={<Button variant="outline" size="icon-md" />}>
    <AlertTriangle aria-hidden size={18} />
  </NotificationCenterTrigger>
  <NotificationCenterPopup viewport="desktop" size="sm" side="bottom" align="center">
    <NotificationCenterHeader>
      <NotificationCenterTitle>Notifications</NotificationCenterTitle>
      <NotificationCenterCount>Clear all</NotificationCenterCount>
    </NotificationCenterHeader>
    <NotificationCenterScroller>
      <NotificationCenterEmptyState>
        <EmptyStateIcon>
          <CheckCircle2 size={36} />
        </EmptyStateIcon>
        <EmptyStateTitle>No notifications right now</EmptyStateTitle>
        <EmptyStateDescription>
          You'll see things here that need your attention.
        </EmptyStateDescription>
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
  <EmptyStateIcon>
    <CheckCircle2 size={36} />
  </EmptyStateIcon>
  <EmptyStateTitle>No notifications right now</EmptyStateTitle>
  <EmptyStateDescription>
    You'll see things here that need your attention.
  </EmptyStateDescription>
</NotificationCenterEmptyState>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "open / defaultOpen",
    type: "boolean",
    description: "Popover open state. Source trigger state now lives on Base UI Popover.Root.",
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
    name: "children",
    type: "ReactNode",
    description: "Popover trigger, popup, and compound notification-center parts.",
  },
];

const POPUP_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterPopup.viewport",
    type: '"desktop" | "mobile"',
    default: '"desktop"',
    description: "desktop = fixed width; mobile = viewport-capped width.",
  },
  {
    name: "NotificationCenterPopup.size",
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: "Frame height token. Desktop uses fixed heights; mobile uses max-height tokens.",
  },
  {
    name: "NotificationCenterPopup.side / align",
    type: '"top" | "bottom" | "left" | "right" / "start" | "center" | "end"',
    default: '"bottom" / "center"',
    description:
      "Anchored placement relative to the trigger, forwarded to Base UI Popover.Positioner.",
  },
  {
    name: "NotificationCenterPopup.positionMethod / sideOffset / collisionAvoidance",
    type: '"fixed" | "absolute" / number / CollisionAvoidance',
    description: "Positioner tuning. The popup bundles Portal, Positioner, and Popup internally.",
  },
  {
    name: "NotificationCenterPopup.portalProps",
    type: "Base UI Popover.Portal.Props",
    description: "Optional portal options (e.g. container) forwarded to the internal portal.",
  },
  {
    name: "NotificationCenterPopup",
    type: "Base UI Popover.Popup.Props",
    description: "The visual card, anchored to the trigger by the internal positioner.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterTrigger",
    type: "Base UI Popover.Trigger.Props",
    description:
      "Trigger affordance and positioning anchor. Use render to compose the source icon button.",
  },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "useRender render prop",
    description: "Optional element composition hook for each slot part.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged into the slot class through tv() and Base UI mergeProps.",
  },
  {
    name: "Layout parts",
    type: "Header | Title | Count | Scroller | List",
    description: "Header and scroll/list structure. List defaults to aria-label='Notifications'.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterItem.read",
    type: "boolean",
    default: "false",
    description: "Applies the source read opacity treatment.",
  },
  {
    name: "NotificationCenterItemIcon.status",
    type: '"error" | "warning" | "info" | "success"',
    default: '"info"',
    description: "Applies the notification status color and default icon.",
  },
  {
    name: "Item parts",
    type: "ItemRow | ItemContent | ItemTitle | ItemBody | ItemActions",
    description: "Addressable layers for the source li structure.",
  },
];

const ACTION_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterActionButton.variant",
    type: '"primary" | "secondary"',
    default: '"secondary"',
    description: "Maps notification actions to the shared Button primary/outline variants.",
  },
  {
    name: "NotificationCenterEmptyState",
    type: "EmptyStateProps",
    description:
      "Semantic empty-state root. Compose EmptyStateIcon, EmptyStateTitle, and EmptyStateDescription as children.",
  },
  {
    name: "NotificationCenterEmptyState.render",
    type: "useRender render prop",
    description: "Optional root element composition hook inherited from EmptyState.",
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
      sectionDividers={false}
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview} previewClassName="!min-h-[38rem] items-start pt-16">
          <NotificationCenterBasicExample />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="NotificationCenter.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="empty" title="Empty" badge={<StatusBadge status="in-progress" />}>
        <Example html={code.empty}>
          <NotificationCenterExample entries={[]} size="sm" />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">NotificationCenter root</h3>
            <PropsTable rows={ROOT_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Trigger and portal</h3>
            <PropsTable rows={TRIGGER_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Popup</h3>
            <PropsTable rows={POPUP_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Layout parts</h3>
            <PropsTable rows={PART_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Item parts</h3>
            <PropsTable rows={ITEM_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Actions and empty state</h3>
            <PropsTable rows={ACTION_EMPTY_PROPS} />
          </div>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
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
        <NotificationCenterTrigger
          id={triggerId}
          render={<Button variant="outline" size="icon-md" className="size-9" />}
        >
          <AlertTriangle aria-hidden size={18} />
        </NotificationCenterTrigger>
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
                <EmptyStateIcon>
                  <CheckCircle2 size={36} />
                </EmptyStateIcon>
                <EmptyStateTitle>No notifications right now</EmptyStateTitle>
                <EmptyStateDescription>
                  You'll see things here that need your attention.
                </EmptyStateDescription>
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

function defaultCountLabel(count: number) {
  return count === 0 ? "Clear all" : `${count} ${count === 1 ? "item" : "items"}`;
}
