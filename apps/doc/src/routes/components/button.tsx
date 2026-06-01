import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@slock-ui/ui";

import { ComponentPreview } from "#/components/component-preview.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";

export const Route = createFileRoute("/components/button")({ component: ButtonDoc });

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"primary" | "secondary"',
    default: '"primary"',
    description: "Visual style of the button.",
  },
  {
    name: "size",
    type: '"sm" | "md"',
    default: '"md"',
    description: "Controls padding and font size.",
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

function ButtonDoc() {
  return (
    <DocPage
      title="Button"
      description="A clickable button with variant and size options."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPreview>
          <Button>Button</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="variants" title="Variants">
        <ComponentPreview>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <ComponentPreview>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="states" title="States">
        <ComponentPreview>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
