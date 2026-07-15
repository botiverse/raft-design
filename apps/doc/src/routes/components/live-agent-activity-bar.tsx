import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { LiveAgentActivityBarComposition } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import { LIVE_AGENT_ACTIVITY_PREVIEW } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.fixtures.ts";
import { SourceLiveAgentActivityBar } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.source-preview.tsx";
import liveAgentActivityBarCompositionSource from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  composition: liveAgentActivityBarCompositionSource,
} as const;

type PreviewValues = {
  active: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "LiveAgentActivityBar",
    type: "div props",
    description: "Live-region root and themed surface. Visible structure is supplied as children.",
  },
  {
    name: "LiveAgentActivityBarRow",
    type: "div props",
    description: "Structural row for the avatar and activity content.",
  },
  {
    name: "LiveAgentActivityBarAvatar",
    type: "Avatar root props",
    description:
      "Fixed xs agent avatar frame with the shared Avatar fallback. Compose an optional AvatarImage as its child.",
  },
  {
    name: "LiveAgentActivityBarContent",
    type: "div props",
    description: "Layout region for the live status and activity copy.",
  },
  {
    name: "LiveAgentActivityBarStatus",
    type: "Status span props",
    description: "Canonical pulsing primary status indicator with theme-owned placement.",
  },
  {
    name: "LiveAgentActivityBarText",
    type: "span props",
    description: "Truncating activity copy with native span props, including an explicit title.",
  },
];

export const Route = createFileRoute("/components/live-agent-activity-bar")({
  component: LiveAgentActivityBarDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LiveAgentActivityBarDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="LiveAgentActivityBar"
      description="A compact shell status bar that surfaces the latest thinking or working agent activity."
      overview={
        <Differences from="source LiveAgentActivityBar">
          <li>preserves the source avatar, pulsing status, typography, spacing, and surfaces</li>
          <li>uses the source white mobile surface and cream desktop surface responsively</li>
          <li>exposes avatar, status, and text as explicit composition parts</li>
          <li>keeps stores, socket events, and the 90-second expiry lifecycle consumer-owned</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PreviewValues>
          defaultValues={{ active: true }}
          controls={[{ name: "active", label: "Activity", type: "boolean" }]}
          previewClassName="overflow-visible"
          render={(values) => (
            <div className="w-72 self-center overflow-visible border-x border-line-subtle">
              <LiveAgentActivityBarComposition
                latest={values.active ? LIVE_AGENT_ACTIVITY_PREVIEW : null}
              />
            </div>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.composition} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <DocNote>
          Render the component only while an activity item exists. The consumer owns selection,
          expiry, terminal-state removal, and avatar resolution. The component owns its default
          Avatar fallback. Brutal uses the white surface below the md breakpoint and the cream
          sidebar surface at md and above.
        </DocNote>
        <div className="mt-4">
          <PropsTable rows={PROPS} />
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
    <section className="overflow-hidden border border-line-subtle bg-layer-panel">
      <div className="border-b border-line-subtle bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex min-h-28 items-center justify-center bg-white p-4">{children}</div>
    </section>
  );
}
