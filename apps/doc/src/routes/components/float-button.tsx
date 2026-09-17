import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, MessageSquare, PanelLeft, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FloatButton,
  FloatButtonGroup,
} from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  FLOAT_BUTTON_SHAPES,
  FLOAT_BUTTON_SIZES,
  FLOAT_BUTTON_VARIANTS,
} from "#/modules/float-button/float-button.constants.ts";
import { FloatButtonPlaygroundPreview } from "#/modules/float-button/float-button.preview.tsx";
import floatButtonPreviewCompositionSource from "#/modules/float-button/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { FloatButton, FloatButtonGroup } from "raft-ui";

<FloatButton icon={<Plus />} />`,
  basic: `import { MessageSquare } from "lucide-react";
import { FloatButton } from "raft-ui";

<FloatButton
  position="relative"
  variant="primary"
  icon={<MessageSquare />}
  aria-label="Feedback"
/>`,
  shapesAndSizes: `import { ArrowUp } from "lucide-react";
import { FloatButton } from "raft-ui";

<FloatButton position="relative" shape="circle" size="xs" icon={<ArrowUp />} aria-label="Circle xs" />
<FloatButton position="relative" shape="circle" size="sm" icon={<ArrowUp />} aria-label="Circle sm" />
<FloatButton position="relative" shape="circle" size="md" icon={<ArrowUp />} aria-label="Circle md" />
<FloatButton position="relative" shape="circle" size="lg" icon={<ArrowUp />} aria-label="Circle lg" />
<FloatButton position="relative" shape="square" size="xs" icon={<ArrowUp />} aria-label="Square xs" />
<FloatButton position="relative" shape="square" size="sm" icon={<ArrowUp />} aria-label="Square sm" />
<FloatButton position="relative" shape="square" size="md" icon={<ArrowUp />} aria-label="Square md" />
<FloatButton position="relative" shape="square" size="lg" icon={<ArrowUp />} aria-label="Square lg" />`,
  description: `import { ArrowUp } from "lucide-react";
import { FloatButton } from "raft-ui";

<FloatButton
  position="relative"
  shape="square"
  icon={<ArrowUp />}
  description="TOP"
  aria-label="Back to top"
/>`,
  tooltip: `import { PanelLeft } from "lucide-react";
import { FloatButton } from "raft-ui";

<FloatButton
  position="relative"
  variant="default"
  tooltip="Expand sidebar"
  icon={<PanelLeft />}
  aria-label="Expand sidebar"
/>`,
  group: `import { ArrowUp, MessageSquare, Settings } from "lucide-react";
import { FloatButton, FloatButtonGroup } from "raft-ui";

<FloatButtonGroup position="relative" direction="vertical">
  <FloatButton icon={<ArrowUp />} aria-label="Top" />
  <FloatButton icon={<MessageSquare />} aria-label="Message" />
  <FloatButton variant="primary" icon={<Settings />} aria-label="Settings" />
</FloatButtonGroup>

<FloatButtonGroup position="relative" direction="vertical" attached shape="square">
  <FloatButton shape="square" icon={<ArrowUp />} aria-label="Top" />
  <FloatButton shape="square" icon={<MessageSquare />} aria-label="Message" />
  <FloatButton shape="square" variant="primary" icon={<Settings />} aria-label="Settings" />
</FloatButtonGroup>`,
  menu: `import { Plus, Settings, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  FloatButton,
} from "raft-ui";

<DropdownMenu>
  <DropdownMenuTrigger
    render={
      <FloatButton
        position="relative"
        variant="primary"
        icon={<Plus />}
        aria-label="Actions"
      />
    }
  />
  <DropdownMenuContent side="top" align="center">
    <DropdownMenuItem>
      <MessageSquare />
      <span>New message</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings />
      <span>Settings</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
} as const;

const FLOAT_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: FLOAT_BUTTON_VARIANTS.map((v) => `"${v}"`).join(" | "),
    default: '"default"',
    description: "Action semantics following design system tokens and themes.",
  },
  {
    name: "shape",
    type: FLOAT_BUTTON_SHAPES.map((s) => `"${s}"`).join(" | "),
    default: '"circle"',
    description: "Shape of the button. Adapts radius according to theme recipe.",
  },
  {
    name: "size",
    type: FLOAT_BUTTON_SIZES.map((s) => `"${s}"`).join(" | "),
    default: '"md"',
    description: "Size dimensions (xs = 24px, sm = 28px, md = 32px, lg = 36px).",
  },
  {
    name: "icon",
    type: "ReactNode",
    description: "Primary icon element.",
  },
  {
    name: "description",
    type: "ReactNode",
    description: "Sub-label text rendered underneath the icon.",
  },
  {
    name: "tooltip",
    type: "ReactNode",
    description: "Built-in Tooltip content rendered via rUI Tooltip.",
  },
  {
    name: "position",
    type: '"fixed" | "absolute" | "relative"',
    default: '"fixed" (or unpositioned if inside group)',
    description: "CSS position strategy.",
  },
  {
    name: "side",
    type: '"bottom-right" | "bottom-left" | "top-right" | "top-left"',
    default: '"bottom-right"',
    description: "Corner placement for positioned buttons.",
  },
  {
    name: "offset",
    type: "number | string | [number | string, number | string]",
    default: "16",
    description: "Distance from viewport edges [x, y] or uniform value.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render composition prop.",
  },
];

const FLOAT_BUTTON_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "direction",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Flex layout direction for child float buttons.",
  },
  {
    name: "attached",
    type: "boolean",
    default: "false",
    description: "Whether child buttons are seamlessly attached without gaps.",
  },
  {
    name: "shape",
    type: FLOAT_BUTTON_SHAPES.map((s) => `"${s}"`).join(" | "),
    default: '"circle"',
    description: "Shape styling for container and corner radii.",
  },
  {
    name: "position",
    type: '"fixed" | "absolute" | "relative"',
    default: '"fixed"',
    description: "CSS position strategy for the group container.",
  },
  {
    name: "side",
    type: '"bottom-right" | "bottom-left" | "top-right" | "top-left"',
    default: '"bottom-right"',
    description: "Corner placement for the group container.",
  },
  {
    name: "offset",
    type: "number | string | [number | string, number | string]",
    default: "16",
    description: "Distance from edges [x, y] or uniform value.",
  },
  {
    name: "gap",
    type: "number | string",
    description: "Custom spacing between buttons when not attached.",
  },
];

export const Route = createFileRoute("/components/float-button")({
  component: FloatButtonDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        floatButtonPreviewComposition: floatButtonPreviewCompositionSource,
      },
    }),
});

function FloatButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="FloatButton"
      description="A floating interactive trigger positioned over page content for primary actions, navigation, or menus."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <FloatButtonPlaygroundPreview code={code.floatButtonPreviewComposition} />
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
          <DocSubsection parentId="usage" id="basic" title="Basic">
            <Preview>
              <Preview.Canvas>
                <FloatButton
                  position="relative"
                  variant="primary"
                  icon={<MessageSquare />}
                  aria-label="Feedback"
                />
              </Preview.Canvas>
              <Preview.Code html={code.basic} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="shapesAndSizes" title="Shapes & Sizes">
            <Preview>
              <Preview.Canvas>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <FloatButton
                    position="relative"
                    shape="circle"
                    size="xs"
                    icon={<ArrowUp />}
                    aria-label="Circle xs"
                  />
                  <FloatButton
                    position="relative"
                    shape="circle"
                    size="sm"
                    icon={<ArrowUp />}
                    aria-label="Top sm"
                  />
                  <FloatButton
                    position="relative"
                    shape="circle"
                    size="md"
                    icon={<ArrowUp />}
                    aria-label="Top md"
                  />
                  <FloatButton
                    position="relative"
                    shape="circle"
                    size="lg"
                    icon={<ArrowUp />}
                    aria-label="Top lg"
                  />
                  <FloatButton
                    position="relative"
                    shape="square"
                    size="xs"
                    icon={<ArrowUp />}
                    aria-label="Square xs"
                  />
                  <FloatButton
                    position="relative"
                    shape="square"
                    size="sm"
                    icon={<ArrowUp />}
                    aria-label="Square sm"
                  />
                  <FloatButton
                    position="relative"
                    shape="square"
                    size="md"
                    icon={<ArrowUp />}
                    aria-label="Square md"
                  />
                  <FloatButton
                    position="relative"
                    shape="square"
                    size="lg"
                    icon={<ArrowUp />}
                    aria-label="Square lg"
                  />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.shapesAndSizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="description" title="Description">
            <Preview>
              <Preview.Canvas>
                <FloatButton
                  position="relative"
                  shape="square"
                  icon={<ArrowUp />}
                  description="TOP"
                  aria-label="Back to top"
                />
              </Preview.Canvas>
              <Preview.Code html={code.description} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="tooltip" title="Tooltip">
            <Preview>
              <Preview.Canvas>
                <FloatButton
                  position="relative"
                  variant="default"
                  tooltip="Expand sidebar"
                  icon={<PanelLeft />}
                  aria-label="Expand sidebar"
                />
              </Preview.Canvas>
              <Preview.Code html={code.tooltip} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="group" title="FloatButtonGroup">
            <Preview>
              <Preview.Canvas>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <FloatButtonGroup position="relative" direction="vertical">
                    <FloatButton icon={<ArrowUp />} aria-label="Top" />
                    <FloatButton icon={<MessageSquare />} aria-label="Message" />
                    <FloatButton variant="primary" icon={<Settings />} aria-label="Settings" />
                  </FloatButtonGroup>

                  <FloatButtonGroup
                    position="relative"
                    direction="vertical"
                    attached
                    shape="square"
                  >
                    <FloatButton shape="square" icon={<ArrowUp />} aria-label="Top" />
                    <FloatButton shape="square" icon={<MessageSquare />} aria-label="Message" />
                    <FloatButton
                      shape="square"
                      variant="primary"
                      icon={<Settings />}
                      aria-label="Settings"
                    />
                  </FloatButtonGroup>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.group} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="menu" title="Menu Composition">
            <Preview>
              <Preview.Canvas>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <FloatButton
                        position="relative"
                        variant="primary"
                        icon={<Plus />}
                        aria-label="Actions"
                      />
                    }
                  />
                  <DropdownMenuContent side="top" align="center">
                    <DropdownMenuItem>
                      <MessageSquare />
                      <span>New message</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Preview.Canvas>
              <Preview.Code html={code.menu} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <h3 className="mb-3 text-sm font-semibold text-foreground">FloatButton Props</h3>
        <PropsTable rows={FLOAT_BUTTON_PROPS} />

        <h3 className="mb-3 mt-8 text-sm font-semibold text-foreground">FloatButtonGroup Props</h3>
        <PropsTable rows={FLOAT_BUTTON_GROUP_PROPS} />
      </DocSection>
    </DocPage>
  );
}
