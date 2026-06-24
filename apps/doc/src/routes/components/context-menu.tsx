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
  InlineCode,
} from "@raft/ui";
import { Archive, Bell, ChevronRight, Copy, MoonStar, Pin, Sun, Trash } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "tailwind-variants";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import contextMenuCompositionSource from "#/compositions/context-menu-composition.tsx?raw";
import {
  CONTEXT_MENU_COMPOSITION_PATH,
  ContextMenuCompositionPreview,
  ContextMenuMessageMenuPreview,
  ContextMenuSelectionMenuPreview,
  ContextMenuSidebarMenuPreview,
  ContextMenuSourceMessageMenuPreview,
  ContextMenuSourcePreview,
  ContextMenuSourceSelectionMenuPreview,
  ContextMenuSourceSidebarMenuPreview,
} from "#/compositions/context-menu-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "submenu", title: "Submenu" },
  { id: "radio-group", title: "Radio group" },
  { id: "checkboxes", title: "Checkboxes" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-action-menu", title: "Action menu" },
      { id: "source-comparison-message-menu", title: "Message menu" },
      { id: "source-comparison-selection-menu", title: "Selection menu" },
      { id: "source-comparison-sidebar-menu", title: "Sidebar menu" },
    ],
  },
] as const;

const CONTEXT_MENU_COMPOSITION_SOURCES = createCompositionSourceMap({
  contextMenuComposition: contextMenuCompositionSource,
} as const);

type PlaygroundValues = {
  label: string;
};

const ACTION_MENU_BODY_SNIPPET = `    <ContextMenuLabel>Thread actions</ContextMenuLabel>
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
    </ContextMenuItem>`;

const SNIPPETS = {
  anatomy: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@raft/ui";

<ContextMenu defaultOpen>
  <ContextMenuTrigger id="context-menu-trigger">Right click this surface</ContextMenuTrigger>
  <ContextMenuContent>
${ACTION_MENU_BODY_SNIPPET}
  </ContextMenuContent>
</ContextMenu>`,
  submenu: `<ContextMenu defaultOpen>
  <ContextMenuTrigger id="context-submenu-trigger">Right click this surface</ContextMenuTrigger>
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
  <ContextMenuTrigger id="context-radio-trigger">Right click this surface</ContextMenuTrigger>
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
  <ContextMenuTrigger id="context-checkbox-trigger">Right click this surface</ContextMenuTrigger>
  <ContextMenuContent className="flex w-64 min-w-64 flex-col">
    <ContextMenuLabel>Visible rows</ContextMenuLabel>
    <ContextMenuCheckboxItem defaultChecked>Unread threads</ContextMenuCheckboxItem>
    <ContextMenuCheckboxItem defaultChecked>Pinned threads</ContextMenuCheckboxItem>
    <ContextMenuCheckboxItem>Archived threads</ContextMenuCheckboxItem>
  </ContextMenuContent>
</ContextMenu>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ContextMenu",
    type: "Base UI ContextMenu.Root.Props",
    description: "Owns right-click open state, focus roving, keyboard navigation, and dismissal.",
  },
  {
    name: "ContextMenuTrigger",
    type: "Base UI ContextMenu.Trigger.Props",
    description: "Right-click or long-press target. Renders a div and keeps text selection off.",
  },
  {
    name: "ContextMenuContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating menu shell. Defaults to placing the popup top-left at the context point, with collision correction off unless overridden.",
  },
  {
    name: "ContextMenuItem",
    type: "Base UI ContextMenu.Item.Props",
    description:
      "Action row. Compose leading icons, label text, and trailing shortcuts as children.",
  },
  {
    name: "ContextMenuSubmenu",
    type: "Base UI ContextMenu.SubmenuRoot.Props",
    description: "Nested context-menu branch for secondary action groups.",
  },
  {
    name: "ContextMenuSubmenuTrigger",
    type: "Base UI ContextMenu.SubmenuTrigger.Props",
    description: "Row that opens a nested menu. Compose the chevron as the trailing icon.",
  },
  {
    name: "ContextMenuRadioGroup",
    type: "Base UI ContextMenu.RadioGroup.Props",
    description: "Single-selection group inside the menu.",
  },
  {
    name: "ContextMenuRadioItem",
    type: "Base UI ContextMenu.RadioItem.Props",
    description: "Selectable row with a trailing check indicator.",
  },
  {
    name: "ContextMenuCheckboxItem",
    type: "Base UI ContextMenu.CheckboxItem.Props",
    description: "Toggleable row with a trailing check indicator.",
  },
  {
    name: "ContextMenuLabel",
    type: "div props",
    description: "Section label for grouped rows.",
  },
  {
    name: "ContextMenuShortcut",
    type: "Kbd props",
    description: "Right-aligned keyboard hint composed inside a menu row.",
  },
  {
    name: "ContextMenuSeparator",
    type: "Base UI ContextMenu.Separator.Props",
    description: "Group separator mapped from the source ContextMenuDivider primitive.",
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
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className={contentClassName}
        >
          {children}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function ContextMenuPreview({ label }: PlaygroundValues) {
  return (
    <OpenContextMenuExample triggerId="preview-context-menu-trigger" label={label}>
      <ActionMenuRows />
    </OpenContextMenuExample>
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
      <DocSection id="preview" title="Preview">
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview defaults the menu open so the row styling, density, and theme differences are
          visible immediately; dismiss it and right-click the trigger to reopen it.
        </p>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            label: "Right click thread",
          }}
          controls={[{ name: "label", label: "Label", type: "text" }]}
          previewClassName="min-h-[26rem] items-start pt-16"
          render={(values) => <ContextMenuPreview {...values} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="ContextMenu.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="submenu" title="Submenu">
        <Example html={code.submenu} previewClassName="min-h-[22rem] items-start pt-12">
          <OpenContextMenuExample triggerId="context-submenu-trigger" label="Right click item">
            <SubmenuRows />
          </OpenContextMenuExample>
        </Example>
      </DocSection>

      <DocSection id="radio-group" title="Radio group">
        <Example html={code.radioGroup} previewClassName="min-h-[24rem] items-start pt-12">
          <OpenContextMenuExample
            triggerId="context-radio-trigger"
            label="Right click notification"
            contentClassName="flex w-60 min-w-60 flex-col"
          >
            <RadioGroupRows />
          </OpenContextMenuExample>
        </Example>
      </DocSection>

      <DocSection id="checkboxes" title="Checkboxes">
        <Example html={code.checkboxes} previewClassName="min-h-[22rem] items-start pt-12">
          <OpenContextMenuExample
            triggerId="context-checkbox-trigger"
            label="Right click list"
            contentClassName="flex w-64 min-w-64 flex-col"
          >
            <CheckboxRows />
          </OpenContextMenuExample>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              id: "source-comparison-action-menu",
              label: "Action menu",
              status: "difference",
              note: (
                <>
                  Source exposed standalone <InlineCode>MenuItem</InlineCode> and{" "}
                  <InlineCode>ContextMenuDivider</InlineCode> primitives. Current keeps the compact
                  row and separator structure but moves it into a themed Base UI{" "}
                  <InlineCode>ContextMenu</InlineCode> composition.
                </>
              ),
              source: <ContextMenuSourcePreview />,
              brutal: <ContextMenuCompositionPreview />,
              elegant: <ContextMenuCompositionPreview />,
              elegantDark: <ContextMenuCompositionPreview />,
              compositionCode: code.contextMenuComposition,
              compositionCollapsedCode: code.contextMenuCompositionBody,
              compositionPath: CONTEXT_MENU_COMPOSITION_PATH,
              compositionSource: CONTEXT_MENU_COMPOSITION_SOURCES.contextMenuComposition,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-message-menu",
              label: "Message menu",
              status: "difference",
              note: (
                <>
                  Source rendered the message context menu from <InlineCode>MessageItem</InlineCode>
                  with a custom reaction quick row followed by copy, share, thread, save, and task
                  sections. Current keeps that mixed custom-row plus item-section structure inside
                  the shared <InlineCode>ContextMenu</InlineCode> visual contract.
                </>
              ),
              source: <ContextMenuSourceMessageMenuPreview />,
              brutal: <ContextMenuMessageMenuPreview />,
              elegant: <ContextMenuMessageMenuPreview />,
              elegantDark: <ContextMenuMessageMenuPreview />,
            },
            {
              id: "source-comparison-selection-menu",
              label: "Selection menu",
              status: "difference",
              note: (
                <>
                  Source intentionally kept selected-text actions separate from the full message row
                  menu: only <InlineCode>Quote</InlineCode> and <InlineCode>Copy</InlineCode>.
                  Current preserves that scoped two-action surface instead of merging it with
                  message actions.
                </>
              ),
              source: <ContextMenuSourceSelectionMenuPreview />,
              brutal: <ContextMenuSelectionMenuPreview />,
              elegant: <ContextMenuSelectionMenuPreview />,
              elegantDark: <ContextMenuSelectionMenuPreview />,
            },
            {
              id: "source-comparison-sidebar-menu",
              label: "Sidebar menu",
              status: "difference",
              note: (
                <>
                  Source sidebar right-click menus reuse the same action row primitive for unread,
                  pin, and archive sections across channels, DMs, and agents. Current keeps the
                  section divider contract while letting the theme own item and surface styling.
                </>
              ),
              source: <ContextMenuSourceSidebarMenuPreview />,
              brutal: <ContextMenuSidebarMenuPreview />,
              elegant: <ContextMenuSidebarMenuPreview />,
              elegantDark: <ContextMenuSidebarMenuPreview />,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
