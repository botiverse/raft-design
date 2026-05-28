import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (p: string) => readFileSync(resolve(repoRoot, p), "utf8");

test("beautiful-mermaid is the declared dependency (not better-mermaid / dompurify)", () => {
  const pkg = JSON.parse(read("package.json")) as {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  assert.ok(pkg.dependencies["beautiful-mermaid"], "beautiful-mermaid must be a dependency");
  assert.ok(!pkg.dependencies["better-mermaid"], "better-mermaid must NOT be a dependency");
  // Isolation is via sandboxed iframe, not a sanitizer dep — no DOMPurify.
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.ok(!all["isomorphic-dompurify"] && !all["dompurify"], "no DOMPurify dep — iframe isolation replaces it");
});

test("MermaidDiagram lazy-loads beautiful-mermaid (keeps elkjs out of the main bundle)", () => {
  const src = read("src/components/markdown/MermaidDiagram.tsx");
  // Dynamic import only — a static `from "beautiful-mermaid"` would pull the
  // layout engine into the main chunk.
  assert.match(src, /import\("beautiful-mermaid"\)/);
  assert.doesNotMatch(src, /from\s+["']beautiful-mermaid["']/);
  // Synchronous render API used inside try/catch with a source fallback.
  assert.match(src, /renderMermaidSVG\(code,/);
  assert.match(src, /MermaidSourceFallback/);
  assert.match(src, /\} catch \{/);
});

test("①+② attacker-controlled SVG renders in an EMPTY-sandbox iframe, never main DOM", () => {
  const src = read("src/components/markdown/MermaidDiagram.tsx");
  // No string ever reaches the main document — the only safe sink is the
  // sandboxed iframe. dangerouslySetInnerHTML must not exist here at all.
  assert.doesNotMatch(src, /dangerouslySetInnerHTML/);
  // SVG goes into the shared isolation primitive via srcDoc with an EMPTY
  // sandbox (no allow-scripts, no allow-same-origin) → opaque origin, zero
  // script execution, so script/onload/foreignObject/javascript: are inert.
  assert.match(src, /import SandboxedPreviewFrame from "\.\.\/ui\/SandboxedPreviewFrame"/);
  assert.match(src, /<SandboxedPreviewFrame\b[\s\S]*?srcDoc=\{result\.srcDoc\}[\s\S]*?sandbox=""/);
  assert.doesNotMatch(src, /sandbox="[^"]*allow-(scripts|same-origin)[^"]*"/);
  assert.match(src, /buildMermaidSrcDoc\(svg\)/);

  // srcDoc carries a strict CSP as defense-in-depth on top of the empty sandbox.
  const frame = read("src/components/markdown/mermaidFrame.ts");
  assert.match(frame, /Content-Security-Policy/);
  assert.match(frame, /default-src 'none'/);
  assert.match(frame, /export function buildMermaidSrcDoc\(svg: string\): string/);
  assert.match(frame, /export function parseSvgAspect\(svg: string\)/);
});

test("③ HtmlAttachmentPreviewModal migrated to the shared primitive — behavior preserved", () => {
  const item = read("src/components/message/MessageItem.tsx");
  const modal = item.match(/function HtmlAttachmentPreviewModal\([\s\S]*?\n\}\n/);
  assert.ok(modal, "HtmlAttachmentPreviewModal not found");
  const m = modal[0];
  // Uses the shared primitive, NOT a bare iframe.
  assert.doesNotMatch(m, /<iframe\b/);
  assert.match(m, /<SandboxedPreviewFrame\b/);
  // Every iframe attribute pinned, unchanged from the pre-extraction iframe:
  assert.match(m, /src=\{url\}/);
  assert.match(m, /sandbox="allow-scripts"/); // exactly — not tightened/loosened
  assert.match(m, /referrerPolicy="no-referrer"/);
  assert.match(m, /className="h-full w-full border-0 bg-white"/);
  assert.match(m, /title=\{`HTML preview: \$\{filename\}`\}/);
  // Threat-model comment retained.
  assert.match(m, /Threat model: any human or agent can upload hostile HTML/);

  // The two sandbox configs are pinned independently so a shared default
  // can't silently drift either callsite (Bugen re-review guard).
  const prim = read("src/components/ui/SandboxedPreviewFrame.tsx");
  assert.match(prim, /sandbox = ""/); // primitive defaults to maximally locked
});

test("④ PDF attachment preview uses the shared primitive — opaque origin, no allow-same-origin", () => {
  const item = read("src/components/message/MessageItem.tsx");
  // The PDF branch must not be a bare iframe — that was the pre-fix shape
  // flagged by react-doctor `iframe-missing-sandbox` (Ark security review,
  // #proj-frontend:8b1098b4).
  const pdfBranch = item.match(/preview\.kind === "pdf" \? \([\s\S]*?\) : null/);
  assert.ok(pdfBranch, "PDF preview branch not found in DocumentAttachmentPreviewModal");
  const m = pdfBranch[0];
  assert.doesNotMatch(m, /<iframe\b/, "PDF preview must not render a bare iframe");
  assert.match(m, /<SandboxedPreviewFrame\b/);
  // allow-scripts only — native PDF viewers need scripts. allow-same-origin
  // would dissolve the origin boundary and is forbidden for attacker-uploaded
  // content (PDF bytes come from any human or agent).
  assert.match(m, /sandbox="allow-scripts"/);
  assert.doesNotMatch(m, /sandbox="[^"]*allow-same-origin[^"]*"/);
  assert.match(m, /referrerPolicy="no-referrer"/);
  assert.match(m, /title=\{`PDF preview: \$\{filename\}`\}/);
});

test("mermaid is opt-in and scoped to attachment preview, NOT chat message body", () => {
  const md = read("src/components/markdown/MarkdownContent.tsx");
  assert.match(md, /enableMermaid\?: boolean/);
  assert.match(md, /getMarkdownComponents\(\s*density: MarkdownDensity,\s*enableMermaid = false,?\s*\)/);
  assert.match(md, /MERMAID_MARKDOWN_COMPONENTS/);
  // pre-slot interception (keeps SVG out of the dark code wrapper).
  assert.match(md, /readMermaidSource\(children\)/);

  const item = read("src/components/message/MessageItem.tsx");
  // Attachment preview opts in…
  assert.match(
    item,
    /<MarkdownContent[\s\S]*source=\{markdown\}[\s\S]*density="document"[\s\S]*enableMermaid[\s\S]*components=\{headingComponents\}[\s\S]*\/>/,
  );
  // …and there is exactly one enableMermaid usage (chat body must not get it).
  const occurrences = item.match(/enableMermaid/g) ?? [];
  assert.equal(occurrences.length, 1, "only the attachment-preview callsite may enable mermaid");
});

test("readMermaidSource lives in a standalone pure module (cheap unit guard)", () => {
  const src = read("src/components/markdown/mermaidSource.ts");
  assert.match(src, /export function readMermaidSource\(children: ReactNode\): string \| null/);
  // Pure: must not import the renderer or react-markdown (only `react`).
  assert.doesNotMatch(src, /from\s+["']beautiful-mermaid["']/);
  assert.doesNotMatch(src, /import\(["']beautiful-mermaid["']\)/);
  assert.doesNotMatch(src, /from\s+["']react-markdown["']/);
});
