import { createFileRoute } from "@tanstack/react-router";
import { Kbd } from "@slock/ui";
import { Callout } from "#/components/callout.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyMenuItem from "../../../../../packages/ui/src/legacy/menu-item.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `import { Kbd } from "@slock/ui";

<div className="flex flex-wrap items-center gap-3">
  <Kbd>⌫</Kbd>
  <Kbd>Esc</Kbd>
  <Kbd>⌘K</Kbd>
</div>`,
  anatomy: `import { Kbd } from "@slock/ui";

<Kbd>⌫</Kbd>`,
  sourceShortcut: `// Source scenes from legacy/menu-item.tsx inventory:
// Sidebar channel/DM/agent menus, MessageItem, SavedPanel, ThreadsInbox.
<MenuItem trailing={<span className="ml-auto shrink-0 text-black/60">⌫</span>}>
  Delete
</MenuItem>`,
  currentShortcut: `// Extracted primitive for the same right-click action-menu hint.
<div className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black">
  <span className="min-w-0 flex-1 truncate">Delete</span>
  <Kbd>⌫</Kbd>
</div>`,
} as const;

const KBD_PROPS: readonly PropRow[] = [
  {
    name: "className",
    type: "string",
    description: "Optional positioning or rare visual override classes.",
  },
  {
    name: "...props",
    type: "ComponentPropsWithRef<'kbd'>",
    description: "Native kbd attributes. The root always renders a semantic kbd element.",
  },
];

export const Route = createFileRoute("/components/kbd")({
  component: KbdDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function KbdDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Kbd"
      description="A compact keyboard hint for menu row shortcuts."
      overview={
        <Callout>
          <code>Kbd</code> is extracted from the source menu trailing slot. It should read like a
          right-aligned shortcut hint inside a row, not like a standalone boxed keycap.
        </Callout>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview}>
          <div className="flex flex-wrap items-center gap-3">
            <Kbd>⌫</Kbd>
            <Kbd>Esc</Kbd>
            <Kbd>⌘K</Kbd>
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Kbd.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={KBD_PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label:
                "Source scenes: Sidebar channel/DM/agent, MessageItem, SavedPanel, ThreadsInbox",
              status: "difference",
              note: (
                <>
                  Source evidence comes from <code>legacy/menu-item.tsx</code>: the shared{" "}
                  <code>MenuItem</code> row was inventoried for right-click context menus across
                  these app surfaces, and its <code>trailing</code> slot was documented as the
                  shortcut-hint position. The visual contract is right-aligned subtle text, not a
                  bordered keycap. Current extracts that hint into <code>Kbd</code>; menu-specific
                  shortcut parts can reuse it from their own component docs.
                </>
              ),
              source: (
                <LegacyMenuItem
                  trailing={<span className="ml-auto shrink-0 text-black/60">⌫</span>}
                >
                  Delete
                </LegacyMenuItem>
              ),
              current: (
                <div className="flex w-full cursor-default select-none items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black transition-colors hover:bg-brutal-yellow/30 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0">
                  <span className="min-w-0 flex-1 truncate">Delete</span>
                  <Kbd>⌫</Kbd>
                </div>
              ),
              sourceCode: code.sourceShortcut,
              currentCode: code.currentShortcut,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
