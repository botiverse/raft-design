import { createFileRoute } from "@tanstack/react-router";
import type { DrawerProps } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { DrawerNestedCloseCallbackComposition } from "#/modules/drawer/compositions/nested-close-callback.composition.tsx";
import nestedCloseCallbackCompositionSource from "#/modules/drawer/compositions/nested-close-callback.composition.tsx?raw";
import pwaInstallDrawerSource from "#/modules/drawer/compositions/pwa-install-drawer-base.tsx?raw";
import { DrawerResponsivePlacementComposition } from "#/modules/drawer/compositions/responsive-placement.composition.tsx";
import responsivePlacementCompositionSource from "#/modules/drawer/compositions/responsive-placement.composition.tsx?raw";
import { DrawerSnapPointsComposition } from "#/modules/drawer/compositions/snap-points.composition.tsx";
import snapPointsCompositionSource from "#/modules/drawer/compositions/snap-points.composition.tsx?raw";
import memberDetailsDrawerSource from "#/modules/drawer/compositions/workspace-settings/member-details-drawer.tsx?raw";
import removeMemberDrawerSource from "#/modules/drawer/compositions/workspace-settings/remove-member-drawer.tsx?raw";
import workspaceSettingsDrawerSource from "#/modules/drawer/compositions/workspace-settings/workspace-settings-drawer.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { DrawerPreview, DrawerSideFullWidthUsage } from "#/modules/drawer/drawer.preview.tsx";

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

const ANATOMY = `<Drawer>
  <DrawerTrigger />
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle />
    </DrawerHeader>
    <DrawerBody>
      <DrawerDescription />
    </DrawerBody>
    <DrawerFooter>
      <DrawerActions>
        <DrawerClose />
      </DrawerActions>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

const LEAVE_CHANNEL = `import {
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
  <DrawerContent className="max-md:right-3 max-md:w-auto max-md:max-w-none">
    <DrawerHeader>
      <DrawerTitle>Filters</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody className="min-h-0 overflow-y-auto overscroll-contain">
      <DrawerDescription>
        On small screens the panel spans the floating inset. From md up it keeps the default
        narrow side width. Scroll the body to verify long content.
      </DrawerDescription>
      <div className="mt-6 w-full space-y-4 text-left text-sm leading-6 text-foreground-strong/70">
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
  <div className="mx-auto max-w-md border-2 border-black bg-white shadow-xl">
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
  leaveChannel: LEAVE_CHANNEL,
  listenNestedCloseComposition: nestedCloseCallbackCompositionSource,
  listenNestedCloseMemberDetails: memberDetailsDrawerSource,
  listenNestedCloseRemoveMember: removeMemberDrawerSource,
  listenNestedCloseWorkspaceSettings: workspaceSettingsDrawerSource,
  pwaInstall: pwaInstallDrawerSource,
  sourceAdaptive: SOURCE_ADAPTIVE,
  sourceAdaptiveOther: SOURCE_ADAPTIVE_OTHER,
  sourceDrawer: SOURCE_DRAWER,
  usageResponsivePlacement: responsivePlacementCompositionSource,
  usageSideFullWidth: USAGE_SIDE_FULL_WIDTH,
  usageSnapPoints: snapPointsCompositionSource,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "open / defaultOpen",
    type: "boolean",
    default: "— / false",
    description:
      "Controlled open state, or uncontrolled initial open state. Pair open with onOpenChange.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean, eventDetails) => void",
    description: "Fires on trigger, close, Escape, outside press, or swipe dismissal.",
  },
  {
    name: "onOpenChangeComplete",
    type: "(open: boolean) => void",
    description:
      "Fires after the opening or closing transition completes. Attach it to a nested Drawer and check for open === false to observe that layer closing.",
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
    name: "snapPoints",
    type: "Array<number | string>",
    description:
      "Preset heights for vertical drawers. Fractions use viewport height, values greater than 1 use pixels, and strings support px or rem.",
  },
  {
    name: "defaultSnapPoint",
    type: "number | string | null",
    description: "Initial snap point for an uncontrolled drawer.",
  },
  {
    name: "snapPoint / onSnapPointChange",
    type: "number | string | null / (snapPoint) => void",
    description: "Controlled snap-point state and its change callback.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "portalProps",
    type: "DrawerPortalProps",
    description: "Pass the Base UI portal container, keepMounted state, or portal element props.",
  },
  {
    name: "...props",
    type: "Base UI Drawer.Popup.Props",
    description:
      "Portal-backed surface that composes the backdrop, viewport, popup, and selectable content region.",
  },
];

const BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Main content area between header and footer.",
  },
];

const ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
      src={`/iframe/drawer?${params.toString()}`}
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
        <Preview>
          <Preview.Canvas>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {DIRECTION_PREVIEWS.map(({ label, swipeDirection }) => (
                <DrawerPreview key={label} swipeDirection={swipeDirection} triggerLabel={label} />
              ))}
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.leaveChannel} collapsedHtml={code.leaveChannelBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel path="drawer" source={ANATOMY} html={code.anatomy} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="snap-points" title="Snap points">
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Snap points apply to vertical drawers. Compare separate bottom and top notifications;
              each expands from an 8rem summary to a 24rem detail view.
            </p>
            <Preview>
              <Preview.Canvas>
                <div className="flex justify-center">
                  <DrawerSnapPointsComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.usageSnapPoints} collapsedHtml={code.usageSnapPointsBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="nested-close-callbacks"
            title="Nested close callbacks"
          >
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Each nested drawer owns its close callback; removing a member closes the confirmation
              and details layers together.
            </p>
            <Preview>
              <Preview.Canvas>
                <div className="flex justify-center">
                  <DrawerNestedCloseCallbackComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <DocsCodeBlock.Files
                    collapsible={false}
                    files={[
                      {
                        path: "nested-close-callback.composition.tsx",
                        source: nestedCloseCallbackCompositionSource,
                        html: code.listenNestedCloseComposition,
                        collapsedHtml: code.listenNestedCloseCompositionBody,
                      },
                      {
                        path: "workspace-settings/workspace-settings-drawer.tsx",
                        source: workspaceSettingsDrawerSource,
                        html: code.listenNestedCloseWorkspaceSettings,
                        collapsedHtml: code.listenNestedCloseWorkspaceSettingsBody,
                      },
                      {
                        path: "workspace-settings/member-details-drawer.tsx",
                        source: memberDetailsDrawerSource,
                        html: code.listenNestedCloseMemberDetails,
                        collapsedHtml: code.listenNestedCloseMemberDetailsBody,
                      },
                      {
                        path: "workspace-settings/remove-member-drawer.tsx",
                        source: removeMemberDrawerSource,
                        html: code.listenNestedCloseRemoveMember,
                        collapsedHtml: code.listenNestedCloseRemoveMemberBody,
                      },
                    ]}
                  />
                }
              />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="full-width-side-drawer"
            title="Full-width side drawer"
          >
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Override <code className="font-mono text-[0.8125rem]">DrawerContent</code> on small
              screens to span the floating inset.
            </p>
            <Preview>
              <Preview.Canvas>
                <div className="flex justify-center">
                  <DrawerSideFullWidthUsage />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.usageSideFullWidth}
                collapsedHtml={code.usageSideFullWidthBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="responsive-placement" title="Responsive placement">
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Switch <code className="font-mono text-[0.8125rem]">swipeDirection</code> at md:
              bottom on mobile, right on desktop.
            </p>
            <Preview>
              <Preview.Canvas>
                <div className="flex justify-center">
                  <DrawerResponsivePlacementComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.usageResponsivePlacement}
                collapsedHtml={code.usageResponsivePlacementBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Drawer">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="DrawerContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-body" title="DrawerBody">
            <PropsTable rows={BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-actions" title="DrawerActions">
            <PropsTable rows={ACTIONS_PROPS} />
          </DocSubsection>
        </div>
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
              compositionCollapsedCode: code.pwaInstallBody,
              compositionPath:
                "apps/doc/src/modules/drawer/compositions/pwa-install-drawer-base.tsx",
              compositionSource: pwaInstallDrawerSource,
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
              currentCode: code.pwaInstall,
              compositionCode: code.pwaInstall,
              compositionCollapsedCode: code.pwaInstallBody,
              compositionPath:
                "apps/doc/src/modules/drawer/compositions/pwa-install-drawer-base.tsx",
              compositionSource: pwaInstallDrawerSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
