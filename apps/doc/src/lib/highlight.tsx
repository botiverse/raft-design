import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { CSSProperties } from "react";
import { createHighlighter, createJavaScriptRegexEngine } from "shiki";
import type { ThemedToken } from "shiki";

const highlighter = createHighlighter({
  themes: ["github-light"],
  langs: ["tsx"],
  engine: createJavaScriptRegexEngine(),
});

type HighlightedSnippets = Record<string, AnyRenderableServerComponent>;

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
  const lines = (await highlighter).codeToTokensBase(code, { lang: "tsx", theme: "github-light" });

  return (
    <div className="overflow-hidden rounded-md border border-line-subtle">
      <pre className="overflow-x-auto bg-layer-muted p-4 font-mono text-sm leading-relaxed">
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
    </div>
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
      Object.entries(data).map(async ([id, code]) => [
        id,
        await renderServerComponent(<ServerCodeBlock code={code} />),
      ]),
    );
    return Object.fromEntries(entries) as HighlightedSnippets;
  });
