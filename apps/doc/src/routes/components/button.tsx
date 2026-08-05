import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ICON_SIZES, SIZES, VARIANTS } from "#/modules/button/button.constants.ts";
import { ButtonPlaygroundPreview, ButtonPreview } from "#/modules/button/button.preview.tsx";
import buttonPreviewCompositionSource from "#/modules/button/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "raft-ui";

<Button />`,
  variants: `<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="information">Information</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Accent</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="danger-secondary">Delete</Button>
<Button variant="danger-outline">Remove</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
  states: `<Button>Default</Button>
<Button>Focus visible</Button>
<Button disabled>Disabled</Button>`,
  sizes: `<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
  icons: `import { Plus, Trash2 } from "lucide-react";

<Button size="icon-xs" aria-label="icon-xs">
  <Plus />
</Button>
<Button size="icon-sm" aria-label="icon-sm">
  <Plus />
</Button>
<Button size="icon-md" aria-label="icon-md">
  <Plus />
</Button>
<Button size="icon-lg" aria-label="icon-lg">
  <Plus />
</Button>

<Button variant="default">
  <Plus data-icon="inline-start" />
  New
</Button>

<Button variant="outline">
  Next
  <Plus data-icon="inline-end" />
</Button>

<Button variant="danger" size="icon-sm" aria-label="Delete">
  <Trash2 />
</Button>`,
  loading: `<Button loading>Saving</Button>
<Button variant="danger" loading loadingLabel="Deleting">
  Delete
</Button>`,
  disabled: `<Button disabled>Disabled</Button>
<Button variant="primary" disabled>
  Primary
</Button>
<Button variant="danger" disabled>
  Danger
</Button>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Action semantics. Variants consume semantic layer and tone utilities.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description:
      "Text sizes scale height and padding; icon-* sizes render a square icon-only button.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Shows an inline Spinner, preserves button width, and disables interaction.",
  },
  {
    name: "loadingLabel",
    type: "string",
    default: '"Loading"',
    description: "Accessible label for the loading indicator.",
  },
  {
    name: "data-icon (on a child icon)",
    type: '"inline-start" | "inline-end"',
    description:
      "Mark an icon sitting beside text so its side padding tightens automatically. Not a prop on Button itself.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element or compose with another component (Base UI).",
  },
  {
    name: "...props",
    type: "Base UI Button.Props",
    description: "All native button attributes (onClick, disabled, type, etc.) plus Base UI props.",
  },
];

export const Route = createFileRoute("/components/button")({
  component: ButtonDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        buttonPreviewComposition: buttonPreviewCompositionSource,
      },
    }),
});

function ButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Button"
      description="A clickable action control backed by semantic variants and tone utilities."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ButtonPlaygroundPreview code={code.buttonPreviewComposition} />
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
                <div className="-m-1 grid max-w-full grid-cols-[repeat(7,max-content)] gap-3 overflow-x-auto p-1">
                  <Button variant="default">Default</Button>
                  <Button variant="primary">Primary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="information">Information</Button>
                  <Button variant="muted">Muted</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="danger-secondary">Delete</Button>
                  <Button variant="danger-outline">Remove</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Preview>
              <Preview.Canvas>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="grid min-w-32 place-items-center">
                    <Button>Default</Button>
                  </div>
                  <div className="grid min-w-32 place-items-center">
                    <ButtonPreview focusVisible>Focus visible</ButtonPreview>
                  </div>
                  <div className="grid min-w-32 place-items-center">
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <Button size="xs">Extra small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="icons" title="Icons">
            <Preview>
              <Preview.Canvas>
                {ICON_SIZES.map((size) => (
                  <Button key={size} size={size} aria-label={size}>
                    <Plus />
                  </Button>
                ))}
                <Button variant="default">
                  <Plus data-icon="inline-start" />
                  New
                </Button>
                <Button variant="outline">
                  Next
                  <Plus data-icon="inline-end" />
                </Button>
                <Button variant="danger" size="icon-sm" aria-label="Delete">
                  <Trash2 />
                </Button>
              </Preview.Canvas>
              <Preview.Code html={code.icons} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="loading" title="Loading">
            <Preview>
              <Preview.Canvas>
                <Button loading>Saving</Button>
                <Button variant="danger" loading loadingLabel="Deleting">
                  Delete
                </Button>
              </Preview.Canvas>
              <Preview.Code html={code.loading} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="disabled" title="Disabled">
            <Preview>
              <Preview.Canvas>
                <Button disabled>Disabled</Button>
                <Button variant="primary" disabled>
                  Primary
                </Button>
                <Button variant="danger" disabled>
                  Danger
                </Button>
              </Preview.Canvas>
              <Preview.Code html={code.disabled} />
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
