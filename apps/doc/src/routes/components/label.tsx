import { createFileRoute } from "@tanstack/react-router";
import { Input, Label, LabelAsterisk, LabelOptional, LabelSub } from "raft-ui";
import { Info } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import labelInlineFormLabelCompositionSource from "#/modules/label/compositions/inline-form-label.composition.tsx?raw";
import labelOptionalMarkerCompositionSource from "#/modules/label/compositions/optional-marker.composition.tsx?raw";
import labelRequiredMarkerCompositionSource from "#/modules/label/compositions/required-marker.composition.tsx?raw";
import labelSecondaryTextCompositionSource from "#/modules/label/compositions/secondary-text.composition.tsx?raw";
import {
  LABEL_SOURCE_COMPARISON_COMPOSITION,
  LABEL_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/label/label.source-comparison.tsx";
import LegacyFormField from "../../../../../packages/ui/src/legacy/FormField.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Native and form labels",
    scenes: [
      {
        label: "HumanLoginSetupPage.tsx:107",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/pages/HumanLoginSetupPage.tsx:107",
      },
      {
        label: "InviteHumanDialog.tsx:116,140",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/InviteHumanDialog.tsx:116,140",
      },
      {
        label: "SettingsPanel.tsx:307,1010,1830,1919,2767",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:307,1010,1830,1919,2767",
      },
      {
        label: "LegalAcceptanceCheckbox.tsx:15",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/LegalAcceptanceCheckbox.tsx:15",
      },
      {
        label: "AgentScopesPanel.tsx:145",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentScopesPanel.tsx:145",
      },
      {
        label: "RuntimeConfigFields.tsx:241,316",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/RuntimeConfigFields.tsx:241,316",
      },
      {
        label: "ReportIssueDialog.tsx:307,315,323,339",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ReportIssueDialog.tsx:307,315,323,339",
      },
      {
        label: "AgentDetailPanel.tsx:1797",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:1797",
      },
      {
        label: "MessageInput.tsx:1137",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:1137",
      },
      {
        label: "OwnerOnboardingModal.tsx:1045,1067,1119",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/OwnerOnboardingModal.tsx:1045,1067,1119",
      },
      {
        label: "FormField.tsx:91",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/FormField.tsx:91",
      },
    ],
  },
  {
    label: "Eyebrow labels",
    scenes: [
      {
        label: "SectionEyebrow.tsx:51",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SectionEyebrow.tsx:51",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `import { Label } from "raft-ui";

<Label htmlFor="email">Email address</Label>`,
  anatomy: `import { Label, LabelAsterisk } from "raft-ui";

<Label>
  <LabelAsterisk />
</Label>`,
  markers: `<Label htmlFor="email">
  Email address
  <LabelAsterisk />
</Label>

<Label htmlFor="middle-name">
  Middle name
  <LabelOptional />
</Label>

<Label htmlFor="project-visibility">
  Project URL
  <LabelSub>public</LabelSub>
</Label>

<Label htmlFor="project-url">
  Project URL
  <Info aria-hidden className="size-3.5 text-foreground-strong/40" />
</Label>`,
  states: `<Label htmlFor="email">Email address</Label>

<Label htmlFor="email" disabled>
  Email address
  <LabelAsterisk />
</Label>`,
  migrationInline: `// Source
<label className="mb-1 block text-sm font-bold text-black" htmlFor="email">
  Email
</label>

// Current
<Label htmlFor="email">Email</Label>`,
  migrationFormField: `// Source
<FormField label="Email" htmlFor="email" required>
  <input id="email" className="input-brutal" />
</FormField>

// Current
<Label htmlFor="email">
  Email
  <LabelAsterisk />
</Label>
<Input id="email" />`,
} as const;

const LABEL_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description:
      "Visible label content. Compose LabelAsterisk, LabelOptional, or LabelSub inside it.",
  },
  {
    name: "htmlFor",
    type: "string",
    description: "Native label association with the matching control id.",
  },
  {
    name: "size",
    type: '"sm" | "md"',
    default: '"md"',
    description: "Label text size. Use sm for dense settings rows.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description:
      "Sets aria-disabled and disabled styling on the label. It does not disable the control.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element when composing into a custom form pattern.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"label">',
    description: "Native label attributes.",
  },
];

const MARKER_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    default: '"*" for LabelAsterisk',
    description:
      "Marker content. LabelOptional defaults to (optional). LabelSub accepts custom secondary text.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for rare custom markers or tests.",
  },
];

const LabelCurrent = LABEL_SOURCE_COMPARISON_COMPOSITION;

const LABEL_COMPOSITION_RAW_SOURCES = {
  InlineFormLabel: labelInlineFormLabelCompositionSource,
  OptionalMarker: labelOptionalMarkerCompositionSource,
  RequiredMarker: labelRequiredMarkerCompositionSource,
  SecondaryText: labelSecondaryTextCompositionSource,
} as const;

const LABEL_COMPOSITION_SOURCES = createCompositionSourceMap(LABEL_COMPOSITION_RAW_SOURCES);

const LABEL_COMPOSITION_SNIPPET_IDS = {
  InlineFormLabel: "labelInlineFormLabelComposition",
  OptionalMarker: "labelOptionalMarkerComposition",
  RequiredMarker: "labelRequiredMarkerComposition",
  SecondaryText: "labelSecondaryTextComposition",
} as const;

type LabelCompositionKey = keyof typeof LABEL_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/label")({
  component: LabelDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(LABEL_COMPOSITION_SOURCES, LABEL_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function LabelDoc() {
  const code = Route.useLoaderData();
  const labelComposition = (key: LabelCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: LABEL_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: LABEL_COMPOSITION_SNIPPET_IDS,
      sources: LABEL_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Label"
      description="A form label primitive with required and secondary text markers."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="grid w-80 gap-2">
              <Label htmlFor="label-preview-email">Email address</Label>
              <Input id="label-preview-email" placeholder="you@example.com" />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="markers" title="Markers">
            <DocNote>
              Prefer explicit composition over boolean label props. Use LabelAsterisk for required
              fields, LabelOptional for optional markers, and LabelSub for custom secondary copy.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid w-80 gap-4">
                  <Label htmlFor="label-required-email">
                    Email address
                    <LabelAsterisk />
                  </Label>
                  <Label htmlFor="label-optional-middle-name">
                    Middle name
                    <LabelOptional />
                  </Label>
                  <Label htmlFor="label-secondary-project-url">
                    Project URL
                    <LabelSub>public</LabelSub>
                  </Label>
                  <Label htmlFor="label-project-url">
                    Project URL
                    <Info aria-hidden className="size-3.5 text-foreground-strong/40" />
                  </Label>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.markers} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <DocNote>
              Disabled label styling is only visual and semantic. Disable the actual form control
              separately.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid w-80 gap-4">
                  <Label htmlFor="label-state-email">Email address</Label>
                  <Label htmlFor="label-state-disabled-email" disabled>
                    Email address
                    <LabelAsterisk />
                  </Label>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Label">
            <PropsTable rows={LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-markers"
            title="LabelAsterisk / LabelOptional / LabelSub"
          >
            <PropsTable rows={MARKER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Inline form label",
              status: "match",
              note: "Source repeated native label class strings around inputs. Current extracts the form label text treatment while keeping native label semantics.",
              source: (
                <label
                  className="mb-1 block text-sm font-bold text-black"
                  htmlFor="source-inline-email"
                >
                  Email
                </label>
              ),
              brutal: <LabelCurrent.InlineFormLabel />,
              elegant: <LabelCurrent.InlineFormLabel />,
              elegantDark: <LabelCurrent.InlineFormLabel />,
              ...labelComposition("InlineFormLabel"),
            },
            {
              label: "Required marker",
              status: "difference",
              note: "Source exposed required as a FormField prop. Current keeps the label primitive composable with an explicit asterisk part.",
              source: (
                <LegacyFormField label="Email" htmlFor="source-required-email" required>
                  <input id="source-required-email" className="input-brutal w-64" />
                </LegacyFormField>
              ),
              brutal: <LabelCurrent.RequiredMarker />,
              elegant: <LabelCurrent.RequiredMarker />,
              elegantDark: <LabelCurrent.RequiredMarker />,
              ...labelComposition("RequiredMarker"),
            },
            {
              label: "Optional marker",
              status: "difference",
              note: "Source exposed optional as a FormField prop. Current uses LabelOptional so optional markers stay explicit without repeating copy.",
              source: (
                <LegacyFormField label="Middle name" htmlFor="source-optional-name" optional>
                  <input id="source-optional-name" className="input-brutal w-64" />
                </LegacyFormField>
              ),
              brutal: <LabelCurrent.OptionalMarker />,
              elegant: <LabelCurrent.OptionalMarker />,
              elegantDark: <LabelCurrent.OptionalMarker />,
              ...labelComposition("OptionalMarker"),
            },
            {
              label: "Secondary text",
              status: "match",
              note: "Source used a manual muted span beside the label. Current keeps that custom secondary copy in LabelSub.",
              source: (
                <label
                  className="mb-1 block text-sm font-bold text-black"
                  htmlFor="source-secondary-project"
                >
                  Project URL
                  <span className="ml-1 text-black/40 normal-case">public</span>
                </label>
              ),
              brutal: <LabelCurrent.SecondaryText />,
              elegant: <LabelCurrent.SecondaryText />,
              elegantDark: <LabelCurrent.SecondaryText />,
              ...labelComposition("SecondaryText"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
