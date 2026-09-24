import type { CSSProperties, ReactElement } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import tsx from "shiki/dist/langs/tsx.mjs";
import vitesseDark from "shiki/dist/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/dist/themes/vitesse-light.mjs";
import type { ThemedToken } from "shiki";

import { stripSourceCodeBlocks, stripTopLevelImports } from "./source-code.ts";
import { isMarkdownMode } from "./markdown-mode.ts";

// Tokens carry both palettes as --shiki-light/--shiki-dark CSS vars; the code
// surface (CodeBlock / DocsCodeBlock) picks one per mode.
const HIGHLIGHT_THEMES = {
  dark: "vitesse-dark",
  light: "vitesse-light",
} as const;

// Fine-grained bundle: register only the `tsx` grammar, the vitesse themes,
// and the JS regex engine. Avoids shiki's full bundle pulling ~50 unused
// grammars and the oniguruma WASM in.
const highlighter = createHighlighterCore({
  themes: [vitesseLight, vitesseDark],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
});

export type HighlightedSnippet = string | ReactElement;
export type HighlightedSnippets = Record<string, HighlightedSnippet>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tokenStyle(token: ThemedToken) {
  const style: CSSProperties = token.htmlStyle ?? {};

  if (!token.htmlStyle) {
    if (token.color) {
      style.color = token.color;
    }

    if (token.bgColor) {
      style.backgroundColor = token.bgColor;
    }
  }

  return Object.entries(style)
    .map(
      ([property, value]) => `${property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`,
    )
    .join(";");
}

function codeToHtml(lines: Array<Array<ThemedToken>>, anatomy: boolean) {
  let html = anatomy ? '<pre data-doc-snippet="anatomy"><code>' : "<pre><code>";

  for (const [lineIndex, line] of lines.entries()) {
    html += "<span>";

    for (const token of line) {
      const style = tokenStyle(token);
      html += style
        ? `<span style="${style}">${escapeHtml(token.content)}</span>`
        : `<span>${escapeHtml(token.content)}</span>`;
    }

    html += lineIndex < lines.length - 1 ? "\n</span>" : "</span>";
  }

  return `${html}</code></pre>`;
}

/**
 * Highlight a map of `id -> source` snippets into `<pre>` markup.
 *
 * Runs wherever it is called: on the server during prerender, and locally in
 * the browser on client-side navigation. `CodeBlock` renders the returned
 * string directly, so no RSC payload is shipped alongside the markup.
 */
export async function highlightSnippets({ data }: { data: Record<string, string> }) {
  const core = await highlighter;
  const highlight = (id: string, code: string) =>
    codeToHtml(
      core.codeToTokens(code, { lang: "tsx", themes: HIGHLIGHT_THEMES, defaultColor: false })
        .tokens,
      id.toLowerCase().includes("anatomy"),
    );

  const entries: Array<[string, HighlightedSnippet]> = [];

  // The Markdown pass wants the source, not Shiki's markup: `CodeBlock` already
  // renders a non-string `html` as children, and a real `<pre>` element is what
  // the Markdown renderer turns into a fenced block. Highlighting here would
  // produce an HTML string injected via dangerouslySetInnerHTML, which a
  // non-DOM renderer cannot see at all.
  const emit = (id: string, code: string): HighlightedSnippet =>
    isMarkdownMode() ? (
      <pre data-lang="tsx">
        <code>{code}</code>
      </pre>
    ) : (
      highlight(id, code)
    );

  for (const [id, code] of Object.entries(data)) {
    const displayCode = stripSourceCodeBlocks(code);
    const bodyCode = stripTopLevelImports(displayCode);

    entries.push([id, emit(id, displayCode)]);

    if (bodyCode !== displayCode && !id.endsWith("Body")) {
      entries.push([`${id}Body`, emit(id, bodyCode)]);
    }
  }

  return Object.fromEntries(entries) as HighlightedSnippets;
}
