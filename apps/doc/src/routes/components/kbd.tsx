import { createFileRoute } from "@tanstack/react-router";
import { InputGroup, InputGroupAddon, InputGroupInput, Kbd, KbdGroup } from "raft-ui";
import { Search } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
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

<Kbd />

<KbdGroup>
  <Kbd />
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
        <Preview>
          <Preview.Canvas>
            <div className="flex flex-wrap items-center gap-4">
              <Kbd>⌫</Kbd>
              <KbdGroup aria-label="Command K">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              <Kbd>Esc</Kbd>
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
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
        <div className="space-y-6">
          <DocNote>
            Keep Kbd as supporting metadata, not the primary action label. In menus it sits at the
            trailing edge; in fields it names a shortcut without becoming a clickable control.
          </DocNote>
          <DocSubsection parentId="usage" id="menu-row" title="Menu row">
            <Preview>
              <Preview.Canvas>
                <div className="flex w-64 items-center gap-2 px-3 py-2 text-sm font-medium">
                  <span className="min-w-0 flex-1 truncate">Copy link</span>
                  <Kbd>⌘C</Kbd>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.usageMenu} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="input-hint" title="Input hint">
            <Preview>
              <Preview.Canvas>
                <InputGroup className="w-64">
                  <InputGroupAddon>
                    <Search aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput aria-label="Search messages" placeholder="Search messages" />
                  <InputGroupAddon align="inline-end">
                    <Kbd>Cmd K</Kbd>
                  </InputGroupAddon>
                </InputGroup>
              </Preview.Canvas>
              <Preview.Code html={code.usageInput} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="key-sequence" title="Key sequence">
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span>Open command menu</span>
                  <KbdGroup aria-label="Command K">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.usageSequence} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Kbd">
            <PropsTable rows={KBD_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-group" title="KbdGroup">
            <PropsTable rows={KBD_GROUP_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
