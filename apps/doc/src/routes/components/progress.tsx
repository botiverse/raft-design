import { createFileRoute } from "@tanstack/react-router";
import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  type ProgressProps,
} from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import progressAttachmentUploadCompositionSource from "#/modules/progress/compositions/attachment-upload.composition.tsx?raw";
import progressMachineDownloadCompositionSource from "#/modules/progress/compositions/machine-download.composition.tsx?raw";
import progressRestartIndeterminateCompositionSource from "#/modules/progress/compositions/restart-indeterminate.composition.tsx?raw";
import {
  PROGRESS_SOURCE_COMPARISON_COMPOSITION,
  PROGRESS_SOURCE_COMPARISON_COMPOSITION_PATHS,
  PROGRESS_SOURCE_COMPARISON_SOURCE,
} from "#/modules/progress/progress.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const VARIANTS = ["primary", "information", "accent", "success", "warning", "danger"] as const;

const SIZES = ["sm", "md", "lg"] as const;

const SOURCE_SCENES = {
  AttachmentUpload: [
    {
      label: "Attachment upload",
      scenes: [
        {
          label: "MessageInput.tsx:225",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:225",
        },
        {
          label: "MessageInput.tsx:1425",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:1425",
        },
      ],
    },
  ],
  MachineDownload: [
    {
      label: "ProgressBar primitive",
      scenes: [
        {
          label: "ProgressBar.tsx:44",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/ui/ProgressBar.tsx:44",
        },
      ],
    },
    {
      label: "Machine operation",
      scenes: [
        {
          label: "MachineDetailPanel.tsx:1091",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/machine/MachineDetailPanel.tsx:1091",
        },
      ],
    },
  ],
  RestartIndeterminate: [
    {
      label: "ProgressBar primitive",
      scenes: [
        {
          label: "ProgressBar.tsx:71",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/ui/ProgressBar.tsx:71",
        },
        {
          label: "index.css:249",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/index.css:249",
        },
      ],
    },
    {
      label: "Machine operation",
      scenes: [
        {
          label: "MachineDetailPanel.tsx:1091",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/machine/MachineDetailPanel.tsx:1091",
        },
      ],
    },
  ],
} as const;

const SNIPPETS = {
  anatomy: `<Progress>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  variants: `<Progress value={64} variant="primary">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="success">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="warning">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>

<Progress value={64} variant="danger">
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
  indeterminate: `<Progress value={null} aria-label="Generating response">
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  composition: `<Progress value={72} variant="information">
  <ProgressHeader>
    <ProgressLabel>Uploading transcript</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
  anatomyImport: `import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "raft-ui";

<Progress value={72}>
  <ProgressHeader>
    <ProgressLabel>Uploading transcript</ProgressLabel>
    <ProgressValue />
  </ProgressHeader>
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
</Progress>`,
} as const;

type PlaygroundValues = {
  value: string;
  variant: NonNullable<ProgressProps["variant"]>;
  size: NonNullable<ProgressProps["size"]>;
  indeterminate: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "number | null",
    description: "Current progress value. Use null for indeterminate progress.",
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: "Minimum value passed to Base UI Progress.Root.",
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: "Maximum value passed to Base UI Progress.Root.",
  },
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
    name: "getAriaValueText",
    type: "(formattedValue, value) => string",
    description: "Optional screen reader text for the current value.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the rendered element.",
  },
];

const ProgressSource = PROGRESS_SOURCE_COMPARISON_SOURCE;
const ProgressCurrent = PROGRESS_SOURCE_COMPARISON_COMPOSITION;

const PROGRESS_COMPOSITION_RAW_SOURCES = {
  AttachmentUpload: progressAttachmentUploadCompositionSource,
  MachineDownload: progressMachineDownloadCompositionSource,
  RestartIndeterminate: progressRestartIndeterminateCompositionSource,
} as const;

const PROGRESS_COMPOSITION_SOURCES = createCompositionSourceMap(PROGRESS_COMPOSITION_RAW_SOURCES);

const PROGRESS_COMPOSITION_SNIPPET_IDS = {
  AttachmentUpload: "progressAttachmentUploadComposition",
  MachineDownload: "progressMachineDownloadComposition",
  RestartIndeterminate: "progressRestartIndeterminateComposition",
} as const;

type ProgressCompositionKey = keyof typeof PROGRESS_COMPOSITION_SOURCES;

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
  const progressComposition = (key: ProgressCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: PROGRESS_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: PROGRESS_COMPOSITION_SNIPPET_IDS,
      sources: PROGRESS_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Progress"
      description="A themed Base UI progress primitive for uploads, generation, and long-running tasks."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            value: "64",
            variant: "primary",
            size: "md",
            indeterminate: false,
          }}
          controls={[
            { name: "value", label: "Value", type: "text" },
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "indeterminate", label: "Indeterminate", type: "boolean" },
          ]}
          render={(values) => {
            const value = Math.max(0, Math.min(100, Number(values.value) || 0));

            return (
              <div className="w-full max-w-sm">
                <Progress
                  value={values.indeterminate ? null : value}
                  variant={values.variant}
                  size={values.size}
                >
                  <ProgressHeader>
                    <ProgressLabel>
                      {values.indeterminate ? "Generating response" : "Uploading transcript"}
                    </ProgressLabel>
                    <ProgressValue />
                  </ProgressHeader>
                  <ProgressTrack>
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </div>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Example html={code.variants}>
              <div className="grid w-full max-w-sm gap-4">
                {["primary", "success", "warning", "danger"].map((variant) => (
                  <Progress key={variant} value={64} variant={variant as ProgressProps["variant"]}>
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
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Example html={code.sizes}>
              <div className="grid w-full max-w-sm gap-4">
                {SIZES.map((size) => (
                  <Progress key={size} value={64} size={size}>
                    <ProgressTrack>
                      <ProgressIndicator />
                    </ProgressTrack>
                  </Progress>
                ))}
              </div>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="indeterminate" title="Indeterminate">
            <DocNote>
              Use indeterminate progress when work has started but a reliable completion percentage
              is not available yet.
            </DocNote>
            <Example html={code.indeterminate}>
              <div className="w-full max-w-sm">
                <Progress value={null} aria-label="Generating response">
                  <ProgressTrack>
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </div>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <div className="space-y-4">
              <Example html={code.composition}>
                <div className="w-full max-w-sm">
                  <Progress value={72} variant="information">
                    <ProgressHeader>
                      <ProgressLabel>Uploading transcript</ProgressLabel>
                      <ProgressValue />
                    </ProgressHeader>
                    <ProgressTrack>
                      <ProgressIndicator />
                    </ProgressTrack>
                  </Progress>
                </div>
              </Example>
              <DocsCodeBlock.Panel
                path="ProgressNamedParts.tsx"
                source={SNIPPETS.anatomyImport}
                html={code.anatomyImport}
                collapsedHtml={code.anatomyImportBody}
              />
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Machine download",
              status: "match",
              note: "Migrates the source ProgressBar determinate mode used by managed Computer upgrade progress.",
              sourceScenes: SOURCE_SCENES.MachineDownload,
              source: <ProgressSource.MachineDownload />,
              brutal: <ProgressCurrent.MachineDownload />,
              elegant: <ProgressCurrent.MachineDownload />,
              elegantDark: <ProgressCurrent.MachineDownload />,
              ...progressComposition("MachineDownload"),
            },
            {
              label: "Machine restart",
              status: "review",
              note: "Maps the no-percent ProgressBar path for restart and non-byte phases to Base UI indeterminate progress; sweep timing and the elegant treatment still diverge from the source stripe.",
              sourceScenes: SOURCE_SCENES.RestartIndeterminate,
              source: <ProgressSource.RestartIndeterminate />,
              brutal: <ProgressCurrent.RestartIndeterminate />,
              elegant: <ProgressCurrent.RestartIndeterminate />,
              elegantDark: <ProgressCurrent.RestartIndeterminate />,
              ...progressComposition("RestartIndeterminate"),
            },
            {
              label: "Attachment upload",
              status: "todo",
              note: "Maps the source attachment chip overlay to the same Progress parts while preserving the compact bottom-fill behavior.",
              sourceScenes: SOURCE_SCENES.AttachmentUpload,
              source: <ProgressSource.AttachmentUpload />,
              brutal: <ProgressCurrent.AttachmentUpload />,
              elegant: <ProgressCurrent.AttachmentUpload />,
              elegantDark: <ProgressCurrent.AttachmentUpload />,
              ...progressComposition("AttachmentUpload"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
