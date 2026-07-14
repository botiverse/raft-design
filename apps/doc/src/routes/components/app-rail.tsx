import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { AppRailComposition } from "#/modules/app-rail/app-rail.composition.tsx";
import appRailCompositionSource from "#/modules/app-rail/app-rail.composition.tsx?raw";
import { SourceAppRailPreview } from "#/modules/app-rail/app-rail.source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const APP_RAIL_COMPOSITION_PATH = "apps/doc/src/modules/app-rail/app-rail.composition.tsx";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  appRailComposition: appRailCompositionSource,
  anatomy: `<AppShellRail>
  <AppRailRoot>
    <AppRailHeader>
      <AppRailServerButton />
    </AppRailHeader>
    <TooltipProvider>
      <AppRailNav>
        <Tooltip>
          <TooltipTrigger>
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
</AppShellRail>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellRail",
    type: 'useRender.ComponentProps<"aside">',
    description:
      "Desktop rail column by default. Override with className when composing a mobile bottom-navigation row.",
  },
  {
    name: "AppRailRoot",
    type: "{ value?: string; onValueChange?: (value: string) => void }",
    description: "Optional controlled selection context. Routing and tab memory stay app-owned.",
  },
  {
    name: "AppRailHeader / Nav / Footer",
    type: "div / nav props",
    description:
      "Composable regions. Apps may render separate desktop and mobile Nav compositions inside one controlled Root.",
  },
  {
    name: "AppRailItem*",
    type: "button + span props",
    description: "Composable icon, label, badge, and indicator parts for app-owned rail actions.",
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
      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
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
