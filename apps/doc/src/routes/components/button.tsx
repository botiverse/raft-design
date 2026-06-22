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
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import buttonAccentCompositionSource from "#/compositions/button/accent-composition.tsx?raw";
import buttonDangerCompositionSource from "#/compositions/button/danger-composition.tsx?raw";
import buttonDangerOutlineCompositionSource from "#/compositions/button/danger-outline-composition.tsx?raw";
import buttonDangerSecondaryCompositionSource from "#/compositions/button/danger-secondary-composition.tsx?raw";
import buttonDefaultCompositionSource from "#/compositions/button/default-composition.tsx?raw";
import buttonGhostCompositionSource from "#/compositions/button/ghost-composition.tsx?raw";
import buttonIconOnlyCompositionSource from "#/compositions/button/icon-only-composition.tsx?raw";
import buttonInformationCompositionSource from "#/compositions/button/information-composition.tsx?raw";
import buttonInlineIconCompositionSource from "#/compositions/button/inline-icon-composition.tsx?raw";
import buttonLinkCompositionSource from "#/compositions/button/link-composition.tsx?raw";
import buttonMutedCompositionSource from "#/compositions/button/muted-composition.tsx?raw";
import buttonOutlineCompositionSource from "#/compositions/button/outline-composition.tsx?raw";
import buttonPrimaryCompositionSource from "#/compositions/button/primary-composition.tsx?raw";
import buttonSizesCompositionSource from "#/compositions/button/sizes-composition.tsx?raw";
import buttonWarningCompositionSource from "#/compositions/button/warning-composition.tsx?raw";
import {
  BUTTON_SOURCE_COMPARISON_COMPOSITION,
  BUTTON_SOURCE_COMPARISON_COMPOSITION_PATHS,
  BUTTON_SOURCE_COMPARISON_SOURCE,
} from "#/compositions/button-source-comparison.tsx";

const TOC = [
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
  "warning",
  "danger",
  "danger-secondary",
  "danger-outline",
  "ghost",
  "link",
] as const;

const ICON_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;
const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "@slock/ui";

<Button>Button</Button>`,
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

const ButtonSource = BUTTON_SOURCE_COMPARISON_SOURCE;
const ButtonCurrent = BUTTON_SOURCE_COMPARISON_COMPOSITION;
const ButtonCompositionPaths = BUTTON_SOURCE_COMPARISON_COMPOSITION_PATHS;

const BUTTON_COMPOSITION_SOURCES = {
  Accent: stripSourceCodeBlocks(buttonAccentCompositionSource),
  Danger: stripSourceCodeBlocks(buttonDangerCompositionSource),
  DangerOutline: stripSourceCodeBlocks(buttonDangerOutlineCompositionSource),
  DangerSecondary: stripSourceCodeBlocks(buttonDangerSecondaryCompositionSource),
  Default: stripSourceCodeBlocks(buttonDefaultCompositionSource),
  Ghost: stripSourceCodeBlocks(buttonGhostCompositionSource),
  IconOnly: stripSourceCodeBlocks(buttonIconOnlyCompositionSource),
  Information: stripSourceCodeBlocks(buttonInformationCompositionSource),
  InlineIcon: stripSourceCodeBlocks(buttonInlineIconCompositionSource),
  Link: stripSourceCodeBlocks(buttonLinkCompositionSource),
  Muted: stripSourceCodeBlocks(buttonMutedCompositionSource),
  Outline: stripSourceCodeBlocks(buttonOutlineCompositionSource),
  Primary: stripSourceCodeBlocks(buttonPrimaryCompositionSource),
  Sizes: stripSourceCodeBlocks(buttonSizesCompositionSource),
  Warning: stripSourceCodeBlocks(buttonWarningCompositionSource),
} as const;

const BUTTON_COMPOSITION_SNIPPET_IDS = {
  Accent: "buttonAccentComposition",
  Danger: "buttonDangerComposition",
  DangerOutline: "buttonDangerOutlineComposition",
  DangerSecondary: "buttonDangerSecondaryComposition",
  Default: "buttonDefaultComposition",
  Ghost: "buttonGhostComposition",
  IconOnly: "buttonIconOnlyComposition",
  Information: "buttonInformationComposition",
  InlineIcon: "buttonInlineIconComposition",
  Link: "buttonLinkComposition",
  Muted: "buttonMutedComposition",
  Outline: "buttonOutlineComposition",
  Primary: "buttonPrimaryComposition",
  Sizes: "buttonSizesComposition",
  Warning: "buttonWarningComposition",
} as const;

type ButtonCompositionKey = keyof typeof BUTTON_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/button")({
  component: ButtonDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        buttonAccentComposition: BUTTON_COMPOSITION_SOURCES.Accent,
        buttonDangerComposition: BUTTON_COMPOSITION_SOURCES.Danger,
        buttonDangerOutlineComposition: BUTTON_COMPOSITION_SOURCES.DangerOutline,
        buttonDangerSecondaryComposition: BUTTON_COMPOSITION_SOURCES.DangerSecondary,
        buttonDefaultComposition: BUTTON_COMPOSITION_SOURCES.Default,
        buttonGhostComposition: BUTTON_COMPOSITION_SOURCES.Ghost,
        buttonIconOnlyComposition: BUTTON_COMPOSITION_SOURCES.IconOnly,
        buttonInformationComposition: BUTTON_COMPOSITION_SOURCES.Information,
        buttonInlineIconComposition: BUTTON_COMPOSITION_SOURCES.InlineIcon,
        buttonLinkComposition: BUTTON_COMPOSITION_SOURCES.Link,
        buttonMutedComposition: BUTTON_COMPOSITION_SOURCES.Muted,
        buttonOutlineComposition: BUTTON_COMPOSITION_SOURCES.Outline,
        buttonPrimaryComposition: BUTTON_COMPOSITION_SOURCES.Primary,
        buttonSizesComposition: BUTTON_COMPOSITION_SOURCES.Sizes,
        buttonWarningComposition: BUTTON_COMPOSITION_SOURCES.Warning,
      },
    }),
});

function ButtonDoc() {
  const code = Route.useLoaderData();
  const buttonComposition = (key: ButtonCompositionKey) => {
    const snippetId = BUTTON_COMPOSITION_SNIPPET_IDS[key];

    return {
      compositionCode: code[snippetId],
      compositionCollapsedCode: code[`${snippetId}Body`],
      compositionPath: ButtonCompositionPaths[key],
      compositionSource: BUTTON_COMPOSITION_SOURCES[key],
      compositionShowLineNumbers: false,
    };
  };

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
              <Button variant="warning">Warning</Button>
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
              source: <ButtonSource.Default />,
              brutal: <ButtonCurrent.Default />,
              elegant: <ButtonCurrent.Default />,
              elegantDark: <ButtonCurrent.Default />,
              ...buttonComposition("Default"),
            },
            {
              label: "Primary",
              status: "match",
              source: <ButtonSource.Primary />,
              brutal: <ButtonCurrent.Primary />,
              elegant: <ButtonCurrent.Primary />,
              elegantDark: <ButtonCurrent.Primary />,
              ...buttonComposition("Primary"),
            },
            {
              label: "Outline",
              status: "match",
              source: <ButtonSource.Outline />,
              brutal: <ButtonCurrent.Outline />,
              elegant: <ButtonCurrent.Outline />,
              elegantDark: <ButtonCurrent.Outline />,
              ...buttonComposition("Outline"),
            },
            {
              label: "Information",
              status: "match",
              source: <ButtonSource.Information />,
              brutal: <ButtonCurrent.Information />,
              elegant: <ButtonCurrent.Information />,
              elegantDark: <ButtonCurrent.Information />,
              ...buttonComposition("Information"),
            },
            {
              label: "Muted",
              status: "match",
              source: <ButtonSource.Muted />,
              brutal: <ButtonCurrent.Muted />,
              elegant: <ButtonCurrent.Muted />,
              elegantDark: <ButtonCurrent.Muted />,
              ...buttonComposition("Muted"),
            },
            {
              label: "Accent",
              status: "match",
              source: <ButtonSource.Accent />,
              brutal: <ButtonCurrent.Accent />,
              elegant: <ButtonCurrent.Accent />,
              elegantDark: <ButtonCurrent.Accent />,
              ...buttonComposition("Accent"),
            },
            {
              label: "Warning",
              status: "match",
              source: <ButtonSource.Warning />,
              brutal: <ButtonCurrent.Warning />,
              elegant: <ButtonCurrent.Warning />,
              elegantDark: <ButtonCurrent.Warning />,
              ...buttonComposition("Warning"),
            },
            {
              label: "Danger",
              status: "match",
              source: <ButtonSource.Danger />,
              brutal: <ButtonCurrent.Danger />,
              elegant: <ButtonCurrent.Danger />,
              elegantDark: <ButtonCurrent.Danger />,
              ...buttonComposition("Danger"),
            },
            {
              label: "Danger secondary",
              status: "new",
              source: <ButtonSource.Missing />,
              brutal: <ButtonCurrent.DangerSecondary />,
              elegant: <ButtonCurrent.DangerSecondary />,
              elegantDark: <ButtonCurrent.DangerSecondary />,
              ...buttonComposition("DangerSecondary"),
            },
            {
              label: "Danger outline",
              status: "new",
              source: <ButtonSource.Missing />,
              brutal: <ButtonCurrent.DangerOutline />,
              elegant: <ButtonCurrent.DangerOutline />,
              elegantDark: <ButtonCurrent.DangerOutline />,
              ...buttonComposition("DangerOutline"),
            },
            {
              label: "Ghost",
              status: "new",
              source: <ButtonSource.Missing />,
              brutal: <ButtonCurrent.Ghost />,
              elegant: <ButtonCurrent.Ghost />,
              elegantDark: <ButtonCurrent.Ghost />,
              ...buttonComposition("Ghost"),
            },
            {
              label: "Link",
              status: "new",
              source: <ButtonSource.Missing />,
              brutal: <ButtonCurrent.Link />,
              elegant: <ButtonCurrent.Link />,
              elegantDark: <ButtonCurrent.Link />,
              ...buttonComposition("Link"),
            },
            {
              label: "Sizes",
              status: "match",
              source: <ButtonSource.Sizes />,
              brutal: <ButtonCurrent.Sizes />,
              elegant: <ButtonCurrent.Sizes />,
              elegantDark: <ButtonCurrent.Sizes />,
              ...buttonComposition("Sizes"),
            },
            {
              label: "Icon only",
              status: "match",
              source: <ButtonSource.IconOnly />,
              brutal: <ButtonCurrent.IconOnly />,
              elegant: <ButtonCurrent.IconOnly />,
              elegantDark: <ButtonCurrent.IconOnly />,
              ...buttonComposition("IconOnly"),
            },
            {
              label: "Inline icon",
              status: "match",
              source: <ButtonSource.InlineIcon />,
              brutal: <ButtonCurrent.InlineIcon />,
              elegant: <ButtonCurrent.InlineIcon />,
              elegantDark: <ButtonCurrent.InlineIcon />,
              ...buttonComposition("InlineIcon"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
