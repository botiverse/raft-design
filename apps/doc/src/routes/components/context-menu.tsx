import { createFileRoute } from "@tanstack/react-router";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  ContextMenuTrigger,
} from "raft-ui";
import { Archive, Bell, ChevronRight, Copy, MoonStar, Pin, Sun, Trash } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "tailwind-variants";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/composition-code.ts";
import contextMenuCompositionSource from "#/modules/context-menu/context-menu.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const CONTEXT_MENU_COMPOSITION_SOURCES = createCompositionSourceMap({
  contextMenuComposition: contextMenuCompositionSource,
} as const);

const SNIPPETS = {
  preview: `<ContextMenu defaultOpen>
  <ContextMenuTrigger>Right click thread</ContextMenuTrigger>
  <ContextMenuContent className="flex w-56 min-w-56 flex-col">
    <ContextMenuLabel>Thread actions</ContextMenuLabel>
    <ContextMenuItem>
      <Pin />
      Pin thread
    </ContextMenuItem>
    <ContextMenuItem>
      <Copy />
      Copy link
      <ContextMenuShortcut>⌘C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Archive />
      Archive
    </ContextMenuItem>
    <ContextMenuItem>
      <Trash />
      Delete
      <ContextMenuShortcut>⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  anatomy: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "raft-ui";

<ContextMenu>
  <ContextMenuTrigger />
  <ContextMenuContent>
    <ContextMenuLabel />
    <ContextMenuItem>
      <ContextMenuShortcut />
    </ContextMenuItem>
    <ContextMenuSeparator />
  </ContextMenuContent>
</ContextMenu>`,
  submenu: `<ContextMenu defaultOpen>
  <ContextMenuTrigger id="context-submenu-trigger">Right click item</ContextMenuTrigger>
  <ContextMenuContent className="flex w-56 min-w-56 flex-col">
    <ContextMenuItem>
      <Pin />
      <span className="min-w-0 flex-1 truncate">Pin thread</span>
    </ContextMenuItem>
    <ContextMenuSubmenu>
      <ContextMenuSubmenuTrigger openOnHover>
        <MoonStar />
        <span className="min-w-0 flex-1 truncate">Move to</span>
        <ChevronRight className="ml-auto" />
      </ContextMenuSubmenuTrigger>
      <ContextMenuContent side="right" align="start" sideOffset={10} className="flex w-36 min-w-36 flex-col">
        <ContextMenuItem>Inbox</ContextMenuItem>
        <ContextMenuItem>Archive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuSubmenu>
  </ContextMenuContent>
</ContextMenu>`,
  radioGroup: `<ContextMenu defaultOpen>
  <ContextMenuTrigger id="context-radio-trigger">Right click notification</ContextMenuTrigger>
  <ContextMenuContent className="flex w-60 min-w-60 flex-col">
    <ContextMenuLabel>Theme</ContextMenuLabel>
    <ContextMenuRadioGroup defaultValue="system">
      <ContextMenuRadioItem value="system">
        <Bell />
        <span className="min-w-0 flex-1 truncate">System alerts</span>
      </ContextMenuRadioItem>
      <ContextMenuRadioItem value="quiet">
        <MoonStar />
        <span className="min-w-0 flex-1 truncate">Quiet mode</span>
      </ContextMenuRadioItem>
      <ContextMenuRadioItem value="light">
        <Sun />
        <span className="min-w-0 flex-1 truncate">Light mode</span>
      </ContextMenuRadioItem>
    </ContextMenuRadioGroup>
  </ContextMenuContent>
</ContextMenu>`,
  checkboxes: `<ContextMenu defaultOpen>
  <ContextMenuTrigger id="context-checkbox-trigger">Right click list</ContextMenuTrigger>
  <ContextMenuContent className="flex w-64 min-w-64 flex-col">
    <ContextMenuLabel>Visible rows</ContextMenuLabel>
    <ContextMenuCheckboxItem defaultChecked>Unread threads</ContextMenuCheckboxItem>
    <ContextMenuCheckboxItem defaultChecked>Pinned threads</ContextMenuCheckboxItem>
    <ContextMenuCheckboxItem>Archived threads</ContextMenuCheckboxItem>
  </ContextMenuContent>
</ContextMenu>`,
} as const;

const CONTEXT_MENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.Root.Props",
    description: "Owns right-click open state, focus roving, keyboard navigation, and dismissal.",
  },
];

const CONTEXT_MENU_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.Trigger.Props",
    description: "Right-click or long-press target. Renders a div and keeps text selection off.",
  },
];

const CONTEXT_MENU_PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI ContextMenu.Portal.Props",
    description: "Portals the menu to the body or a custom container.",
  },
];

const CONTEXT_MENU_POPUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Static panel shell for docs previews and non-portaled comparison panes.",
  },
];

const CONTEXT_MENU_ITEM_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'StyledProps<ComponentPropsWithRef<"span">>',
    description: "Small muted label above grouped items or inside an item.",
  },
];

const CONTEXT_MENU_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'StyledProps<ComponentPropsWithRef<"div">>',
    description: "Footer region with a top hairline for auxiliary controls.",
  },
];

const CONTEXT_MENU_CHECKBOX_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.CheckboxItemIndicator.Props",
    description: "Check indicator shown inside a checked ContextMenuCheckboxItem.",
  },
];

const CONTEXT_MENU_RADIO_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.RadioItemIndicator.Props",
    description: "Radio dot shown inside a selected ContextMenuRadioItem.",
  },
];

const CONTEXT_MENU_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating menu shell. Keeps the menu near the context point while shifting it inside the collision boundary with 8px of padding.",
  },
];

const CONTEXT_MENU_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.Item.Props",
    description:
      "Action row. Compose leading icons, label text, and trailing shortcuts as children.",
  },
];

const CONTEXT_MENU_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Section label for grouped rows.",
  },
];

const CONTEXT_MENU_SHORTCUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Kbd props",
    description: "Right-aligned keyboard hint composed inside a menu row.",
  },
];

const CONTEXT_MENU_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.Separator.Props",
    description: "Group separator mapped from the source ContextMenuDivider primitive.",
  },
];

const CONTEXT_MENU_RADIO_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.RadioGroup.Props",
    description: "Single-selection group inside the menu.",
  },
];

const CONTEXT_MENU_RADIO_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.RadioItem.Props",
    description: "Selectable row with a trailing check indicator.",
  },
];

const CONTEXT_MENU_CHECKBOX_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.CheckboxItem.Props",
    description: "Toggleable row with a trailing check indicator.",
  },
];

const CONTEXT_MENU_SUBMENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.SubmenuRoot.Props",
    description: "Nested context-menu branch for secondary action groups.",
  },
];

const CONTEXT_MENU_SUBMENU_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ContextMenu.SubmenuTrigger.Props",
    description: "Row that opens a nested menu. Compose the chevron as the trailing icon.",
  },
];

export const Route = createFileRoute("/components/context-menu")({
  component: ContextMenuDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...CONTEXT_MENU_COMPOSITION_SOURCES,
      },
    }),
});

function ContextMenuTriggerSurface({ id, children }: { id: string; children: ReactNode }) {
  return (
    <ContextMenuTrigger
      id={id}
      className={cn(
        "flex min-h-24 w-72 items-center justify-center px-5 py-6 text-center",
        "border border-dashed border-line-strong bg-layer-panel text-sm font-medium text-foreground-muted",
        "[[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=brutal]_&]:font-sans [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black",
      )}
    >
      {children}
    </ContextMenuTrigger>
  );
}

function ActionMenuRows() {
  return (
    <>
      <ContextMenuLabel>Thread actions</ContextMenuLabel>
      <ContextMenuItem>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin thread</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        <span className="min-w-0 flex-1 truncate">Copy link</span>
        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Archive />
        <span className="min-w-0 flex-1 truncate">Archive</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Trash />
        <span className="min-w-0 flex-1 truncate">Delete</span>
        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </>
  );
}

function SubmenuRows() {
  return (
    <>
      <ContextMenuItem>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin thread</span>
      </ContextMenuItem>
      <ContextMenuSubmenu>
        <ContextMenuSubmenuTrigger openOnHover>
          <MoonStar />
          <span className="min-w-0 flex-1 truncate">Move to</span>
          <ChevronRight className="ml-auto" />
        </ContextMenuSubmenuTrigger>
        <ContextMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="flex w-36 min-w-36 flex-col"
        >
          <ContextMenuItem>Inbox</ContextMenuItem>
          <ContextMenuItem>Archive</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuSubmenu>
    </>
  );
}

function RadioGroupRows() {
  return (
    <>
      <ContextMenuLabel>Theme</ContextMenuLabel>
      <ContextMenuRadioGroup defaultValue="system">
        <ContextMenuRadioItem value="system">
          <Bell />
          <span className="min-w-0 flex-1 truncate">System alerts</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="quiet">
          <MoonStar />
          <span className="min-w-0 flex-1 truncate">Quiet mode</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="light">
          <Sun />
          <span className="min-w-0 flex-1 truncate">Light mode</span>
        </ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </>
  );
}

function CheckboxRows() {
  return (
    <>
      <ContextMenuLabel>Visible rows</ContextMenuLabel>
      <ContextMenuCheckboxItem defaultChecked>Unread threads</ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem defaultChecked>Pinned threads</ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem>Archived threads</ContextMenuCheckboxItem>
    </>
  );
}

function OpenContextMenuExample({
  triggerId,
  label,
  children,
  contentClassName = "flex w-56 min-w-56 flex-col",
}: {
  triggerId: string;
  label: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [hasCursorAnchor, setHasCursorAnchor] = useState(false);
  const anchor = {
    getBoundingClientRect() {
      const rect = triggerRef.current?.getBoundingClientRect();
      return DOMRect.fromRect({
        x: rect?.right ?? 0,
        y: rect?.bottom ?? 0,
        width: 0,
        height: 0,
      });
    },
  };

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <ContextMenu defaultOpen>
        <div ref={triggerRef} onContextMenuCapture={() => setHasCursorAnchor(true)}>
          <ContextMenuTriggerSurface id={triggerId}>{label}</ContextMenuTriggerSurface>
        </div>
        <ContextMenuContent
          anchor={hasCursorAnchor ? undefined : anchor}
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className={contentClassName}
        >
          {children}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function ContextMenuPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  return (
    <Preview previewClassName="min-h-[26rem] items-start pt-16">
      <Preview.Canvas>
        <OpenContextMenuExample triggerId="preview-context-menu-trigger" label="Right click thread">
          <ActionMenuRows />
        </OpenContextMenuExample>
      </Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

function ContextMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ContextMenu"
      description="A right-click menu family for compact action, selection, and nested action surfaces."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview defaults the menu open so the row styling, density, and theme differences are
          visible immediately; dismiss it and right-click the trigger to reopen it.
        </p>
        <ContextMenuPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="submenu" title="Submenu">
            <Preview previewClassName="min-h-[22rem] items-start pt-12">
              <Preview.Canvas>
                <OpenContextMenuExample
                  triggerId="context-submenu-trigger"
                  label="Right click item"
                >
                  <SubmenuRows />
                </OpenContextMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.submenu} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="radio-group" title="Radio group">
            <Preview previewClassName="min-h-[24rem] items-start pt-12">
              <Preview.Canvas>
                <OpenContextMenuExample
                  triggerId="context-radio-trigger"
                  label="Right click notification"
                  contentClassName="flex w-60 min-w-60 flex-col"
                >
                  <RadioGroupRows />
                </OpenContextMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.radioGroup} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="checkboxes" title="Checkboxes">
            <Preview previewClassName="min-h-[22rem] items-start pt-12">
              <Preview.Canvas>
                <OpenContextMenuExample
                  triggerId="context-checkbox-trigger"
                  label="Right click list"
                  contentClassName="flex w-64 min-w-64 flex-col"
                >
                  <CheckboxRows />
                </OpenContextMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.checkboxes} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-context-menu" title="ContextMenu">
            <PropsTable rows={CONTEXT_MENU_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-trigger" title="ContextMenuTrigger">
            <PropsTable rows={CONTEXT_MENU_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-portal" title="ContextMenuPortal">
            <PropsTable rows={CONTEXT_MENU_PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-content" title="ContextMenuContent">
            <PropsTable rows={CONTEXT_MENU_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-popup" title="ContextMenuPopup">
            <PropsTable rows={CONTEXT_MENU_POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-item" title="ContextMenuItem">
            <PropsTable rows={CONTEXT_MENU_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-item-label"
            title="ContextMenuItemLabel"
          >
            <PropsTable rows={CONTEXT_MENU_ITEM_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-label" title="ContextMenuLabel">
            <PropsTable rows={CONTEXT_MENU_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-shortcut" title="ContextMenuShortcut">
            <PropsTable rows={CONTEXT_MENU_SHORTCUT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-separator"
            title="ContextMenuSeparator"
          >
            <PropsTable rows={CONTEXT_MENU_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-footer" title="ContextMenuFooter">
            <PropsTable rows={CONTEXT_MENU_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-radio-group"
            title="ContextMenuRadioGroup"
          >
            <PropsTable rows={CONTEXT_MENU_RADIO_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-radio-item"
            title="ContextMenuRadioItem"
          >
            <PropsTable rows={CONTEXT_MENU_RADIO_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-radio-item-indicator"
            title="ContextMenuRadioItemIndicator"
          >
            <PropsTable rows={CONTEXT_MENU_RADIO_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-checkbox-item"
            title="ContextMenuCheckboxItem"
          >
            <PropsTable rows={CONTEXT_MENU_CHECKBOX_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-checkbox-item-indicator"
            title="ContextMenuCheckboxItemIndicator"
          >
            <PropsTable rows={CONTEXT_MENU_CHECKBOX_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-context-menu-submenu" title="ContextMenuSubmenu">
            <PropsTable rows={CONTEXT_MENU_SUBMENU_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-context-menu-submenu-trigger"
            title="ContextMenuSubmenuTrigger"
          >
            <PropsTable rows={CONTEXT_MENU_SUBMENU_TRIGGER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
