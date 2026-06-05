import { createFileRoute } from "@tanstack/react-router";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import AppSandboxedPreviewFrame from "../../../../../packages/ui/src/legacy/SandboxedPreviewFrame.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "api", title: "API" },
] as const;

const TODOS = [
  "Skipped: keep as an app-local security utility, not an @slock/ui component",
] as const;

const SNIPPETS = {
  anatomy: `import SandboxedPreviewFrame from "../ui/SandboxedPreviewFrame";

<SandboxedPreviewFrame
  title="Attachment preview"
  src={scopedUrl}
  sandbox="allow-scripts"
  className="h-full w-full border-0 bg-white"
/>`,
  usage: `// Static SVG (Mermaid) — maximally locked, zero scripts:
<SandboxedPreviewFrame title="Diagram" srcDoc={svgDoc} />

// Interactive HTML attachment — scripts allowed, never same-origin:
<SandboxedPreviewFrame title="Preview" src={scopedUrl} sandbox="allow-scripts" />`,
  sourceHtml: `<SandboxedPreviewFrame
  title={\`HTML preview: \${filename}\`}
  src={url}
  sandbox="allow-scripts"
  referrerPolicy="no-referrer"
  className="h-full w-full border-0 bg-white"
/>`,
  currentHtml: `<SandboxedPreviewFrame
  title={\`HTML preview: \${filename}\`}
  src={url}
  sandbox="allow-scripts"
  referrerPolicy="no-referrer"
  className="h-full w-full border-0 bg-white"
/>`,
  sourcePdf: `<SandboxedPreviewFrame
  title={\`PDF preview: \${filename}\`}
  src={url ?? ""}
  sandbox="allow-scripts"
  referrerPolicy="no-referrer"
  className="h-full w-full border-0 bg-white"
/>`,
  currentPdf: `<SandboxedPreviewFrame
  title={\`PDF preview: \${filename}\`}
  src={url ?? ""}
  sandbox="allow-scripts"
  referrerPolicy="no-referrer"
  className="h-full w-full border-0 bg-white"
/>`,
  sourceMermaid: `<SandboxedPreviewFrame
  srcDoc={result.srcDoc}
  sandbox=""
  referrerPolicy="no-referrer"
  title="Mermaid diagram"
  className="block w-full border-0 bg-transparent"
  style={{ width: "100%", aspectRatio: \`\${result.w} / \${result.h}\` }}
/>`,
  currentMermaid: `<SandboxedPreviewFrame
  srcDoc={result.srcDoc}
  sandbox=""
  referrerPolicy="no-referrer"
  title="Mermaid diagram"
  className="block w-full border-0 bg-transparent"
  style={{ width: "100%", aspectRatio: \`\${result.w} / \${result.h}\` }}
/>`,
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
    description:
      "iframe sandbox tokens. Empty = maximally locked. Use allow-scripts for HTML/PDF preview; never allow-same-origin for untrusted content.",
  },
  { name: "title", type: "string", description: "Required accessible title." },
  {
    name: "referrerPolicy",
    type: "HTMLAttributeReferrerPolicy",
    default: '"no-referrer"',
    description: "Forwarded to the iframe.",
  },
  {
    name: "className / style / native iframe props",
    type: 'ComponentPropsWithRef<"iframe">',
    description: "Caller-owned sizing and native iframe attributes. The root element is fixed.",
  },
];

const HTML_ATTACHMENT_DOC = encodeURIComponent(`<!doctype html>
<html>
  <body style="margin:0;background:#fff;font:14px ui-monospace,SFMono-Regular,Menlo,monospace;color:#111">
    <main style="padding:18px">
      <div style="display:flex;align-items:center;justify-content:space-between;border:2px solid #111;background:#bfe8f2;padding:10px 12px;font-weight:800">
        <span>interactive-report.html</span>
        <span style="border:2px solid #111;background:#fee899;padding:3px 8px">sandboxed</span>
      </div>
      <section style="margin-top:14px;border:2px solid #111;padding:14px;background:#fff">
        <h1 style="margin:0 0 8px;font-size:18px">HTML attachment preview</h1>
        <p style="margin:0 0 12px;line-height:1.45">Scripts can run here, but this frame never receives same-origin access.</p>
        <button style="border:2px solid #111;background:#a9d877;padding:7px 12px;font:inherit;font-weight:800;box-shadow:4px 4px 0 #111">Demo action</button>
      </section>
    </main>
  </body>
</html>`);
const HTML_ATTACHMENT_URL = `data:text/html;charset=utf-8,${HTML_ATTACHMENT_DOC}`;

const PDF_ATTACHMENT_DOC = encodeURIComponent(`<!doctype html>
<html>
  <body style="margin:0;background:#f6f6f6;font:13px ui-monospace,SFMono-Regular,Menlo,monospace;color:#111">
    <div style="height:28px;display:flex;align-items:center;gap:8px;border-bottom:2px solid #111;background:#222;color:#fff;padding:0 10px">
      <strong>PDF preview</strong><span>release-notes.pdf</span><span style="margin-left:auto">1 / 3</span>
    </div>
    <main style="display:grid;place-items:center;padding:18px">
      <article style="width:72%;min-height:170px;border:2px solid #111;background:white;box-shadow:6px 6px 0 #111;padding:20px">
        <h1 style="margin:0 0 12px;font-size:20px">Release notes</h1>
        <div style="height:8px;background:#111;margin-bottom:12px"></div>
        <p style="margin:0 0 10px;line-height:1.45">A mocked native PDF surface for docs comparison.</p>
        <p style="margin:0;line-height:1.45;color:#666">The source callsite uses the same sandbox contract as HTML preview.</p>
      </article>
    </main>
  </body>
</html>`);
const PDF_ATTACHMENT_URL = `data:text/html;charset=utf-8,${PDF_ATTACHMENT_DOC}`;

const MERMAID_SRC_DOC =
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='96'><rect width='240' height='96' fill='white'/><rect x='16' y='20' width='84' height='40' fill='#bfe8f2' stroke='black' stroke-width='2'/><rect x='140' y='20' width='84' height='40' fill='#a9d877' stroke='black' stroke-width='2'/><path d='M100 40H140' stroke='black' stroke-width='2'/><text x='28' y='45' font-family='monospace' font-size='12'>render</text><text x='154' y='45' font-family='monospace' font-size='12'>frame</text></svg>";

export const Route = createFileRoute("/components/sandboxed-preview-frame")({
  component: SandboxedPreviewFrameDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SandboxedPreviewFrameDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SandboxedPreviewFrame"
      description="A source security utility that should stay app-local instead of becoming a design-system component."
      overview={
        <Differences from="SandboxedPreviewFrame">
          <li>
            skipped for <code>@slock/ui</code>: no visual contract, no theme contract, and no Base
            UI/composition value
          </li>
          <li>
            HTML/PDF previews keep <code>sandbox=&quot;allow-scripts&quot;</code> without{" "}
            <code>allow-same-origin</code>; Mermaid keeps an empty sandbox
          </li>
          <li>
            keep the source implementation as an app-level utility so security policy stays close to
            attachment and markdown preview callsites
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <AttachmentPreviewDemo filename="interactive-report.html" label="HTML preview">
            <AppSandboxedPreviewFrame
              title="HTML attachment preview"
              src={HTML_ATTACHMENT_URL}
              sandbox="allow-scripts"
              className="h-full w-full border-0 bg-white"
            />
          </AttachmentPreviewDemo>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <Example html={code.usage}>
          <div className="flex flex-wrap gap-4">
            <MermaidMessagePreview>
              <AppSandboxedPreviewFrame
                title="Inline SVG preview"
                srcDoc={MERMAID_SRC_DOC}
                sandbox=""
                className="block w-full border-0 bg-transparent"
                style={{ width: "100%", aspectRatio: "240 / 96" }}
              />
            </MermaidMessagePreview>
            <AttachmentPreviewDemo filename="interactive-report.html" label="HTML preview">
              <AppSandboxedPreviewFrame
                title="HTML attachment preview"
                src={HTML_ATTACHMENT_URL}
                sandbox="allow-scripts"
                className="h-full w-full border-0 bg-white"
              />
            </AttachmentPreviewDemo>
          </div>
        </Example>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "HTML attachment preview",
              status: "match",
              note: "Source pins allow-scripts for interactive HTML while omitting allow-same-origin. Current decision is to keep the same utility app-local, outside @slock/ui.",
              source: (
                <AttachmentPreviewDemo filename="interactive-report.html" label="HTML preview">
                  <AppSandboxedPreviewFrame
                    title="HTML preview: attachment.html"
                    src={HTML_ATTACHMENT_URL}
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                    className="h-full w-full border-0 bg-white"
                  />
                </AttachmentPreviewDemo>
              ),
              current: (
                <AttachmentPreviewDemo filename="interactive-report.html" label="HTML preview">
                  <AppSandboxedPreviewFrame
                    title="HTML preview: attachment.html"
                    src={HTML_ATTACHMENT_URL}
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                    className="h-full w-full border-0 bg-white"
                  />
                </AttachmentPreviewDemo>
              ),
              sourceCode: code.sourceHtml,
              currentCode: code.currentHtml,
            },
            {
              label: "PDF preview",
              status: "match",
              note: "Source uses the same opaque-origin allow-scripts setup for native PDF viewers. Current keeps that behavior app-local instead of exporting a design-system primitive.",
              source: (
                <AttachmentPreviewDemo filename="release-notes.pdf" label="PDF preview">
                  <AppSandboxedPreviewFrame
                    title="PDF preview: release-notes.pdf"
                    src={PDF_ATTACHMENT_URL}
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                    className="h-full w-full border-0 bg-white"
                  />
                </AttachmentPreviewDemo>
              ),
              current: (
                <AttachmentPreviewDemo filename="release-notes.pdf" label="PDF preview">
                  <AppSandboxedPreviewFrame
                    title="PDF preview: release-notes.pdf"
                    src={PDF_ATTACHMENT_URL}
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                    className="h-full w-full border-0 bg-white"
                  />
                </AttachmentPreviewDemo>
              ),
              sourceCode: code.sourcePdf,
              currentCode: code.currentPdf,
            },
            {
              label: "Mermaid diagram",
              status: "match",
              note: "Source uses srcDoc plus an empty sandbox for static SVG. Current keeps the zero-script contract near the markdown preview implementation.",
              source: (
                <MermaidMessagePreview>
                  <AppSandboxedPreviewFrame
                    title="Mermaid diagram"
                    srcDoc={MERMAID_SRC_DOC}
                    sandbox=""
                    referrerPolicy="no-referrer"
                    className="block w-full border-0 bg-transparent"
                    style={{ width: "100%", aspectRatio: "240 / 96" }}
                  />
                </MermaidMessagePreview>
              ),
              current: (
                <MermaidMessagePreview>
                  <AppSandboxedPreviewFrame
                    title="Mermaid diagram"
                    srcDoc={MERMAID_SRC_DOC}
                    sandbox=""
                    referrerPolicy="no-referrer"
                    className="block w-full border-0 bg-transparent"
                    style={{ width: "100%", aspectRatio: "240 / 96" }}
                  />
                </MermaidMessagePreview>
              ),
              sourceCode: code.sourceMermaid,
              currentCode: code.currentMermaid,
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

function AttachmentPreviewDemo({
  filename,
  label,
  children,
}: {
  filename: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[520px] border-2 border-black bg-white shadow-[6px_6px_0_#111]">
      <div className="flex items-center gap-2 border-b-2 border-black bg-brutal-cream px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-black">{filename}</span>
        <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-black">
          {label}
        </span>
      </div>
      <div className="h-64 bg-white">{children}</div>
    </div>
  );
}

function MermaidMessagePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[520px]">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-black/60">
        <span># engineering</span>
        <span className="text-black/30">Mermaid diagram</span>
      </div>
      <div className="overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_#111]">
        {children}
      </div>
    </div>
  );
}
