import { createFileRoute } from "@tanstack/react-router";
import { Text } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceComparisonPreview } from "#/compositions/source-comparison-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "sizes", title: "Sizes" },
  { id: "variants", title: "Variants" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-panel-copy", title: "Panel copy" },
      { id: "source-comparison-task-row", title: "Task row" },
      { id: "source-comparison-detail-copy", title: "Detail copy" },
      { id: "source-comparison-dialog-copy", title: "Dialog copy" },
    ],
  },
  { id: "api", title: "API" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Panel and task copy",
    scenes: [
      {
        label: "AnnouncementModal.tsx:122,139,157-159",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/AnnouncementModal.tsx:122,139,157-159",
      },
      {
        label: "OnboardingStepDialog.tsx:77,80,114",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/onboarding/OnboardingStepDialog.tsx:77,80,114",
      },
      {
        label: "CreateTaskDialog.tsx:59",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/CreateTaskDialog.tsx:59",
      },
      {
        label: "ThreadsInbox.tsx:162",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/thread/ThreadsInbox.tsx:162",
      },
      {
        label: "TasksPanel.tsx:135,241,824",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TasksPanel.tsx:135,241,824",
      },
      {
        label: "LegacyTaskPanel.tsx:112,141,154",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/LegacyTaskPanel.tsx:112,141,154",
      },
      {
        label: "ActionCard.tsx:280,285,291,431-502",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/actions/ActionCard.tsx:280,285,291,431-502",
      },
      {
        label: "TaskItem.tsx:59-80,125,130",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/TaskItem.tsx:59-80,125,130",
      },
    ],
  },
  {
    label: "Detail copy",
    scenes: [
      {
        label: "HumanDetailPanel.tsx:267,275,279,319,360,368,374,397,475,481,530",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:267,275,279,319,360,368,374,397,475,481,530",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `import { Text } from "raft-ui";

<div>
  <Text.Heading level={4}>Workspace updates</Text.Heading>
  <Text.Sans size="small" variant="muted">3 unread messages</Text.Sans>
  <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
</div>`,
  anatomy: `import { Text } from "raft-ui";

<Text.Heading level={4}>Heading</Text.Heading>
<Text.Sans size="body">Body copy</Text.Sans>
<Text.Mono size="code">mono-token</Text.Mono>`,
  sizes: `<div>
  <Text.Heading level={5}>Heading level 5</Text.Heading>
  <Text.Sans size="large">Large body</Text.Sans>
  <Text.Sans size="body">Body text</Text.Sans>
  <Text.Sans size="small">Small supporting text</Text.Sans>
  <Text.Sans size="caption">Caption text</Text.Sans>
  <Text.Mono size="meta">meta</Text.Mono>
</div>`,
  variants: `<div>
  <Text.Sans variant="default">Default</Text.Sans>
  <Text.Sans variant="muted">Muted</Text.Sans>
  <Text.Sans variant="placeholder">Placeholder</Text.Sans>
  <Text.Sans variant="primary">Primary</Text.Sans>
  <Text.Sans variant="success">Success</Text.Sans>
  <Text.Sans variant="danger">Danger</Text.Sans>
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Text.Heading",
    type: 'ComponentPropsWithRef<"h1"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }',
    description: "Semantic heading with RAFT display typography.",
  },
  {
    name: "Text.Sans",
    type: '"large" | "body" | "small" | "caption"',
    description: "Sans text sizes for product copy and supporting labels.",
  },
  {
    name: "Text.Mono",
    type: '"code" | "meta" | "eyebrow" | "tabular"',
    description: "Mono text sizes for identifiers, metadata, and numeric text.",
  },
  {
    name: "variant",
    type: '"default" | "primary" | "information" | "muted" | "placeholder" | "accent" | "success" | "warning" | "danger"',
    description: "Optional semantic color. Leave unset to use each size recipe default.",
  },
  {
    name: "render",
    type: "ReactElement | (props) => ReactElement",
    description: "Base UI render override for changing the underlying element.",
  },
];

export const Route = createFileRoute("/components/text")({
  component: TextDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SourcePanelCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
        <h2 className="m-0 text-lg font-bold text-black">Tasks</h2>
        <p className="m-0 text-sm leading-5 text-black/60">4 open tasks across 2 channels.</p>
        <p className="m-0 font-mono text-[10px] uppercase tracking-wide text-black/40">
          Updated 3 min ago
        </p>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentPanelCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2">
        <Text.Heading level={6}>Tasks</Text.Heading>
        <Text.Sans size="small">4 open tasks across 2 channels.</Text.Sans>
        <Text.Mono size="eyebrow">Updated 3 min ago</Text.Mono>
      </div>
    </SourceComparisonPreview>
  );
}

function SourceTaskRowPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[20rem] gap-1 border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0_#000]">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-bold text-black">Audit component migration</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-black/50">Today</span>
        </div>
        <p className="m-0 text-xs leading-5 text-black/60">
          Compare source usage before replacing legacy primitives.
        </p>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentTaskRowPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[20rem] gap-1">
        <div className="flex items-center justify-between gap-3">
          <Text.Sans
            render={<span />}
            size="small"
            variant="default"
            className="truncate font-medium text-foreground-strong"
          >
            Audit component migration
          </Text.Sans>
          <Text.Mono render={<span />} size="meta">
            Today
          </Text.Mono>
        </div>
        <Text.Sans size="caption">
          Compare source usage before replacing legacy primitives.
        </Text.Sans>
      </div>
    </SourceComparisonPreview>
  );
}

function SourceDetailCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <dl className="grid w-[18rem] gap-3 border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
        <div className="grid gap-1">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-black/40">
            Owner
          </dt>
          <dd className="m-0 text-sm font-bold text-black">Mira</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-black/40">
            Notes
          </dt>
          <dd className="m-0 text-xs leading-5 text-black/60">Ready for source comparison.</dd>
        </div>
      </dl>
    </SourceComparisonPreview>
  );
}

function CurrentDetailCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <dl className="grid w-[18rem] gap-3">
        <div className="grid gap-1">
          <Text.Mono render={<dt />} size="eyebrow">
            Owner
          </Text.Mono>
          <Text.Sans render={<dd />} size="small" variant="default" className="font-medium">
            Mira
          </Text.Sans>
        </div>
        <div className="grid gap-1">
          <Text.Mono render={<dt />} size="eyebrow">
            Notes
          </Text.Mono>
          <Text.Sans render={<dd />} size="caption">
            Ready for source comparison.
          </Text.Sans>
        </div>
      </dl>
    </SourceComparisonPreview>
  );
}

function SourceDialogCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-black/40">
          Workspace setup
        </span>
        <h2 className="m-0 text-lg font-bold text-black">Invite people</h2>
        <p className="m-0 text-sm leading-5 text-black/60">
          Add teammates now or continue with a private workspace.
        </p>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentDialogCopyPreview() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2">
        <Text.Mono size="eyebrow">Workspace setup</Text.Mono>
        <Text.Heading level={6}>Invite people</Text.Heading>
        <Text.Sans size="small">Add teammates now or continue with a private workspace.</Text.Sans>
      </div>
    </SourceComparisonPreview>
  );
}

function TextDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Text"
      description="Semantic text primitives for headings, product copy, and compact metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.preview}>
          <div className="grid max-w-sm gap-2">
            <Text.Heading level={4}>Workspace updates</Text.Heading>
            <Text.Sans size="small" variant="muted">
              3 unread messages
            </Text.Sans>
            <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Text.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <DocNote>
            Use Text for repeatable product typography. Use token pages when auditing the full type
            scale.
          </DocNote>
          <Example html={code.sizes}>
            <div className="grid max-w-sm gap-3">
              <Text.Heading level={5}>Heading level 5</Text.Heading>
              <Text.Sans size="large">Large body</Text.Sans>
              <Text.Sans size="body">Body text</Text.Sans>
              <Text.Sans size="small">Small supporting text</Text.Sans>
              <Text.Sans size="caption">Caption text</Text.Sans>
              <Text.Mono size="meta">meta</Text.Mono>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <div className="grid max-w-sm gap-2">
            <Text.Sans variant="default">Default</Text.Sans>
            <Text.Sans variant="muted">Muted</Text.Sans>
            <Text.Sans variant="placeholder">Placeholder</Text.Sans>
            <Text.Sans variant="primary">Primary</Text.Sans>
            <Text.Sans variant="success">Success</Text.Sans>
            <Text.Sans variant="danger">Danger</Text.Sans>
          </div>
        </Example>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              id: "source-comparison-panel-copy",
              label: "Panel copy",
              status: "difference",
              note: "Source scenes: ThreadsInbox.tsx:162; TasksPanel.tsx:135,241,824; LegacyTaskPanel.tsx:112,141,154.",
              source: <SourcePanelCopyPreview />,
              current: <CurrentPanelCopyPreview />,
            },
            {
              id: "source-comparison-task-row",
              label: "Task row",
              status: "difference",
              note: "Source scenes: TaskItem.tsx:59-80,125,130; ActionCard.tsx:280,285,291,431-502.",
              source: <SourceTaskRowPreview />,
              current: <CurrentTaskRowPreview />,
            },
            {
              id: "source-comparison-detail-copy",
              label: "Detail copy",
              status: "difference",
              note: "Source scenes: HumanDetailPanel.tsx:267,275,279,319,360,368,374,397,475,481,530.",
              source: <SourceDetailCopyPreview />,
              current: <CurrentDetailCopyPreview />,
            },
            {
              id: "source-comparison-dialog-copy",
              label: "Dialog copy",
              status: "difference",
              note: "Source scenes: AnnouncementModal.tsx:122,139,157-159; OnboardingStepDialog.tsx:77,80,114; CreateTaskDialog.tsx:59.",
              source: <SourceDialogCopyPreview />,
              current: <CurrentDialogCopyPreview />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
