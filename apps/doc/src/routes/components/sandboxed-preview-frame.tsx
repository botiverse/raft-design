import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import AppSandboxedPreviewFrame from "#/modules/sandboxed-preview-frame/sandboxed-preview-frame.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Skipped: keep as an app-local security utility, not an raft-ui component"] as const;

const SNIPPETS = {
  preview: `import SandboxedPreviewFrame from "../ui/SandboxedPreviewFrame";

<SandboxedPreviewFrame
  title="Attachment preview"
  src={scopedUrl}
  sandbox="allow-scripts"
  className="h-full w-full border-0 bg-white"
/>`,
  anatomy: `import SandboxedPreviewFrame from "../ui/SandboxedPreviewFrame";

<SandboxedPreviewFrame title="Attachment preview" src={scopedUrl} />`,
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
      overview={<TodoList items={TODOS} />}
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <AttachmentPreviewDemo filename="interactive-report.html" label="HTML preview">
              <AppSandboxedPreviewFrame
                title="HTML attachment preview"
                src={HTML_ATTACHMENT_URL}
                sandbox="allow-scripts"
                className="h-full w-full border-0 bg-white"
              />
            </AttachmentPreviewDemo>
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
        <DocSubsection parentId="usage" id="sandboxed-content" title="Sandboxed content">
          <Preview>
            <Preview.Canvas>
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
            </Preview.Canvas>
            <Preview.Code html={code.usage} />
          </Preview>
        </DocSubsection>
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
