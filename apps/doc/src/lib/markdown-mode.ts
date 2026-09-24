/**
 * Markdown mode: the docs site renders twice from one source of truth — once to
 * HTML for the browser, once to Markdown for `.md` endpoints and llms.txt.
 *
 * The flag is a module-level boolean rather than React context because route
 * loaders (`highlightSnippets`) run outside the render tree and need to see it.
 * The Markdown pass is a separate, single-threaded build step, so a module
 * global is safe here and keeps every call site unchanged.
 */
let markdownMode = false;

export function setMarkdownMode(enabled: boolean) {
  markdownMode = enabled;
}

export function isMarkdownMode() {
  return markdownMode;
}
