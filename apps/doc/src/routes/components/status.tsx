import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Status } from "raft-ui";
import type { StatusProps } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
const VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const SIZES = ["xs", "sm", "md", "lg"] as const;

const SNIPPETS = {
  preview: `<Status variant="success" size="md" />`,
  anatomy: `import { Status } from "raft-ui";

<Status />`,
  variants: `<Status />
<Status variant="primary" />
<Status variant="information" />
<Status variant="muted" />
<Status variant="accent" />
<Status variant="success" />
<Status variant="warning" />
<Status variant="danger" />`,
  sizes: `<Status size="xs" variant="success" />
<Status size="sm" variant="success" />
<Status size="md" variant="success" />
<Status size="lg" variant="success" />`,
  customize: `<Status className="[--status-color:var(--color-brutal-purple-300)]" />
<Status className="[--status-color:oklch(0.72_0.14_200)]" />
<Status size="lg" className="[--status-color:oklch(0.78_0.12_145)]" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Semantic status color.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description: "Pixel size: 6, 8, 9 or 11px square.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes plus className. Set --status-color for custom colors.",
  },
];

export const Route = createFileRoute("/components/status")({
  component: StatusDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function StatusPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  const [variant, setVariant] = useState<NonNullable<StatusProps["variant"]>>("success");
  const [size, setSize] = useState<NonNullable<StatusProps["size"]>>("md");
  const handleVariantChange = useCallback(
    (value: string) => setVariant(value as NonNullable<StatusProps["variant"]>),
    [],
  );
  const handleSizeChange = useCallback(
    (value: string) => setSize(value as NonNullable<StatusProps["size"]>),
    [],
  );

  return (
    <Preview>
      <Preview.Canvas>
        <Status variant={variant} size={size} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="status-preview-variant">
          <Preview.Select
            id="status-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="status-preview-size">
          <Preview.Select
            id="status-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}

function StatusDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Status"
      description="A square status pixel for presence, progress, and unread markers. It never animates: a working agent is a steady light."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <StatusPreview code={code.preview} />
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
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
                {VARIANTS.map((variant) => (
                  <Status key={variant} variant={variant} />
                ))}
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <Status size="xs" variant="success" />
                <Status size="sm" variant="success" />
                <Status size="md" variant="success" />
                <Status size="lg" variant="success" />
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customize" title="Customize">
            <Preview>
              <Preview.Canvas>
                <Status className="[--status-color:var(--color-brutal-purple-300)]" />
                <Status className="[--status-color:oklch(0.72_0.14_200)]" />
                <Status size="lg" className="[--status-color:oklch(0.78_0.12_145)]" />
              </Preview.Canvas>
              <Preview.Code html={code.customize} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
