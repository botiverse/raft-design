import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `import { InlineCode } from "raft-ui";

<p>
  Set <InlineCode>data-invalid</InlineCode> on the control.
</p>`,
  anatomy: `import { InlineCode } from "raft-ui";

<InlineCode />`,
  usage: `<p>
  Put <InlineCode>data-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on the control.
</p>

<p>
  Replace <InlineCode>input-legacy</InlineCode> with the themed component recipe.
</p>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "className",
    type: "string",
    description: "Optional spacing or rare visual override classes.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"code">',
    description: "Native code attributes. The root always renders a semantic code element.",
  },
];

export const Route = createFileRoute("/components/inline-code")({
  component: InlineCodeDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function InlineCodeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="InlineCode"
      description="A semantic inline code token for docs prose."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Use <InlineCode>InlineCode</InlineCode> inside explanatory prose when naming props,
            attributes, classes, or component parts.
          </DocNote>
          <Preview>
            <Preview.Canvas>
              <p className="max-w-2xl text-sm leading-6 text-foreground-strong">
                Set <InlineCode>data-invalid</InlineCode> on the control.
              </p>
            </Preview.Canvas>
            <Preview.Code html={code.preview} />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-4">
          <DocNote>
            Keep <InlineCode>InlineCode</InlineCode> for short inline identifiers. Use{" "}
            <InlineCode>CodeBlock</InlineCode> for snippets, multi-token examples, or anything that
            needs syntax highlighting.
          </DocNote>
          <Preview>
            <Preview.Canvas>
              <div className="grid max-w-2xl gap-4 text-sm leading-6 text-foreground-strong">
                <p>
                  Put <InlineCode>data-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on
                  the control.
                </p>
                <p>
                  Replace <InlineCode>input-legacy</InlineCode> with the themed component recipe.
                </p>
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.usage} />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
