import { CATALOG, CATEGORIES, catalogEntry } from "./catalog.ts";
import type { ComponentStatus } from "./catalog.ts";
import { getDocSource } from "./doc-source.ts";

// Proposal mock (B3): the site's information architecture. In the
// implementation the guideline lists come from the files in design/foundations,
// design/patterns, design/products and design/decisions, ordered by a
// `nav.json` per folder; the component list comes from catalog front matter.

export type SectionId = "foundations" | "components" | "patterns" | "products" | "decisions";

export type SitePage = {
  section: SectionId;
  slug: string;
  title: string;
  summary?: string;
  status?: ComponentStatus;
  aliases?: readonly string[];
  group?: string;
};

const FOUNDATIONS: [string, string][] = [
  ["color", "Color"],
  ["typography", "Typography"],
  ["spacing", "Spacing"],
  ["alignment", "Alignment"],
  ["shape", "Shape"],
  ["elevation", "Elevation"],
  ["motion", "Motion"],
  ["states", "States"],
  ["iconography", "Iconography"],
  ["brand", "Brand"],
  ["dark-mode", "Dark mode"],
  ["writing", "Writing"],
];

const PATTERNS: [string, string][] = [
  ["choosing-components", "Choosing components"],
  ["page-structure", "Page structure"],
  ["navigation", "Navigation"],
  ["agents", "Agents"],
  ["tasks", "Tasks"],
  ["conversation", "Conversation"],
  ["forms", "Forms and settings"],
  ["feedback", "Feedback"],
  ["responsive", "Wide and narrow"],
  ["composites", "Composites"],
];

const PRODUCTS: [string, string][] = [["raft-chat", "Raft Chat"]];

const DECISIONS: [string, string][] = [
  ["log", "Decision log"],
  ["open-questions", "Open questions"],
];

function guideline(section: SectionId, [slug, title]: [string, string]): SitePage {
  return { section, slug, title, summary: getDocSource(slug)?.frontMatter.summary };
}

export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "foundations", title: "Foundations" },
  { id: "components", title: "Components" },
  { id: "patterns", title: "Patterns" },
  { id: "products", title: "Products" },
  { id: "decisions", title: "Decisions" },
];

export const PAGES: readonly SitePage[] = [
  ...FOUNDATIONS.map((row) => guideline("foundations", row)),
  ...CATEGORIES.flatMap((category) =>
    CATALOG.filter((entry) => entry.category === category.id).map((entry): SitePage => ({
      section: "components",
      slug: entry.slug,
      title: entry.title,
      summary: getDocSource(entry.slug)?.frontMatter.summary,
      status: entry.status,
      aliases: entry.aliases,
      group: category.title,
    })),
  ),
  ...PATTERNS.map((row) => guideline("patterns", row)),
  ...PRODUCTS.map((row) => guideline("products", row)),
  ...DECISIONS.map((row) => guideline("decisions", row)),
];

export function findPage(section: string, slug: string) {
  return PAGES.find((page) => page.section === section && page.slug === slug);
}

export function pageHref(page: Pick<SitePage, "section" | "slug">) {
  return `/proposal/${page.section}/${page.slug}`;
}

export function componentStatus(slug: string) {
  return catalogEntry(slug)?.status;
}

export type SearchHit = { page: SitePage; matchedAlias?: string };

/**
 * Title first, then aliases (former design names and common names from other
 * systems), then the summary. An alias hit says which name matched, so a
 * search for "snackbar" explains why it lands on Toast.
 */
export function searchPages(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const page of PAGES) {
    const title = page.title.toLowerCase();
    const alias = page.aliases?.find((name) => name.toLowerCase().includes(q));
    let score = 0;
    let matchedAlias: string | undefined;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (alias) {
      score = alias.toLowerCase() === q ? 70 : 50;
      matchedAlias = alias;
    } else if (page.summary?.toLowerCase().includes(q)) score = 20;
    if (score > 0) scored.push({ hit: { page, matchedAlias }, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.hit.page.title.localeCompare(b.hit.page.title))
    .slice(0, 12)
    .map(({ hit }) => hit);
}
