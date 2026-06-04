import { createFileRoute } from "@tanstack/react-router";
import { SandboxedPreviewFrame } from "@slock/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["No visual styling to theme — security primitive only"] as const;

const SNIPPETS = {
  anatomy: `import { SandboxedPreviewFrame } from "@slock/ui";

<SandboxedPreviewFrame
  title="Attachment preview"
  src={scopedUrl}
  sandbox="allow-scripts"
/>`,
  usage: `// Static SVG (Mermaid) — maximally locked, zero scripts:
<SandboxedPreviewFrame title="Diagram" srcDoc={svgDoc} />

// Interactive HTML attachment — scripts allowed, never same-origin:
<SandboxedPreviewFrame title="Preview" src={scopedUrl} sandbox="allow-scripts" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "src",
    type: "string",
    description: "Scoped URL to frame. Mutually exclusive with srcDoc.",
  },
  {
    name: "srcDoc",
    type: "string",
    description: "Inline document to frame. Mutually exclusive with src.",
  },
  {
    name: "sandbox",
    type: "string",
    default: '""',
    description: "iframe sandbox tokens. Empty = maximally locked. Never allow-same-origin.",
  },
  { name: "title", type: "string", description: "Required accessible title." },
  {
    name: "referrerPolicy",
    type: "HTMLAttributeReferrerPolicy",
    default: '"no-referrer"',
    description: "Forwarded to the iframe.",
  },
  {
    name: "className / style",
    type: "string / CSSProperties",
    description: "Caller-owned sizing.",
  },
];

export const Route = createFileRoute("/components/sandboxed-preview-frame")({
  component: SandboxedPreviewFrameDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SandboxedPreviewFrameDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SandboxedPreviewFrame"
      description="An isolation primitive for previewing attacker-controlled content in an iframe."
      overview={
        <Differences from="SandboxedPreviewFrame">
          <li>reproduced 1:1 — a pure passthrough iframe with no styling of its own</li>
          <li>
            intentionally keeps the native <code>iframe</code> as the base element because it is the
            security boundary
          </li>
          <li>
            the <code>default</code> export is now a named <code>SandboxedPreviewFrame</code> export
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-4">
          <Example html={code.usage}>
            <SandboxedPreviewFrame
              title="Inline SVG preview"
              srcDoc="<svg xmlns='http://www.w3.org/2000/svg' width='220' height='80'><rect width='220' height='80' fill='%23a9d877'/><text x='16' y='46' font-family='monospace'>sandboxed</text></svg>"
              className="h-20 w-56 border-2 border-black"
            />
          </Example>
          <Callout>
            The iframe is the security boundary: with no <code>allow-same-origin</code>, framed
            content runs in an opaque origin and can&rsquo;t touch the host DOM, cookies, or
            storage.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
