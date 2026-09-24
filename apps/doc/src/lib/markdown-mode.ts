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

const emittedFiles = new Set<string>();

/**
 * Pages that repeat one multi-file example per usage variant would otherwise
 * repeat every file in full. Returns true the first time a path is seen on
 * the current page; the renderer calls `beginMarkdownPage` between pages.
 */
export function claimMarkdownFile(path: string) {
  if (emittedFiles.has(path)) return false;
  emittedFiles.add(path);
  return true;
}

export function beginMarkdownPage() {
  emittedFiles.clear();
}
