import { createFileRoute } from "@tanstack/react-router";
import { InlineCode, type DrawerProps } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
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

<Drawer>
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

const SNIPPETS = {
  anatomy: ANATOMY,
  leaveChannel: LEAVE_CHANNEL,
  listenNestedCloseComposition: nestedCloseCallbackCompositionSource,
  listenNestedCloseMemberDetails: memberDetailsDrawerSource,
  listenNestedCloseRemoveMember: removeMemberDrawerSource,
  listenNestedCloseWorkspaceSettings: workspaceSettingsDrawerSource,
  pwaInstall: pwaInstallDrawerSource,
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
              Override <InlineCode>DrawerContent</InlineCode> on small screens to span the floating
              inset.
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
              Switch <InlineCode>swipeDirection</InlineCode> at <InlineCode>md</InlineCode>: bottom
              on mobile, right on desktop.
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
    </DocPage>
  );
}
