import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
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
  anatomy: `<RaftLogo role="img" aria-label="Raft" />
<RaftWordmark role="img" aria-label="Raft" />
<RaftLogoLockup role="img" aria-label="Raft" />`,
  accessibility: `<RaftLogo role="img" aria-label="Raft" />

<div>
  <RaftLogo aria-hidden />
  <span>Raft</span>
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "RaftLogo",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Standalone Raft mark. Size it with native SVG props or className.",
  },
  {
    name: "RaftWordmark",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Standalone Raft wordmark with its own fitted viewBox.",
  },
  {
    name: "RaftLogoLockup",
    type: 'ComponentPropsWithoutRef<"svg">',
    description: "Combined mark and wordmark lockup in one SVG.",
  },
  {
    name: "...props",
    type: "SVGAttributes<SVGSVGElement>",
    description:
      "Native SVG attributes, including className, role, aria-label, and aria-hidden, are forwarded to the root SVG.",
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
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
