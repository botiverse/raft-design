import { createFileRoute } from "@tanstack/react-router";
import { useId } from "react";
import type { ReactNode } from "react";
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
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { DocNote } from "#/components/doc-note.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
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
  NotificationCenterActionButton,
  NotificationCenterCount,
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
} from "raft-ui";

<NotificationCenter>
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
  preview: `import { CircleGauge } from "lucide-react";

<NotificationCenter open modal={false} triggerId={triggerId}>
  <NotificationCenterTrigger id={triggerId} type="button" aria-label="Notification center" />
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
  <NotificationCenterTrigger id={triggerId} type="button" aria-label="Notification center" />
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
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state owned by Base UI Popover.Root.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Initial open state for uncontrolled usage.",
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
    name: "side",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
    default: '"bottom"',
    description:
      "Anchored placement relative to the trigger, forwarded to Base UI Popover.Positioner.",
  },
  {
    name: "align",
    type: '"start" | "center" | "end"',
    default: '"center"',
    description: "Alignment along the anchored side, forwarded to Base UI Popover.Positioner.",
  },
  {
    name: "positionMethod",
    type: '"fixed" | "absolute"',
    default: '"fixed"',
    description:
      "Positioning strategy for the popup. The popup bundles Portal, Positioner, and Popup internally.",
  },
  {
    name: "sideOffset",
    type: "number",
    default: "4",
    description: "Gap between the trigger and the popup edge.",
  },
  {
    name: "collisionAvoidance",
    type: "CollisionAvoidance",
    description: "How the popup avoids viewport edges when space runs out.",
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
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          The snippets show the default trigger. Brutal previews swap in a custom trigger through{" "}
          <InlineCode>render</InlineCode> to demonstrate the source bell affordance.
        </p>
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
            <InlineCode>NotificationCenterPopup</InlineCode> is the surface.{" "}
            <InlineCode>NotificationCenterHeader</InlineCode>,{" "}
            <InlineCode>NotificationCenterScroller</InlineCode>,{" "}
            <InlineCode>NotificationCenterList</InlineCode>, and{" "}
            <InlineCode>NotificationCenterItem</InlineCode> are content slots and should live inside
            the popup unless you intentionally provide your own shell.
          </DocNote>
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
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

  return (
    <div
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
          side="bottom"
          align="center"
          collisionAvoidance={{ side: "none", align: "none" }}
          initialFocus={false}
          finalFocus={false}
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
