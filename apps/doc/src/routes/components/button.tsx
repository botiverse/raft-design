import { createFileRoute } from "@tanstack/react-router";
import { Button, type ButtonProps } from "@slock-ui/ui";
import { Plus } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { ComponentPreview } from "#/components/component-preview.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";

export const Route = createFileRoute("/components/button")({ component: ButtonDoc });

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "tones", title: "Tones" },
  { id: "sizes", title: "Sizes" },
  { id: "icons", title: "Icons" },
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

const ICON_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;

const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;

type PlaygroundValues = {
  tone: NonNullable<ButtonProps["tone"]>;
  size: NonNullable<ButtonProps["size"]>;
  label: string;
  disabled: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"white"',
    description: "Background color from the brutal palette. Text is always ink-black.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description:
      "Text sizes scale height and padding; icon-* sizes render a square icon-only button.",
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

function ButtonDoc() {
  return (
    <DocPage title="Button" description="A clickable button with tone and size options." toc={TOC}>
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ tone: "white", size: "sm", label: "Button", disabled: false }}
          controls={[
            { name: "tone", label: "Tone", type: "select", options: TONES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "label", label: "Label", type: "text" },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <Button tone={values.tone} size={values.size} disabled={values.disabled}>
              {values.size.startsWith("icon-") ? <Plus /> : values.label}
            </Button>
          )}
        />
      </DocSection>

      <DocSection id="tones" title="Tones">
        <div className="space-y-4">
          <ComponentPreview>
            {TONES.map((tone) => (
              <Button key={tone} tone={tone}>
                {tone}
              </Button>
            ))}
          </ComponentPreview>
          <Callout>
            Tones are fixed colors from the brutal palette, not semantic roles — a tone renders the
            same pastel under both the <code>brutal</code> and <code>elegant</code> themes. Pick a
            tone when you want a specific color; leave it at <code>white</code> for a neutral
            default.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <ComponentPreview>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection id="icons" title="Icons">
        <div className="space-y-4">
          <ComponentPreview>
            {ICON_SIZES.map((size) => (
              <Button key={size} size={size} aria-label={size}>
                <Plus />
              </Button>
            ))}
            <Button>
              <Plus data-icon="inline-start" />
              New
            </Button>
          </ComponentPreview>
          <Callout>
            For an icon-only button use an <code>icon-*</code> size (square, no label). When an icon
            sits beside text, add <code>data-icon="inline-start"</code> or <code>"inline-end"</code>{" "}
            to the icon so its side padding tightens — it is an opt-in convention, not enforced, so
            a missing marker just leaves padding slightly looser. Child <code>&lt;svg&gt;</code>{" "}
            elements auto-size to the button; pass an explicit <code>size-*</code> class to
            override.
          </Callout>
        </div>
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
