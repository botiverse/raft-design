import { createFileRoute } from "@tanstack/react-router";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";
import { Button, type ButtonProps } from "@slock/ui";
import { Plus, Trash2 } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyButton from "../../../../../packages/ui/src/legacy/button.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "icons", title: "Icons" },
  { id: "loading", title: "Loading" },
  { id: "disabled", title: "Disabled" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const VARIANTS = [
  "default",
  "primary",
  "outline",
  "information",
  "muted",
  "accent",
  "danger",
  "danger-secondary",
  "danger-outline",
  "ghost",
  "link",
] as const;

const ICON_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;
const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;

const TODOS = [
  { status: "done", label: "Replace color-first tone with semantic variant utilities." },
  { status: "done", label: "Set the neutral default action as the default Button variant." },
  { status: "done", label: "Document loading, icon placement, and size/variant combinations." },
  { status: "deferred", label: "Add ButtonGroup as a separate planned UI." },
] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "@slock/ui";

<Button>Button</Button>`,
  variants: `<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="information">Information</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Accent</Button>
<Button variant="danger">Danger</Button>
<Button variant="danger-secondary">Delete</Button>
<Button variant="danger-outline">Remove</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`,
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
<Button variant="danger">Delete</Button>`,
  migrationSupportingTones: `// Source
<Button tone="cyan">Details</Button>
<Button tone="stone">Muted</Button>
<Button tone="pink">Notify</Button>

// Current
<Button variant="information">Details</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Notify</Button>`,
  migrationLavender: `// Source
<Button tone="lavender">Human</Button>

// Current
<span className="inline-flex items-center rounded-[var(--radius)] border-2 border-black bg-brutal-lavender px-2 py-1 font-heading text-xs font-bold text-black">
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
  sourceVariantCoverage: `<Button tone="white">Default</Button>
<Button tone="yellow">Primary</Button>
<Button tone="white">Outline</Button>
<Button tone="cyan">Information</Button>
<Button tone="stone">Muted</Button>
<Button tone="pink">Accent</Button>
<Button tone="red">Danger</Button>
<Button tone="red">Delete</Button>
<Button tone="red">Remove</Button>
<Button tone="white">Ghost</Button>
<Button tone="white">Link</Button>`,
  currentVariantCoverage: `<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="information">Information</Button>
<Button variant="muted">Muted</Button>
<Button variant="accent">Accent</Button>
<Button variant="danger">Danger</Button>
<Button variant="danger">Delete</Button>
<Button variant="danger-outline">Remove</Button>
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
<Button variant="outline" size="xs">O XS</Button>
<Button variant="outline" size="sm">O SM</Button>
<Button variant="outline" size="md">O MD</Button>
<Button variant="outline" size="lg">O LG</Button>
<Button variant="danger" size="xs">D XS</Button>
<Button variant="danger" size="sm">D SM</Button>
<Button variant="danger" size="md">D MD</Button>
<Button variant="danger" size="lg">D LG</Button>`,
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
<Button variant="outline" size="icon-sm" aria-label="Add outline">
  <Plus />
</Button>
<Button variant="ghost" size="icon-sm" aria-label="Add ghost">
  <Plus />
</Button>
<Button variant="danger" size="icon-sm" aria-label="Delete">
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
<Button variant="outline">
  <Plus data-icon="inline-start" />
  More
</Button>
<Button variant="danger">
  <Trash2 data-icon="inline-start" />
  Delete
</Button>`,
  sourceShapeMigration: `<Button shape="icon">
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
} as const;

type PlaygroundValues = {
  variant: NonNullable<ButtonProps["variant"]>;
  size: NonNullable<ButtonProps["size"]>;
  label: string;
  disabled: boolean;
  loading: boolean;
};

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

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

export const Route = createFileRoute("/components/button")({
  component: ButtonDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Button"
      description="A clickable action control backed by semantic variants and tone utilities."
      headerAction={
        <Button
          render={<a href="/components/button/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
      sectionDividers={false}
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
        <DocsCodeBlock.Panel
          path="Button.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-4">
          <Example html={code.variants}>
            <div className="-m-1 grid max-w-full grid-cols-[repeat(7,max-content)] gap-3 overflow-x-auto p-1">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="information">Information</Button>
              <Button variant="muted">Muted</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="danger-secondary">Delete</Button>
              <Button variant="danger-outline">Remove</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </Example>
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
            <Button variant="danger" size="icon-sm" aria-label="Delete">
              <Trash2 />
            </Button>
          </Example>
        </div>
      </DocSection>

      <DocSection id="loading" title="Loading">
        <div className="space-y-4">
          <Example html={code.loading}>
            <Button loading>Saving</Button>
            <Button variant="danger" loading loadingLabel="Deleting">
              Delete
            </Button>
          </Example>
        </div>
      </DocSection>

      <DocSection id="disabled" title="Disabled">
        <div className="space-y-4">
          <Example html={code.disabled}>
            <Button disabled>Disabled</Button>
            <Button variant="primary" disabled>
              Primary
            </Button>
            <Button variant="danger" disabled>
              Danger
            </Button>
          </Example>
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
              source: <LegacyButton>Default</LegacyButton>,
              brutal: <Button>Default</Button>,
              elegant: <Button>Default</Button>,
              elegantDark: <Button>Default</Button>,
            },
            {
              label: "Primary",
              status: "match",
              source: <LegacyButton tone="yellow">Primary</LegacyButton>,
              brutal: <Button variant="primary">Primary</Button>,
              elegant: <Button variant="primary">Primary</Button>,
              elegantDark: <Button variant="primary">Primary</Button>,
            },
            {
              label: "Outline",
              status: "match",
              source: <LegacyButton tone="white">Outline</LegacyButton>,
              brutal: <Button variant="outline">Outline</Button>,
              elegant: <Button variant="outline">Outline</Button>,
              elegantDark: <Button variant="outline">Outline</Button>,
            },
            {
              label: "Information",
              status: "match",
              source: <LegacyButton tone="cyan">Information</LegacyButton>,
              brutal: <Button variant="information">Information</Button>,
              elegant: <Button variant="information">Information</Button>,
              elegantDark: <Button variant="information">Information</Button>,
            },
            {
              label: "Muted",
              status: "match",
              source: <LegacyButton tone="stone">Muted</LegacyButton>,
              brutal: <Button variant="muted">Muted</Button>,
              elegant: <Button variant="muted">Muted</Button>,
              elegantDark: <Button variant="muted">Muted</Button>,
            },
            {
              label: "Accent",
              status: "match",
              source: <LegacyButton tone="pink">Accent</LegacyButton>,
              brutal: <Button variant="accent">Accent</Button>,
              elegant: <Button variant="accent">Accent</Button>,
              elegantDark: <Button variant="accent">Accent</Button>,
            },
            {
              label: "Danger",
              status: "match",
              source: <LegacyButton tone="red">Danger</LegacyButton>,
              brutal: <Button variant="danger">Danger</Button>,
              elegant: <Button variant="danger">Danger</Button>,
              elegantDark: <Button variant="danger">Danger</Button>,
            },
            {
              label: "Danger secondary",
              status: "new",
              source: <MissingSource />,
              brutal: <Button variant="danger-secondary">Delete</Button>,
              elegant: <Button variant="danger-secondary">Delete</Button>,
              elegantDark: <Button variant="danger-secondary">Delete</Button>,
            },
            {
              label: "Danger outline",
              status: "new",
              source: <MissingSource />,
              brutal: <Button variant="danger-outline">Remove</Button>,
              elegant: <Button variant="danger-outline">Remove</Button>,
              elegantDark: <Button variant="danger-outline">Remove</Button>,
            },
            {
              label: "Ghost",
              status: "new",
              source: <MissingSource />,
              brutal: <Button variant="ghost">Ghost</Button>,
              elegant: <Button variant="ghost">Ghost</Button>,
              elegantDark: <Button variant="ghost">Ghost</Button>,
            },
            {
              label: "Link",
              status: "new",
              source: <MissingSource />,
              brutal: <Button variant="link">Link</Button>,
              elegant: <Button variant="link">Link</Button>,
              elegantDark: <Button variant="link">Link</Button>,
            },
            {
              label: "Sizes",
              status: "match",
              source: (
                <>
                  <LegacyButton tone="yellow" size="xs">
                    XS
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="sm">
                    SM
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="md">
                    MD
                  </LegacyButton>
                  <LegacyButton tone="yellow" size="lg">
                    LG
                  </LegacyButton>
                </>
              ),
              brutal: (
                <>
                  <Button variant="primary" size="xs">
                    XS
                  </Button>
                  <Button variant="primary" size="sm">
                    SM
                  </Button>
                  <Button variant="primary" size="md">
                    MD
                  </Button>
                  <Button variant="primary" size="lg">
                    LG
                  </Button>
                </>
              ),
              elegant: (
                <>
                  <Button variant="primary" size="xs">
                    XS
                  </Button>
                  <Button variant="primary" size="sm">
                    SM
                  </Button>
                  <Button variant="primary" size="md">
                    MD
                  </Button>
                  <Button variant="primary" size="lg">
                    LG
                  </Button>
                </>
              ),
              elegantDark: (
                <>
                  <Button variant="primary" size="xs">
                    XS
                  </Button>
                  <Button variant="primary" size="sm">
                    SM
                  </Button>
                  <Button variant="primary" size="md">
                    MD
                  </Button>
                  <Button variant="primary" size="lg">
                    LG
                  </Button>
                </>
              ),
            },
            {
              label: "Icon only",
              status: "match",
              source: (
                <LegacyButton tone="yellow" shape="icon" aria-label="Add">
                  <Plus size={14} />
                </LegacyButton>
              ),
              brutal: (
                <Button variant="primary" size="icon-sm" aria-label="Add">
                  <Plus />
                </Button>
              ),
              elegant: (
                <Button variant="primary" size="icon-sm" aria-label="Add">
                  <Plus />
                </Button>
              ),
              elegantDark: (
                <Button variant="primary" size="icon-sm" aria-label="Add">
                  <Plus />
                </Button>
              ),
            },
            {
              label: "Inline icon",
              status: "match",
              source: (
                <LegacyButton tone="yellow" shape="iconText">
                  <Plus size={14} />
                  New
                </LegacyButton>
              ),
              brutal: (
                <Button variant="primary">
                  <Plus data-icon="inline-start" />
                  New
                </Button>
              ),
              elegant: (
                <Button variant="primary">
                  <Plus data-icon="inline-start" />
                  New
                </Button>
              ),
              elegantDark: (
                <Button variant="primary">
                  <Plus data-icon="inline-start" />
                  New
                </Button>
              ),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
