import { createFileRoute } from "@tanstack/react-router";
import { Button, type ButtonProps } from "@slock/ui";
import { Plus } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyButton from "../../../../../packages/ui/src/legacy/button.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "tones", title: "Tones" },
  { id: "sizes", title: "Sizes" },
  { id: "icons", title: "Icons" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
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

const TODOS = [
  "Adjust tone into a more semantic API shape",
  "Add a loading state",
  "Add elegant family styling",
] as const;

const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "@slock/ui";

<Button>Click me</Button>`,
  tones: `<Button tone="yellow">Yellow</Button>
<Button tone="pink">Pink</Button>
<Button tone="cyan">Cyan</Button>`,
  sizes: `<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
  icons: `import { Plus } from "lucide-react";

<Button size="icon-md" aria-label="Add">
  <Plus />
</Button>

<Button>
  <Plus data-icon="inline-start" />
  New
</Button>`,
  states: `<Button>Default</Button>
<Button disabled>Disabled</Button>`,
  sourceDefault: `<Button>Button</Button>`,
  currentDefault: `<Button>Button</Button>`,
  sourceTone: `<Button tone="yellow">Yellow</Button>
<Button tone="pink">Pink</Button>
<Button tone="cyan">Cyan</Button>`,
  currentTone: `<Button tone="yellow">Yellow</Button>
<Button tone="pink">Pink</Button>
<Button tone="cyan">Cyan</Button>`,
  sourceSizes: `<Button size="xs">XS</Button>
<Button size="sm">SM</Button>
<Button size="md">MD</Button>
<Button size="lg">LG</Button>`,
  currentSizes: `<Button size="xs">XS</Button>
<Button size="sm">SM</Button>
<Button size="md">MD</Button>
<Button size="lg">LG</Button>`,
  sourceIcon: `<Button shape="icon" aria-label="Add">
  <Plus size={14} />
</Button>

<Button shape="iconText">
  <Plus size={14} />
  New
</Button>`,
  currentIcon: `<Button size="icon-sm" aria-label="Add">
  <Plus />
</Button>

<Button>
  <Plus data-icon="inline-start" />
  New
</Button>`,
  sourceDisabled: `<Button disabled>Disabled</Button>`,
  currentDisabled: `<Button disabled>Disabled</Button>`,
} as const;

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

export const Route = createFileRoute("/components/button")({
  component: ButtonDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Button"
      description="A clickable button with tone and size options."
      overview={
        <Differences from="Button">
          <li>
            built on Base UI&rsquo;s <code>Button</code> (was a native <code>button</code>)
          </li>
          <li>
            <code>icon-*</code> sizes and <code>data-icon</code> inline-icon padding replace the
            original <code>shape</code> prop
          </li>
          <li>adds the elegant family (the original was brutal-only)</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

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

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="tones" title="Tones">
        <div className="space-y-4">
          <Example html={code.tones}>
            {TONES.map((tone) => (
              <Button key={tone} tone={tone}>
                {tone}
              </Button>
            ))}
          </Example>
          <Callout>
            Tones are fixed colors from the brutal palette, not semantic roles; a tone renders the
            same pastel under both the <code>brutal</code> and <code>elegant</code> themes. Pick a
            tone when you want a specific color; leave it at <code>white</code> for a neutral
            default.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Example>
      </DocSection>

      <DocSection id="icons" title="Icons">
        <div className="space-y-4">
          <Example html={code.icons}>
            {ICON_SIZES.map((size) => (
              <Button key={size} size={size} aria-label={size}>
                <Plus />
              </Button>
            ))}
            <Button>
              <Plus data-icon="inline-start" />
              New
            </Button>
          </Example>
          <Callout>
            For an icon-only button use an <code>icon-*</code> size (square, no label). When an icon
            sits beside text, add <code>data-icon="inline-start"</code> or <code>"inline-end"</code>{" "}
            to the icon so its side padding tightens. It is an opt-in convention, not enforced, so a
            missing marker just leaves padding slightly looser. Child <code>&lt;svg&gt;</code>{" "}
            elements auto-size to the button; pass an explicit <code>size-*</code> class to
            override.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Default",
              status: "match",
              source: <LegacyButton>Button</LegacyButton>,
              current: <Button>Button</Button>,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Tone",
              status: "match",
              source: (
                <>
                  <LegacyButton tone="yellow">Yellow</LegacyButton>
                  <LegacyButton tone="pink">Pink</LegacyButton>
                  <LegacyButton tone="cyan">Cyan</LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button tone="yellow">Yellow</Button>
                  <Button tone="pink">Pink</Button>
                  <Button tone="cyan">Cyan</Button>
                </>
              ),
              sourceCode: code.sourceTone,
              currentCode: code.currentTone,
            },
            {
              label: "Sizes",
              status: "match",
              source: (
                <>
                  <LegacyButton size="xs">XS</LegacyButton>
                  <LegacyButton size="sm">SM</LegacyButton>
                  <LegacyButton size="md">MD</LegacyButton>
                  <LegacyButton size="lg">LG</LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button size="xs">XS</Button>
                  <Button size="sm">SM</Button>
                  <Button size="md">MD</Button>
                  <Button size="lg">LG</Button>
                </>
              ),
              sourceCode: code.sourceSizes,
              currentCode: code.currentSizes,
            },
            {
              label: "Icon",
              status: "difference",
              note: (
                <>
                  Source uses <code>shape=&quot;icon&quot;</code>; current uses square{" "}
                  <code>size=&quot;icon-*&quot;</code>.
                </>
              ),
              source: (
                <>
                  <LegacyButton shape="icon">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton shape="iconText">
                    <Plus size={14} />
                    New
                  </LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button size="icon-sm" aria-label="Add">
                    <Plus />
                  </Button>
                  <Button>
                    <Plus data-icon="inline-start" />
                    New
                  </Button>
                </>
              ),
              sourceCode: code.sourceIcon,
              currentCode: code.currentIcon,
            },
            {
              label: "Disabled",
              status: "match",
              source: <LegacyButton disabled>Disabled</LegacyButton>,
              current: <Button disabled>Disabled</Button>,
              sourceCode: code.sourceDisabled,
              currentCode: code.currentDisabled,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
