import { createFileRoute } from "@tanstack/react-router";
import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "raft-ui";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { BannerPlaygroundPreview } from "#/modules/banner/banner.preview.tsx";
import bannerPreviewCompositionSource from "#/modules/banner/compositions/preview.composition.tsx?raw";
import bannerActionCompositionSource from "#/modules/banner/compositions/action.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "actions", title: "Actions" },
  { id: "api", title: "API" },
] as const;

const STATUSES = ["default", "destructive", "warning", "info", "success"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const BANNER_COMPOSITION_RAW_SOURCES = {
  Preview: bannerPreviewCompositionSource,
  Action: bannerActionCompositionSource,
} as const;

const BANNER_COMPOSITION_SOURCES = createCompositionSourceMap(BANNER_COMPOSITION_RAW_SOURCES);

const BANNER_COMPOSITION_SNIPPET_IDS = {
  Preview: "bannerPreviewComposition",
  Action: "bannerActionComposition",
} as const;

const SNIPPETS = {
  anatomy: `import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
} from "raft-ui";

<Banner status="info">
  <BannerTitle />
  <BannerDescription />
  <BannerAction>
    <Button />
  </BannerAction>
</Banner>`,
  statuses: `<Banner status="default">
  <Info />
  <BannerTitle>Settings synced</BannerTitle>
  <BannerDescription>Rules now apply to every project.</BannerDescription>
  <BannerAction><Button variant="ghost" size="icon-xs" aria-label="Dismiss workspace settings notice"><X /></Button></BannerAction>
</Banner>
<Banner status="destructive">
  <CircleX />
  <BannerTitle>Payment failed</BannerTitle>
  <BannerDescription>Retry to keep automations running.</BannerDescription>
  <BannerAction><Button variant="ghost" size="xs">Retry</Button></BannerAction>
</Banner>
<Banner status="warning">
  <CircleAlert />
  <BannerTitle>Invoice details missing</BannerTitle>
  <BannerDescription>Add billing email and tax ID.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Review</Button></BannerAction>
</Banner>
<Banner status="info">
  <Info />
  <BannerTitle>Trial ends soon</BannerTitle>
  <BannerDescription>Upgrade to keep projects available.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Upgrade</Button></BannerAction>
</Banner>
<Banner status="success">
  <CircleCheck />
  <BannerTitle>Deployment live</BannerTitle>
  <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
  <BannerAction><Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice"><X /></Button></BannerAction>
</Banner>`,
  sizes: `<Banner status="info" size="sm">
  <Info />
  <BannerTitle>Small banner</BannerTitle>
  <BannerDescription>Tight form-error banner.</BannerDescription>
  <BannerAction><Button variant="ghost" size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="md">
  <Info />
  <BannerTitle>Medium banner</BannerTitle>
  <BannerDescription>Default banner.</BannerDescription>
  <BannerAction><Button variant="ghost" size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="lg">
  <Info />
  <BannerTitle>Large banner</BannerTitle>
  <BannerDescription>Prominent surface banner.</BannerDescription>
  <BannerAction><Button variant="ghost" size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>`,
  composition: `<Banner status="warning">
  <CircleAlert />
  <BannerTitle>Plan limit reached</BannerTitle>
  <BannerDescription>Remove an inactive machine before adding another.</BannerDescription>
  <BannerAction>
    <Button variant="ghost" size="icon-xs" aria-label="Dismiss"><X /></Button>
  </BannerAction>
</Banner>`,
} as const;

const BANNER_PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: STATUSES.map((status) => `"${status}"`).join(" | "),
    description:
      'Drives the surface color. Source intent="..." maps to destructive / warning / info / success; default covers neutral banners.',
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description:
      "Controls padding, icon size, title size, description size, and action affordance.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Native div attributes plus render. Place an optional SVG icon as a direct child; the root normalizes its size.",
  },
];

const BANNER_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional bold heading.",
  },
];

const BANNER_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Message/content slot. Its font size follows the root size.",
  },
];

const BANNER_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'Omit<useRender.ComponentProps<"div">, "align">',
    description: "Trailing slot, pinned right and aligned to the top.",
  },
];

export const Route = createFileRoute("/components/banner")({
  component: BannerDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(BANNER_COMPOSITION_SOURCES, BANNER_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function BannerDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="Banner"
      description="An inline banner / callout / alert composed from a status-driven root and slot parts."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <BannerPlaygroundPreview
          code={code.bannerPreviewComposition}
          collapsedCode={code.bannerPreviewCompositionBody}
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
          <DocSubsection parentId="usage" id="statuses" title="Statuses">
            <Preview>
              <Preview.Canvas>
                <div className="flex w-[28rem] flex-col gap-3">
                  <Banner status="default">
                    <Info />
                    <BannerTitle>Settings synced</BannerTitle>
                    <BannerDescription>Rules now apply to every project.</BannerDescription>
                    <BannerAction>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Dismiss workspace settings notice"
                      >
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="destructive">
                    <CircleX />
                    <BannerTitle>Payment failed</BannerTitle>
                    <BannerDescription>Retry to keep automations running.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="xs">
                        Retry
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="warning">
                    <CircleAlert />
                    <BannerTitle>Invoice details missing</BannerTitle>
                    <BannerDescription>Add billing email and tax ID.</BannerDescription>
                    <BannerAction>
                      <Button variant="outline" size="xs">
                        Review
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info">
                    <Info />
                    <BannerTitle>Trial ends soon</BannerTitle>
                    <BannerDescription>Upgrade to keep projects available.</BannerDescription>
                    <BannerAction>
                      <Button variant="outline" size="xs">
                        Upgrade
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="success">
                    <CircleCheck />
                    <BannerTitle>Deployment live</BannerTitle>
                    <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.statuses} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <DocNote>
              Banners stay iconless by default, matching the dominant inline pattern. Compose a
              direct icon child for the heavier warning surfaces.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="flex w-[28rem] flex-col gap-3">
                  <Banner status="info" size="sm">
                    <Info />
                    <BannerTitle>Small banner</BannerTitle>
                    <BannerDescription>Tight form-error banner.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info" size="md">
                    <Info />
                    <BannerTitle>Medium banner</BannerTitle>
                    <BannerDescription>Default banner.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                  <Banner status="info" size="lg">
                    <Info />
                    <BannerTitle>Large banner</BannerTitle>
                    <BannerDescription>Prominent surface banner.</BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <Preview>
              <Preview.Canvas>
                <div className="w-[28rem]">
                  <Banner status="warning">
                    <CircleAlert />
                    <BannerTitle>Plan limit reached</BannerTitle>
                    <BannerDescription>
                      Remove an inactive machine before adding another.
                    </BannerDescription>
                    <BannerAction>
                      <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
                        <X />
                      </Button>
                    </BannerAction>
                  </Banner>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="actions" title="Actions" showThemeSwitcher>
        <DocNote>
          Text actions inside a banner use <code>Button size=&quot;inline&quot;</code> inside{" "}
          <code>BannerDescription</code>. The inline button inherits the description&apos;s font
          size and sits on the baseline. Other button sizes inside banner content are not supported
          and will be addressed in raft-ui.
        </DocNote>
        <Preview>
          <Preview.Canvas>
            <div className="w-[28rem]">
              <Banner status="warning">
                <CircleAlert />
                <BannerTitle>Plan limit reached</BannerTitle>
                <BannerDescription>
                  Remove an inactive machine before adding another.{" "}
                  <Button variant="link" size="inline">
                    Manage machines
                  </Button>
                </BannerDescription>
                <BannerAction>
                  <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
                    <X />
                  </Button>
                </BannerAction>
              </Banner>
            </div>
          </Preview.Canvas>
          <Preview.Code
            html={code.bannerActionComposition}
            collapsedHtml={code.bannerActionCompositionBody}
          />
        </Preview>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Banner">
            <PropsTable rows={BANNER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="BannerTitle">
            <PropsTable rows={BANNER_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="BannerDescription">
            <PropsTable rows={BANNER_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-action" title="BannerAction">
            <PropsTable rows={BANNER_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
