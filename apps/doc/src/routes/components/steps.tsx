import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { StepsClickableComposition } from "#/modules/steps/compositions/clickable.composition.tsx";
import stepsClickableCompositionSource from "#/modules/steps/compositions/clickable.composition.tsx?raw";
import { StepsIconComposition } from "#/modules/steps/compositions/icon.composition.tsx";
import stepsIconCompositionSource from "#/modules/steps/compositions/icon.composition.tsx?raw";
import stepsPreviewCompositionSource from "#/modules/steps/compositions/preview.composition.tsx?raw";
import { StepsMigrationComposition } from "#/modules/steps/compositions/migration.composition.tsx";
import stepsMigrationCompositionSource from "#/modules/steps/compositions/migration.composition.tsx?raw";
import { StepsRiverComposition } from "#/modules/steps/compositions/river.composition.tsx";
import stepsRiverCompositionSource from "#/modules/steps/compositions/river.composition.tsx?raw";
import { StepsSizeComposition } from "#/modules/steps/compositions/size.composition.tsx";
import stepsSizeCompositionSource from "#/modules/steps/compositions/size.composition.tsx?raw";
import { StepsStatusComposition } from "#/modules/steps/compositions/status.composition.tsx";
import stepsStatusCompositionSource from "#/modules/steps/compositions/status.composition.tsx?raw";
import { StepsVerticalComposition } from "#/modules/steps/compositions/vertical.composition.tsx";
import stepsVerticalCompositionSource from "#/modules/steps/compositions/vertical.composition.tsx?raw";
import { SIZES, STATUSES, TRACKS } from "#/modules/steps/steps.constants.ts";
import { StepsPlaygroundPreview } from "#/modules/steps/steps.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Step, Steps } from "raft-ui";

<Steps current={2}>
  <Step title="" description="" />
  <Step title="" />
</Steps>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Preview: stepsPreviewCompositionSource,
  Status: stepsStatusCompositionSource,
  Size: stepsSizeCompositionSource,
  Vertical: stepsVerticalCompositionSource,
  Icon: stepsIconCompositionSource,
  Clickable: stepsClickableCompositionSource,
  River: stepsRiverCompositionSource,
  Migration: stepsMigrationCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Preview: "stepsPreviewComposition",
  Status: "stepsStatusComposition",
  Size: "stepsSizeComposition",
  Vertical: "stepsVerticalComposition",
  Icon: "stepsIconComposition",
  Clickable: "stepsClickableComposition",
  River: "stepsRiverComposition",
  Migration: "stepsMigrationComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const union = (values: readonly string[]) => values.map((value) => `"${value}"`).join(" | ");

const STEPS_PROPS: readonly PropRow[] = [
  {
    name: "current",
    type: "number",
    description:
      "The current step, counted from 1. Steps before it finish, steps after it wait. Without it every step is in progress.",
  },
  {
    name: "defaultCurrent",
    type: "number",
    description: "Initial current step when uncontrolled; clicks then move it.",
  },
  {
    name: "status",
    type: union(STATUSES),
    default: '"process"',
    description: "Status of the current step.",
  },
  {
    name: "size",
    type: union(SIZES),
    default: '"md"',
    description: "Marker and text size.",
  },
  {
    name: "vertical",
    type: "boolean",
    default: "false",
    description: "Lays the steps out in a column instead of a row.",
  },
  {
    name: "track",
    type: union(TRACKS),
    default: '"line"',
    description:
      "How the steps are joined. river is a channel: full of water behind finished steps, flowing in behind the step in progress and dry ahead.",
  },
  {
    name: "renderIndicator",
    type: "(state: StepIndicatorState) => ReactNode",
    description:
      "Renders a step's marker from { index, status, current, marker }. The slot keeps its size but drops the box; returning null or undefined keeps the default marker.",
  },
  {
    name: "finishIcon",
    type: "ReactNode",
    description: "Replaces the check mark of finished steps.",
  },
  {
    name: "errorIcon",
    type: "ReactNode",
    description: "Replaces the cross of failed steps.",
  },
  {
    name: "finishLabel",
    type: "string",
    default: '"Completed"',
    description: "Screen-reader text read after a finished step's title.",
  },
  {
    name: "errorLabel",
    type: "string",
    default: '"Failed"',
    description: "Screen-reader text read after a failed step's title.",
  },
  {
    name: "onUpdateCurrent",
    type: "(current: number) => void",
    description:
      "Called with the clicked step's number. Setting it turns every step that isn't disabled into a button.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"ol">',
    description: "Native ordered-list attributes. Children are Steps, numbered by position.",
  },
];

const STEP_PROPS: readonly PropRow[] = [
  {
    name: "title",
    type: "ReactNode",
    description: "The step's title; the marker centers on its first line.",
  },
  {
    name: "description",
    type: "ReactNode",
    description: "Shown under the title. children override it.",
  },
  {
    name: "status",
    type: union(STATUSES),
    description: "Overrides the status the step gets from current.",
  },
  {
    name: "icon",
    type: "ReactNode",
    description: "Replaces the number while the step waits or is in progress.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Keeps the step from being clicked when the steps are clickable.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"li">',
    description: "Native list-item attributes.",
  },
];

export const Route = createFileRoute("/components/steps")({
  component: StepsDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function StepsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Steps"
      description="Where a process stands, as an ordered list of numbered steps."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <StepsPlaygroundPreview code={code.stepsPreviewComposition} />
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
          <DocSubsection parentId="usage" id="status" title="Status">
            <DocNote>
              <InlineCode>current</InlineCode> counts from 1: steps before it finish, steps after it
              wait. <InlineCode>status</InlineCode> sets the current step's status:{" "}
              <InlineCode>process</InlineCode> (the default), <InlineCode>finish</InlineCode>,{" "}
              <InlineCode>error</InlineCode> or <InlineCode>wait</InlineCode>. A{" "}
              <InlineCode>Step</InlineCode>'s own <InlineCode>status</InlineCode> overrides the one
              it gets from <InlineCode>current</InlineCode>. The current step carries{" "}
              <InlineCode>aria-current="step"</InlineCode>, and finished and failed steps read out
              their status after the title.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsStatusComposition />
              </Preview.Canvas>
              <Preview.Code html={code.stepsStatusComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="size" title="Size">
            <DocNote>
              <InlineCode>size="sm"</InlineCode> is the compact marker and text size.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsSizeComposition />
              </Preview.Canvas>
              <Preview.Code html={code.stepsSizeComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="vertical" title="Vertical">
            <DocNote>
              <InlineCode>vertical</InlineCode> lays the steps out in a column and lets long titles
              wrap. A row fits a phone too: below 640px each step's text moves under its marker and
              the titles wrap. For more than four or five steps, or long titles, prefer{" "}
              <InlineCode>vertical</InlineCode> on small screens.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsVerticalComposition />
              </Preview.Canvas>
              <Preview.Code html={code.stepsVerticalComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="icon" title="Custom icons">
            <DocNote>
              <InlineCode>finishIcon</InlineCode> and <InlineCode>errorIcon</InlineCode> replace the
              check and the cross for every step; a <InlineCode>Step</InlineCode>'s{" "}
              <InlineCode>icon</InlineCode> replaces its number while it waits or is in progress.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsIconComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.stepsIconComposition}
                collapsedHtml={code.stepsIconCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="river" title="River track">
            <DocNote>
              <InlineCode>track="river"</InlineCode> joins the steps with a stream instead of a
              line. The channel behind a finished step is full of water, water keeps flowing in
              behind the step in progress, and ahead of it the bed is dry. After a failed step the
              water stalls half way in red. Under reduced motion the water stands still.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsRiverComposition />
              </Preview.Canvas>
              <Preview.Code html={code.stepsRiverComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="render-indicator" title="Custom indicator">
            <DocNote>
              <InlineCode>renderIndicator</InlineCode> draws a step's marker from its{" "}
              <InlineCode>index</InlineCode>, <InlineCode>status</InlineCode>, whether it is{" "}
              <InlineCode>current</InlineCode>, and the <InlineCode>marker</InlineCode> it would
              show by default. The slot keeps the marker's size, set with{" "}
              <InlineCode>--r-steps-indicator-size</InlineCode>, and drops its box, so the content
              can be any picture. Return <InlineCode>undefined</InlineCode> to keep the default
              marker on a step. Here each step of moving a workspace between machines has an otter
              posed by its status: asleep on the bank while waiting, paddling while in progress,
              hugging the delivered parcel when finished, and shivering with the parcel adrift after
              a failure (press Fail to see it).
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsMigrationComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.stepsMigrationComposition}
                collapsedHtml={code.stepsMigrationCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="clickable" title="Clickable">
            <DocNote>
              With <InlineCode>onUpdateCurrent</InlineCode> each step's title becomes a button whose
              hit area covers the marker and the description; clicking it reports the step's number.{" "}
              <InlineCode>disabled</InlineCode> keeps a step from being picked. Pass{" "}
              <InlineCode>defaultCurrent</InlineCode> instead of <InlineCode>current</InlineCode> to
              let clicks move the current step on their own.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <StepsClickableComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.stepsClickableComposition}
                collapsedHtml={code.stepsClickableCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-steps" title="Steps">
            <PropsTable rows={STEPS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-step" title="Step">
            <PropsTable rows={STEP_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
