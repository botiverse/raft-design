import { createFileRoute } from "@tanstack/react-router";
import { Separator, Text } from "raft-ui";

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
  preview: `import { Separator } from "raft-ui";

<div className="grid gap-3">
  <span>Channel settings</span>
  <Separator />
  <Separator>Actions</Separator>
  <span>Visibility actions</span>
</div>`,
  anatomy: `import { Separator } from "raft-ui";

<Separator />`,
  orientation: `import { Separator } from "raft-ui";

<Separator />
<Separator orientation="vertical" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: "Separator direction. Vertical separators stretch to the parent height.",
  },
  {
    name: "children",
    type: "ReactNode",
    description:
      "Optional centered content for horizontal separators, such as text, icons, or compact metadata.",
  },
  {
    name: "className",
    type: "string",
    description: "Optional spacing or rare visual override classes.",
  },
  {
    name: "...props",
    type: "Base UI Separator.Props",
    description: "Base UI separator attributes.",
  },
];

export const Route = createFileRoute("/components/separator")({
  component: SeparatorDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SeparatorDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Separator"
      description="A themed divider for grouping nearby content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="grid w-64 gap-3">
              <Text.Sans size="small">Channel settings</Text.Sans>
              <Separator />
              <Separator>Actions</Separator>
              <Text.Sans size="small">Visibility actions</Text.Sans>
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
        <DocSubsection parentId="usage" id="orientation" title="Orientation">
          <DocNote>
            Use horizontal separators between stacked groups. Use vertical separators only inside a
            row with a stable height.
          </DocNote>
          <Preview>
            <Preview.Canvas>
              <div className="grid gap-8">
                <div className="grid w-64 gap-3">
                  <Text.Sans size="small">Channel settings</Text.Sans>
                  <Separator />
                  <Separator>Actions</Separator>
                  <Text.Sans size="small">Visibility actions</Text.Sans>
                </div>
                <div className="flex h-14 items-center gap-4">
                  <Text.Sans size="small">Filters</Text.Sans>
                  <Separator orientation="vertical" />
                  <Text.Sans size="small">Sort</Text.Sans>
                </div>
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.orientation} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
