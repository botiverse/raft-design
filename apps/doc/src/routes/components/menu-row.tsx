import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MenuRowSortComposition } from "#/modules/menu-row/compositions/sort.composition.tsx";
import menuRowSortCompositionSource from "#/modules/menu-row/compositions/sort.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { MenuRow, MenuRowCheck, MenuRowLabel, MenuRowList, MenuRowShortcut } from "raft-ui";

<MenuRowList>
  <MenuRow>
    {/* a 16px icon */}
    <MenuRowLabel />
    <MenuRowShortcut />
  </MenuRow>
  <MenuRow aria-current>
    <MenuRowLabel />
    <MenuRowCheck />
  </MenuRow>
</MenuRowList>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Sort: menuRowSortCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Sort: "menuRowSortComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const MENU_ROW_PROPS: readonly PropRow[] = [
  {
    name: "highlighted",
    type: "boolean",
    default: "false",
    description:
      "A highlight the caller drives, such as a finder's active row while focus stays in its input. Hover and keyboard focus highlight on their own.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Render a link instead of the button.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Native button attributes. aria-current, aria-checked or aria-selected make the row bold; disabled greys it.",
  },
];

const PARTS: readonly PropRow[] = [
  {
    name: "MenuRowList",
    type: "div",
    description: "The column inside a popover: 240 wide, a 6px inset.",
  },
  {
    name: "MenuRowLabel",
    type: "span",
    description: "The row's words; they take the room and truncate.",
  },
  {
    name: "MenuRowCheck",
    type: "span",
    description: "The ink check at the end of the current value's row; decorative.",
  },
  {
    name: "MenuRowShortcut",
    type: "kbd",
    description: "A shortcut at the end, Space Mono 12 ink-3.",
  },
];

export const Route = createFileRoute("/components/menu-row")({
  component: MenuRowDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function MenuRowDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MenuRow"
      description="The look of a menu item on a plain button, for a list of choices in a popover that is not a menu."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <MenuRowSortComposition />
          </Preview.Canvas>
          <Preview.Code
            html={code.menuRowSortComposition}
            collapsedHtml={code.menuRowSortCompositionBody}
          />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="menu-or-row" title="A menu, or rows">
          <DocNote>
            A <InlineCode>MenuRow</InlineCode> is a button with no menu role: it has no arrow keys
            or typeahead. A list of actions on something belongs in{" "}
            <InlineCode>DropdownMenu</InlineCode> or <InlineCode>ContextMenu</InlineCode>, whose
            items have them. Use rows for a short list of choices or places inside a{" "}
            <InlineCode>Popover</InlineCode>. Tab moves between them, and the current one carries{" "}
            <InlineCode>aria-current</InlineCode> and a check.
          </DocNote>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-menu-row" title="MenuRow">
            <PropsTable rows={MENU_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-parts" title="Parts">
            <PropsTable rows={PARTS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
