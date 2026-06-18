import { createFileRoute } from "@tanstack/react-router";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@slock/ui";
import { Archive, Pin, Trash2 } from "lucide-react";
import { useMemo, useRef } from "react";

import { Callout } from "#/components/callout.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyContextMenuDivider from "../../../../../packages/ui/src/legacy/context-menu-divider.tsx";
import LegacyMenuItem from "../../../../../packages/ui/src/legacy/menu-item.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "opened", title: "Opened" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = [
  "Add elegant family styling",
  "Add checkbox, radio, label, and submenu parts when a source callsite needs them",
] as const;

const SNIPPETS = {
  anatomy: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@slock/ui";

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      <Pin />
      <span className="min-w-0 flex-1 truncate">Pin</span>
    </ContextMenuItem>
    <ContextMenuItem>
      <Archive />
      <span className="min-w-0 flex-1 truncate">Archive</span>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Trash2 />
      <span className="min-w-0 flex-1 truncate">Delete</span>
      <ContextMenuShortcut>⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  opened: `<div className="min-w-48 overflow-hidden border-2 border-black bg-white shadow-[var(--shadow-hover)]">
  <div className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
    <Pin size={14} />
    <span className="min-w-0 flex-1 truncate">Pin</span>
  </div>
  <div className="flex w-full items-center gap-2 bg-brutal-yellow/30 px-3 py-2 text-left text-sm font-medium text-black">
    <Archive size={14} />
    <span className="min-w-0 flex-1 truncate">Archive</span>
  </div>
  <div className="border-t-2 border-black" />
  <div className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
    <Trash2 size={14} />
    <span className="min-w-0 flex-1 truncate">Delete</span>
    <kbd className="pointer-events-none ml-auto inline-flex w-fit shrink-0 items-center justify-center gap-1 font-sans text-sm font-medium leading-none whitespace-nowrap text-black/60 select-none">⌫</kbd>
  </div>
</div>`,
  sourceItem: `<MenuItem icon={<Pin size={14} />}>Pin</MenuItem>`,
  currentItem: `<ContextMenuItem>
  <Pin />
  <span className="min-w-0 flex-1 truncate">Pin</span>
</ContextMenuItem>`,
  sourceDivider: `<ContextMenuDivider />`,
  currentDivider: `<ContextMenuSeparator />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ContextMenu",
    type: "Base UI ContextMenu.Root.Props",
    description: "Owns right-click open state and menu dismissal.",
  },
  {
    name: "ContextMenuTrigger",
    type: "Base UI ContextMenu.Trigger.Props",
    description: "Right-click target. Adds source-compatible select-none behavior.",
  },
  {
    name: "ContextMenuContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled card shell. Defaults to side=right, align=start, alignOffset=4, disableAnchorTracking=true, and positionMethod=fixed.",
  },
  {
    name: "ContextMenuItem",
    type: "Base UI ContextMenu.Item.Props",
    description:
      "Source MenuItem row styling plus Base UI keyboard highlight and dismiss behavior.",
  },
  {
    name: "ContextMenuShortcut",
    type: "Kbd props",
    description: "Right-aligned keyboard hint composed inside ContextMenuItem.",
  },
  {
    name: "ContextMenuSeparator",
    type: "Base UI ContextMenu.Separator.Props",
    description: "Source ContextMenuDivider styling as the separator part.",
  },
];

const PREVIEW_CONTENT_CLASS =
  "w-full max-w-xs overflow-hidden border-2 border-black bg-white shadow-[var(--shadow-hover)]";
const PREVIEW_ITEM_CLASS =
  "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-left text-sm font-medium text-black transition-colors hover:bg-brutal-yellow/30 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0";
const PREVIEW_SEPARATOR_CLASS = "border-t-2 border-black";
export const Route = createFileRoute("/components/context-menu")({
  component: ContextMenuDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CurrentMenuItemComparison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = containerRef.current?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: rect?.left ?? 0,
          y: rect?.top ?? 0,
          width: 0,
          height: 0,
        });
      },
    }),
    [],
  );

  return (
    <div ref={containerRef} className="relative h-9 w-full max-w-xs">
      <ContextMenu open>
        <ContextMenuContent
          anchor={anchor}
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={0}
          className="w-80 min-w-0 border-0 shadow-none"
          portalProps={{ container: containerRef }}
        >
          <ContextMenuItem>
            <Pin />
            <span className="min-w-0 flex-1 truncate">Pin</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function ContextMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ContextMenu"
      description="A right-click menu family built on Base UI and styled like the source action menus."
      overview={
        <Differences from="MenuItem + ContextMenuDivider">
          <li>
            source row and divider styling preserved: yellow/30 item hover, compact viewport
            density, and border-t-2 separators
          </li>
          <li>
            source standalone primitives are now composition parts:
            <code> MenuItem</code> → <code>ContextMenuItem</code>, <code>ContextMenuDivider</code> →{" "}
            <code>ContextMenuSeparator</code>
          </li>
          <li>
            item content follows shadcn-style composition: icons, labels, and shortcuts are authored
            as children, with <code>ContextMenuShortcut</code> for the right-aligned slot
          </li>
          <li>
            Base UI now owns right-click opening, focus roving, keyboard highlight, Escape, outside
            press dismissal, portal, and positioning
          </li>
          <li>
            difference from source: item and separator parts are meant to live inside a{" "}
            <code>ContextMenu</code> tree; legacy source files are kept only under{" "}
            <code>src/legacy</code> for visual comparison
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <ContextMenu>
              <ContextMenuTrigger className="block w-full border-2 border-dashed border-black bg-brutal-cream px-4 py-8 text-center font-heading text-sm font-bold text-black">
                Right click this surface
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Pin />
                  <span className="min-w-0 flex-1 truncate">Pin</span>
                </ContextMenuItem>
                <ContextMenuItem>
                  <Archive />
                  <span className="min-w-0 flex-1 truncate">Archive</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <Trash2 />
                  <span className="min-w-0 flex-1 truncate">Delete</span>
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Example>
          <Callout>
            Keyboard navigation now uses Base UI&rsquo;s highlighted state, mapped to the same
            yellow/30 fill as pointer hover.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="ContextMenu.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>
      <DocSection id="opened" title="Opened">
        <Example html={code.opened}>
          <div className={PREVIEW_CONTENT_CLASS}>
            <div className={PREVIEW_ITEM_CLASS}>
              <Pin />
              <span className="min-w-0 flex-1 truncate">Pin</span>
            </div>
            <div className={`${PREVIEW_ITEM_CLASS} bg-brutal-yellow/30`}>
              <Archive />
              <span className="min-w-0 flex-1 truncate">Archive</span>
            </div>
            <div className={PREVIEW_SEPARATOR_CLASS} />
            <div className={PREVIEW_ITEM_CLASS}>
              <Trash2 />
              <span className="min-w-0 flex-1 truncate">Delete</span>
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Menu item row",
              status: "match",
              note: "Current keeps the same row density and yellow/30 hover, but moves icon and label to children composition.",
              source: (
                <div className="w-full max-w-xs">
                  <LegacyMenuItem icon={<Pin size={14} />}>Pin</LegacyMenuItem>
                </div>
              ),
              current: (
                <div className="w-full max-w-xs">
                  <CurrentMenuItemComparison />
                </div>
              ),
              sourceCode: code.sourceItem,
              currentCode: code.currentItem,
            },
            {
              label: "Divider",
              status: "match",
              note: "Current maps the source border-t-2 divider onto Base UI's separator part.",
              source: (
                <div className="w-full max-w-xs">
                  <LegacyContextMenuDivider />
                </div>
              ),
              current: (
                <div className="w-full max-w-xs">
                  <ContextMenuSeparator />
                </div>
              ),
              sourceCode: code.sourceDivider,
              currentCode: code.currentDivider,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
