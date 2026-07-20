import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "raft-ui";
import { Field, FieldDescription, FieldLabel } from "raft-ui";
import { Check } from "lucide-react";

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
import radioGroupReferralSourceCompositionSource from "#/modules/radio-group/compositions/referral-source.composition.tsx?raw";
import radioGroupReferralSourceRestoredCompositionSource from "#/modules/radio-group/compositions/referral-source-restored.composition.tsx?raw";
import radioGroupResetModeCompositionSource from "#/modules/radio-group/compositions/reset-mode.composition.tsx?raw";
import radioGroupResetModeRestoredCompositionSource from "#/modules/radio-group/compositions/reset-mode-restored.composition.tsx?raw";
import {
  RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION,
  RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS,
  RadioGroupReferralSourcePreview,
  RadioGroupResetModeSourcePreview,
} from "#/modules/radio-group/radio-group.source-comparison.tsx";
import { RadioGroupPreview } from "#/modules/radio-group/radio-group.preview.tsx";
import { RadioGroupReferralSourceComposition } from "#/modules/radio-group/compositions/referral-source.composition.tsx";
import { RadioGroupResetModeComposition } from "#/modules/radio-group/compositions/reset-mode.composition.tsx";
import { RadioGroupResetModeRestoredComposition } from "#/modules/radio-group/compositions/reset-mode-restored.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Onboarding and reset choices",
    scenes: [
      {
        label: "OwnerOnboardingModal.tsx:914",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/OwnerOnboardingModal.tsx:914",
      },
      {
        label: "ResetAgentDialog.tsx:83,94,113,117",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ResetAgentDialog.tsx:83,94,113,117",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `<RadioGroup>
  <RadioGroupItem />
</RadioGroup>`,
  field: `<Field className="gap-2.5">
  <FieldLabel>Restart mode</FieldLabel>
  <RadioGroup defaultValue="restart" ariaLabel="Restart mode">
    <label>
      <RadioGroupItem value="restart" />
      Restart
    </label>
    <label>
      <RadioGroupItem value="session" />
      Reset session
    </label>
  </RadioGroup>
  <FieldDescription>Choose one mode before confirming.</FieldDescription>
</Field>`,
  customIndicator: `<RadioGroup defaultValue="approved" ariaLabel="Approval state">
  <label>
    <RadioGroupItem value="approved">
      <RadioGroupIndicator>
        <Check aria-hidden className="size-3" strokeWidth={2.25} />
      </RadioGroupIndicator>
    </RadioGroupItem>
    Approved
  </label>
  <label>
    <RadioGroupItem value="review">
      <RadioGroupIndicator>
        <Check aria-hidden className="size-3" strokeWidth={2.25} />
      </RadioGroupIndicator>
    </RadioGroupItem>
    Needs review
  </label>
</RadioGroup>`,
  disabled: `<RadioGroup disabled defaultValue="twitter_x" ariaLabel="Referral source">
  <label>
    <RadioGroupItem value="twitter_x" />
    Twitter / X
  </label>
  <label>
    <RadioGroupItem value="linkedin" />
    LinkedIn
  </label>
</RadioGroup>`,
} as const;

const RADIO_GROUP_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "RadioGroup",
    type: "Base UI RadioGroup.Props<T>",
    description:
      "Owns one selected value, roving keyboard behavior, form name/form metadata, and disabled/readOnly/required state.",
  },
  {
    name: "value / defaultValue",
    type: "T",
    description: "Controlled or uncontrolled selected value.",
  },
  {
    name: "onValueChange",
    type: "(value: T, details) => void",
    description: "Called when a different item is selected.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Accessible label for groups without an external visible label.",
  },
  {
    name: "name",
    type: "string",
    description: "Native form field name passed to the hidden radio inputs.",
  },
  {
    name: "disabled / readOnly / required",
    type: "boolean",
    description: "Group-level interaction and form-validation state.",
  },
];

const RADIO_GROUP_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "RadioGroupItem",
    type: "Base UI Radio.Root.Props<T>",
    description:
      'The radio control itself. Compose it inside a clickable label or a descriptive option row. Set appearance="none" when the surrounding row/card owns the selected visual.',
  },
];

const RADIO_GROUP_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "RadioGroupIndicator",
    type: "Base UI Radio.Indicator.Props",
    description:
      "Optional visual indicator rendered by RadioGroupItem by default. Use it as children when you need a custom mark.",
  },
];

const RADIO_GROUP_USAGE_COMPOSITION_RAW_SOURCES = {
  ReferralSource: radioGroupReferralSourceCompositionSource,
  ResetMode: radioGroupResetModeCompositionSource,
} as const;

const RADIO_GROUP_SOURCE_COMPARISON_RAW_SOURCES = {
  ReferralSource: radioGroupReferralSourceRestoredCompositionSource,
  ResetMode: radioGroupResetModeRestoredCompositionSource,
} as const;

const RADIO_GROUP_USAGE_COMPOSITION_SOURCES = createCompositionSourceMap(
  RADIO_GROUP_USAGE_COMPOSITION_RAW_SOURCES,
);

const RADIO_GROUP_SOURCE_COMPARISON_SOURCES = createCompositionSourceMap(
  RADIO_GROUP_SOURCE_COMPARISON_RAW_SOURCES,
);

const RADIO_GROUP_USAGE_COMPOSITION_SNIPPET_IDS = {
  ReferralSource: "radioGroupReferralSourceComposition",
  ResetMode: "radioGroupResetModeComposition",
} as const;

const RADIO_GROUP_SOURCE_COMPARISON_SNIPPET_IDS = {
  ReferralSource: "radioGroupReferralSourceRestoredComposition",
  ResetMode: "radioGroupResetModeRestoredComposition",
} as const;

type RadioGroupSourceComparisonKey = keyof typeof RADIO_GROUP_SOURCE_COMPARISON_SOURCES;

export const Route = createFileRoute("/components/radio-group")({
  component: RadioGroupDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          RADIO_GROUP_USAGE_COMPOSITION_SOURCES,
          RADIO_GROUP_USAGE_COMPOSITION_SNIPPET_IDS,
        ),
        ...createCompositionSnippetMap(
          RADIO_GROUP_SOURCE_COMPARISON_SOURCES,
          RADIO_GROUP_SOURCE_COMPARISON_SNIPPET_IDS,
        ),
      },
    }),
});

function RadioGroupDoc() {
  const code = Route.useLoaderData();
  const radioGroupComposition = (key: RadioGroupSourceComparisonKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: RADIO_GROUP_SOURCE_COMPARISON_SNIPPET_IDS,
      sources: RADIO_GROUP_SOURCE_COMPARISON_SOURCES,
    });

  const RadioGroupCurrent = RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION;
  const [referralValue, setReferralValue] = useState("twitter_x");
  const [resetMode, setResetMode] = useState("restart");

  return (
    <DocPage
      title="RadioGroup"
      description="A mutually exclusive choice control for forms, option lists, and descriptive cards."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <RadioGroupPreview value={referralValue} onValueChange={setReferralValue} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="grid gap-10">
          <DocSubsection parentId="usage" id="option-list" title="Option list">
            <Example html={code.radioGroupReferralSourceComposition}>
              <RadioGroupReferralSourceComposition
                value={referralValue}
                onValueChange={setReferralValue}
              />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="descriptive-cards" title="Descriptive cards">
            <Example html={code.radioGroupResetModeComposition}>
              <RadioGroupResetModeComposition value={resetMode} onValueChange={setResetMode} />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="custom-indicator" title="Custom indicator">
            <Example html={code.customIndicator}>
              <RadioGroup defaultValue="approved" ariaLabel="Approval state" className="w-48">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="approved">
                    <RadioGroupIndicator>
                      <Check aria-hidden className="size-3" strokeWidth={2.25} />
                    </RadioGroupIndicator>
                  </RadioGroupItem>
                  Approved
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="review">
                    <RadioGroupIndicator>
                      <Check aria-hidden className="size-3" strokeWidth={2.25} />
                    </RadioGroupIndicator>
                  </RadioGroupItem>
                  Needs review
                </label>
              </RadioGroup>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customization" title="Customization">
            <Example html={code.radioGroupResetModeRestoredComposition}>
              <RadioGroupResetModeRestoredComposition
                value={resetMode}
                onValueChange={setResetMode}
              />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <Example html={code.field}>
              <Field className="w-64 gap-2.5">
                <FieldLabel>Restart mode</FieldLabel>
                <RadioGroup defaultValue="restart" ariaLabel="Restart mode">
                  <label className="flex items-center gap-3 text-sm">
                    <RadioGroupItem value="restart" />
                    Restart
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <RadioGroupItem value="session" />
                    Reset session
                  </label>
                </RadioGroup>
                <FieldDescription>Choose one mode before confirming.</FieldDescription>
              </Field>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Example html={code.disabled}>
              <RadioGroupReferralSourceComposition disabled />
            </Example>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="RadioGroup root">
            <PropsTable rows={RADIO_GROUP_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item" title="RadioGroupItem">
            <PropsTable rows={RADIO_GROUP_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-indicator" title="RadioGroupIndicator">
            <PropsTable rows={RADIO_GROUP_INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Referral source",
              status: "match",
              note: "Source onboarding already used radiogroup semantics for a single form answer. The migration keeps RadioGroup semantics while letting the option row own the selected visual.",
              source: <RadioGroupReferralSourcePreview />,
              brutal: <RadioGroupCurrent.ReferralSourceRestored />,
              elegant: <RadioGroupCurrent.ReferralSourceRestored />,
              elegantDark: <RadioGroupCurrent.ReferralSourceRestored />,
              ...radioGroupComposition("ReferralSource"),
            },
            {
              label: "Reset mode cards",
              status: "difference",
              note: "Source reset dialogs used selected button cards before a confirm action. RadioGroup gives the same deferred choice a real mutually exclusive form control.",
              source: <RadioGroupResetModeSourcePreview />,
              brutal: <RadioGroupCurrent.ResetModeRestored />,
              elegant: <RadioGroupCurrent.ResetModeRestored />,
              elegantDark: <RadioGroupCurrent.ResetModeRestored />,
              ...radioGroupComposition("ResetMode"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
