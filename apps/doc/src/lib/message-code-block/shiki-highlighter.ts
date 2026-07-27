import { createHighlighterCore, type ThemedToken } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/dist/langs/bash.mjs";
import css from "shiki/dist/langs/css.mjs";
import html from "shiki/dist/langs/html.mjs";
import javascript from "shiki/dist/langs/javascript.mjs";
import json from "shiki/dist/langs/json.mjs";
import jsx from "shiki/dist/langs/jsx.mjs";
import markdown from "shiki/dist/langs/markdown.mjs";
import tsx from "shiki/dist/langs/tsx.mjs";
import typescript from "shiki/dist/langs/typescript.mjs";
import githubDarkHighContrast from "shiki/dist/themes/github-dark-high-contrast.mjs";
import { normalizeMessageCodeLanguage } from "./message-code-language.ts";

const SHIKI_THEME = "github-dark-high-contrast";

const highlighter = createHighlighterCore({
  themes: [githubDarkHighContrast],
  langs: [bash, css, html, javascript, json, jsx, markdown, tsx, typescript],
  engine: createJavaScriptRegexEngine(),
});

export type MessageCodeTokenLine = ThemedToken[];

const highlightCache = new Map<string, Promise<MessageCodeTokenLine[]>>();
const HIGHLIGHT_CACHE_LIMIT = 128;

export function highlightMessageCode(
  code: string,
  language: string | null | undefined,
): Promise<MessageCodeTokenLine[]> | null {
  const normalizedLanguage = normalizeMessageCodeLanguage(language);
  if (!normalizedLanguage) return null;

  const key = `${normalizedLanguage}\u0000${code}`;
  const cached = highlightCache.get(key);
  if (cached) return cached;

  const highlighted = highlighter.then((instance) =>
    instance.codeToTokensBase(code, {
      lang: normalizedLanguage,
      theme: SHIKI_THEME,
    }),
  );

  if (highlightCache.size >= HIGHLIGHT_CACHE_LIMIT) {
    const oldestKey = highlightCache.keys().next().value;
    if (oldestKey !== undefined) highlightCache.delete(oldestKey);
  }
  highlightCache.set(key, highlighted);
  return highlighted;
}
