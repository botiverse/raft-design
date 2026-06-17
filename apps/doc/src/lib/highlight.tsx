import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { CSSProperties } from "react";
import { createHighlighter, createJavaScriptRegexEngine } from "shiki";
import type { ThemedToken } from "shiki";

const HIGHLIGHT_THEME = "vitesse-light";

const highlighter = createHighlighter({
  themes: [HIGHLIGHT_THEME],
  langs: ["tsx"],
  engine: createJavaScriptRegexEngine(),
});

type HighlightedSnippets = Record<string, AnyRenderableServerComponent>;

export function stripTopLevelImports(code: string) {
  const lines = code.split("\n");
  let index = 0;
  let sawImport = false;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (line === "") {
      index += 1;
      continue;
    }

    if (!line.startsWith("import ")) {
      break;
    }

    sawImport = true;

    do {
      index += 1;
    } while (index < lines.length && !lines[index - 1]?.trimEnd().endsWith(";"));
  }

  if (!sawImport) {
    return code;
  }

  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1;
  }

  return lines.slice(index).join("\n");
}

function tokenStyle(token: ThemedToken): CSSProperties | undefined {
  if (token.htmlStyle) {
    return token.htmlStyle as CSSProperties;
  }

  const style: CSSProperties = {};

  if (token.color) {
    style.color = token.color;
  }

  if (token.bgColor) {
    style.backgroundColor = token.bgColor;
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

async function ServerCodeBlock({ code }: { code: string }) {
  const lines = (await highlighter).codeToTokensBase(code, { lang: "tsx", theme: HIGHLIGHT_THEME });

  return (
    <pre>
      <code>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {line.map((token, tokenIndex) => (
              <span key={tokenIndex} style={tokenStyle(token)}>
                {token.content}
              </span>
            ))}
            {lineIndex < lines.length - 1 ? "\n" : null}
          </span>
        ))}
      </code>
    </pre>
  );
}

/**
 * Highlight a map of `id -> source` snippets into RSC-rendered code blocks.
 * Shiki and the resulting markup stay on the server side; the client receives
 * renderable RSC output instead of running the highlighter in the route module.
 */
export const highlightSnippets = createServerFn({ method: "POST" })
  .validator((snippets: Record<string, string>) => snippets)
  .handler(async ({ data }) => {
    const entries = await Promise.all(
      Object.entries(data).flatMap(([id, code]) => {
        const bodyCode = stripTopLevelImports(code);
        const snippetEntries = [[id, code]];

        if (bodyCode !== code && !id.endsWith("Body")) {
          snippetEntries.push([`${id}Body`, bodyCode]);
        }

        return snippetEntries.map(async ([snippetId, snippetCode]) => [
          snippetId,
          await renderServerComponent(<ServerCodeBlock code={snippetCode} />),
        ]);
      }),
    );
    return Object.fromEntries(entries) as HighlightedSnippets;
  });
