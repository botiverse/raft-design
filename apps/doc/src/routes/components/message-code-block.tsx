import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import plainCompositionSource from "#/modules/message-code-block/compositions/plain.composition.tsx?raw";
import { PlainMessageCodeBlockComposition } from "#/modules/message-code-block/compositions/plain.composition.tsx";
import shikiCompositionSource from "#/modules/message-code-block/compositions/shiki.composition.tsx?raw";
import { ShikiMessageCodeBlockComposition } from "#/modules/message-code-block/compositions/shiki.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "external-highlighting", title: "External highlighting" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageCodeBlock code={code}>
  <pre>
    <code>{code}</code>
  </pre>
</MessageCodeBlock>`;

const PROPS: readonly PropRow[] = [
  {
    name: "code",
    type: "string",
    description:
      "Canonical source used by the built-in copy action. It should match the code rendered by children.",
  },
  {
    name: "children",
    type: "ReactNode",
    description:
      "Complete rendered code block, including pre and code. Pass plain markup or an external highlighter.",
  },
  {
    name: "...props",
    type: 'Omit<useRender.ComponentProps<"div">, "children">',
    description: "Native attributes and render substitution for the stable code-block wrapper.",
  },
];

export const Route = createFileRoute("/components/message-code-block")({
  component: MessageCodeBlockDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        plain: plainCompositionSource,
        shiki: shikiCompositionSource,
      },
    }),
});

function MessageCodeBlockDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageCodeBlock"
      description="A message code surface with built-in copy feedback and consumer-rendered code content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Compose a plain pre and code when syntax highlighting is not needed. MessageCodeBlock
            owns only the wrapper and copy action.
          </DocNote>
          <Preview previewClassName="items-stretch">
            <Preview.Canvas>
              <div className="w-full max-w-2xl">
                <PlainMessageCodeBlockComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.plain} />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="external-highlighting" title="External highlighting">
        <div className="space-y-4">
          <DocNote>
            Shiki stays outside raft-ui. Let the external renderer produce the complete pre and code
            structure, then pass that result as children.
          </DocNote>
          <Preview previewClassName="items-stretch">
            <Preview.Canvas>
              <div className="w-full max-w-2xl">
                <ShikiMessageCodeBlockComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.shiki} collapsedHtml={code.shikiBody} />
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

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
