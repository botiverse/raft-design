import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { ICON_SIZES, SIZES, VARIANTS } from "#/modules/button/button.constants.ts";
import { ButtonPlaygroundPreview, ButtonPreview } from "#/modules/button/button.preview.tsx";
import buttonAccentCompositionSource from "#/modules/button/compositions/accent.composition.tsx?raw";
import buttonDangerCompositionSource from "#/modules/button/compositions/danger.composition.tsx?raw";
import buttonDangerOutlineCompositionSource from "#/modules/button/compositions/danger-outline.composition.tsx?raw";
import buttonDangerSecondaryCompositionSource from "#/modules/button/compositions/danger-secondary.composition.tsx?raw";
import buttonDefaultCompositionSource from "#/modules/button/compositions/default.composition.tsx?raw";
import buttonGhostCompositionSource from "#/modules/button/compositions/ghost.composition.tsx?raw";
import buttonIconOnlyCompositionSource from "#/modules/button/compositions/icon-only.composition.tsx?raw";
import buttonInformationCompositionSource from "#/modules/button/compositions/information.composition.tsx?raw";
import buttonInlineIconCompositionSource from "#/modules/button/compositions/inline-icon.composition.tsx?raw";
import buttonLinkCompositionSource from "#/modules/button/compositions/link.composition.tsx?raw";
import buttonMutedCompositionSource from "#/modules/button/compositions/muted.composition.tsx?raw";
import buttonOutlineCompositionSource from "#/modules/button/compositions/outline.composition.tsx?raw";
import buttonPreviewCompositionSource from "#/modules/button/compositions/preview.composition.tsx?raw";
import buttonPrimaryCompositionSource from "#/modules/button/compositions/primary.composition.tsx?raw";
import buttonSizesCompositionSource from "#/modules/button/compositions/sizes.composition.tsx?raw";
import buttonWarningCompositionSource from "#/modules/button/compositions/warning.composition.tsx?raw";
import {
  BUTTON_SOURCE_COMPARISON_COMPOSITION,
  BUTTON_SOURCE_COMPARISON_COMPOSITION_PATHS,
  BUTTON_SOURCE_COMPARISON_SOURCE,
} from "#/modules/button/button.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Icon and lightbox actions",
    scenes: [
      {
        label: "ImageLightbox.tsx:136,144",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ImageLightbox.tsx:136,144",
      },
      {
        label: "MobileComputersPanel.tsx:49",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MobileComputersPanel.tsx:49",
      },
      {
        label: "ChannelMembers.tsx:107",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ChannelMembers.tsx:107",
      },
      {
        label: "SelectShareLightbox.tsx:37",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/SelectShareLightbox.tsx:37",
      },
      {
        label: "PanelHeader.tsx:141",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/PanelHeader.tsx:141",
      },
    ],
  },
  {
    label: "Chat and message actions",
    scenes: [
      {
        label: "LegacyTaskPanel.tsx:94",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/LegacyTaskPanel.tsx:94",
      },
      {
        label: "ChatPanel.tsx:695,705,715",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:695,705,715",
      },
      {
        label: "MessageItem.tsx:953,956",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:953,956",
      },
    ],
  },
] as const;

const HEIGHT_ALIGNMENT_SIZES = ["xs", "sm", "md", "lg"] as const;
const HEIGHT_ALIGNMENT_VARIANTS = [
  { variant: "outline", label: "Outline" },
  { variant: "primary", label: "Primary" },
  { variant: "danger-outline", label: "Danger outline" },
] as const;

const SNIPPETS = {
  anatomy: `<Button />`,
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
  heightAlignment: `const sizes = ["xs", "sm", "md", "lg"] as const;
const variants = [
  { variant: "outline", label: "Outline" },
  { variant: "primary", label: "Primary" },
  { variant: "danger-outline", label: "Danger outline" },
] as const;

{sizes.map((size) => (
  <div key={size}>
    {variants.map(({ variant, label }) => (
      <div key={variant}>
        <Button variant={variant} size={size}>
          {label}
        </Button>
        <Button variant={variant} size={size}>
          <Plus data-icon="inline-start" />
          {label}
        </Button>
        <Button variant={variant} size={size}>
          {label}
          <Plus data-icon="inline-end" />
        </Button>
      </div>
    ))}
  </div>
))}`,
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
        buttonPreviewComposition: buttonPreviewCompositionSource,
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
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ButtonPlaygroundPreview
          code={code.buttonPreviewComposition}
          collapsedCode={code.buttonPreviewCompositionBody}
        />
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

          <DocSubsection parentId="usage" id="height-alignment" title="Height alignment">
            <Preview>
              <Preview.Canvas>
                <div className="-m-1 max-w-full overflow-x-auto p-1">
                  <div className="grid min-w-max gap-3">
                    {HEIGHT_ALIGNMENT_SIZES.map((size) => (
                      <div
                        key={size}
                        className="grid grid-cols-[2.5rem_repeat(9,max-content)] items-center gap-2"
                      >
                        <span className="font-mono text-xs text-foreground-muted">{size}</span>
                        {HEIGHT_ALIGNMENT_VARIANTS.map(({ variant, label }) => (
                          <div key={variant} className="contents">
                            <Button variant={variant} size={size}>
                              {label}
                            </Button>
                            <Button variant={variant} size={size}>
                              <Plus data-icon="inline-start" />
                              {label}
                            </Button>
                            <Button variant={variant} size={size}>
                              {label}
                              <Plus data-icon="inline-end" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.heightAlignment} />
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
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
