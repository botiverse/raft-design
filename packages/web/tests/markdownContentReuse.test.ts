import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

// stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137):
//   "markdown 或相关文件 attachment 的预览，需要和消息正文用同样的样式预览，
//    这需要复用组件"
//
// Pin both surfaces to the shared `<MarkdownContent>` component so future
// edits don't reintroduce a parallel `<ReactMarkdown components={...}>`
// setup that drifts from the chat-body styling.
test("markdown attachment preview shares MarkdownContent with chat body", () => {
  const messageItemSource = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );

  // The shared component must export a single source-of-truth components map
  // and the default export must spread it.
  assert.match(markdownContentSource, /export const BASE_MARKDOWN_COMPONENTS:/);
  assert.match(markdownContentSource, /export default function MarkdownContent\(/);
  assert.match(markdownContentSource, /\.\.\.BASE_MARKDOWN_COMPONENTS/);

  // MarkdownPreviewPane (the .md attachment preview surface) must route
  // through `<MarkdownContent>` instead of inlining its own ReactMarkdown
  // tree. The function body is short — keep the assertion tight.
  const previewPaneMatch = messageItemSource.match(
    /function MarkdownPreviewPane\([\s\S]*?\n\}\n/,
  );
  assert.ok(previewPaneMatch, "MarkdownPreviewPane definition not found");
  // `enableMermaid` is opt-in on the attachment-preview surface only (task
  // #268); chat body never sets it. Still routes through <MarkdownContent>.
  assert.match(previewPaneMatch[0], /<MarkdownContent[\s\S]*source=\{markdown\}[\s\S]*density="document"[\s\S]*enableMermaid[\s\S]*components=\{headingComponents\}[\s\S]*\/>/);
  assert.doesNotMatch(
    previewPaneMatch[0],
    /<ReactMarkdown\b/,
    "MarkdownPreviewPane must not inline ReactMarkdown — route through MarkdownContent",
  );
});

test("markdown attachment preview only owns the document chrome", () => {
  const messageItemSource = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  const previewPaneMatch = messageItemSource.match(
    /function MarkdownPreviewPane\([\s\S]*?\n\}\n/,
  );
  assert.ok(previewPaneMatch, "MarkdownPreviewPane definition not found");
  const previewPaneSource = previewPaneMatch[0];

  assert.match(previewPaneSource, /bg-brutal-cream/);
  assert.match(previewPaneSource, /card-brutal/);
  assert.match(previewPaneSource, /max-w-3xl/);
  assert.match(previewPaneSource, /font-display/);
  assert.match(previewPaneSource, /text-base/);
  assert.match(previewPaneSource, /text-black/);
  assert.doesNotMatch(
    previewPaneSource,
    /\[&_p\]|\[&_li\]|\[&_h[1-6]\]|leading-relaxed|leading-6|text-black\/80/,
    "MarkdownPreviewPane must not rewrite markdown typography rhythm; paragraphs, lists, and headings stay in MarkdownContent density variants",
  );
  assert.doesNotMatch(
    previewPaneSource,
    /font-prose|text-\[#1f2328\]|border-\[#d1d9e0\]|bg-\[#eff1f3\]/,
    "Markdown preview should use Slock landing/blog styling, not GitHub-neutral token overrides",
  );
});

test("MarkdownContent exposes explicit compact and document density variants", () => {
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );
  const messageItemSource = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  assert.match(markdownContentSource, /export type MarkdownDensity = "compact" \| "document"/);
  // Signature gained an opt-in `enableMermaid` arg (task #268); density
  // variants are unchanged.
  assert.match(markdownContentSource, /export function getMarkdownComponents\(\s*density: MarkdownDensity,\s*enableMermaid = false,?\s*\): Components/);
  assert.match(markdownContentSource, /const DOCUMENT_MARKDOWN_COMPONENTS: Components = \{/);
  assert.match(markdownContentSource, /p: \(\{ children \}\) => <p className="mb-3 last:mb-0">/);
  assert.match(markdownContentSource, /h1: \(\{ children \}\) => <h1 className="text-3xl font-bold mt-6 mb-3 leading-tight">/);
  assert.match(markdownContentSource, /h2: \(\{ children \}\) => <h2 className="text-2xl font-bold mt-5 mb-2\.5 leading-tight">/);
  assert.match(markdownContentSource, /h3: \(\{ children \}\) => <h3 className="text-xl font-bold mt-4 mb-2 leading-tight">/);
  assert.match(messageItemSource, /<MarkdownContent[\s\S]{0,200}density="compact"/);
  assert.match(messageItemSource, /<MarkdownContent[\s\S]*source=\{markdown\}[\s\S]*density="document"[\s\S]*enableMermaid[\s\S]*components=\{headingComponents\}[\s\S]*\/>/);
});

test("document density keeps shared Slock inline code token", () => {
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );
  const documentMapMatch = markdownContentSource.match(
    /const DOCUMENT_MARKDOWN_COMPONENTS: Components = \{[\s\S]*?\n\};/,
  );
  assert.ok(documentMapMatch, "DOCUMENT_MARKDOWN_COMPONENTS definition not found");

  assert.match(markdownContentSource, /bg-brutal-yellow\/40/);
  assert.doesNotMatch(
    documentMapMatch[0],
    /\bcode:\s*\(/,
    "Document density must inherit BASE inline-code styling instead of overriding it",
  );
});

test("markdown attachment preview does not define a separate prose font utility", () => {
  const cssSource = readFileSync(resolve(repoRoot, "src/index.css"), "utf8");

  assert.doesNotMatch(
    cssSource,
    /@utility font-prose|Iowan Old Style|Palatino Linotype|Georgia/,
    "Markdown preview should inherit Slock's landing/blog Space Grotesk stack",
  );
});

test("MarkdownContent BASE map covers every block element used by chat body", () => {
  // Catches the bug class where someone adds a new block element override
  // (e.g. `kbd`, `details`) only on the chat-body side, leaving the
  // attachment preview to fall back to the unstyled default. Each element
  // listed here must appear in the BASE map.
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );

  const required = ["pre", "code", "p", "ul", "ol", "li", "blockquote", "table", "th", "td", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "a"];
  for (const tag of required) {
    assert.match(
      markdownContentSource,
      new RegExp(`\\b${tag}:\\s*\\(`),
      `BASE_MARKDOWN_COMPONENTS missing ${tag} override`,
    );
  }
});

// tygg 2026-05-20 #proj-uiux:9cfb3511 (task #279): "markdown 预览里面代码行太长会
// 溢出". Long unbreakable inline-code tokens (e.g.
// `untrusted_reason=cold_start|reconnect_gap|...` — no spaces, only `=`/`|`/`_`
// which are not default break opportunities) overflowed the document preview
// card and got clipped. The inline-code element must carry an overflow-wrap
// rule so such tokens wrap instead of overflowing. This is on the shared BASE
// map, so it fixes chat body + attachment preview together.
test("inline code wraps long unbreakable tokens (no horizontal overflow)", () => {
  const markdownContentSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );

  // Isolate the inline-code branch (the `if (!className)` return inside the
  // shared `code` renderer) and assert it carries the wrap rule alongside the
  // canonical yellow token.
  const inlineCodeMatch = markdownContentSource.match(
    /if \(!className\) \{[\s\S]*?<code className="([^"]+)"/,
  );
  assert.ok(inlineCodeMatch, "inline-code branch not found in shared code renderer");
  const inlineCodeClass = inlineCodeMatch![1];
  assert.match(inlineCodeClass, /bg-brutal-yellow\/40/, "inline code keeps the canonical Slock token");
  assert.match(
    inlineCodeClass,
    /\[overflow-wrap:anywhere\]|break-all|break-words/,
    "inline code must allow long unbreakable tokens to wrap (overflow-wrap) so they don't overflow the preview card",
  );
});
