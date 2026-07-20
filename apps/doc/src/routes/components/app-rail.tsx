import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { AppRailComposition } from "#/modules/app-rail/app-rail.composition.tsx";
import appRailCompositionSource from "#/modules/app-rail/app-rail.composition.tsx?raw";
import { SourceAppRailPreview } from "#/modules/app-rail/app-rail.source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const APP_RAIL_COMPOSITION_PATH = "apps/doc/src/modules/app-rail/app-rail.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  appRailComposition: appRailCompositionSource,
  anatomy: `<AppShellRailSlot>
  <AppRailRoot>
    <AppRailHeader>
      {/* App-owned server switcher */}
    </AppRailHeader>
    <TooltipProvider>
      <AppRailNav>
        <Tooltip>
          <TooltipTrigger
            render={<AppRailItem nativeButton={false} render={<Link to="/chat" />} />}
          >
            <AppRailItemIcon>
              <AppRailItemAttention />
            </AppRailItemIcon>
            <AppRailItemLabel />
            <AppRailItemBadge />
          </TooltipTrigger>
          <TooltipContent />
        </Tooltip>
      </AppRailNav>
      <AppRailFooter>
        <Tooltip>
          <TooltipTrigger>
            <AppRailItemIcon />
            <AppRailItemLabel />
          </TooltipTrigger>
          <TooltipContent />
        </Tooltip>
      </AppRailFooter>
      <AppRailNav>
        {/* App-owned mobile destinations */}
      </AppRailNav>
    </TooltipProvider>
  </AppRailRoot>
</AppShellRailSlot>`,
} as const;

const SHELL_PROPS: readonly PropRow[] = [
  {
    name: "AppShellRailSlot",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop rail column by default. Override with className when composing a mobile bottom-navigation row.",
  },
];

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "AppRailRoot",
    type: "{ value?: string; onValueChange?: (value: string) => void }",
    description: "Optional controlled selection context. Routing and tab memory stay app-owned.",
  },
];

const REGION_PROPS: readonly PropRow[] = [
  {
    name: "AppRailHeader / Nav / Footer",
    type: "div / nav props",
    description:
      "Composable regions. Header is a layout slot for an app-owned server switcher; apps may also render separate desktop and mobile Nav compositions inside one controlled Root.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "AppRailItem*",
    type: "button + span props; nativeButton?: boolean",
    description:
      "Composable icon, label, badge, and indicator parts for app-owned rail actions. Set nativeButton={false} when render replaces the native button.",
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
      description="Controlled rail structure for server switching, app mode navigation, unread badges, and footer actions."
      overview={
        <Differences from="LeftRail">
          <li>
            does not import stores, router memory, server unread summaries, or notification wiring
          </li>
          <li>
            keeps the source rail geometry: yellow column, 64px desktop width, square icon slots
          </li>
          <li>
            selection is optional controlled state; app code decides where each value navigates
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewInset="flush">
          <Preview.Canvas>
            <div className="h-[586px] overflow-hidden border border-line bg-layer-panel p-2">
              <PreviewThemeScope className="flex h-full items-stretch justify-start bg-layer-page">
                <AppRailComposition />
              </PreviewThemeScope>
            </div>
          </Preview.Canvas>
          <Preview.Code
            html={code.appRailComposition}
            collapsedHtml={code.appRailCompositionBody}
          />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-shell-slot" title="Shell slot">
            <PropsTable rows={SHELL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-root" title="AppRail root">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-regions" title="Regions">
            <PropsTable rows={REGION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-items" title="Items">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceAppRailPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <AppRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <AppRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <AppRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path={APP_RAIL_COMPOSITION_PATH}
          source={appRailCompositionSource}
          html={code.appRailComposition}
          collapsedHtml={code.appRailCompositionBody}
          showLineNumbers={false}
        />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[586px] items-stretch justify-start overflow-hidden bg-white p-2">
        {children}
      </div>
    </div>
  );
}
