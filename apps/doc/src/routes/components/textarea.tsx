import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode, Textarea, TextareaCounter, TextareaGroup } from "raft-ui";
import { Field, FieldError, FieldLabel } from "raft-ui";

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
import { TEXTAREA_PREVIEW_CLASS } from "#/modules/textarea/textarea.constants.ts";
import { TextareaPreview } from "#/modules/textarea/textarea.preview.tsx";
import textareaDefaultShellCompositionSource from "#/modules/textarea/compositions/default-shell.composition.tsx?raw";
import textareaDisabledStylingCompositionSource from "#/modules/textarea/compositions/disabled-styling.composition.tsx?raw";
import textareaInvalidStateCompositionSource from "#/modules/textarea/compositions/invalid-state.composition.tsx?raw";
import textareaWrapperApiCompositionSource from "#/modules/textarea/compositions/wrapper-api.composition.tsx?raw";
import {
  TEXTAREA_SOURCE_COMPARISON_COMPOSITION,
  TEXTAREA_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/textarea/textarea.source-comparison.tsx";
import LegacyTextarea from "../../../../../packages/ui/src/legacy/Textarea.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Channel, agent, and report textareas",
    scenes: [
      {
        label: "HumanDetailPanel.tsx:309",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:309",
      },
      {
        label: "CreateJointChannelDialog.tsx:209,232",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:209,232",
      },
      {
        label: "CreateChannelDialog.tsx:272",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateChannelDialog.tsx:272",
      },
      {
        label: "EditChannelDialog.tsx:166",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:166",
      },
      {
        label: "ReportIssueDialog.tsx:294",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ReportIssueDialog.tsx:294",
      },
      {
        label: "CreateAgentDialog.tsx:416",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/CreateAgentDialog.tsx:416",
      },
      {
        label: "AgentDetailPanel.tsx:876",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:876",
      },
      {
        label: "SettingsPanel.tsx:2569,2630",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:2569,2630",
      },
    ],
  },
  {
    label: "Composer and wrappers",
    scenes: [
      {
        label: "SOSDialog.tsx:102",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/SOSDialog.tsx:102",
      },
      {
        label: "MessageInput.tsx:1106",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:1106",
      },
      {
        label: "Textarea.tsx:114",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/Textarea.tsx:114",
      },
    ],
  },
] as const;

const SNIPPETS = {
  preview: `<Textarea
  className="w-80"
  rows={4}
  placeholder="Type your message here."
/>`,
  anatomy: `<Textarea />`,
  states: `<Textarea aria-label="Message" rows={4} placeholder="Type your message here." />
<Textarea aria-label="Message" rows={4} defaultValue="Hello world." />
<Textarea aria-label="Message" rows={4} aria-invalid defaultValue="oops" />
<Textarea aria-label="Message" rows={4} disabled placeholder="Disabled" />
<Textarea aria-label="Message" rows={4} aria-invalid disabled defaultValue="Locked error" />`,
  counter: `import { Textarea, TextareaCounter, TextareaGroup } from "raft-ui";

<TextareaGroup>
  <Textarea
    aria-label="Message"
    rows={4}
    value={message}
    onChange={(event) => setMessage(event.currentTarget.value)}
    placeholder="Type your message here."
  />
  <TextareaCounter value={message} limit={24} />
</TextareaGroup>`,
  autoGrow: `<Textarea
  aria-label="Auto growing message"
  className="field-sizing-content max-h-80 resize-none overflow-y-auto"
  placeholder="Type a few lines..."
/>`,
  field: `import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea,
  TextareaCounter,
  TextareaGroup,
} from "raft-ui";

<Field invalid>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <TextareaGroup>
    <Textarea
      id="msg"
      rows={4}
      maxLength={120}
      value={message}
      onChange={(event) => setMessage(event.currentTarget.value)}
    />
    <TextareaCounter value={message} limit={120} />
  </TextareaGroup>
  <FieldError match>Message is required.</FieldError>
</Field>`,
  migrationShell: `// Source
<textarea className="input-brutal" rows={4} placeholder="Type your message here." />

// Current
<Textarea aria-label="Message" rows={4} placeholder="Type your message here." />`,
  migrationWrapper: `// Source
<Textarea
  rows={4}
  hint="Enter your message below."
  showCounter
  limit={120}
  defaultValue="Hello world."
/>

// Current
<Field>
  <FieldLabel htmlFor="message">Message</FieldLabel>
  <TextareaGroup>
    <Textarea id="message" rows={4} maxLength={120} defaultValue="Hello world." />
    <TextareaCounter value="Hello world." limit={120} />
  </TextareaGroup>
  <FieldDescription>Enter your message below.</FieldDescription>
</Field>`,
  migrationInvalid: `// Source
<Textarea
  rows={4}
  error="Message is required."
  showCounter
  limit={120}
  defaultValue="oops"
/>

// Current
<Field invalid>
  <TextareaGroup>
    <Textarea aria-label="Message" rows={4} aria-invalid maxLength={120} defaultValue="oops" />
    <TextareaCounter value="oops" limit={120} />
  </TextareaGroup>
  <FieldError match>Message is required.</FieldError>
</Field>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "aria-invalid",
    type: "boolean",
    description:
      "Standalone invalid styling. Inside Field, set Field invalid and keep aria-invalid on the control when native textarea state should match.",
  },
  {
    name: "ref",
    type: "Ref<HTMLTextAreaElement>",
    description: "Forwarded to the underlying textarea (React 19 ref prop).",
  },
  {
    name: "...props",
    type: "TextareaHTMLAttributes",
    description:
      "All native textarea attributes (value, onChange, rows, maxLength, placeholder, disabled, etc.).",
  },
];

const GROUP_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description:
      "Place Textarea and TextareaCounter as direct children. Elegant positions the counter inside the textarea bottom-right; Brutal keeps it below the control.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description: "Native div attributes for layout, width, and custom composition.",
  },
];

const COUNTER_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "string",
    description: "Text whose length is counted. Ignored when count is set.",
  },
  {
    name: "count",
    type: "number",
    description: "Override the counted length directly.",
  },
  {
    name: "limit",
    type: "number",
    description: "Shown after the slash; the counter turns red once length exceeds it.",
  },
  {
    name: "getLength",
    type: "(value: string) => number",
    description: "Custom length function, for example Unicode code point counting.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for custom counter labeling or test hooks.",
  },
];

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

const TextareaCurrent = TEXTAREA_SOURCE_COMPARISON_COMPOSITION;

const TEXTAREA_COMPOSITION_RAW_SOURCES = {
  DefaultShell: textareaDefaultShellCompositionSource,
  DisabledStyling: textareaDisabledStylingCompositionSource,
  InvalidState: textareaInvalidStateCompositionSource,
  WrapperApi: textareaWrapperApiCompositionSource,
} as const;

const TEXTAREA_COMPOSITION_SOURCES = createCompositionSourceMap(TEXTAREA_COMPOSITION_RAW_SOURCES);

const TEXTAREA_COMPOSITION_SNIPPET_IDS = {
  DefaultShell: "textareaDefaultShellComposition",
  DisabledStyling: "textareaDisabledStylingComposition",
  InvalidState: "textareaInvalidStateComposition",
  WrapperApi: "textareaWrapperApiComposition",
} as const;

type TextareaCompositionKey = keyof typeof TEXTAREA_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/textarea")({
  component: TextareaDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          TEXTAREA_COMPOSITION_SOURCES,
          TEXTAREA_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function TextareaDoc() {
  const code = Route.useLoaderData();
  const [counterMessage, setCounterMessage] = useState("The quick brown fox.");
  const [fieldMessage, setFieldMessage] = useState("oops");
  const textareaComposition = (key: TextareaCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: TEXTAREA_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: TEXTAREA_COMPOSITION_SNIPPET_IDS,
      sources: TEXTAREA_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Textarea"
      description="A multi-line text control with theme-aware focus, invalid, and disabled states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TextareaPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="states" title="States">
            <DocNote>
              <InlineCode>disabled</InlineCode> wins over <InlineCode>aria-invalid</InlineCode>. A
              disabled invalid textarea keeps the disabled border and removes the invalid ring
              because the user cannot edit it.
            </DocNote>
            <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
              <Preview.Canvas>
                <div className="grid w-full max-w-96 gap-3">
                  <Textarea aria-label="Message" rows={4} placeholder="Type your message here." />
                  <Textarea aria-label="Message" rows={4} defaultValue="Hello world." />
                  <Textarea aria-label="Message" rows={4} aria-invalid defaultValue="oops" />
                  <Textarea aria-label="Message" rows={4} disabled placeholder="Disabled" />
                  <Textarea
                    aria-label="Message"
                    rows={4}
                    aria-invalid
                    disabled
                    defaultValue="Locked error"
                  />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="counter" title="Counter">
            <DocNote>
              Place <InlineCode>TextareaCounter</InlineCode> inside{" "}
              <InlineCode>TextareaGroup</InlineCode> to position it in the textarea. Pass the
              current <InlineCode>value</InlineCode> from your change handler and the intended{" "}
              <InlineCode>limit</InlineCode> explicitly. Omit native{" "}
              <InlineCode>maxLength</InlineCode> when the counter should show an over-limit state.
            </DocNote>
            <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
              <Preview.Canvas>
                <div className="grid w-80 gap-4">
                  <TextareaGroup>
                    <Textarea
                      aria-label="Message"
                      rows={4}
                      value={counterMessage}
                      onChange={(event) => setCounterMessage(event.currentTarget.value)}
                      placeholder="Type your message here."
                    />
                    <TextareaCounter value={counterMessage} limit={24} />
                  </TextareaGroup>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.counter} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="auto-grow" title="Auto grow">
            <DocNote>
              Use <InlineCode>field-sizing-content</InlineCode> when the textarea should grow with
              its content. The component still keeps its default minimum height; pair content sizing
              with a max height for long drafts so the control scrolls instead of pushing the page
              indefinitely.
            </DocNote>
            <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
              <Preview.Canvas>
                <Textarea
                  aria-label="Auto growing message"
                  className="w-80 field-sizing-content max-h-80 resize-none overflow-y-auto"
                  placeholder="Type a few lines..."
                />
              </Preview.Canvas>
              <Preview.Code html={code.autoGrow} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <DocNote>
              Label, description, and error copy come from <Link to="/components/field">Field</Link>
              . Textarea stays a pure control; the counter is a composed companion part that follows
              the field invalid state.
            </DocNote>
            <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
              <Preview.Canvas>
                <Field className="w-80" invalid>
                  <FieldLabel htmlFor="msg">Message</FieldLabel>
                  <TextareaGroup>
                    <Textarea
                      id="msg"
                      rows={4}
                      maxLength={120}
                      value={fieldMessage}
                      onChange={(event) => setFieldMessage(event.currentTarget.value)}
                    />
                    <TextareaCounter value={fieldMessage} limit={120} />
                  </TextareaGroup>
                  <FieldError match>Message is required.</FieldError>
                </Field>
              </Preview.Canvas>
              <Preview.Code html={code.field} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Textarea">
            <PropsTable rows={PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-group" title="TextareaGroup">
            <PropsTable rows={GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-counter" title="TextareaCounter">
            <PropsTable rows={COUNTER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Default shell",
              status: "match",
              note: "Source used the input-brutal shell. Brutal keeps that shape; Elegant maps the same native textarea API to the quieter field surface.",
              source: (
                <LegacyTextarea
                  aria-label="Message"
                  className="w-80"
                  rows={4}
                  placeholder="Type your message here."
                />
              ),
              brutal: <TextareaCurrent.DefaultShell />,
              elegant: <TextareaCurrent.DefaultShell />,
              elegantDark: <TextareaCurrent.DefaultShell />,
              ...textareaComposition("DefaultShell"),
            },
            {
              label: "Wrapper API to composition",
              status: "difference",
              note: "Source Textarea owned hint, error, and counter props. Current Textarea keeps the control skin narrow while Field and TextareaCounter own surrounding form composition.",
              source: (
                <LegacyTextarea
                  aria-label="Message"
                  className="w-80"
                  rows={4}
                  hint="Enter your message below."
                  showCounter
                  limit={120}
                  defaultValue="Hello world."
                />
              ),
              brutal: <TextareaCurrent.WrapperApi />,
              elegant: <TextareaCurrent.WrapperApi />,
              elegantDark: <TextareaCurrent.WrapperApi />,
              ...textareaComposition("WrapperApi"),
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Source used a red border, tinted background, red ring, and no brutal black shadow while invalid. Current Textarea centralizes the same control state behind aria-invalid.",
              source: (
                <LegacyTextarea
                  aria-label="Message"
                  className="w-80"
                  rows={4}
                  error="Message is required."
                  showCounter
                  limit={120}
                  defaultValue="oops"
                />
              ),
              brutal: <TextareaCurrent.InvalidState />,
              elegant: <TextareaCurrent.InvalidState />,
              elegantDark: <TextareaCurrent.InvalidState />,
              ...textareaComposition("InvalidState"),
            },
            {
              label: "Disabled styling",
              status: "new",
              note: "Source textarea did not own a disabled visual state. Current Textarea adds one so unavailable text areas remain readable without looking editable.",
              source: <MissingSource />,
              brutal: <TextareaCurrent.DisabledStyling />,
              elegant: <TextareaCurrent.DisabledStyling />,
              elegantDark: <TextareaCurrent.DisabledStyling />,
              ...textareaComposition("DisabledStyling"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
