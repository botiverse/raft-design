import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import notificationPermissionsCompositionSource from "#/modules/card/compositions/notification-permissions.composition.tsx?raw";
import { CardNotificationPermissionsComposition } from "#/modules/card/compositions/notification-permissions.composition.tsx";
import projectSummaryCompositionSource from "#/modules/card/compositions/project-summary.composition.tsx?raw";
import { CardProjectSummaryComposition } from "#/modules/card/compositions/project-summary.composition.tsx";
import sessionActionCompositionSource from "#/modules/card/compositions/session-action.composition.tsx?raw";
import { CardSessionActionComposition } from "#/modules/card/compositions/session-action.composition.tsx";
import settingsSectionCompositionSource from "#/modules/card/compositions/settings-section.composition.tsx?raw";
import { CardSettingsSectionComposition } from "#/modules/card/compositions/settings-section.composition.tsx";
import workspaceModeCompositionSource from "#/modules/card/compositions/workspace-mode.composition.tsx?raw";
import { CardWorkspaceModeComposition } from "#/modules/card/compositions/workspace-mode.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<Card>
  <CardHeader>
    <CardTitle />
    <CardDescription />
    <CardAction />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  NotificationPermissions: notificationPermissionsCompositionSource,
  Preview: projectSummaryCompositionSource,
  SessionAction: sessionActionCompositionSource,
  SettingsSection: settingsSectionCompositionSource,
  WorkspaceMode: workspaceModeCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  NotificationPermissions: "cardNotificationPermissionsComposition",
  Preview: "cardProjectSummaryComposition",
  SessionAction: "cardSessionActionComposition",
  SettingsSection: "cardSettingsSectionComposition",
  WorkspaceMode: "cardWorkspaceModeComposition",
});

const CARD_PARTS: readonly PropRow[] = [
  {
    name: "Card",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Visual surface root for caller-owned content. Keep semantic boundaries such as forms as children.",
  },
  {
    name: "CardHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Top region for identity, title, description, and an optional CardAction.",
  },
  {
    name: "CardTitle",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Primary card heading. Use render to choose the heading level for the page context.",
  },
  {
    name: "CardDescription",
    type: 'useRender.ComponentProps<"div">',
    description: "Supporting copy associated with CardTitle, typically inside CardHeader.",
  },
  {
    name: "CardAction",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing header region for a caller-owned status or functional action.",
  },
  {
    name: "CardContent",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Main content region. Forms, lists, and product sections remain explicit children.",
  },
  {
    name: "CardFooter",
    type: 'useRender.ComponentProps<"div">',
    description: "Bottom region for metadata or functional card-level actions.",
  },
];

export const Route = createFileRoute("/components/card")({
  component: CardDoc,
  loader: () =>
    highlightSnippets({
      data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS },
    }),
});

function CardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Card"
      description="A composable surface with optional header, content, action, and footer regions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <CardProjectSummaryComposition />
          </Preview.Canvas>
          <Preview.Code
            html={code.cardProjectSummaryComposition}
            collapsedHtml={code.cardProjectSummaryCompositionBody}
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

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection
            parentId="usage"
            id="notification-permissions"
            title="Notification permissions"
          >
            <p>Place the current status in CardAction and permission controls in CardContent.</p>
            <Preview>
              <Preview.Canvas>
                <CardNotificationPermissionsComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardNotificationPermissionsComposition}
                collapsedHtml={code.cardNotificationPermissionsCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="workspace-mode" title="Workspace mode">
            <p>
              Use CardContent alone for a compact preference whose label supplies its hierarchy.
            </p>
            <Preview>
              <Preview.Canvas>
                <CardWorkspaceModeComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardWorkspaceModeComposition}
                collapsedHtml={code.cardWorkspaceModeCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="session-action" title="Session action">
            <p>Separate explanatory content from a consequential action in CardFooter.</p>
            <Preview>
              <Preview.Canvas>
                <CardSessionActionComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardSessionActionComposition}
                collapsedHtml={code.cardSessionActionCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="settings-section" title="Account settings">
            <p>
              Keep the section label outside the surface, then compose identity, forms, related
              settings, and actions through the card parts. The form remains a semantic child of
              CardContent.
            </p>
            <Preview>
              <Preview.Canvas>
                <CardSettingsSectionComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardSettingsSectionComposition}
                collapsedHtml={code.cardSettingsSectionCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <DocSubsection parentId="api" id="api-parts" title="Parts">
          <PropsTable rows={CARD_PARTS} nameColumnLabel="Part" />
        </DocSubsection>
      </DocSection>
    </DocPage>
  );
}
