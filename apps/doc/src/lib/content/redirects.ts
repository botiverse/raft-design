import { pageAt, PAGES } from "./pages.ts";
import type { DocPage } from "./pages.ts";

// Every old address of the site answers with a 301 to where its content is
// now. Two sources: the moves recorded here, from before the pages were
// Markdown (apps/doc/DESIGN.md §9 and §11), and `redirectFrom` in a page's
// front matter, for pages that moved since. The root route applies them
// (routes/__root.tsx), so an old path redirects whether or not a route still
// matches it, and so does its `.md` twin.

const SKILL_RULES =
  "https://github.com/botiverse/raft-design/blob/main/packages/ui/skills/raft-ui-guide/rules";

const MOVED: Record<string, string> = {
  // The token pages moved into Foundations (§11, 2).
  "/tokens": "/foundations",
  "/tokens/colors": "/foundations/color",
  "/tokens/typography": "/foundations/typography",
  "/tokens/shadows": "/foundations/elevation",
  // The raft-ui-guide rules: the guideline ones are pages now; the
  // code-specific ones stay in the skill (§11, 4).
  "/guides": "/",
  "/guides/overview": "/",
  "/guides/composition": "/components#built-from-existing-parts",
  "/guides/conversation": "/patterns/conversation",
  "/guides/display": "/foundations/typography",
  "/guides/feedback": "/patterns/feedback",
  "/guides/forms": "/patterns/forms",
  "/guides/layout": "/patterns/page-structure",
  "/guides/overlays": "/components#overlays",
  "/guides/styling": "/foundations/color",
  "/guides/adoption": `${SKILL_RULES}/adoption.md`,
  "/guides/lookup": `${SKILL_RULES}/lookup.md`,
  "/guides/technical-overview": `${SKILL_RULES}/technical-overview.md`,
  // The dashboard example and the Playground were dropped (§11, 8 and 10); the
  // lab's pixel loader is an example on the Spinner page (§11, 7).
  "/dashboard": "/",
  "/lab": "/components/spinner",
  "/playground": "/",
  // Component pages the old hand-written routes had under names that are not
  // a component folder.
  "/components/activity": "/components/activity-inbox",
  "/components/chat-composer": "/components/composer",
  "/components/composer-suggestions": "/components/composer",
  "/components/message-reference": "/components/message-embed",
  "/components/sidebar-item": "/components/sidebar",
  "/components/task-chip": "/components/task-card",
  "/components/task-status": "/components/tasks",
  // The components overview (design/components/overview.md) is the
  // section's own page; the raft-ui-guide skill links it by its file name.
  "/components/overview": "/components",
};

/** Twins of old paths that have one. */
const MOVED_TWINS: Record<string, string> = {
  "/components/overview.md": "/components.md",
};

/** Where any other path under a retired prefix goes. */
const RETIRED_PREFIXES: readonly [prefix: string, target: string][] = [
  ["/tokens/", "/foundations"],
  ["/guides/", "/"],
  ["/playground/", "/"],
];

/** `/patterns/agents/`, `patterns/agents.md` → `/patterns/agents`. */
function normalize(path: string) {
  return `/${path.trim().replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.md$/, "")}`;
}

function listOf(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * The redirects `redirectFrom` declares on `pages`: each old path to the page,
 * and the old path's `.md` twin to the page's twin. An old path that is still
 * a page's address is skipped (the page wins), and so is one a second page
 * already claimed; `conflicts` names both kinds, for the content check.
 */
export function frontMatterRedirects(pages: readonly DocPage[]) {
  const live = new Set(pages.map((page) => page.url));
  const redirects = new Map<string, string>();
  const conflicts: string[] = [];
  for (const page of pages) {
    for (const entry of listOf(page.frontMatter.redirectFrom)) {
      const from = normalize(entry);
      if (from === "/" || live.has(from)) {
        conflicts.push(`${page.repoPath}: redirectFrom ${entry} is a live page`);
        continue;
      }
      if (redirects.has(from)) {
        conflicts.push(`${page.repoPath}: redirectFrom ${entry} is claimed by another page`);
        continue;
      }
      redirects.set(from, page.url);
      redirects.set(`${from}.md`, `${page.url}.md`);
    }
  }
  return { redirects, conflicts };
}

const FROM_PAGES = frontMatterRedirects(PAGES).redirects;

/**
 * Where an old path goes, or undefined when it is not an old path. A path that
 * is a page's address never redirects; a page's `redirectFrom` overrides the
 * older moves in `MOVED`.
 */
export function redirectFor(
  pathname: string,
  fromPages: ReadonlyMap<string, string> = FROM_PAGES,
): string | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (pageAt(path)) return undefined;
  const fromPage = fromPages.get(path);
  if (fromPage) return fromPage;
  // The older moves predate the `.md` twins, so only the HTML paths redirect.
  if (path.endsWith(".md")) return MOVED_TWINS[path];
  return MOVED[path] ?? RETIRED_PREFIXES.find(([prefix]) => path.startsWith(prefix))?.[1];
}
