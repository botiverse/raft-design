import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { LogoComposition } from "#/modules/logo/logo.composition.tsx";
import logoCompositionSource from "#/modules/logo/logo.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "accessibility", title: "Accessibility" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  composition: logoCompositionSource,
  anatomy: `import { RaftLogo, RaftLogoLockup, RaftWordmark } from "raft-ui";

<RaftLogo role="img" aria-label="Raft" />
<RaftWordmark role="img" aria-label="Raft" />
<RaftLogoLockup role="img" aria-label="Raft" />`,
  accessibility: `<RaftLogo role="img" aria-label="Raft" />

<div>
  <RaftLogo aria-hidden />
  <span>Raft</span>
</div>`,
} as const;

const RAFT_LOGO_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Standalone Raft mark. Size it with native SVG props or className.",
  },
];

const RAFT_WORDMARK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Standalone Raft wordmark with its own fitted viewBox.",
  },
];

const RAFT_LOGO_LOCKUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Combined mark and wordmark lockup in one SVG.",
  },
];

export const Route = createFileRoute("/components/logo")({
  component: LogoDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LogoDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Logo"
      description="Optimized Raft mark, wordmark, and combined lockup SVGs."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <LogoComposition />
          </Preview.Canvas>
          <Preview.Code html={code.composition} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="accessibility" title="Accessibility">
        <p>
          Give a standalone brand graphic an accessible name. When visible text already names the
          brand, hide the repeated SVG from assistive technology.
        </p>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.accessibility} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-raft-logo" title="RaftLogo">
            <PropsTable rows={RAFT_LOGO_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-raft-wordmark" title="RaftWordmark">
            <PropsTable rows={RAFT_WORDMARK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-raft-logo-lockup" title="RaftLogoLockup">
            <PropsTable rows={RAFT_LOGO_LOCKUP_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
