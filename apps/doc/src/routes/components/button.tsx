import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@slock-ui/ui";

import { ComponentPreview } from "#/components/component-preview.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";

export const Route = createFileRoute("/components/button")({ component: ButtonDoc });

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "tones", title: "Tones" },
  { id: "sizes", title: "Sizes" },
  { id: "shapes", title: "Shapes" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const TONES = [
  "white",
  "yellow",
  "pink",
  "cyan",
  "lavender",
  "orange",
  "lime",
  "red",
  "stone",
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"yellow"',
    description: "Background color from the brutal palette. Text is always ink-black.",
  },
  {
    name: "size",
    type: '"xs" | "sm" | "md" | "lg"',
    default: '"sm"',
    description: "Controls height, padding, and font size.",
  },
  {
    name: "shape",
    type: '"icon" | "text" | "iconText"',
    default: '"text"',
    description: "Square icon-only, text-only, or icon-plus-text layout.",
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
      description="A clickable button with tone, size, and shape options."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPreview>
          <Button>Button</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="tones" title="Tones">
        <ComponentPreview>
          {TONES.map((tone) => (
            <Button key={tone} tone={tone}>
              {tone}
            </Button>
          ))}
        </ComponentPreview>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <ComponentPreview>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="shapes" title="Shapes">
        <ComponentPreview>
          <Button shape="icon" aria-label="Add">
            +
          </Button>
          <Button shape="text">Text</Button>
          <Button shape="iconText">
            <span aria-hidden>+</span>
            Add
          </Button>
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
