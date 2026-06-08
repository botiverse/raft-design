import { createFileRoute } from "@tanstack/react-router";
import { Button, type ButtonProps } from "@slock/ui";
import { Plus, Trash2 } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
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
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "icons", title: "Icons" },
  { id: "loading", title: "Loading" },
  { id: "tokens", title: "Tokens" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const VARIANTS = [
  "primary",
  "default",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "destructive",
  "destructive-outline",
  "outline",
  "ghost",
  "link",
] as const;

const ICON_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;
const ICON_POSITIONS = ["left", "right", "only"] as const;
const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;

const TODOS = [
  { status: "done", label: "Replace color-first tone with semantic variant/action tokens." },
  { status: "done", label: "Set the neutral default action as the default Button variant." },
  { status: "done", label: "Document loading, icon placement, and size/variant combinations." },
  { status: "deferred", label: "Add ButtonGroup as a separate planned UI." },
] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "@slock/ui";

<Button>Button</Button>`,
  variants: `<Button variant="primary">Primary</Button>
<Button variant="default">Default</Button>
<Button variant="information">Information</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Accent</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="destructive">Delete</Button>
<Button variant="destructive-outline">Remove</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
  sizes: `<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
  icons: `import { Plus, Trash2 } from "lucide-react";

<Button size="icon-md" aria-label="Add">
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

<Button variant="information" size="icon-sm" aria-label="Show information">
  <Plus />
</Button>

<Button variant="destructive" size="icon-sm" aria-label="Delete">
  <Trash2 />
</Button>`,
  loading: `<Button loading>Saving</Button>
<Button variant="destructive" loading loadingLabel="Deleting">
  Delete
</Button>`,
  tokens: `primitive palette
  -> semantic tone
    -> action token
      -> Button variant

--color-brutal-yellow
  -> --primary
    -> --action-primary-default
      -> variant="primary"

--neutral-default
  -> --action-default-default
    -> variant="default"

--color-brutal-cyan
  -> --information-default
    -> --action-information-default
      -> variant="information"

--color-brutal-stone
  -> --muted-default
    -> --action-muted-default
      -> variant="muted"

--color-brutal-pink
  -> --accent-default
    -> --action-accent-default
      -> variant="accent"

--color-brutal-lime
  -> --success-default
    -> --action-success-default
      -> variant="success"

--color-brutal-orange
  -> --warning-default
    -> --action-warning-default
      -> variant="warning"`,
  migrationDefault: `// Source
<Button>Button</Button>

// Current
<Button>Button</Button>`,
  migrationTones: `// Source
<Button tone="yellow">Save</Button>
<Button tone="white">Cancel</Button>
<Button tone="red">Delete</Button>

// Current
<Button variant="primary">Save</Button>
<Button variant="default">Cancel</Button>
<Button variant="destructive">
  <Trash2 data-icon="inline-start" />
  Delete
</Button>`,
  migrationStatusTones: `// Source
<Button tone="cyan">Details</Button>
<Button tone="stone">Muted</Button>
<Button tone="pink">Notify</Button>
<Button tone="lime">Online</Button>
<Button tone="orange">Warn</Button>

// Current
<Button variant="information">Details</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Notify</Button>
<Button variant="success">Online</Button>
<Button variant="warning">Warn</Button>`,
  migrationLavender: `// Source
<Button tone="lavender">Human</Button>

// Current
<span className="inline-flex items-center rounded-[var(--radius)] border-2 border-black bg-brutal-lavender px-2 py-1 font-display text-xs font-bold text-black">
  Human
</span>

// Current, temporary source-visual fallback
<Button
  variant="default"
  className="bg-brutal-lavender hover:bg-brutal-lavender"
>
  Human
</Button>`,
  migrationIconOnly: `// Source
<Button shape="icon" aria-label="Add">
  <Plus size={14} />
</Button>

// Current
<Button size="icon-sm" aria-label="Add">
  <Plus />
</Button>`,
  migrationInlineIcon: `// Source
<Button shape="iconText">
  <Plus size={14} />
  New
</Button>

// Current
<Button>
  <Plus data-icon="inline-start" />
  New
</Button>

// Current, right-side icon
<Button variant="outline">
  Next
  <Plus data-icon="inline-end" />
</Button>`,
  sourceDefault: `<Button>Button</Button>`,
  currentDefault: `<Button>Button</Button>`,
  sourceVariantCoverage: `<Button tone="yellow">Primary</Button>
<Button tone="white">Default</Button>
<Button tone="cyan">Information</Button>
<Button tone="stone">Muted</Button>
<Button tone="pink">Accent</Button>
<Button tone="lime">Success</Button>
<Button tone="orange">Warning</Button>
<Button tone="red">Delete</Button>
<Button tone="red">Remove</Button>
<Button tone="white">Outline</Button>
<Button tone="white">Ghost</Button>
<Button tone="white">Link</Button>`,
  currentVariantCoverage: `<Button variant="primary">Primary</Button>
<Button variant="default">Default</Button>
<Button variant="information">Information</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Accent</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="destructive">Delete</Button>
<Button variant="destructive-outline">Remove</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
  sourcePaletteOnly: `<Button tone="lavender">lavender</Button>`,
  currentPaletteOnly: `// No Button variant for lavender.
// Keep it as a palette/component token.`,
  sourceSizesByTone: `<Button tone="yellow" size="xs">P XS</Button>
<Button tone="yellow" size="sm">P SM</Button>
<Button tone="yellow" size="md">P MD</Button>
<Button tone="yellow" size="lg">P LG</Button>
<Button tone="white" size="xs">DF XS</Button>
<Button tone="white" size="sm">DF SM</Button>
<Button tone="white" size="md">DF MD</Button>
<Button tone="white" size="lg">DF LG</Button>
<Button tone="cyan" size="xs">I XS</Button>
<Button tone="cyan" size="sm">I SM</Button>
<Button tone="cyan" size="md">I MD</Button>
<Button tone="cyan" size="lg">I LG</Button>
<Button tone="stone" size="xs">M XS</Button>
<Button tone="stone" size="sm">M SM</Button>
<Button tone="stone" size="md">M MD</Button>
<Button tone="stone" size="lg">M LG</Button>
<Button tone="pink" size="xs">A XS</Button>
<Button tone="pink" size="sm">A SM</Button>
<Button tone="pink" size="md">A MD</Button>
<Button tone="pink" size="lg">A LG</Button>
<Button tone="lime" size="xs">OK XS</Button>
<Button tone="lime" size="sm">OK SM</Button>
<Button tone="lime" size="md">OK MD</Button>
<Button tone="lime" size="lg">OK LG</Button>
<Button tone="orange" size="xs">W XS</Button>
<Button tone="orange" size="sm">W SM</Button>
<Button tone="orange" size="md">W MD</Button>
<Button tone="orange" size="lg">W LG</Button>
<Button tone="red" size="xs">D XS</Button>
<Button tone="red" size="sm">D SM</Button>
<Button tone="red" size="md">D MD</Button>
<Button tone="red" size="lg">D LG</Button>`,
  currentSizesByVariant: `<Button variant="primary" size="xs">P XS</Button>
<Button variant="primary" size="sm">P SM</Button>
<Button variant="primary" size="md">P MD</Button>
<Button variant="primary" size="lg">P LG</Button>
<Button variant="default" size="xs">DF XS</Button>
<Button variant="default" size="sm">DF SM</Button>
<Button variant="default" size="md">DF MD</Button>
<Button variant="default" size="lg">DF LG</Button>
<Button variant="information" size="xs">I XS</Button>
<Button variant="information" size="sm">I SM</Button>
<Button variant="information" size="md">I MD</Button>
<Button variant="information" size="lg">I LG</Button>
<Button variant="muted" size="xs">M XS</Button>
<Button variant="muted" size="sm">M SM</Button>
<Button variant="muted" size="md">M MD</Button>
<Button variant="muted" size="lg">M LG</Button>
<Button variant="accent" size="xs">A XS</Button>
<Button variant="accent" size="sm">A SM</Button>
<Button variant="accent" size="md">A MD</Button>
<Button variant="accent" size="lg">A LG</Button>
<Button variant="success" size="xs">OK XS</Button>
<Button variant="success" size="sm">OK SM</Button>
<Button variant="success" size="md">OK MD</Button>
<Button variant="success" size="lg">OK LG</Button>
<Button variant="warning" size="xs">W XS</Button>
<Button variant="warning" size="sm">W SM</Button>
<Button variant="warning" size="md">W MD</Button>
<Button variant="warning" size="lg">W LG</Button>
<Button variant="outline" size="xs">O XS</Button>
<Button variant="outline" size="sm">O SM</Button>
<Button variant="outline" size="md">O MD</Button>
<Button variant="outline" size="lg">O LG</Button>
<Button variant="destructive" size="xs">D XS</Button>
<Button variant="destructive" size="sm">D SM</Button>
<Button variant="destructive" size="md">D MD</Button>
<Button variant="destructive" size="lg">D LG</Button>`,
  sourceIcon: `<Button tone="yellow" shape="icon" aria-label="Add primary">
  <Plus size={14} />
</Button>
<Button tone="white" shape="icon" aria-label="Add neutral">
  <Plus size={14} />
</Button>
<Button tone="cyan" shape="icon" aria-label="Show information">
  <Plus size={14} />
</Button>
<Button tone="stone" shape="icon" aria-label="Muted action">
  <Plus size={14} />
</Button>
<Button tone="pink" shape="icon" aria-label="Mark important">
  <Plus size={14} />
</Button>
<Button tone="lime" shape="icon" aria-label="Confirm">
  <Plus size={14} />
</Button>
<Button tone="orange" shape="icon" aria-label="Warn">
  <Plus size={14} />
</Button>
<Button tone="red" shape="icon" aria-label="Delete">
  <Trash2 size={14} />
</Button>`,
  currentIcon: `<Button variant="primary" size="icon-sm" aria-label="Add primary">
  <Plus />
</Button>
<Button variant="default" size="icon-sm" aria-label="Add neutral">
  <Plus />
</Button>
<Button variant="information" size="icon-sm" aria-label="Show information">
  <Plus />
</Button>
<Button variant="muted" size="icon-sm" aria-label="Muted action">
  <Plus />
</Button>
<Button variant="accent" size="icon-sm" aria-label="Mark important">
  <Plus />
</Button>
<Button variant="success" size="icon-sm" aria-label="Confirm">
  <Plus />
</Button>
<Button variant="warning" size="icon-sm" aria-label="Warn">
  <Plus />
</Button>
<Button variant="outline" size="icon-sm" aria-label="Add outline">
  <Plus />
</Button>
<Button variant="ghost" size="icon-sm" aria-label="Add ghost">
  <Plus />
</Button>
<Button variant="destructive" size="icon-sm" aria-label="Delete">
  <Trash2 />
</Button>`,
  sourceInlineIcon: `<Button tone="yellow" shape="iconText">
  <Plus size={14} />
  New
</Button>
<Button tone="white" shape="iconText">
  <Plus size={14} />
  Filter
</Button>
<Button tone="cyan" shape="iconText">
  <Plus size={14} />
  Info
</Button>
<Button tone="stone" shape="iconText">
  <Plus size={14} />
  Muted
</Button>
<Button tone="pink" shape="iconText">
  <Plus size={14} />
  Notify
</Button>
<Button tone="lime" shape="iconText">
  <Plus size={14} />
  Online
</Button>
<Button tone="orange" shape="iconText">
  <Plus size={14} />
  Warning
</Button>
<Button tone="red" shape="iconText">
  <Trash2 size={14} />
  Delete
</Button>`,
  currentInlineIcon: `<Button variant="primary">
  <Plus data-icon="inline-start" />
  New
</Button>
<Button variant="default">
  <Plus data-icon="inline-start" />
  Filter
</Button>
<Button variant="information">
  <Plus data-icon="inline-start" />
  Info
</Button>
<Button variant="muted">
  <Plus data-icon="inline-start" />
  Muted
</Button>
<Button variant="accent">
  <Plus data-icon="inline-start" />
  Notify
</Button>
<Button variant="success">
  <Plus data-icon="inline-start" />
  Online
</Button>
<Button variant="warning">
  <Plus data-icon="inline-start" />
  Warning
</Button>
<Button variant="outline">
  <Plus data-icon="inline-start" />
  More
</Button>
<Button variant="destructive">
  <Trash2 data-icon="inline-start" />
  Delete
</Button>`,
  sourceShapeMigration: `<Button shape="icon" aria-label="Add">
  <Plus size={14} />
</Button>

<Button shape="iconText">
  <Plus size={14} />
  New
</Button>`,
  currentShapeMigration: `<Button size="icon-sm" aria-label="Add">
  <Plus />
</Button>

<Button>
  <Plus data-icon="inline-start" />
  New
</Button>`,
  sourceDisabled: `<Button disabled>Disabled</Button>`,
  currentDisabled: `<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`,
} as const;

type PlaygroundValues = {
  variant: NonNullable<ButtonProps["variant"]>;
  size: NonNullable<ButtonProps["size"]>;
  label: string;
  disabled: boolean;
  loading: boolean;
};

type SizePlaygroundValues = {
  variant: NonNullable<ButtonProps["variant"]>;
  size: NonNullable<ButtonProps["size"]>;
  label: string;
};

type IconPlaygroundValues = {
  variant: NonNullable<ButtonProps["variant"]>;
  size: NonNullable<ButtonProps["size"]>;
  iconPosition: (typeof ICON_POSITIONS)[number];
  label: string;
};

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description:
      "Action semantics. Variants consume action tokens, which each theme maps to its own palette.",
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
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Button"
      description="A clickable action control backed by semantic variant and action tokens."
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            variant: "default",
            size: "sm",
            label: "Button",
            disabled: false,
            loading: false,
          }}
          controls={[
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "label", label: "Label", type: "text" },
            { name: "disabled", label: "Disabled", type: "boolean" },
            { name: "loading", label: "Loading", type: "boolean" },
          ]}
          render={(values) => (
            <Button
              variant={values.variant}
              size={values.size}
              disabled={values.disabled}
              loading={values.loading}
              aria-label={values.size.startsWith("icon-") ? values.label : undefined}
            >
              {values.size.startsWith("icon-") ? <Plus /> : values.label}
            </Button>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-4">
          <Example html={code.variants}>
            <Button variant="primary">Primary</Button>
            <Button variant="default">Default</Button>
            <Button variant="information">Information</Button>
            <Button variant="muted">Muted</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
            <Button variant="destructive-outline">Remove</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </Example>
          <Callout>
            Variants describe action intent. Brutal maps the semantic actions back to source colors:
            primary/yellow, information/cyan, muted/stone, accent/pink, success/lime,
            warning/orange, destructive/red, and default/white.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <Example html={code.sizes}>
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Example>
          <ComponentPlayground<SizePlaygroundValues>
            defaultValues={{
              variant: "default",
              size: "md",
              label: "Button",
            }}
            controls={[
              { name: "variant", label: "Variant", type: "select", options: VARIANTS },
              { name: "size", label: "Size", type: "select", options: SIZES },
              { name: "label", label: "Label", type: "text" },
            ]}
            render={(values) => (
              <Button
                variant={values.variant}
                size={values.size}
                aria-label={values.size.startsWith("icon-") ? values.label : undefined}
              >
                {values.size.startsWith("icon-") ? <Plus /> : values.label}
              </Button>
            )}
          />
        </div>
      </DocSection>

      <DocSection id="icons" title="Icons">
        <div className="space-y-4">
          <Example html={code.icons}>
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
            <Button variant="information" size="icon-sm" aria-label="Show information">
              <Plus />
            </Button>
            <Button variant="destructive" size="icon-sm" aria-label="Delete">
              <Trash2 />
            </Button>
          </Example>
          <ComponentPlayground<IconPlaygroundValues>
            defaultValues={{
              variant: "default",
              size: "sm",
              iconPosition: "right",
              label: "Next",
            }}
            controls={[
              { name: "variant", label: "Variant", type: "select", options: VARIANTS },
              { name: "size", label: "Size", type: "select", options: SIZES },
              { name: "iconPosition", label: "Icon", type: "select", options: ICON_POSITIONS },
              { name: "label", label: "Label", type: "text" },
            ]}
            render={(values) => {
              if (values.iconPosition === "only" || values.size.startsWith("icon-")) {
                const iconOnlySize = values.size.startsWith("icon-") ? values.size : "icon-sm";

                return (
                  <Button variant={values.variant} size={iconOnlySize} aria-label={values.label}>
                    <Plus />
                  </Button>
                );
              }

              return (
                <Button variant={values.variant} size={values.size}>
                  {values.iconPosition === "left" ? <Plus data-icon="inline-start" /> : null}
                  {values.label}
                  {values.iconPosition === "right" ? <Plus data-icon="inline-end" /> : null}
                </Button>
              );
            }}
          />
        </div>
      </DocSection>

      <DocSection id="loading" title="Loading">
        <div className="space-y-4">
          <Example html={code.loading}>
            <Button loading>Saving</Button>
            <Button variant="destructive" loading loadingLabel="Deleting">
              Delete
            </Button>
          </Example>
          <Callout>
            Loading keeps the original content in layout invisibly, disables interaction, and shows
            the Spinner in the center.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="tokens" title="Tokens">
        <div className="space-y-4">
          <CodeBlock html={code.tokens} />
          <Callout>
            Button consumes action tokens. Theme files decide how those action tokens map onto the
            shared semantic tone layer.
          </Callout>
        </div>
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
              note: 'Source defaulted to a neutral white tone. Current defaults to the neutral default variant; use variant="primary" for the prominent yellow action.',
              source: <LegacyButton>Button</LegacyButton>,
              current: <Button>Button</Button>,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Tone to variant coverage",
              status: "difference",
              note: "Source chose fixed brutal colors through tone. Current maps white, yellow, cyan, stone, pink, lime, orange, and red into semantic action variants.",
              source: (
                <>
                  <LegacyButton tone="yellow">Primary</LegacyButton>
                  <LegacyButton tone="white">Default</LegacyButton>
                  <LegacyButton tone="cyan">Information</LegacyButton>
                  <LegacyButton tone="stone">Muted</LegacyButton>
                  <LegacyButton tone="pink">Accent</LegacyButton>
                  <LegacyButton tone="lime">Success</LegacyButton>
                  <LegacyButton tone="orange">Warning</LegacyButton>
                  <LegacyButton tone="red">Delete</LegacyButton>
                  <LegacyButton tone="red">Remove</LegacyButton>
                  <LegacyButton tone="white">Outline</LegacyButton>
                  <LegacyButton tone="white">Ghost</LegacyButton>
                  <LegacyButton tone="white">Link</LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button variant="primary">Primary</Button>
                  <Button variant="default">Default</Button>
                  <Button variant="information">Information</Button>
                  <Button variant="muted">Muted</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="destructive">Delete</Button>
                  <Button variant="destructive-outline">Remove</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </>
              ),
              sourceCode: code.sourceVariantCoverage,
              currentCode: code.currentVariantCoverage,
            },
            {
              label: "Palette-only tones",
              status: "difference",
              note: "Lavender existed as a legacy Button tone, but its source usage is human/avatar and attachment identity rather than action intent. Current does not expose a Button variant for it.",
              source: <LegacyButton tone="lavender">lavender</LegacyButton>,
              current: (
                <div className="max-w-sm text-xs leading-relaxed text-gray-500">
                  Use semantic components or palette tokens for human/avatar and attachment
                  surfaces.
                </div>
              ),
              sourceCode: code.sourcePaletteOnly,
              currentCode: code.currentPaletteOnly,
            },
            {
              label: "Sizes across variants",
              status: "review",
              note: "Size is orthogonal to variant. Source supported size across tones; current keeps that behavior across raised, flat, and destructive variants.",
              source: (
                <>
                  <LegacyButton tone="yellow" size="xs">
                    P XS
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="sm">
                    P SM
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="md">
                    P MD
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="lg">
                    P LG
                  </LegacyButton>
                  <LegacyButton tone="white" size="xs">
                    DF XS
                  </LegacyButton>
                  <LegacyButton tone="white" size="sm">
                    DF SM
                  </LegacyButton>
                  <LegacyButton tone="white" size="md">
                    DF MD
                  </LegacyButton>
                  <LegacyButton tone="white" size="lg">
                    DF LG
                  </LegacyButton>
                  <LegacyButton tone="cyan" size="xs">
                    I XS
                  </LegacyButton>
                  <LegacyButton tone="cyan" size="sm">
                    I SM
                  </LegacyButton>
                  <LegacyButton tone="cyan" size="md">
                    I MD
                  </LegacyButton>
                  <LegacyButton tone="cyan" size="lg">
                    I LG
                  </LegacyButton>
                  <LegacyButton tone="stone" size="xs">
                    M XS
                  </LegacyButton>
                  <LegacyButton tone="stone" size="sm">
                    M SM
                  </LegacyButton>
                  <LegacyButton tone="stone" size="md">
                    M MD
                  </LegacyButton>
                  <LegacyButton tone="stone" size="lg">
                    M LG
                  </LegacyButton>
                  <LegacyButton tone="pink" size="xs">
                    A XS
                  </LegacyButton>
                  <LegacyButton tone="pink" size="sm">
                    A SM
                  </LegacyButton>
                  <LegacyButton tone="pink" size="md">
                    A MD
                  </LegacyButton>
                  <LegacyButton tone="pink" size="lg">
                    A LG
                  </LegacyButton>
                  <LegacyButton tone="lime" size="xs">
                    OK XS
                  </LegacyButton>
                  <LegacyButton tone="lime" size="sm">
                    OK SM
                  </LegacyButton>
                  <LegacyButton tone="lime" size="md">
                    OK MD
                  </LegacyButton>
                  <LegacyButton tone="lime" size="lg">
                    OK LG
                  </LegacyButton>
                  <LegacyButton tone="orange" size="xs">
                    W XS
                  </LegacyButton>
                  <LegacyButton tone="orange" size="sm">
                    W SM
                  </LegacyButton>
                  <LegacyButton tone="orange" size="md">
                    W MD
                  </LegacyButton>
                  <LegacyButton tone="orange" size="lg">
                    W LG
                  </LegacyButton>
                  <LegacyButton tone="red" size="xs">
                    D XS
                  </LegacyButton>
                  <LegacyButton tone="red" size="sm">
                    D SM
                  </LegacyButton>
                  <LegacyButton tone="red" size="md">
                    D MD
                  </LegacyButton>
                  <LegacyButton tone="red" size="lg">
                    D LG
                  </LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button variant="primary" size="xs">
                    P XS
                  </Button>
                  <Button variant="primary" size="sm">
                    P SM
                  </Button>
                  <Button variant="primary" size="md">
                    P MD
                  </Button>
                  <Button variant="primary" size="lg">
                    P LG
                  </Button>
                  <Button variant="default" size="xs">
                    DF XS
                  </Button>
                  <Button variant="default" size="sm">
                    DF SM
                  </Button>
                  <Button variant="default" size="md">
                    DF MD
                  </Button>
                  <Button variant="default" size="lg">
                    DF LG
                  </Button>
                  <Button variant="information" size="xs">
                    I XS
                  </Button>
                  <Button variant="information" size="sm">
                    I SM
                  </Button>
                  <Button variant="information" size="md">
                    I MD
                  </Button>
                  <Button variant="information" size="lg">
                    I LG
                  </Button>
                  <Button variant="muted" size="xs">
                    M XS
                  </Button>
                  <Button variant="muted" size="sm">
                    M SM
                  </Button>
                  <Button variant="muted" size="md">
                    M MD
                  </Button>
                  <Button variant="muted" size="lg">
                    M LG
                  </Button>
                  <Button variant="accent" size="xs">
                    A XS
                  </Button>
                  <Button variant="accent" size="sm">
                    A SM
                  </Button>
                  <Button variant="accent" size="md">
                    A MD
                  </Button>
                  <Button variant="accent" size="lg">
                    A LG
                  </Button>
                  <Button variant="success" size="xs">
                    OK XS
                  </Button>
                  <Button variant="success" size="sm">
                    OK SM
                  </Button>
                  <Button variant="success" size="md">
                    OK MD
                  </Button>
                  <Button variant="success" size="lg">
                    OK LG
                  </Button>
                  <Button variant="warning" size="xs">
                    W XS
                  </Button>
                  <Button variant="warning" size="sm">
                    W SM
                  </Button>
                  <Button variant="warning" size="md">
                    W MD
                  </Button>
                  <Button variant="warning" size="lg">
                    W LG
                  </Button>
                  <Button variant="outline" size="xs">
                    O XS
                  </Button>
                  <Button variant="outline" size="sm">
                    O SM
                  </Button>
                  <Button variant="outline" size="md">
                    O MD
                  </Button>
                  <Button variant="outline" size="lg">
                    O LG
                  </Button>
                  <Button variant="destructive" size="xs">
                    D XS
                  </Button>
                  <Button variant="destructive" size="sm">
                    D SM
                  </Button>
                  <Button variant="destructive" size="md">
                    D MD
                  </Button>
                  <Button variant="destructive" size="lg">
                    D LG
                  </Button>
                </>
              ),
              sourceCode: code.sourceSizesByTone,
              currentCode: code.currentSizesByVariant,
            },
            {
              label: "Icon-only across variants",
              status: "difference",
              note: "Source combined icon-only shape with tone. Current combines icon-* size with the full variant axis, so icon-only controls are not primary-only.",
              source: (
                <>
                  <LegacyButton tone="yellow" shape="icon" aria-label="Add primary">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="white" shape="icon" aria-label="Add neutral">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="cyan" shape="icon" aria-label="Show information">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="stone" shape="icon" aria-label="Muted action">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="pink" shape="icon" aria-label="Mark important">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="lime" shape="icon" aria-label="Confirm">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="orange" shape="icon" aria-label="Warn">
                    <Plus size={14} />
                  </LegacyButton>
                  <LegacyButton tone="red" shape="icon" aria-label="Delete">
                    <Trash2 size={14} />
                  </LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button variant="primary" size="icon-sm" aria-label="Add primary">
                    <Plus />
                  </Button>
                  <Button variant="default" size="icon-sm" aria-label="Add neutral">
                    <Plus />
                  </Button>
                  <Button variant="information" size="icon-sm" aria-label="Show information">
                    <Plus />
                  </Button>
                  <Button variant="muted" size="icon-sm" aria-label="Muted action">
                    <Plus />
                  </Button>
                  <Button variant="accent" size="icon-sm" aria-label="Mark important">
                    <Plus />
                  </Button>
                  <Button variant="success" size="icon-sm" aria-label="Confirm">
                    <Plus />
                  </Button>
                  <Button variant="warning" size="icon-sm" aria-label="Warn">
                    <Plus />
                  </Button>
                  <Button variant="outline" size="icon-sm" aria-label="Add outline">
                    <Plus />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Add ghost">
                    <Plus />
                  </Button>
                  <Button variant="destructive" size="icon-sm" aria-label="Delete">
                    <Trash2 />
                  </Button>
                </>
              ),
              sourceCode: code.sourceIcon,
              currentCode: code.currentIcon,
            },
            {
              label: "Inline icon across variants",
              status: "difference",
              note: 'Source used shape="iconText" with tones. Current uses normal text buttons plus data-icon padding across variants.',
              source: (
                <>
                  <LegacyButton tone="yellow" shape="iconText">
                    <Plus size={14} />
                    New
                  </LegacyButton>
                  <LegacyButton tone="white" shape="iconText">
                    <Plus size={14} />
                    Filter
                  </LegacyButton>
                  <LegacyButton tone="cyan" shape="iconText">
                    <Plus size={14} />
                    Info
                  </LegacyButton>
                  <LegacyButton tone="stone" shape="iconText">
                    <Plus size={14} />
                    Muted
                  </LegacyButton>
                  <LegacyButton tone="pink" shape="iconText">
                    <Plus size={14} />
                    Notify
                  </LegacyButton>
                  <LegacyButton tone="lime" shape="iconText">
                    <Plus size={14} />
                    Online
                  </LegacyButton>
                  <LegacyButton tone="orange" shape="iconText">
                    <Plus size={14} />
                    Warning
                  </LegacyButton>
                  <LegacyButton tone="red" shape="iconText">
                    <Trash2 size={14} />
                    Delete
                  </LegacyButton>
                </>
              ),
              current: (
                <>
                  <Button variant="primary">
                    <Plus data-icon="inline-start" />
                    New
                  </Button>
                  <Button variant="default">
                    <Plus data-icon="inline-start" />
                    Filter
                  </Button>
                  <Button variant="information">
                    <Plus data-icon="inline-start" />
                    Info
                  </Button>
                  <Button variant="muted">
                    <Plus data-icon="inline-start" />
                    Muted
                  </Button>
                  <Button variant="accent">
                    <Plus data-icon="inline-start" />
                    Notify
                  </Button>
                  <Button variant="success">
                    <Plus data-icon="inline-start" />
                    Online
                  </Button>
                  <Button variant="warning">
                    <Plus data-icon="inline-start" />
                    Warning
                  </Button>
                  <Button variant="outline">
                    <Plus data-icon="inline-start" />
                    More
                  </Button>
                  <Button variant="destructive">
                    <Trash2 data-icon="inline-start" />
                    Delete
                  </Button>
                </>
              ),
              sourceCode: code.sourceInlineIcon,
              currentCode: code.currentInlineIcon,
            },
            {
              label: "Shape migration",
              status: "difference",
              note: (
                <>
                  Source uses <code>shape=&quot;icon&quot;</code> and{" "}
                  <code>shape=&quot;iconText&quot;</code>; current uses square{" "}
                  <code>size=&quot;icon-*&quot;</code> plus inline icon markers.
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
              sourceCode: code.sourceShapeMigration,
              currentCode: code.currentShapeMigration,
            },
            {
              label: "Disabled and loading",
              status: "difference",
              note: "Disabled still matches source behavior; loading is new and keeps the button width stable.",
              source: <LegacyButton disabled>Disabled</LegacyButton>,
              current: (
                <>
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                </>
              ),
              sourceCode: code.sourceDisabled,
              currentCode: code.currentDisabled,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Default</h3>
            <p className="text-sm text-gray-500">
              Source and current both render the neutral action without props.
            </p>
            <CodeBlock html={code.migrationDefault} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Tone to Variant</h3>
            <p className="text-sm text-gray-500">
              Migrate color names to action intent: yellow/white/red become
              primary/default/destructive. Use this same mapping when auditing downstream Button
              call sites.
            </p>
            <CodeBlock html={code.migrationTones} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Status Tones</h3>
            <p className="text-sm text-gray-500">
              Cyan, stone, pink, lime, and orange become semantic action variants.
            </p>
            <CodeBlock html={code.migrationStatusTones} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Lavender</h3>
            <p className="text-sm text-gray-500">
              Keep lavender on identity or attachment surfaces; use a local Button override only as
              a temporary source-visual fallback.
            </p>
            <CodeBlock html={code.migrationLavender} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Icon Only</h3>
            <p className="text-sm text-gray-500">
              Replace shape=&quot;icon&quot; with an icon-* size and keep the accessible label.
            </p>
            <CodeBlock html={code.migrationIconOnly} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Inline Icons</h3>
            <p className="text-sm text-gray-500">
              Replace shape=&quot;iconText&quot; with inline icon markers on normal text buttons.
            </p>
            <CodeBlock html={code.migrationInlineIcon} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
