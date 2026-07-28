import { useMemo } from "react";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { markdownReferenceSanitizeSchema } from "#/lib/markdown/markdown-reference-sanitize-schema.ts";
import { createExampleReferenceComponents } from "#/modules/message-reference/create-example-reference-components.tsx";
import { EXAMPLE_REFERENCE_REMARK_PLUGINS } from "#/modules/message-reference/example-reference-remark-plugins.ts";

type ExampleMarkdownProps = {
  portalContainer?: HTMLElement | null;
};

const EXAMPLE_SOURCE = `Ask @Atlas to ship the **token fixture** pass — \`layer-panel\`, mentions, and [docs links](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) stay caller-owned.

@you tracked #21 in #release-notes and linked #release-notes:reply.

- Keep body content in \`MessageItemBody\`
- Prefer ~~ad-hoc spans~~ semantic markdown + reference parts`;

const LEAD_SOURCE = `@Atlas starting a short sequence — first the **layout pass**, then gutter clock polish for #release-notes.`;

const FOLLOW_UP_SOURCE = `@you — the second row keeps only its timestamp in the gutter, with a quick \`HH:MM\` hover clock.

1. Align the gutter to the **avatar column**
2. Land #21 before the #all rollout`;

const CLOSING_SOURCE = `Final note for @Atlas in #release-notes:reply:

> Compact rows should read as one thread, not a new speaker.

\`\`\`tsx
<MessageItem compact>
  <MessageItemGutter />
</MessageItem>
\`\`\``;

function ExampleMarkdown({ portalContainer, source }: ExampleMarkdownProps & { source: string }) {
  // react-markdown re-parses whenever the components identity changes, so keep it stable.
  const components = useMemo(
    () => createExampleReferenceComponents(portalContainer),
    [portalContainer],
  );

  return (
    <Markdown
      additionalRemarkPlugins={EXAMPLE_REFERENCE_REMARK_PLUGINS}
      components={components}
      sanitizeSchema={markdownReferenceSanitizeSchema}
    >
      {source}
    </Markdown>
  );
}

/** Compact markdown used by MessageItem docs examples (not the full catalog). */
export function MessageItemExampleMarkdown({ portalContainer }: ExampleMarkdownProps = {}) {
  return <ExampleMarkdown portalContainer={portalContainer} source={EXAMPLE_SOURCE} />;
}

export function MessageItemExampleMarkdownLead({ portalContainer }: ExampleMarkdownProps = {}) {
  return <ExampleMarkdown portalContainer={portalContainer} source={LEAD_SOURCE} />;
}

export function MessageItemExampleMarkdownFollowUp({ portalContainer }: ExampleMarkdownProps = {}) {
  return <ExampleMarkdown portalContainer={portalContainer} source={FOLLOW_UP_SOURCE} />;
}

export function MessageItemExampleMarkdownClosing({ portalContainer }: ExampleMarkdownProps = {}) {
  return <ExampleMarkdown portalContainer={portalContainer} source={CLOSING_SOURCE} />;
}
