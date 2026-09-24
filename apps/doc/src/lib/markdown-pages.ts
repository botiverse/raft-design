/**
 * Which docs pages have a Markdown twin (`scripts/build-llms.mjs`), and where.
 * Shared by the Markdown pass and the page actions menu so they cannot drift.
 */
export const MARKDOWN_PAGE_PREFIXES = ["/components/", "/tokens/", "/guides/"] as const;

/** `/components/button/` → `/components/button.md`; null for pages without a twin. */
export function markdownPathFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "");
  const isDocPage = MARKDOWN_PAGE_PREFIXES.some(
    (prefix) => path.startsWith(prefix) && path.length > prefix.length,
  );
  return isDocPage ? `${path}.md` : null;
}
