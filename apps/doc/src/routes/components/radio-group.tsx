import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
  Field,
  FieldDescription,
  FieldLabel,
} from "raft-ui";
import { Check } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import radioGroupReferralSourceCompositionSource from "#/modules/radio-group/compositions/referral-source.composition.tsx?raw";
import radioGroupResetModeCompositionSource from "#/modules/radio-group/compositions/reset-mode.composition.tsx?raw";
import radioGroupResetModeRestoredCompositionSource from "#/modules/radio-group/compositions/reset-mode-restored.composition.tsx?raw";
import { RadioGroupPreview } from "#/modules/radio-group/radio-group.preview.tsx";
import { RadioGroupReferralSourceComposition } from "#/modules/radio-group/compositions/referral-source.composition.tsx";
import { RadioGroupResetModeComposition } from "#/modules/radio-group/compositions/reset-mode.composition.tsx";
import { RadioGroupResetModeRestoredComposition } from "#/modules/radio-group/compositions/reset-mode-restored.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
const SNIPPETS = {
  anatomy: `import { RadioGroup, RadioGroupItem } from "raft-ui";

<RadioGroup defaultValue="option" aria-label="Options">
  <RadioGroupItem value="option" />
</RadioGroup>`,
  field: `<Field className="gap-2.5">
  <FieldLabel>Restart mode</FieldLabel>
  <RadioGroup defaultValue="restart" aria-label="Restart mode">
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
  customIndicator: `<RadioGroup defaultValue="approved" aria-label="Approval state">
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
  disabled: `const referralOptions = [
  { value: "twitter_x", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "search", label: "Search" },
  { value: "hn_reddit", label: "Hacker News / Reddit" },
  { value: "podcast_blog_newsletter", label: "Podcast / blog / newsletter" },
  { value: "other", label: "Other" },
] as const;

<RadioGroup
  disabled
  defaultValue="twitter_x"
  aria-label="Where did you hear about us?"
  className="w-64"
>
  {referralOptions.map((option) => (
    <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
      <RadioGroupItem value={option.value} />
      <span>{option.label}</span>
    </label>
  ))}
</RadioGroup>`,
} as const;

const RADIO_GROUP_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "Controlled selected value.",
  },
  {
    name: "defaultValue",
    type: "T",
    description: "Initial selected value for uncontrolled usage.",
  },
  {
    name: "onValueChange",
    type: "(value: T, details) => void",
    description: "Called when a different item is selected.",
  },
  {
    name: "aria-label",
    type: "string",
    description:
      "Native ARIA attribute naming the group for assistive tech. Set it when the group has no visible label.",
  },
  {
    name: "name",
    type: "string",
    description: "Native form field name passed to the hidden radio inputs.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables selection across the whole group.",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description: "Keeps the group focusable but prevents changing the selection.",
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: "Marks the hidden native inputs required for form validation.",
  },
  {
    name: "...props",
    type: "Base UI RadioGroup.Props<T>",
    description:
      "Owns one selected value, roving keyboard behavior, form metadata, and remaining Base UI root props.",
  },
];

const RADIO_GROUP_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "Option value selected when this item is chosen.",
  },
  {
    name: "appearance",
    type: '"default" | "none"',
    default: '"default"',
    description:
      'Use "none" when the surrounding row or card owns the selected visual and the control should stay visually hidden.',
  },
  {
    name: "...props",
    type: "Base UI Radio.Root.Props<T>",
    description:
      "Compose inside a clickable label or descriptive option row. Children replace the default RadioGroupIndicator.",
  },
];

const RADIO_GROUP_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description: "Optional custom mark. Defaults to the themed inner dot.",
  },
  {
    name: "...props",
    type: "Base UI Radio.Indicator.Props",
    description:
      "Optional visual indicator rendered by RadioGroupItem by default. Pass as children when you need a custom mark.",
  },
];

const RADIO_GROUP_USAGE_COMPOSITION_RAW_SOURCES = {
  ReferralSource: radioGroupReferralSourceCompositionSource,
  ResetMode: radioGroupResetModeCompositionSource,
  ResetModeRestored: radioGroupResetModeRestoredCompositionSource,
} as const;

const RADIO_GROUP_USAGE_COMPOSITION_SOURCES = createCompositionSourceMap(
  RADIO_GROUP_USAGE_COMPOSITION_RAW_SOURCES,
);

const RADIO_GROUP_USAGE_COMPOSITION_SNIPPET_IDS = {
  ReferralSource: "radioGroupReferralSourceComposition",
  ResetMode: "radioGroupResetModeComposition",
  ResetModeRestored: "radioGroupResetModeRestoredComposition",
} as const;

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
      },
    }),
});

function RadioGroupDoc() {
  const code = Route.useLoaderData();
  const [referralValue, setReferralValue] = useState("twitter_x");
  const [resetMode, setResetMode] = useState("restart");

  return (
    <DocPage
      title="RadioGroup"
      description="A mutually exclusive choice control for forms, option lists, and descriptive cards."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <RadioGroupPreview
          value={referralValue}
          onValueChange={setReferralValue}
          code={code.radioGroupReferralSourceComposition}
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
        <div className="grid gap-10">
          <DocSubsection parentId="usage" id="option-list" title="Option list">
            <Preview>
              <Preview.Canvas>
                <RadioGroupReferralSourceComposition
                  value={referralValue}
                  onValueChange={setReferralValue}
                />
              </Preview.Canvas>
              <Preview.Code html={code.radioGroupReferralSourceComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="descriptive-cards" title="Descriptive cards">
            <Preview>
              <Preview.Canvas>
                <RadioGroupResetModeComposition value={resetMode} onValueChange={setResetMode} />
              </Preview.Canvas>
              <Preview.Code html={code.radioGroupResetModeComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="custom-indicator" title="Custom indicator">
            <Preview>
              <Preview.Canvas>
                <RadioGroup defaultValue="approved" aria-label="Approval state" className="w-48">
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
              </Preview.Canvas>
              <Preview.Code html={code.customIndicator} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customization" title="Customization">
            <Preview>
              <Preview.Canvas>
                <RadioGroupResetModeRestoredComposition
                  value={resetMode}
                  onValueChange={setResetMode}
                />
              </Preview.Canvas>
              <Preview.Code
                html={code.radioGroupResetModeRestoredComposition}
                collapsedHtml={code.radioGroupResetModeRestoredCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <Preview>
              <Preview.Canvas>
                <Field className="w-64 gap-2.5">
                  <FieldLabel>Restart mode</FieldLabel>
                  <RadioGroup defaultValue="restart" aria-label="Restart mode">
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
              </Preview.Canvas>
              <Preview.Code html={code.field} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Preview>
              <Preview.Canvas>
                <RadioGroupReferralSourceComposition disabled />
              </Preview.Canvas>
              <Preview.Code html={code.disabled} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="RadioGroup">
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
    </DocPage>
  );
}
