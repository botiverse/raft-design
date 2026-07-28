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
import vitesseDark from "shiki/dist/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/dist/themes/vitesse-light.mjs";
import { normalizeCodeLanguage } from "./code-language.ts";

// Tokens carry both palettes as --shiki-light/--shiki-dark; the code surface picks
// one through --message-code-syntax.
const SHIKI_THEMES = {
  dark: "vitesse-dark",
  light: "vitesse-light",
} as const;

const highlighter = createHighlighterCore({
  themes: [vitesseDark, vitesseLight],
  langs: [bash, css, html, javascript, json, jsx, markdown, tsx, typescript],
  engine: createJavaScriptRegexEngine(),
});

export type CodeTokenLine = ThemedToken[];

const highlightCache = new Map<string, Promise<CodeTokenLine[]>>();
const HIGHLIGHT_CACHE_LIMIT = 128;

export function highlightMessageCode(
  code: string,
  language: string | null | undefined,
): Promise<CodeTokenLine[]> | null {
  const normalizedLanguage = normalizeCodeLanguage(language);
  if (!normalizedLanguage) return null;

  const key = `${normalizedLanguage}\u0000${code}`;
  const cached = highlightCache.get(key);
  if (cached) return cached;

  const highlighted = highlighter.then(
    (instance) =>
      instance.codeToTokens(code, {
        lang: normalizedLanguage,
        themes: SHIKI_THEMES,
        defaultColor: false,
      }).tokens,
  );

  if (highlightCache.size >= HIGHLIGHT_CACHE_LIMIT) {
    const oldestKey = highlightCache.keys().next().value;
    if (oldestKey !== undefined) highlightCache.delete(oldestKey);
  }
  highlightCache.set(key, highlighted);
  return highlighted;
}
