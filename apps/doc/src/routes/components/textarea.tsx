import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode, Textarea, TextareaCounter, TextareaGroup } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { TextareaWithFieldContent } from "#/modules/textarea/compositions/with-field.composition.tsx";
import textareaWithFieldCompositionSource from "#/modules/textarea/compositions/with-field.composition.tsx?raw";
import { TEXTAREA_PREVIEW_CLASS } from "#/modules/textarea/textarea.constants.ts";
import { TextareaPreview } from "#/modules/textarea/textarea.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
const SNIPPETS = {
  preview: `<Textarea
  className="w-80"
  rows={4}
  placeholder="Type your message here."
/>`,
  anatomy: `import { Textarea } from "raft-ui";

<Textarea />`,
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
} as const;

const TEXTAREA_COMPOSITION_SOURCES = createCompositionSourceMap({
  WithField: textareaWithFieldCompositionSource,
});

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

export const Route = createFileRoute("/components/textarea")({
  component: TextareaDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(TEXTAREA_COMPOSITION_SOURCES, {
          WithField: "textareaWithFieldComposition",
        }),
      },
    }),
});

function TextareaDoc() {
  const code = Route.useLoaderData();
  const [counterMessage, setCounterMessage] = useState("The quick brown fox.");

  return (
    <DocPage
      title="Textarea"
      description="A multi-line text control with theme-aware focus, invalid, and disabled states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TextareaPreview code={code.preview} />
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
              Label, description, and error copy come from{" "}
              <Link to="/components/field">
                <InlineCode>Field</InlineCode>
              </Link>
              . <InlineCode>Textarea</InlineCode> stays a pure control while{" "}
              <InlineCode>Field</InlineCode> associates supporting copy and validation feedback with
              it.
            </DocNote>
            <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
              <Preview.Canvas>
                <TextareaWithFieldContent />
              </Preview.Canvas>
              <Preview.Code html={code.textareaWithFieldComposition} />
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
    </DocPage>
  );
}
