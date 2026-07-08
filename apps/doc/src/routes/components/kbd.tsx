import { createFileRoute } from "@tanstack/react-router";
import { InputGroup, InputGroupAddon, InputGroupInput, Kbd, KbdGroup } from "raft-ui";
import { Search } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `import { Kbd, KbdGroup } from "raft-ui";

<div className="flex flex-wrap items-center gap-4">
  <Kbd>⌫</Kbd>
  <KbdGroup aria-label="Command K">
    <Kbd>⌘</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
  <Kbd>Esc</Kbd>
</div>`,
  anatomy: `import { Kbd, KbdGroup } from "raft-ui";

<Kbd>⌫</Kbd>

<KbdGroup aria-label="Command K">
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>`,
  usageMenu: `import { Kbd } from "raft-ui";

<div className="flex w-64 items-center gap-2 px-3 py-2 text-sm font-medium">
  <span className="min-w-0 flex-1 truncate">Copy link</span>
  <Kbd>⌘C</Kbd>
</div>`,
  usageInput: `import { InputGroup, InputGroupAddon, InputGroupInput, Kbd } from "raft-ui";
import { Search } from "lucide-react";

<InputGroup className="w-64">
  <InputGroupAddon>
    <Search aria-hidden />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search messages" placeholder="Search messages" />
  <InputGroupAddon align="inline-end">
    <Kbd>Cmd K</Kbd>
  </InputGroupAddon>
</InputGroup>`,
  usageSequence: `import { Kbd, KbdGroup } from "raft-ui";

<div className="flex items-center gap-3 text-sm font-medium">
  <span>Open command menu</span>
  <KbdGroup aria-label="Command K">
    <Kbd>⌘</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
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

const KBD_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "className",
    type: "string",
    description: "Optional spacing or rare layout override classes.",
  },
  {
    name: "...props",
    type: "ComponentPropsWithRef<'span'>",
    description:
      "Native span attributes for a shortcut sequence. Add aria-label when the visual keys are symbolic.",
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
      description="A compact keyboard hint for row shortcuts, command prompts, and input affordances."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.preview}>
          <div className="flex flex-wrap items-center gap-4">
            <Kbd>⌫</Kbd>
            <KbdGroup aria-label="Command K">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <Kbd>Esc</Kbd>
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

      <DocSection id="usage" title="Usage">
        <div className="space-y-6">
          <DocNote>
            Keep Kbd as supporting metadata, not the primary action label. In menus it sits at the
            trailing edge; in fields it names a shortcut without becoming a clickable control.
          </DocNote>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Menu row</h3>
            <Example html={code.usageMenu}>
              <div className="flex w-64 items-center gap-2 px-3 py-2 text-sm font-medium">
                <span className="min-w-0 flex-1 truncate">Copy link</span>
                <Kbd>⌘C</Kbd>
              </div>
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Input hint</h3>
            <Example html={code.usageInput}>
              <InputGroup className="w-64">
                <InputGroupAddon>
                  <Search aria-hidden />
                </InputGroupAddon>
                <InputGroupInput aria-label="Search messages" placeholder="Search messages" />
                <InputGroupAddon align="inline-end">
                  <Kbd>Cmd K</Kbd>
                </InputGroupAddon>
              </InputGroup>
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Key sequence</h3>
            <Example html={code.usageSequence}>
              <div className="flex items-center gap-3 text-sm font-medium">
                <span>Open command menu</span>
                <KbdGroup aria-label="Command K">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Kbd props</h3>
            <PropsTable rows={KBD_PROPS} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">KbdGroup props</h3>
            <PropsTable rows={KBD_GROUP_PROPS} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
