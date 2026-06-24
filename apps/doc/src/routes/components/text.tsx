import { createFileRoute } from "@tanstack/react-router";
import { Text } from "raft-ui";

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
  { id: "sizes", title: "Sizes" },
  { id: "variants", title: "Variants" },
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

<Text.Heading level={4}>Heading</Text.Heading>
<Text.Sans size="body">Body copy</Text.Sans>
<Text.Mono size="code">mono-token</Text.Mono>`,
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
  <Text.Sans variant="primary">Primary</Text.Sans>
  <Text.Sans variant="success">Success</Text.Sans>
  <Text.Sans variant="danger">Danger</Text.Sans>
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Text.Heading",
    type: 'ComponentPropsWithRef<"h1"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }',
    description: "Semantic heading with RAFT display typography.",
  },
  {
    name: "Text.Sans",
    type: '"large" | "body" | "small" | "caption"',
    description: "Sans text sizes for product copy and supporting labels.",
  },
  {
    name: "Text.Mono",
    type: '"code" | "meta" | "eyebrow" | "tabular"',
    description: "Mono text sizes for identifiers, metadata, and numeric text.",
  },
  {
    name: "variant",
    type: '"default" | "primary" | "information" | "muted" | "accent" | "success" | "warning" | "danger"',
    description: "Optional semantic color. Leave unset to use each size recipe default.",
  },
  {
    name: "render",
    type: "ReactElement | (props) => ReactElement",
    description: "Base UI render override for changing the underlying element.",
  },
];

export const Route = createFileRoute("/components/text")({
  component: TextDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TextDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Text"
      description="Semantic text primitives for headings, product copy, and compact metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview}>
          <div className="grid max-w-sm gap-2">
            <Text.Heading level={4}>Workspace updates</Text.Heading>
            <Text.Sans size="small" variant="muted">
              3 unread messages
            </Text.Sans>
            <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Text.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <DocNote>
            Use Text for repeatable product typography. Use token pages when auditing the full type
            scale.
          </DocNote>
          <Example html={code.sizes}>
            <div className="grid max-w-sm gap-3">
              <Text.Heading level={5}>Heading level 5</Text.Heading>
              <Text.Sans size="large">Large body</Text.Sans>
              <Text.Sans size="body">Body text</Text.Sans>
              <Text.Sans size="small">Small supporting text</Text.Sans>
              <Text.Sans size="caption">Caption text</Text.Sans>
              <Text.Mono size="meta">meta</Text.Mono>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <div className="grid max-w-sm gap-2">
            <Text.Sans variant="default">Default</Text.Sans>
            <Text.Sans variant="muted">Muted</Text.Sans>
            <Text.Sans variant="primary">Primary</Text.Sans>
            <Text.Sans variant="success">Success</Text.Sans>
            <Text.Sans variant="danger">Danger</Text.Sans>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
