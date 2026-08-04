import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import denseSettingsCompositionSource from "#/modules/card/compositions/dense-settings.composition.tsx?raw";
import { CardDenseSettingsComposition } from "#/modules/card/compositions/dense-settings.composition.tsx";
import appNotificationsCompositionSource from "#/modules/card/compositions/app-notifications.composition.tsx?raw";
import { CardAppNotificationsComposition } from "#/modules/card/compositions/app-notifications.composition.tsx";
import notificationPermissionsCompositionSource from "#/modules/card/compositions/notification-permissions.composition.tsx?raw";
import { CardNotificationPermissionsComposition } from "#/modules/card/compositions/notification-permissions.composition.tsx";
import projectSummaryCompositionSource from "#/modules/card/compositions/project-summary.composition.tsx?raw";
import { CardPreview } from "#/modules/card/card.preview.tsx";
import sessionActionCompositionSource from "#/modules/card/compositions/session-action.composition.tsx?raw";
import { CardSessionActionComposition } from "#/modules/card/compositions/session-action.composition.tsx";
import settingsSectionCompositionSource from "#/modules/card/compositions/settings-section.composition.tsx?raw";
import { CardSettingsSectionComposition } from "#/modules/card/compositions/settings-section.composition.tsx";
import supportingNoteCompositionSource from "#/modules/card/compositions/supporting-note.composition.tsx?raw";
import { CardSupportingNoteComposition } from "#/modules/card/compositions/supporting-note.composition.tsx";
import workspaceModeCompositionSource from "#/modules/card/compositions/workspace-mode.composition.tsx?raw";
import { CardWorkspaceModeComposition } from "#/modules/card/compositions/workspace-mode.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLeading,
  CardTitle,
  CardTitleText,
  CardTrailing,
} from "raft-ui";

<Card>
  <CardHeader>
    <CardTitle>
      <CardLeading />
      <CardTitleText />
      <CardTrailing />
    </CardTitle>
    <CardDescription />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  DenseSettings: denseSettingsCompositionSource,
  AppNotifications: appNotificationsCompositionSource,
  NotificationPermissions: notificationPermissionsCompositionSource,
  Preview: projectSummaryCompositionSource,
  SessionAction: sessionActionCompositionSource,
  SettingsSection: settingsSectionCompositionSource,
  SupportingNote: supportingNoteCompositionSource,
  WorkspaceMode: workspaceModeCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  DenseSettings: "cardDenseSettingsComposition",
  AppNotifications: "cardAppNotificationsComposition",
  NotificationPermissions: "cardNotificationPermissionsComposition",
  Preview: "cardProjectSummaryComposition",
  SessionAction: "cardSessionActionComposition",
  SettingsSection: "cardSettingsSectionComposition",
  SupportingNote: "cardSupportingNoteComposition",
  WorkspaceMode: "cardWorkspaceModeComposition",
});

const CARD_PARTS: readonly PropRow[] = [
  {
    name: "Card",
    type: 'useRender.ComponentProps<"div"> & { variant?: "default" | "inset" }',
    description:
      "Visual surface root for caller-owned content. Use inset for a nested content well; default keeps a single surface.",
  },
  {
    name: "CardHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Top region that contains CardTitle and an optional CardDescription.",
  },
  {
    name: "CardTitle",
    type: 'useRender.ComponentProps<"div">',
    description: "Title row that composes CardLeading, CardTitleText, and CardTrailing.",
  },
  {
    name: "CardLeading",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Leading region inside CardTitle for a caller-owned icon, avatar, switch, or action.",
  },
  {
    name: "CardTitleText",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Primary card heading. Use render to choose the heading level for the page context.",
  },
  {
    name: "CardDescription",
    type: 'useRender.ComponentProps<"div">',
    description: "Supporting copy placed after CardTitle inside CardHeader.",
  },
  {
    name: "CardTrailing",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing region inside CardTitle for a caller-owned status, switch, or action.",
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
    description: "Bottom region for supporting notes, metadata, or card-level actions.",
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
      description="A composable surface with optional header, content, footer, and title actions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <CardPreview
          code={code.cardProjectSummaryComposition}
          collapsedCode={code.cardProjectSummaryCompositionBody}
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
          <DocSubsection
            parentId="usage"
            id="notification-permissions"
            title="Notification permissions"
          >
            <p>
              Compose the title text and switch inside <InlineCode>CardTitle</InlineCode>, keep{" "}
              <InlineCode>CardDescription</InlineCode> as its sibling in{" "}
              <InlineCode>CardHeader</InlineCode>, then use <InlineCode>CardContent</InlineCode> for
              supporting controls.
            </p>
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

          <DocSubsection parentId="usage" id="leading-action" title="Leading action">
            <p>
              Use <InlineCode>CardLeading</InlineCode> when an enabling control precedes{" "}
              <InlineCode>CardTitleText</InlineCode>, then reveal its configuration in{" "}
              <InlineCode>CardContent</InlineCode>.
            </p>
            <Preview>
              <Preview.Canvas>
                <CardAppNotificationsComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardAppNotificationsComposition}
                collapsedHtml={code.cardAppNotificationsCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="supporting-note" title="Supporting note">
            <p>
              Use <InlineCode>CardFooter</InlineCode> for brief guidance that describes the whole
              setting, optionally paired with a related action or documentation link.
            </p>
            <Preview>
              <Preview.Canvas>
                <CardSupportingNoteComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardSupportingNoteComposition}
                collapsedHtml={code.cardSupportingNoteCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="workspace-mode" title="Workspace mode">
            <p>
              Use <InlineCode>CardHeader</InlineCode> alone for a compact preference, with its title
              and trailing control composed in <InlineCode>CardTitle</InlineCode>.
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
            <p>
              Place a card-level action in <InlineCode>CardContent</InlineCode> and align it to the
              lower trailing edge.
            </p>
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
              Keep the icon-led section label outside a full-width settings surface, then compose
              identity, profile fields, connected accounts, and related actions through the card
              parts.
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

          <DocSubsection parentId="usage" id="dense-settings" title="Dense settings">
            <p>
              Use <InlineCode>inset</InlineCode> when a card contains a dense cluster of controls or
              nested components that need stronger visual separation. Prefer{" "}
              <InlineCode>default</InlineCode> for isolated cards or lower-density information.
            </p>
            <Preview>
              <Preview.Canvas>
                <CardDenseSettingsComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.cardDenseSettingsComposition}
                collapsedHtml={code.cardDenseSettingsCompositionBody}
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
