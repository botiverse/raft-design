import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { LiveAgentActivityBarComposition } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import { LIVE_AGENT_ACTIVITY_PREVIEW } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.fixtures.ts";
import { SourceLiveAgentActivityBar } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `<LiveAgentActivityBar>
  <LiveAgentActivityBarRow>
    <LiveAgentActivityBarAvatar />
    <LiveAgentActivityBarContent>
      <LiveAgentActivityBarStatus />
      <LiveAgentActivityBarText title="Thinking…">Thinking…</LiveAgentActivityBarText>
    </LiveAgentActivityBarContent>
  </LiveAgentActivityBarRow>
</LiveAgentActivityBar>`,
  anatomy: `<LiveAgentActivityBar>
  <LiveAgentActivityBarRow>
    <LiveAgentActivityBarAvatar>
      <AvatarImage />
    </LiveAgentActivityBarAvatar>
    <LiveAgentActivityBarContent>
      <LiveAgentActivityBarStatus />
      <LiveAgentActivityBarText />
    </LiveAgentActivityBarContent>
  </LiveAgentActivityBarRow>
</LiveAgentActivityBar>`,
} as const;

const LIVE_AGENT_ACTIVITY_BAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Live-region root and themed surface. Visible structure is supplied as children.",
  },
];

const LIVE_AGENT_ACTIVITY_BAR_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Structural row for the avatar and activity content.",
  },
];

const LIVE_AGENT_ACTIVITY_BAR_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Layout region for the live status and activity copy.",
  },
];

const LIVE_AGENT_ACTIVITY_BAR_AVATAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Avatar root props",
    description:
      "Fixed xs agent avatar frame with the shared Avatar fallback. Compose an optional AvatarImage as its child.",
  },
];

const LIVE_AGENT_ACTIVITY_BAR_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Status span props",
    description: "Canonical pulsing primary status indicator with theme-owned placement.",
  },
];

const LIVE_AGENT_ACTIVITY_BAR_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Truncating activity copy with native span props, including an explicit title.",
  },
];

export const Route = createFileRoute("/components/live-agent-activity-bar")({
  component: LiveAgentActivityBarDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LiveAgentActivityBarPreview({
  code,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
}) {
  const [active, setActive] = useState(true);

  return (
    <Preview previewClassName="overflow-visible">
      <Preview.Canvas>
        <div className="w-72 self-center overflow-visible">
          <LiveAgentActivityBarComposition latest={active ? LIVE_AGENT_ACTIVITY_PREVIEW : null} />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Activity" htmlFor="live-agent-activity-bar-preview-active">
          <Preview.Checkbox
            id="live-agent-activity-bar-preview-active"
            label="Activity"
            checked={active}
            onCheckedChange={setActive}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}

function LiveAgentActivityBarDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="LiveAgentActivityBar"
      description="A compact shell status bar that surfaces the latest thinking or working agent activity."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <LiveAgentActivityBarPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <DocNote>
          Pass `null` when activity ends. The consumer owns selection, expiry, terminal-state
          removal, and avatar resolution; Elegant retains the prior content briefly for its exit
          transition. The component owns its default Avatar fallback. Brutal uses the white surface
          below the md breakpoint and the cream sidebar surface at md and above.
        </DocNote>
        <div className="mt-4 space-y-6">
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar"
            title="LiveAgentActivityBar"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar-row"
            title="LiveAgentActivityBarRow"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar-content"
            title="LiveAgentActivityBarContent"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar-avatar"
            title="LiveAgentActivityBarAvatar"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_AVATAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar-status"
            title="LiveAgentActivityBarStatus"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-live-agent-activity-bar-text"
            title="LiveAgentActivityBarText"
          >
            <PropsTable rows={LIVE_AGENT_ACTIVITY_BAR_TEXT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <div className="grid gap-4 lg:grid-cols-2">
          <ComparisonPane label="Source">
            <SourceThemeScope className="w-72 overflow-hidden border-x-2 border-black">
              <SourceLiveAgentActivityBar />
            </SourceThemeScope>
          </ComparisonPane>
          <ComparisonPane label="Current · Brutal">
            <PreviewThemeScope
              family="brutal"
              className="w-72 overflow-hidden border-x-2 border-black"
            >
              <LiveAgentActivityBarComposition latest={LIVE_AGENT_ACTIVITY_PREVIEW} />
            </PreviewThemeScope>
          </ComparisonPane>
        </div>
      </DocSection>
    </DocPage>
  );
}

function ComparisonPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden border border-line-muted bg-layer-panel">
      <div className="border-b border-line-muted bg-fill-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex min-h-28 items-center justify-center bg-white p-4">{children}</div>
    </section>
  );
}
