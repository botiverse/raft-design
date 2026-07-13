import { createFileRoute } from "@tanstack/react-router";
import type { DrawerProps } from "raft-ui";

import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { Example } from "#/components/example.tsx";
import pwaInstallCompositionSource from "#/compositions/drawer/pwa-install-drawer-composition.tsx?raw";
import pwaInstallOtherCompositionSource from "#/compositions/drawer/pwa-install-other-drawer-composition.tsx?raw";
import { DrawerResponsivePlacementComposition } from "#/compositions/drawer/responsive-placement-composition.tsx";
import responsivePlacementCompositionSource from "#/compositions/drawer/responsive-placement-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { DrawerPreview, DrawerSideFullWidthUsage } from "./-drawer.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const DIRECTION_PREVIEWS = [
  { label: "Bottom", swipeDirection: "down" },
  { label: "Top", swipeDirection: "up" },
  { label: "Left", swipeDirection: "left" },
  { label: "Right", swipeDirection: "right" },
] as const satisfies ReadonlyArray<{
  label: string;
  swipeDirection: NonNullable<DrawerProps["swipeDirection"]>;
}>;

const ANATOMY = `import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerActions,
  DrawerClose,
  Button,
} from "raft-ui";

<Drawer>
  <DrawerTrigger render={<Button variant="primary" />}>Open drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Leave channel?</DrawerTitle>
    </DrawerHeader>
    <DrawerBody>
      <DrawerDescription>You can rejoin anytime from the directory.</DrawerDescription>
    </DrawerBody>
    <DrawerFooter>
      <DrawerActions>
        <DrawerClose render={<Button variant="danger" />}>Leave</DrawerClose>
        <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
      </DrawerActions>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

const USAGE_SIDE_FULL_WIDTH = `import {
  Button,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "raft-ui";

<Drawer swipeDirection="left">
  <DrawerTrigger render={<Button variant="primary" />}>Open side drawer</DrawerTrigger>
  <DrawerContent className="max-md:data-[swipe-direction=left]:right-3 max-md:data-[swipe-direction=left]:w-auto max-md:data-[swipe-direction=left]:max-w-none">
    <DrawerHeader>
      <DrawerTitle>Filters</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody className="min-h-0 overflow-y-auto overscroll-contain">
      <DrawerDescription>
        On small screens the panel spans the floating inset. From md up it keeps the default
        narrow side width. Scroll the body to verify long content.
      </DrawerDescription>
      <div className="mt-6 w-full space-y-4 text-left text-sm leading-6 text-foreground/70">
        {/* long lorem paragraphs */}
      </div>
    </DrawerBody>
    <DrawerFooter>
      <DrawerActions>
        <DrawerClose render={<Button variant="primary" />}>Apply</DrawerClose>
        <DrawerClose render={<Button variant="outline" />}>Reset</DrawerClose>
      </DrawerActions>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

const SOURCE_DRAWER = `<div className="fixed inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
  <div className="mx-auto max-w-md border-2 border-black bg-white shadow-brutal-lg">
    ...
  </div>
</div>`;

const SOURCE_ADAPTIVE = `<BottomSheet className="md:hidden" sheetClassName="p-4">
  <div className="mb-3 flex items-start justify-between gap-3">
    <div>
      <div className="text-lg font-black leading-tight text-black">
        Add Raft to your Home Screen
      </div>
      <div className="mt-1 text-sm text-black/60">
        Open Raft as a fullscreen app — faster, more focused.
      </div>
    </div>
    <button type="button" aria-label="Close install instructions">...</button>
  </div>
  <div className="border-2 border-black bg-brutal-cream p-2">...</div>
</BottomSheet>`;

const SOURCE_ADAPTIVE_OTHER = `<BottomSheet className="md:hidden" sheetClassName="p-4">
  <div className="mb-3 flex items-start justify-between gap-3">...</div>
  <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
    Open this page in Safari, then use Share → Add to Home Screen.
  </div>
  <div className="mt-4 flex gap-2">...</div>
</BottomSheet>`;

const SNIPPETS = {
  anatomy: ANATOMY,
  leaveChannel: ANATOMY,
  pwaInstall: pwaInstallCompositionSource,
  pwaInstallOther: pwaInstallOtherCompositionSource,
  sourceAdaptive: SOURCE_ADAPTIVE,
  sourceAdaptiveOther: SOURCE_ADAPTIVE_OTHER,
  sourceDrawer: SOURCE_DRAWER,
  usageResponsivePlacement: responsivePlacementCompositionSource,
  usageSideFullWidth: USAGE_SIDE_FULL_WIDTH,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state. Pair with onOpenChange.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Uncontrolled initial open state.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean, eventDetails) => void",
    description: "Fires on trigger, close, Escape, outside press, or swipe dismissal.",
  },
  {
    name: "modal",
    type: 'boolean | "trap-focus"',
    default: "true",
    description:
      'Controls outside interaction. Use "trap-focus" to contain focus without making the rest of the page inert.',
  },
  {
    name: "swipeDirection",
    type: '"down" | "up" | "left" | "right"',
    default: '"down"',
    description: "Direction the drawer follows and can be swiped to dismiss.",
  },
  {
    name: "DrawerContent",
    type: "Base UI Drawer.Popup.Props",
    description:
      "Portal-backed surface that composes the backdrop, viewport, popup, and selectable content region.",
  },
  {
    name: "DrawerContent.portalProps",
    type: "DrawerPortalProps",
    description: "Pass the Base UI portal container, keepMounted state, or portal element props.",
  },
  {
    name: "DrawerBody",
    type: 'ComponentPropsWithRef<"div">',
    description: "Main content area between header and footer.",
  },
  {
    name: "DrawerActions",
    type: 'ComponentPropsWithRef<"div">',
    description: "Width-aware action cluster for one or more actions.",
  },
];

type DrawerScene = "leave-channel" | "pwa-install" | "pwa-install-other";
type DrawerViewport = "desktop" | "mobile";

function DrawerComparisonIframe({
  mode = "light",
  scene,
  theme = "brutal",
  variant,
  viewport = "mobile",
}: {
  mode?: "dark" | "light";
  scene: DrawerScene;
  theme?: "brutal" | "elegant";
  variant: "current" | "source";
  viewport?: DrawerViewport;
}) {
  const instance = [scene, variant, viewport, theme, mode].join("-");
  const params = new URLSearchParams({ instance, mode, scene, theme, variant, viewport });
  const height = viewport === "desktop" ? "h-[27rem]" : "h-[45rem]";

  return (
    <iframe
      key={instance}
      data-drawer-comparison-frame={`${scene}-${variant}-${theme}-${mode}-${viewport}`}
      title={`${scene} ${variant} ${theme} ${mode} ${viewport}`}
      src={`/previews/drawer?${params.toString()}`}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
      className={`block w-full border-0 bg-transparent ${height}`}
    />
  );
}

export const Route = createFileRoute("/components/drawer")({
  component: DrawerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function DrawerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Drawer"
      description="A swipeable Base UI drawer that can enter from any edge while preserving the active theme frame."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentDemoFrame>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DIRECTION_PREVIEWS.map(({ label, swipeDirection }) => (
              <DrawerPreview key={label} swipeDirection={swipeDirection} triggerLabel={label} />
            ))}
          </div>
        </ComponentDemoFrame>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="drawer"
          source={ANATOMY}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">
              Mobile full-width side drawer
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Override <code className="font-mono text-[0.8125rem]">DrawerContent</code> width on
              small screens so the panel spans the floating inset while keeping the default narrow
              side panel from <code className="font-mono text-[0.8125rem]">md</code> up.
            </p>
            <Example html={code.usageSideFullWidth}>
              <div className="flex justify-center">
                <DrawerSideFullWidthUsage />
              </div>
            </Example>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Responsive placement</h3>
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Drive <code className="font-mono text-[0.8125rem]">swipeDirection</code> from{" "}
              <code className="font-mono text-[0.8125rem]">foxact/use-media-query</code> so desktop
              keeps a right edge panel while mobile switches to a bottom sheet. Update the direction
              in place so an open drawer stays open across the breakpoint.
            </p>
            <Example html={code.usageResponsivePlacement}>
              <div className="flex justify-center">
                <DrawerResponsivePlacementComposition />
              </div>
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Leave channel mobile",
              status: "difference",
              note: "Current keeps the established mobile frame while Base UI owns focus, dismissal, and swipe behavior.",
              source: <DrawerComparisonIframe scene="leave-channel" variant="source" />,
              brutal: <DrawerComparisonIframe scene="leave-channel" variant="current" />,
              elegant: (
                <DrawerComparisonIframe scene="leave-channel" variant="current" theme="elegant" />
              ),
              elegantDark: (
                <DrawerComparisonIframe
                  scene="leave-channel"
                  variant="current"
                  theme="elegant"
                  mode="dark"
                />
              ),
              sourceCode: code.sourceDrawer,
              currentCode: code.leaveChannel,
            },
            {
              label: "Leave channel desktop",
              status: "difference",
              note: "Desktop retains the narrow centered panel and themed frame.",
              source: (
                <DrawerComparisonIframe scene="leave-channel" variant="source" viewport="desktop" />
              ),
              brutal: (
                <DrawerComparisonIframe
                  scene="leave-channel"
                  variant="current"
                  viewport="desktop"
                />
              ),
              elegant: (
                <DrawerComparisonIframe
                  scene="leave-channel"
                  variant="current"
                  viewport="desktop"
                  theme="elegant"
                />
              ),
              elegantDark: (
                <DrawerComparisonIframe
                  scene="leave-channel"
                  variant="current"
                  viewport="desktop"
                  theme="elegant"
                  mode="dark"
                />
              ),
              sourceCode: code.sourceDrawer,
              currentCode: code.leaveChannel,
            },
            {
              label: "PWA install mobile",
              status: "difference",
              note: "The executable composition owns the mobile media query and unmounts the Drawer when the viewport leaves mobile, preventing an invisible modal lock.",
              source: <DrawerComparisonIframe scene="pwa-install" variant="source" />,
              brutal: <DrawerComparisonIframe scene="pwa-install" variant="current" />,
              elegant: (
                <DrawerComparisonIframe scene="pwa-install" variant="current" theme="elegant" />
              ),
              elegantDark: (
                <DrawerComparisonIframe
                  scene="pwa-install"
                  variant="current"
                  theme="elegant"
                  mode="dark"
                />
              ),
              sourceCode: code.sourceAdaptive,
              currentCode: code.pwaInstall,
              compositionCode: code.pwaInstall,
              compositionPath:
                "apps/doc/src/compositions/drawer/pwa-install-drawer-composition.tsx",
              compositionSource: pwaInstallCompositionSource,
            },
            {
              label: "PWA install non-Safari mobile",
              status: "difference",
              note: "The alternate branch reuses the same executable Drawer behavior and only changes caller-owned content and actions.",
              source: <DrawerComparisonIframe scene="pwa-install-other" variant="source" />,
              brutal: <DrawerComparisonIframe scene="pwa-install-other" variant="current" />,
              elegant: (
                <DrawerComparisonIframe
                  scene="pwa-install-other"
                  variant="current"
                  theme="elegant"
                />
              ),
              elegantDark: (
                <DrawerComparisonIframe
                  scene="pwa-install-other"
                  variant="current"
                  theme="elegant"
                  mode="dark"
                />
              ),
              sourceCode: code.sourceAdaptiveOther,
              currentCode: code.pwaInstallOther,
              compositionCode: code.pwaInstallOther,
              compositionPath:
                "apps/doc/src/compositions/drawer/pwa-install-other-drawer-composition.tsx",
              compositionSource: pwaInstallOtherCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
