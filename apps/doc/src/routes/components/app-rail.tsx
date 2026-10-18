import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { AppRailComposition } from "#/modules/app-rail/app-rail.composition.tsx";
import appRailCompositionSource from "#/modules/app-rail/app-rail.composition.tsx?raw";
import appRailServerButtonSource from "#/modules/app-rail/app-rail-server-button.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import type { HighlightedSnippets } from "#/lib/highlight.tsx";

const APP_RAIL_COMPOSITION_PATH = "apps/doc/src/modules/app-rail/app-rail.composition.tsx";
const APP_RAIL_SERVER_BUTTON_PATH = "apps/doc/src/modules/app-rail/app-rail-server-button.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  appRailComposition: appRailCompositionSource,
  appRailServerButton: appRailServerButtonSource,
  anatomy: `import { Link } from "@tanstack/react-router";
import { MessageSquare, Settings } from "lucide-react";
import {
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemAttention,
  AppRailItemBadge,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppShellRailSlot,
  NotificationCenter,
  NotificationCenterTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";

<AppShellRailSlot>
  <AppRailRoot>
    <AppRailHeader>
      {/* App-owned server switcher */}
    </AppRailHeader>
    <TooltipProvider>
      <AppRailNav>
        <Tooltip>
          <TooltipTrigger
            render={
              <AppRailItem
                selected
                nativeButton={false}
                render={<Link to="/chat" />}
              />
            }
          >
            <AppRailItemIcon>
              <MessageSquare />
              <AppRailItemAttention title="Unread activity" />
            </AppRailItemIcon>
            <AppRailItemLabel>Chat</AppRailItemLabel>
            <AppRailItemBadge>3</AppRailItemBadge>
          </TooltipTrigger>
          <TooltipContent side="right">Chat</TooltipContent>
        </Tooltip>
      </AppRailNav>
      <AppRailFooter>
        <NotificationCenter>
          <NotificationCenterTrigger type="button" aria-label="Notification center" />
        </NotificationCenter>
        <Tooltip>
          <TooltipTrigger
            render={
              <AppRailItem
                nativeButton={false}
                render={<button type="button" />}
              />
            }
          >
            <AppRailItemIcon>
              <Settings />
            </AppRailItemIcon>
            <AppRailItemLabel>Settings</AppRailItemLabel>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </AppRailFooter>
    </TooltipProvider>
  </AppRailRoot>
</AppShellRailSlot>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Layout root for header, nav, and footer regions. Owns no selection state.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Top region for an app-owned server switcher or equivalent identity control.",
  },
];

const NAV_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"nav">',
    description:
      "Primary destinations region. Mount separate desktop and mobile Nav compositions when needed; visibility stays caller-owned.",
  },
];

const FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Bottom region for footer actions such as notifications and settings.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description:
      "Marks the item as selected. Sets data-selected and aria-pressed when nativeButton is true. Owned by the caller.",
  },
  {
    name: "nativeButton",
    type: "boolean",
    default: "true",
    description:
      "When false, skip native button type/disabled/aria-pressed wiring so render can replace the host element (for example a router Link).",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Button attributes plus render. Compose icon, label, badge, and attention parts as children.",
  },
];

const ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Square icon slot. Place the glyph and an optional AppRailItemAttention here.",
  },
];

const ITEM_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Visible or assistive label for the item.",
  },
];

const ITEM_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional unread or count badge beside the icon.",
  },
];

const ITEM_ATTENTION_PROPS: readonly PropRow[] = [
  {
    name: "title",
    type: "string",
    description:
      "Optional label read to assistive tech. Renders the pink AppRailItemIndicator pixel, which stays decorative; takes no children.",
  },
];

const ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Status props",
    description:
      "Decorative status pixel at the icon's top-right corner. Defaults to the accent (pink) variant at sm; usually rendered by AppRailItemAttention. It never animates.",
  },
];

export const Route = createFileRoute("/components/app-rail")({
  component: AppRailDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AppRailDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AppRail"
      description="Composable rail structure for server switching, destinations, unread attention, and footer actions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewInset="flush">
          <Preview.Canvas>
            <div className="h-[586px] overflow-hidden border border-line-seam bg-layer-canvas p-2">
              <PreviewThemeScope className="flex h-full items-stretch justify-start bg-layer-sidebar">
                <AppRailComposition />
              </PreviewThemeScope>
            </div>
          </Preview.Canvas>
          <Preview.Code codeBlock={<AppRailSourceFiles code={code} collapsible={false} />} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="AppRailRoot">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header" title="AppRailHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-nav" title="AppRailNav">
            <PropsTable rows={NAV_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-footer" title="AppRailFooter">
            <PropsTable rows={FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item" title="AppRailItem">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-icon" title="AppRailItemIcon">
            <PropsTable rows={ITEM_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-label" title="AppRailItemLabel">
            <PropsTable rows={ITEM_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-badge" title="AppRailItemBadge">
            <PropsTable rows={ITEM_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-attention" title="AppRailItemAttention">
            <PropsTable rows={ITEM_ATTENTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-indicator" title="AppRailItemIndicator">
            <PropsTable rows={ITEM_INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}

/** Composition plus the app-owned server-switcher chrome it renders in the rail header. */
function AppRailSourceFiles({
  code,
  collapsible = true,
}: {
  code: HighlightedSnippets;
  collapsible?: boolean;
}) {
  const files = useMemo(
    () => [
      {
        path: APP_RAIL_COMPOSITION_PATH,
        source: appRailCompositionSource,
        html: code.appRailComposition,
        collapsedHtml: code.appRailCompositionBody,
      },
      {
        path: APP_RAIL_SERVER_BUTTON_PATH,
        source: appRailServerButtonSource,
        html: code.appRailServerButton,
        collapsedHtml: code.appRailServerButtonBody,
      },
    ],
    [code],
  );
  return <DocsCodeBlock.Files collapsible={collapsible} showLineNumbers={false} files={files} />;
}
