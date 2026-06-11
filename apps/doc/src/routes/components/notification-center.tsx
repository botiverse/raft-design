import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
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
  NotificationCenterItemInner,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterPopup,
  NotificationCenterPortal,
  NotificationCenterScroller,
  NotificationCenterTitle,
} from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyNotificationCenter, {
  type NotificationCenterEntry as LegacyNotificationCenterEntry,
} from "../../../../../packages/ui/src/legacy/NotificationCenter.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "empty", title: "Empty" },
  { id: "data-mapping", title: "Data mapping" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

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
  title: string;
  body?: string;
  actions?: DemoAction[];
  read?: boolean;
};

const ENTRIES: DemoEntry[] = [
  {
    id: "1",
    status: "success",
    title: "Deploy succeeded",
    body: "slock-ui shipped to production.",
    actions: [{ label: "View", variant: "primary" }, { label: "Dismiss" }],
  },
  {
    id: "2",
    status: "warning",
    title: "Storage almost full",
    body: "92% of your quota is used.",
    read: true,
  },
  { id: "3", status: "info", title: "New comment on #design" },
];

const LEGACY_ENTRIES: LegacyNotificationCenterEntry[] = ENTRIES.map((entry) => ({
  ...entry,
  kind: entry.status,
}));

const SNIPPETS = {
  anatomy: `import {
  NotificationCenter,
  NotificationCenterHeader,
  NotificationCenterTitle,
  NotificationCenterCount,
  NotificationCenterScroller,
  NotificationCenterList,
  NotificationCenterItem,
  NotificationCenterItemInner,
  NotificationCenterItemIcon,
  NotificationCenterItemContent,
  NotificationCenterItemTitle,
  NotificationCenterItemBody,
  NotificationCenterItemActions,
  NotificationCenterActionButton,
  NotificationCenterPortal,
} from "@slock/ui";

<NotificationCenter modal={false}>
  <NotificationCenterTrigger render={<button type="button" />}>
    Notifications
  </NotificationCenterTrigger>
  <NotificationCenterPortal>
    <NotificationCenterPopup viewport="desktop">
      <NotificationCenterHeader>
        <NotificationCenterTitle>Notifications</NotificationCenterTitle>
        <NotificationCenterCount>3 items</NotificationCenterCount>
      </NotificationCenterHeader>
      <NotificationCenterScroller>
        <NotificationCenterList>
          <NotificationCenterItem>
            <NotificationCenterItemInner>
              <NotificationCenterItemIcon status="success" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Deploy succeeded</NotificationCenterItemTitle>
                <NotificationCenterItemBody>slock-ui shipped to production.</NotificationCenterItemBody>
                <NotificationCenterItemActions>
                  <NotificationCenterActionButton variant="primary">View</NotificationCenterActionButton>
                  <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
                </NotificationCenterItemActions>
              </NotificationCenterItemContent>
            </NotificationCenterItemInner>
          </NotificationCenterItem>
        </NotificationCenterList>
      </NotificationCenterScroller>
    </NotificationCenterPopup>
  </NotificationCenterPortal>
</NotificationCenter>`,
  preview: `<NotificationCenter defaultOpen>
  <NotificationCenterPortal>
    <NotificationCenterPopup viewport="desktop">
      <NotificationCenterHeader>
        <NotificationCenterTitle>Notifications</NotificationCenterTitle>
        <NotificationCenterCount>2 items</NotificationCenterCount>
      </NotificationCenterHeader>
      <NotificationCenterScroller>
        <NotificationCenterList>
          <NotificationCenterItem>
            <NotificationCenterItemInner>
              <NotificationCenterItemIcon status="success" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Deploy succeeded</NotificationCenterItemTitle>
                <NotificationCenterItemBody>slock-ui shipped to production.</NotificationCenterItemBody>
                <NotificationCenterItemActions>
                  <NotificationCenterActionButton variant="primary">View</NotificationCenterActionButton>
                  <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
                </NotificationCenterItemActions>
              </NotificationCenterItemContent>
            </NotificationCenterItemInner>
          </NotificationCenterItem>
          <NotificationCenterItem read>
            <NotificationCenterItemInner>
              <NotificationCenterItemIcon status="warning" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Storage almost full</NotificationCenterItemTitle>
                <NotificationCenterItemBody>92% of your quota is used.</NotificationCenterItemBody>
              </NotificationCenterItemContent>
            </NotificationCenterItemInner>
          </NotificationCenterItem>
        </NotificationCenterList>
      </NotificationCenterScroller>
    </NotificationCenterPopup>
  </NotificationCenterPortal>
</NotificationCenter>`,
  dataMapping: `function NotificationsList({ entries }) {
  return (
    <NotificationCenter defaultOpen>
      <NotificationCenterPortal>
        <NotificationCenterPopup viewport="desktop">
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
                    <NotificationCenterItemInner>
                      <NotificationCenterItemIcon status={entry.status} />
                      <NotificationCenterItemContent>
                        <NotificationCenterItemTitle>{entry.title}</NotificationCenterItemTitle>
                        {entry.body ? <NotificationCenterItemBody>{entry.body}</NotificationCenterItemBody> : null}
                        {entry.actions ? (
                          <NotificationCenterItemActions>
                            {entry.actions.map((action) => (
                              <NotificationCenterActionButton key={action.label} variant={action.variant}>
                                {action.label}
                              </NotificationCenterActionButton>
                            ))}
                          </NotificationCenterItemActions>
                        ) : null}
                      </NotificationCenterItemContent>
                    </NotificationCenterItemInner>
                  </NotificationCenterItem>
                ))}
              </NotificationCenterList>
            )}
          </NotificationCenterScroller>
        </NotificationCenterPopup>
      </NotificationCenterPortal>
    </NotificationCenter>
  );
}`,
  empty: `<NotificationCenter defaultOpen>
  <NotificationCenterPortal>
    <NotificationCenterPopup viewport="desktop" size="sm">
      <NotificationCenterHeader>
        <NotificationCenterTitle>Notifications</NotificationCenterTitle>
        <NotificationCenterCount>all clear</NotificationCenterCount>
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
  </NotificationCenterPortal>
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
  <NotificationCenterPortal>
    <NotificationCenterPopup viewport="desktop" style={popoverStyle}>
      ...
    </NotificationCenterPopup>
  </NotificationCenterPortal>
</NotificationCenter>`,
  currentApi: `<NotificationCenter modal={false}>
  <NotificationCenterTrigger render={<button type="button" />}>Notifications</NotificationCenterTrigger>
  <NotificationCenterPortal>
    <NotificationCenterPopup viewport="desktop">
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
  </NotificationCenterPortal>
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
  <NotificationCenterItemInner>
    <NotificationCenterItemIcon status={entry.status} />
    <NotificationCenterItemContent>
      <NotificationCenterItemTitle>{entry.title}</NotificationCenterItemTitle>
      <NotificationCenterItemBody>{entry.body}</NotificationCenterItemBody>
      <NotificationCenterItemActions>...</NotificationCenterItemActions>
    </NotificationCenterItemContent>
  </NotificationCenterItemInner>
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
    description: "Dialog open state. Source trigger state now lives on Base UI Dialog.Root.",
  },
  {
    name: "modal",
    type: 'boolean | "trap-focus"',
    default: "false",
    description: "Defaults to non-modal to match the source rail/navbar floating popup.",
  },
  {
    name: "onOpenChange",
    type: "Dialog.Root.Props['onOpenChange']",
    description: "Called when trigger, Escape, or outside press changes open state.",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "Dialog trigger, portal, popup, and compound notification-center parts.",
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
    name: "NotificationCenterPopup",
    type: "Base UI Dialog.Popup.Props",
    description: "The visual card. Receives positioning className/style from the caller.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterTrigger",
    type: "Base UI Dialog.Trigger.Props",
    description: "Trigger affordance. Use render to compose the source icon button.",
  },
  {
    name: "NotificationCenterPortal",
    type: "Base UI Dialog.Portal.Props",
    description: "Optional portal wrapper for app usage. Docs render Popup inline for comparison.",
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
    type: "ItemInner | ItemContent | ItemTitle | ItemBody | ItemActions",
    description: "Addressable layers for the source li structure.",
  },
];

const ACTION_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "NotificationCenterActionButton.variant",
    type: '"primary" | "secondary"',
    default: '"secondary"',
    description: "Recreates the source btn-brutal action tier.",
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
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function NotificationCenterDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="NotificationCenter"
      description="A notification-center frame composed from header, scroller, list, item, and action parts."
      overview={
        <Differences from="NotificationCenter">
          <li>brutal styling reproduced 1:1 (cream header, status markers, divided list)</li>
          <li>
            source trigger/open state, Escape close, and outside press close are delegated to Base
            UI <code>Dialog</code>
          </li>
          <li>
            source <code>entries</code>, <code>actions</code>, and <code>emptyState</code> business
            props are removed; caller maps data into compound parts
          </li>
          <li>
            <code>card-brutal</code> → <code>--shadow-hover</code>; action buttons reproduce the{" "}
            <code>btn-brutal</code> tier (4px/6px/2px) 1:1
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.preview}>
          <NotificationCenterBasicExample />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="empty" title="Empty">
        <Example html={code.empty}>
          <NotificationCenterExample entries={[]} size="sm" />
        </Example>
      </DocSection>

      <DocSection id="data-mapping" title="Data mapping">
        <CodeBlock html={code.dataMapping} />
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
          items={[
            {
              label: "Overlay mechanics",
              status: "difference",
              note: "Source split trigger, open state, outside press, Escape close, and viewport-clamped positioning across layout files. Current delegates open state, trigger semantics, Escape, outside press, focus handling, and portal requirements to Base UI Dialog; callers still pass positioning style/className to the popup.",
              source: <LegacyNotificationCenterPreview />,
              current: <NotificationCenterPreview />,
              sourceCode: code.sourceOverlay,
              currentCode: code.currentOverlay,
            },
            {
              label: "Data boundary",
              status: "difference",
              note: "Source accepted entries, countLabel, and emptyState props and mapped data internally. Current exposes only the frame and parts; callers map business data into children.",
              source: <LegacyNotificationCenterPreview />,
              current: <NotificationCenterPreview />,
              sourceCode: code.sourceApi,
              currentCode: code.currentApi,
            },
            {
              label: "Visual frame and item",
              status: "match",
              note: "Visual structure is preserved: li padding, read opacity, status icon block, title/body stack, and action row. Current makes each layer addressable through compound parts.",
              source: <LegacyNotificationCenterPreview />,
              current: <NotificationCenterPreview />,
              sourceCode: code.sourceItem,
              currentCode: code.currentItem,
            },
            {
              label: "Action button",
              status: "match",
              note: "Source btn-brutal action tier is preserved through NotificationCenterActionButton while removing the action-object prop shape.",
              source: (
                <NotificationCenterActionButton variant="primary">
                  View
                </NotificationCenterActionButton>
              ),
              current: (
                <NotificationCenterActionButton variant="primary">
                  View
                </NotificationCenterActionButton>
              ),
              sourceCode: code.sourceAction,
              currentCode: code.currentAction,
            },
            {
              label: "Empty state",
              status: "difference",
              note: "Source exposes title/body as preset props on the notification-center empty state. Current keeps the same visual result but composes the shared EmptyState slots explicitly.",
              source: <LegacyNotificationCenterEmptyPreview />,
              current: <NotificationCenterEmptyPreview />,
              sourceCode: code.sourceEmpty,
              currentCode: code.currentEmpty,
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
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setPortalContainer}
      className={framed ? "relative flex min-h-72 w-full items-center justify-center" : "relative"}
    >
      {portalContainer ? (
        <NotificationCenter defaultOpen>
          <NotificationCenterPortal container={portalContainer}>
            <NotificationCenterPopup viewport="desktop" size={size}>
              <NotificationCenterHeader>
                <NotificationCenterTitle>Notifications</NotificationCenterTitle>
                <NotificationCenterCount>
                  {defaultCountLabel(entries.length)}
                </NotificationCenterCount>
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
                        <NotificationCenterItemInner>
                          <NotificationCenterItemIcon status={entry.status} />
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
                        </NotificationCenterItemInner>
                      </NotificationCenterItem>
                    ))}
                  </NotificationCenterList>
                )}
              </NotificationCenterScroller>
            </NotificationCenterPopup>
          </NotificationCenterPortal>
        </NotificationCenter>
      ) : null}
    </div>
  );
}

function NotificationCenterBasicExample() {
  return <NotificationCenterExample entries={ENTRIES.slice(0, 2)} />;
}

function NotificationCenterPreview() {
  return <NotificationCenterExample entries={ENTRIES.slice(0, 2)} framed={false} />;
}

function NotificationCenterEmptyPreview() {
  return <NotificationCenterExample entries={[]} size="sm" framed={false} />;
}

function LegacyNotificationCenterPreview() {
  return (
    <LegacyNotificationCenter
      entries={LEGACY_ENTRIES.slice(0, 2)}
      viewport="desktop"
      size="regular"
    />
  );
}

function LegacyNotificationCenterEmptyPreview() {
  return <LegacyNotificationCenter entries={[]} viewport="desktop" size="compact" />;
}

function defaultCountLabel(count: number) {
  return count === 0 ? "all clear" : `${count} ${count === 1 ? "item" : "items"}`;
}
