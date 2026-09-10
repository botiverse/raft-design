import { createFileRoute } from "@tanstack/react-router";
import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  InlineCode,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "raft-ui";
import type { ProgressProps } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { EmbeddedProgressComposition } from "#/modules/progress/compositions/embedded-progress.composition.tsx";
import embeddedProgressCompositionSource from "#/modules/progress/compositions/embedded-progress.composition.tsx?raw";
import { ProgressPlaygroundPreview } from "#/modules/progress/progress.preview.tsx";
import progressPreviewCompositionSource from "#/modules/progress/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const VARIANTS = ["primary", "information", "accent", "success", "warning", "danger"] as const;

const SIZES = ["sm", "md", "lg"] as const;

const SNIPPETS = {
  anatomy: `import { Progress, ProgressIndicator, ProgressTrack } from "raft-ui";

<Progress value={64}>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  variants: `<Progress value={64} variant="primary">
  <ProgressHeader>
    <ProgressLabel>primary</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="success">
  <ProgressHeader>
    <ProgressLabel>success</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="warning">
  <ProgressHeader>
    <ProgressLabel>warning</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="danger">
  <ProgressHeader>
    <ProgressLabel>danger</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  sizes: `<Progress value={64} size="sm">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} size="md">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} size="lg">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  indeterminate: `<Progress value={null}>
  <ProgressHeader>
    <ProgressLabel>Generating response</ProgressLabel>
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  composition: `<Progress value={72} variant="information">
  <ProgressHeader>
    <ProgressLabel>Uploading transcript</ProgressLabel>
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"primary"',
    description: "Semantic indicator color.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description: "Track height. Brutal maps each size slightly taller than Elegant.",
  },
  {
    name: "...props",
    type: "Base UI Progress.Root.Props",
    description:
      "All native div attributes plus the remaining Base UI Progress.Root props (value, min, max, render, format, locale, aria-valuetext, ...).",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Label and value row rendered above the track.",
  },
];

const LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Progress.Label.Props",
    description: "Accessible component label shown inside the header row.",
  },
];

const VALUE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Progress.Value.Props",
    description: "Formatted current value shown inside the header row.",
  },
];

const TRACK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Progress.Track.Props",
    description: "Full-width track behind the indicator.",
  },
];

const INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Progress.Indicator.Props",
    description: "Filled portion of the track.",
  },
];

const PROGRESS_COMPOSITION_RAW_SOURCES = {
  Preview: progressPreviewCompositionSource,
  EmbeddedProgress: embeddedProgressCompositionSource,
} as const;

const PROGRESS_COMPOSITION_SOURCES = createCompositionSourceMap(PROGRESS_COMPOSITION_RAW_SOURCES);

const PROGRESS_COMPOSITION_SNIPPET_IDS = {
  Preview: "progressPreviewComposition",
  EmbeddedProgress: "embeddedProgressComposition",
} as const;

export const Route = createFileRoute("/components/progress")({
  component: ProgressDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          PROGRESS_COMPOSITION_SOURCES,
          PROGRESS_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function ProgressDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Progress"
      description="A themed Base UI progress primitive for uploads, generation, and long-running tasks."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ProgressPlaygroundPreview
          code={code.progressPreviewComposition}
          collapsedCode={code.progressPreviewCompositionBody}
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
                <div className="grid w-full max-w-sm gap-4">
                  {["primary", "success", "warning", "danger"].map((variant) => (
                    <Progress
                      key={variant}
                      value={64}
                      variant={variant as ProgressProps["variant"]}
                    >
                      <ProgressHeader>
                        <ProgressLabel>{variant}</ProgressLabel>
                        <ProgressValue />
                      </ProgressHeader>
                      <ProgressTrack>
                        <ProgressIndicator />
                      </ProgressTrack>
                    </Progress>
                  ))}
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <div className="grid w-full max-w-sm gap-4">
                  {SIZES.map((size) => (
                    <Progress key={size} value={64} size={size}>
                      <ProgressTrack>
                        <ProgressIndicator />
                      </ProgressTrack>
                    </Progress>
                  ))}
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="indeterminate" title="Indeterminate">
            <DocNote>
              Use indeterminate progress when work has started but a reliable completion percentage
              is not available yet.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="w-full max-w-sm">
                  <Progress value={null}>
                    <ProgressHeader>
                      <ProgressLabel>Generating response</ProgressLabel>
                    </ProgressHeader>
                    <ProgressTrack>
                      <ProgressIndicator />
                    </ProgressTrack>
                  </Progress>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.indeterminate} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <div className="space-y-4">
              <DocNote>
                <InlineCode>ProgressValue</InlineCode> is optional. Omit it when a visible
                percentage would not help the reader; <InlineCode>ProgressLabel</InlineCode> still
                provides the accessible name.
              </DocNote>
              <Preview>
                <Preview.Canvas>
                  <div className="w-full max-w-sm">
                    <Progress value={72} variant="information">
                      <ProgressHeader>
                        <ProgressLabel>Uploading transcript</ProgressLabel>
                      </ProgressHeader>
                      <ProgressTrack>
                        <ProgressIndicator />
                      </ProgressTrack>
                    </Progress>
                  </div>
                </Preview.Canvas>
                <Preview.Code html={code.composition} />
              </Preview>
            </div>
          </DocSubsection>

          <DocSubsection parentId="usage" id="embedded-progress" title="Embedded progress">
            <DocNote>
              Keep file-processing context in consumer UI and use the compact progress parts for
              status within that layout.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <EmbeddedProgressComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.embeddedProgressComposition}
                collapsedHtml={code.embeddedProgressCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-progress" title="Progress">
            <PropsTable rows={PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-progress-header" title="ProgressHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-progress-label" title="ProgressLabel">
            <PropsTable rows={LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-progress-value" title="ProgressValue">
            <PropsTable rows={VALUE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-progress-track" title="ProgressTrack">
            <PropsTable rows={TRACK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-progress-indicator" title="ProgressIndicator">
            <PropsTable rows={INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
