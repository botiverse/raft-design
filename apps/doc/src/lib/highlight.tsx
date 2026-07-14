import type { CSSProperties } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import tsx from "shiki/dist/langs/tsx.mjs";
import vitesseLight from "shiki/dist/themes/vitesse-light.mjs";
import type { ThemedToken } from "shiki";

import { stripSourceCodeBlocks, stripTopLevelImports } from "./source-code.ts";

const HIGHLIGHT_THEME = "vitesse-light";

// Fine-grained bundle: register only the `tsx` grammar, the `vitesse-light`
// theme, and the JS regex engine. Avoids shiki's full bundle pulling ~50 unused
// grammars and the oniguruma WASM in.
const highlighter = createHighlighterCore({
  themes: [vitesseLight],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
});

type HighlightedSnippets = Record<string, string>;

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

function codeToHtml(lines: Array<Array<ThemedToken>>) {
  let html = "<pre><code>";

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
  const highlight = (code: string) =>
    codeToHtml(core.codeToTokensBase(code, { lang: "tsx", theme: HIGHLIGHT_THEME }));

  const entries: Array<[string, string]> = [];

  for (const [id, code] of Object.entries(data)) {
    const displayCode = stripSourceCodeBlocks(code);
    const bodyCode = stripTopLevelImports(displayCode);

    entries.push([id, highlight(displayCode)]);

    if (bodyCode !== displayCode && !id.endsWith("Body")) {
      entries.push([`${id}Body`, highlight(bodyCode)]);
    }
  }

  return Object.fromEntries(entries) as HighlightedSnippets;
}
