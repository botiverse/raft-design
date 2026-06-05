import { createServerFn } from "@tanstack/react-start";
import { createHighlighter, createJavaScriptRegexEngine } from "shiki";

const highlighter = createHighlighter({
  themes: ["github-light"],
  langs: ["tsx"],
  engine: createJavaScriptRegexEngine(),
});

/**
 * Highlight a map of `id -> source` snippets to Shiki HTML. Wrapped in a server
 * fn so the highlighter runs at prerender/SSR time and never ships to the
 * client. Returns the same keys mapped to highlighted markup.
 */
export const highlightSnippets = createServerFn({ method: "GET" })
  .inputValidator((snippets: Record<string, string>) => snippets)
  .handler(async ({ data }) => {
    const entries = await Promise.all(
      Object.entries(data).map(
        async ([id, code]): Promise<[string, string]> => [
          id,
          (await highlighter).codeToHtml(code, { lang: "tsx", theme: "github-light" }),
        ],
      ),
    );
    return Object.fromEntries(entries);
  });
