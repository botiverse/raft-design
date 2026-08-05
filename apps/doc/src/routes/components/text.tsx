import { createFileRoute } from "@tanstack/react-router";
import { InlineCode, Text } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { TextInlineListRowComposition } from "#/modules/text/compositions/inline-list-row.composition.tsx";
import inlineListRowCompositionSource from "#/modules/text/compositions/inline-list-row.composition.tsx?raw";
import { TextSemanticElementsComposition } from "#/modules/text/compositions/semantic-elements.composition.tsx";
import semanticElementsCompositionSource from "#/modules/text/compositions/semantic-elements.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
const SNIPPETS = {
  preview: `import { Text } from "raft-ui";

<div>
  <Text.Heading level={4}>Workspace updates</Text.Heading>
  <Text.Sans size="small" variant="muted">3 unread messages</Text.Sans>
  <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
</div>`,
  anatomy: `import { Text } from "raft-ui";

<Text.Heading />
<Text.Sans />
<Text.Mono />`,
  sizes: `<div>
  <Text.Heading level={5}>Heading level 5</Text.Heading>
  <Text.Sans size="large">Large body</Text.Sans>
  <Text.Sans size="body">Body text</Text.Sans>
  <Text.Sans size="small">Small supporting text</Text.Sans>
  <Text.Sans size="caption">Caption text</Text.Sans>
  <Text.Mono size="meta">meta</Text.Mono>
</div>`,
  variants: `<div>
  <Text.Sans variant="default">Default</Text.Sans>
  <Text.Sans variant="muted">Muted</Text.Sans>
  <Text.Sans variant="placeholder">Placeholder</Text.Sans>
  <Text.Sans variant="primary">Primary</Text.Sans>
  <Text.Sans variant="success">Success</Text.Sans>
  <Text.Sans variant="danger">Danger</Text.Sans>
</div>`,
} as const;

const TEXT_VARIANT_TYPE =
  '"default" | "primary" | "information" | "muted" | "placeholder" | "accent" | "success" | "warning" | "danger"';

const TEXT_COMPOSITION_SOURCES = createCompositionSourceMap({
  SemanticElements: semanticElementsCompositionSource,
  InlineListRow: inlineListRowCompositionSource,
});

const TEXT_COMPOSITION_SNIPPET_IDS = {
  SemanticElements: "semanticElementsComposition",
  InlineListRow: "inlineListRowComposition",
} as const;

const TEXT_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "level",
    type: "1 | 2 | 3 | 4 | 5 | 6",
    default: "1",
    description: "Semantic heading level. Renders the matching h1–h6 element.",
  },
  {
    name: "variant",
    type: TEXT_VARIANT_TYPE,
    description: "Optional semantic color. Leave unset for the strong heading default.",
  },
  {
    name: "render",
    type: "ReactElement | (props) => ReactElement",
    description: "Base UI render override for changing the underlying element.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"h1">',
    description: "Native heading attributes plus Base UI render composition props.",
  },
];

const TEXT_SANS_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: '"large" | "body" | "small" | "caption"',
    default: '"body"',
    description: "Sans text size for product copy and supporting labels.",
  },
  {
    name: "variant",
    type: TEXT_VARIANT_TYPE,
    description: "Optional semantic color. Leave unset to use the size recipe default.",
  },
  {
    name: "render",
    type: "ReactElement | (props) => ReactElement",
    description: "Base UI render override for changing the underlying element.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"p">',
    description: "Native paragraph attributes plus Base UI render composition props.",
  },
];

const TEXT_MONO_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: '"code" | "meta" | "eyebrow" | "tabular"',
    default: '"code"',
    description: "Mono text size for identifiers, metadata, and numeric text.",
  },
  {
    name: "variant",
    type: TEXT_VARIANT_TYPE,
    description: "Optional semantic color. Leave unset to use the size recipe default.",
  },
  {
    name: "render",
    type: "ReactElement | (props) => ReactElement",
    description: "Base UI render override for changing the underlying element.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"p">',
    description: "Native paragraph attributes plus Base UI render composition props.",
  },
];

export const Route = createFileRoute("/components/text")({
  component: TextDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(TEXT_COMPOSITION_SOURCES, TEXT_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function TextDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Text"
      description="Semantic text primitives for headings, product copy, and compact metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="grid max-w-sm gap-2">
              <Text.Heading level={4}>Workspace updates</Text.Heading>
              <Text.Sans size="small" variant="muted">
                3 unread messages
              </Text.Sans>
              <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
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
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <DocNote>
              Use <InlineCode>Text</InlineCode> for repeatable product typography. Use token pages
              when auditing the full type scale.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid max-w-sm gap-3">
                  <Text.Heading level={5}>Heading level 5</Text.Heading>
                  <Text.Sans size="large">Large body</Text.Sans>
                  <Text.Sans size="body">Body text</Text.Sans>
                  <Text.Sans size="small">Small supporting text</Text.Sans>
                  <Text.Sans size="caption">Caption text</Text.Sans>
                  <Text.Mono size="meta">meta</Text.Mono>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
                <div className="grid max-w-sm gap-2">
                  <Text.Sans variant="default">Default</Text.Sans>
                  <Text.Sans variant="muted">Muted</Text.Sans>
                  <Text.Sans variant="placeholder">Placeholder</Text.Sans>
                  <Text.Sans variant="primary">Primary</Text.Sans>
                  <Text.Sans variant="success">Success</Text.Sans>
                  <Text.Sans variant="danger">Danger</Text.Sans>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="semantic-elements" title="Semantic elements">
            <DocNote>
              Use the <InlineCode>render</InlineCode> prop to preserve <InlineCode>Text</InlineCode>{" "}
              styling while choosing the element required by the surrounding document structure.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <TextSemanticElementsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.semanticElementsComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="inline-list-row" title="Inline list-row typography">
            <Preview>
              <Preview.Canvas>
                <TextInlineListRowComposition />
              </Preview.Canvas>
              <Preview.Code html={code.inlineListRowComposition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-heading" title="Text.Heading">
            <PropsTable rows={TEXT_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sans" title="Text.Sans">
            <PropsTable rows={TEXT_SANS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-mono" title="Text.Mono">
            <PropsTable rows={TEXT_MONO_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
