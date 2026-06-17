import { createFileRoute } from "@tanstack/react-router";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  type BannerActionProps,
  type BannerProps,
} from "@slock/ui";
import {
  IconCircleCheckFill18,
  IconCircleInfoFill18,
  IconCircleWarningFill18,
  IconCircleXmarkFill18,
} from "nucleo-ui-fill-18";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";
import { X } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyBanner from "../../../../../packages/ui/src/legacy/Banner.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "statuses", title: "Statuses" },
  { id: "sizes", title: "Sizes" },
  { id: "composition", title: "Composition" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const STATUSES = ["default", "destructive", "warning", "info", "success"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const ACTION_ALIGNS = ["top", "middle"] as const;

const STATUS_ICON = {
  default: IconCircleInfoFill18,
  destructive: IconCircleXmarkFill18,
  warning: IconCircleWarningFill18,
  info: IconCircleInfoFill18,
  success: IconCircleCheckFill18,
} as const;

const SNIPPETS = {
  anatomy: `import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "@slock/ui";
import { IconCircleWarningFill18 } from "nucleo-ui-fill-18";
import { X } from "lucide-react";

<Banner status="warning">
  <IconCircleWarningFill18 />
  <BannerTitle>Review required</BannerTitle>
  <BannerDescription>Heads up — this can't be undone.</BannerDescription>
  <BannerAction align="top">
    <Button size="icon-xs" aria-label="Dismiss"><X /></Button>
  </BannerAction>
</Banner>`,
  statuses: `<Banner status="default">
  <IconCircleInfoFill18 />
  <BannerTitle>Settings synced</BannerTitle>
  <BannerDescription>Rules now apply to every project.</BannerDescription>
  <BannerAction align="top"><Button variant="ghost" size="icon-xs" aria-label="Dismiss workspace settings notice"><X /></Button></BannerAction>
</Banner>
<Banner status="destructive">
  <IconCircleXmarkFill18 />
  <BannerTitle>Payment failed</BannerTitle>
  <BannerDescription>Retry to keep automations running.</BannerDescription>
  <BannerAction><Button variant="ghost" size="xs">Retry</Button></BannerAction>
</Banner>
<Banner status="warning">
  <IconCircleWarningFill18 />
  <BannerTitle>Invoice details missing</BannerTitle>
  <BannerDescription>Add billing email and tax ID.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Review</Button></BannerAction>
</Banner>
<Banner status="info">
  <IconCircleInfoFill18 />
  <BannerTitle>Trial ends soon</BannerTitle>
  <BannerDescription>Upgrade to keep projects available.</BannerDescription>
  <BannerAction><Button variant="outline" size="xs">Upgrade</Button></BannerAction>
</Banner>
<Banner status="success">
  <IconCircleCheckFill18 />
  <BannerTitle>Deployment live</BannerTitle>
  <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
  <BannerAction align="top"><Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice"><X /></Button></BannerAction>
</Banner>`,
  sizes: `<Banner status="info" size="sm">
  <IconCircleInfoFill18 />
  <BannerTitle>Small banner</BannerTitle>
  <BannerDescription>Tight form-error banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="md">
  <IconCircleInfoFill18 />
  <BannerTitle>Medium banner</BannerTitle>
  <BannerDescription>Default banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>
<Banner status="info" size="lg">
  <IconCircleInfoFill18 />
  <BannerTitle>Large banner</BannerTitle>
  <BannerDescription>Prominent surface banner.</BannerDescription>
  <BannerAction><Button size="icon-xs" aria-label="Dismiss"><X /></Button></BannerAction>
</Banner>`,
  composition: `<Banner status="warning">
  <IconCircleWarningFill18 />
  <BannerTitle>Plan limit reached</BannerTitle>
  <BannerDescription>Remove an inactive machine before adding another.</BannerDescription>
  <BannerAction align="top">
    <Button size="icon-xs" aria-label="Dismiss"><X /></Button>
  </BannerAction>
</Banner>`,
  sourceDefault: `<Banner intent="warning">
  Please fix the highlighted fields.
</Banner>`,
  currentDefault: `<Banner status="warning">
  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
</Banner>`,
  sourceIcon: `<Banner intent="destructive" withIcon title="Delete server">
  This can't be undone.
</Banner>`,
  currentIcon: `<Banner status="destructive">
  <IconCircleXmarkFill18 />
  <BannerTitle>Delete server</BannerTitle>
  <BannerDescription>This can't be undone.</BannerDescription>
</Banner>`,
  sourceActions: `<Banner
  intent="info"
  density="lg"
  withIcon
  actions={<button aria-label="Dismiss"><X /></button>}
>
  You're on the free plan.
</Banner>`,
  currentActions: `<Banner status="info" size="lg">
  <IconCircleInfoFill18 />
  <BannerDescription>You're on the free plan.</BannerDescription>
  <BannerAction><button aria-label="Dismiss"><X /></button></BannerAction>
</Banner>`,
} as const;

type PlaygroundValues = {
  status: BannerProps["status"];
  size: NonNullable<BannerProps["size"]>;
  actionAlign: NonNullable<BannerActionProps["align"]>;
  withIcon: boolean;
  withTitle: boolean;
  withActions: boolean;
};

const PROPS: readonly PropRow[] = [
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
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes.",
  },
];

const PART_PROPS: readonly PropRow[] = [
  {
    name: "Icon",
    type: "ReactNode",
    description: "Place an icon as a direct Banner child. The root normalizes SVG size.",
  },
  {
    name: "BannerTitle",
    type: "div props",
    description: "Optional bold heading.",
  },
  {
    name: "BannerDescription",
    type: "div props",
    description: "Message/content slot. Its font size follows the root size.",
  },
  {
    name: "BannerAction",
    type: "div props",
    description: "Trailing slot, pinned right.",
  },
  {
    name: "BannerAction.align",
    type: ACTION_ALIGNS.map((align) => `"${align}"`).join(" | "),
    default: '"middle"',
    description: "Aligns actions to the title row top or vertically centered across the banner.",
  },
];

function DismissIconButton() {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      className="inline-flex size-6 shrink-0 items-center justify-center border-2 border-black bg-white text-black transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] [&>svg]:size-3.5"
    >
      <X />
    </button>
  );
}

export const Route = createFileRoute("/components/banner")({
  component: BannerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BannerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Banner"
      description="An inline banner / callout / alert composed from a status-driven root and slot parts."
      headerAction={
        <Button
          render={<a href="/components/banner/matrix" target="_blank" rel="noreferrer" />}
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
            status: "warning",
            size: "md",
            actionAlign: "middle",
            withIcon: true,
            withTitle: false,
            withActions: false,
          }}
          controls={[
            { name: "status", label: "Status", type: "select", options: STATUSES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "actionAlign", label: "Action align", type: "select", options: ACTION_ALIGNS },
            { name: "withIcon", label: "With icon", type: "boolean" },
            { name: "withTitle", label: "With title", type: "boolean" },
            { name: "withActions", label: "With actions", type: "boolean" },
          ]}
          render={(values) => {
            const Icon = STATUS_ICON[values.status];
            return (
              <Banner status={values.status} size={values.size} className="w-[28rem]">
                {values.withIcon ? <Icon /> : null}
                {values.withTitle ? <BannerTitle>Review required</BannerTitle> : null}
                <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
                {values.withActions ? (
                  <BannerAction align={values.actionAlign}>
                    <Button size="icon-xs" aria-label="Dismiss">
                      <X />
                    </Button>
                  </BannerAction>
                ) : null}
              </Banner>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Banner.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="statuses" title="Statuses">
        <Example html={code.statuses}>
          <div className="flex w-[28rem] flex-col gap-3">
            <Banner status="default">
              <IconCircleInfoFill18 />
              <BannerTitle>Settings synced</BannerTitle>
              <BannerDescription>Rules now apply to every project.</BannerDescription>
              <BannerAction align="top">
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
              <IconCircleXmarkFill18 />
              <BannerTitle>Payment failed</BannerTitle>
              <BannerDescription>Retry to keep automations running.</BannerDescription>
              <BannerAction>
                <Button variant="ghost" size="xs">
                  Retry
                </Button>
              </BannerAction>
            </Banner>
            <Banner status="warning">
              <IconCircleWarningFill18 />
              <BannerTitle>Invoice details missing</BannerTitle>
              <BannerDescription>Add billing email and tax ID.</BannerDescription>
              <BannerAction>
                <Button variant="outline" size="xs">
                  Review
                </Button>
              </BannerAction>
            </Banner>
            <Banner status="info">
              <IconCircleInfoFill18 />
              <BannerTitle>Trial ends soon</BannerTitle>
              <BannerDescription>Upgrade to keep projects available.</BannerDescription>
              <BannerAction>
                <Button variant="outline" size="xs">
                  Upgrade
                </Button>
              </BannerAction>
            </Banner>
            <Banner status="success">
              <IconCircleCheckFill18 />
              <BannerTitle>Deployment live</BannerTitle>
              <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
              <BannerAction align="top">
                <Button variant="ghost" size="icon-xs" aria-label="Dismiss deployment notice">
                  <X />
                </Button>
              </BannerAction>
            </Banner>
          </div>
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <DocNote>
            Banners stay iconless by default, matching the dominant inline pattern. Compose a direct
            icon child for the heavier warning surfaces.
          </DocNote>
          <Example html={code.sizes}>
            <div className="flex w-[28rem] flex-col gap-3">
              <Banner status="info" size="sm">
                <IconCircleInfoFill18 />
                <BannerTitle>Small banner</BannerTitle>
                <BannerDescription>Tight form-error banner.</BannerDescription>
                <BannerAction>
                  <Button size="icon-xs" aria-label="Dismiss">
                    <X />
                  </Button>
                </BannerAction>
              </Banner>
              <Banner status="info" size="md">
                <IconCircleInfoFill18 />
                <BannerTitle>Medium banner</BannerTitle>
                <BannerDescription>Default banner.</BannerDescription>
                <BannerAction>
                  <Button size="icon-xs" aria-label="Dismiss">
                    <X />
                  </Button>
                </BannerAction>
              </Banner>
              <Banner status="info" size="lg">
                <IconCircleInfoFill18 />
                <BannerTitle>Large banner</BannerTitle>
                <BannerDescription>Prominent surface banner.</BannerDescription>
                <BannerAction>
                  <Button size="icon-xs" aria-label="Dismiss">
                    <X />
                  </Button>
                </BannerAction>
              </Banner>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="composition" title="Composition">
        <Example html={code.composition}>
          <div className="w-[28rem]">
            <Banner status="warning">
              <IconCircleWarningFill18 />
              <BannerTitle>Plan limit reached</BannerTitle>
              <BannerDescription>
                Remove an inactive machine before adding another.
              </BannerDescription>
              <BannerAction align="top">
                <Button size="icon-xs" aria-label="Dismiss">
                  <X />
                </Button>
              </BannerAction>
            </Banner>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={PROPS} />
          <PropsTable rows={PART_PROPS} />
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Iconless warning",
              status: "difference",
              note: "Visual output matches. Source intent maps to current status, and body content moves into BannerDescription.",
              source: (
                <LegacyBanner intent="warning">Please fix the highlighted fields.</LegacyBanner>
              ),
              brutal: (
                <Banner status="warning" className="w-fit max-w-full">
                  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
                </Banner>
              ),
              elegant: (
                <Banner status="warning" className="w-fit max-w-full">
                  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
                </Banner>
              ),
              elegantDark: (
                <Banner status="warning" className="w-fit max-w-full">
                  <BannerDescription>Please fix the highlighted fields.</BannerDescription>
                </Banner>
              ),
            },
            {
              label: "Icon + title",
              status: "difference",
              note: "The conventional source withIcon/title props are now a direct icon child and BannerTitle slot.",
              source: (
                <LegacyBanner intent="destructive" withIcon title="Delete server">
                  This can&rsquo;t be undone.
                </LegacyBanner>
              ),
              brutal: (
                <Banner status="destructive" className="w-fit max-w-full">
                  <IconCircleXmarkFill18 />
                  <BannerTitle>Delete server</BannerTitle>
                  <BannerDescription>This can&rsquo;t be undone.</BannerDescription>
                </Banner>
              ),
              elegant: (
                <Banner status="destructive" className="w-fit max-w-full">
                  <IconCircleXmarkFill18 />
                  <BannerTitle>Delete server</BannerTitle>
                  <BannerDescription>This can&rsquo;t be undone.</BannerDescription>
                </Banner>
              ),
              elegantDark: (
                <Banner status="destructive" className="w-fit max-w-full">
                  <IconCircleXmarkFill18 />
                  <BannerTitle>Delete server</BannerTitle>
                  <BannerDescription>This can&rsquo;t be undone.</BannerDescription>
                </Banner>
              ),
            },
            {
              label: "Large + actions",
              status: "difference",
              note: 'Source density="lg" maps to size="lg". The action slot is now composed as BannerAction.',
              source: (
                <LegacyBanner intent="info" density="lg" withIcon actions={<DismissIconButton />}>
                  You&rsquo;re on the free plan.
                </LegacyBanner>
              ),
              brutal: (
                <Banner status="info" size="lg" className="w-fit max-w-full">
                  <IconCircleInfoFill18 />
                  <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
                  <BannerAction>
                    <Button size="icon-xs" aria-label="Dismiss">
                      <X />
                    </Button>
                  </BannerAction>
                </Banner>
              ),
              elegant: (
                <Banner status="info" size="lg" className="w-fit max-w-full">
                  <IconCircleInfoFill18 />
                  <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
                  <BannerAction>
                    <Button size="icon-xs" aria-label="Dismiss">
                      <X />
                    </Button>
                  </BannerAction>
                </Banner>
              ),
              elegantDark: (
                <Banner status="info" size="lg" className="w-fit max-w-full">
                  <IconCircleInfoFill18 />
                  <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
                  <BannerAction>
                    <Button size="icon-xs" aria-label="Dismiss">
                      <X />
                    </Button>
                  </BannerAction>
                </Banner>
              ),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
