"use client";

import { memo, useEffect, useState, type CSSProperties } from "react";
import { supportsCodeLanguage } from "./code-language.ts";
import type { CodeTokenLine } from "./shiki-highlighter.ts";

type HighlightedCode = {
  key: string;
  lines: CodeTokenLine[];
};

type ShikiHighlighterModule = typeof import("./shiki-highlighter.ts");

const MAX_HIGHLIGHT_CHARS = 50 * 1024;
const MAX_HIGHLIGHT_LINES = 500;
let shikiHighlighterPromise: Promise<ShikiHighlighterModule> | null = null;

export type ShikiHighlightedCodeProps = {
  code: string;
  language?: string | null;
};

function loadShikiHighlighter() {
  shikiHighlighterPromise ??= import("./shiki-highlighter.ts");
  return shikiHighlighterPromise;
}

function shouldHighlight(code: string, language: string | null | undefined) {
  if (!supportsCodeLanguage(language) || code.length > MAX_HIGHLIGHT_CHARS) return false;
  return code.split("\n", MAX_HIGHLIGHT_LINES + 1).length <= MAX_HIGHLIGHT_LINES;
}

function tokenStyle(token: CodeTokenLine[number]): CSSProperties | undefined {
  if (token.htmlStyle) return token.htmlStyle;
  if (!token.color && !token.bgColor) return undefined;
  return {
    backgroundColor: token.bgColor,
    color: token.color,
  };
}

function ShikiHighlightedCodeImpl({ code, language }: ShikiHighlightedCodeProps) {
  const key = `${language ?? ""}\u0000${code}`;
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useEffect(() => {
    if (!shouldHighlight(code, language)) return;

    let active = true;
    void loadShikiHighlighter().then(
      ({ highlightMessageCode }) => {
        const result = highlightMessageCode(code, language);
        if (!result) return;
        void result.then(
          (lines) => {
            if (active) setHighlighted({ key, lines });
          },
          () => undefined,
        );
      },
      () => undefined,
    );

    return () => {
      active = false;
    };
  }, [code, key, language]);

  const content =
    highlighted?.key === key
      ? highlighted.lines.map((line, lineIndex) => (
          <span className="line" key={lineIndex}>
            {line.map((token, tokenIndex) => (
              <span key={tokenIndex} style={tokenStyle(token)}>
                {token.content}
              </span>
            ))}
            {lineIndex < highlighted.lines.length - 1 ? "\n" : null}
          </span>
        ))
      : code;

  return (
    <pre className="shiki">
      <code>{content}</code>
    </pre>
  );
}

export const ShikiHighlightedCode = memo(ShikiHighlightedCodeImpl);
