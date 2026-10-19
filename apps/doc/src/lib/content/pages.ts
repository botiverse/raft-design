import { API_INDEX } from "./api.ts";
import { parseFrontMatter } from "./front-matter.ts";
import type { FrontMatter } from "./front-matter.ts";
import { headingSlug } from "./slug.ts";

// Every documentation page is a Markdown file in the repository
// (design/authoring/README.md, "Where things live"). This module finds them,
// gives each its site URL and reads its front matter. A section is a folder:
// `design/<section>/*.md` are its pages and `design/<section>/README.md` its
// introduction, so a new page needs no change here. Only the sections
// themselves and an optional reading order are written down.

const designFiles = import.meta.glob<string>(
  [
    "../../../../../design/*/*.md",
    "../../../../../design/products/*/*.md",
    "!../../../../../design/authoring/**",
  ],
  { query: "?raw", import: "default", eager: true },
);
const readmeSource = import.meta.glob<string>("../../../../../design/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const componentFiles = import.meta.glob<string>(
  "../../../../../packages/ui/src/components/*/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export type SectionId =
  | "principles"
  | "people-and-agents"
  | "foundations"
  | "content"
  | "patterns"
  | "components"
  | "products"
  | "about"
  | "decisions";

export type Section = {
  id: SectionId;
  title: string;
  summary: string;
  /**
   * A section listed inside another one in the navigation. Its URLs stay
   * its own: decision records are under About, at `/decisions/<record>`.
   */
  parent?: SectionId;
};

/** The sections in reading order: the sidebar, llms.txt and the sitemap follow it. */
export const SECTIONS: readonly Section[] = [
  {
    id: "principles",
    title: "Principles",
    summary:
      "Why Raft looks and behaves the way it does, and how to decide what a new feature needs.",
  },
  {
    id: "people-and-agents",
    title: "People and Agents",
    summary: "How people and agents share one server: who is who, who does what, and how it shows.",
  },
  {
    id: "foundations",
    title: "Foundations",
    summary:
      "Color, type, spacing, shape, motion and states: the values and the rules for using them.",
  },
  {
    id: "content",
    title: "Content",
    summary: "How Raft writes: voice, words, labels and messages.",
  },
  {
    id: "patterns",
    title: "Patterns",
    summary: "How components combine into screens in any Raft product.",
  },
  {
    id: "components",
    title: "Components",
    summary:
      "Every raft-ui component: when to use it, live examples in light and dark, and its API.",
  },
  {
    id: "products",
    title: "Products",
    summary: "Structure that belongs to one product: its destinations and what each screen shows.",
  },
  {
    id: "about",
    title: "About",
    summary: "Where the system comes from, how it changes, and how to contribute.",
  },
  {
    id: "decisions",
    title: "Decisions",
    summary: "Why the system chose one option over another, and the questions still open.",
    parent: "about",
  },
];

const SECTION_IDS = new Set<string>(SECTIONS.map((section) => section.id));

/**
 * Reading order of pages written before front matter had `order`. A page's
 * `order` comes first; then these; then every other page, by title.
 */
const ORDER: Partial<Record<SectionId, readonly string[]>> = {
  foundations: [
    "color",
    "typography",
    "spacing",
    "alignment",
    "shape",
    "elevation",
    "motion",
    "states",
    "iconography",
    "brand",
    "dark-mode",
    "writing",
  ],
  patterns: [
    "page-structure",
    "navigation",
    "agents",
    "tasks",
    "conversation",
    "forms",
    "feedback",
    "responsive",
  ],
};

export type DocPage = {
  section: SectionId;
  /** The page's address inside its section: `color`, `raft-chat/home`. */
  slug: string;
  /** Site path, without a trailing slash: `/foundations/color`. */
  url: string;
  /** Path from the repository root: `design/foundations/color.md`. */
  repoPath: string;
  frontMatter: FrontMatter;
  /** The Markdown after the front matter, the `# Title` line removed. */
  body: string;
  /** The source file as written. */
  source: string;
  /** `##` and `###` headings, for "On this page". */
  headings: { id: string; title: string; depth: 2 | 3 }[];
  /** Every heading's anchor, at any depth. */
  anchors: string[];
  /** For product pages: the product's folder name. */
  product?: string;
  /** A component with no doc yet: the page is only what is generated from code. */
  generated?: boolean;
  /**
   * The section's introduction (`design/<section>/README.md`,
   * `design/components/overview.md`): rendered at the top of the section's
   * own page, at `/<section>`.
   */
  intro?: boolean;
};

const REPO_PREFIX = /^(\.\.\/)+/;

function toRepoPath(globKey: string) {
  return globKey.replace(REPO_PREFIX, "");
}

/** `design/foundations/color.md` → its section and slug, or null if it is not a page. */
export function locate(
  repoPath: string,
): Pick<DocPage, "section" | "slug" | "product" | "intro"> | null {
  if (repoPath === "design/components/overview.md") {
    return { section: "components", slug: "", intro: true };
  }
  let match = repoPath.match(/^design\/([\w-]+)\/([\w-]+)\.md$/);
  if (match && SECTION_IDS.has(match[1]!) && match[1] !== "components") {
    const section = match[1] as SectionId;
    return match[2] === "README"
      ? { section, slug: "", intro: true }
      : { section, slug: match[2]! };
  }
  match = repoPath.match(/^design\/products\/([\w-]+)\/([\w-]+)\.md$/);
  if (match) {
    const [, product, file] = match;
    return {
      section: "products",
      slug: file === "README" ? product! : `${product}/${file}`,
      product: product!,
    };
  }
  match = repoPath.match(/^packages\/ui\/src\/components\/([\w-]+)\/\1\.md$/);
  if (match) return { section: "components", slug: match[1]! };
  return null;
}

export function urlOf(page: Pick<DocPage, "section" | "slug">) {
  return page.slug ? `/${page.section}/${page.slug}` : `/${page.section}`;
}

function headingsOf(body: string) {
  const headings: DocPage["headings"] = [];
  const anchors: string[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = line.match(/^(#{2,6}) (.+)$/);
    if (!match) continue;
    const title = match[2]!.trim();
    const id = headingSlug(title);
    anchors.push(id);
    const depth = match[1]!.length;
    if (depth === 2 || depth === 3) headings.push({ id, title, depth });
  }
  return { headings, anchors };
}

function toPage(globKey: string, source: string): DocPage | null {
  const repoPath = toRepoPath(globKey);
  const location = locate(repoPath);
  if (!location) return null;
  const { data, content } = parseFrontMatter(source);
  const title =
    data.title ||
    content.match(/^# (.+)$/m)?.[1]?.trim() ||
    location.slug ||
    sectionOf(location.section).title;
  const body = content.replace(/^\s*# .+\r?\n+/, "").trim();
  return {
    ...location,
    url: urlOf(location),
    repoPath,
    frontMatter: { ...data, title },
    body,
    source,
    ...headingsOf(body),
  };
}

/** Where a page sits in its section: `[tier, position]`, compared in that order. */
function rank(page: DocPage): [number, number] {
  if (page.intro) return [0, 0];
  if (page.section === "products" && page.slug === page.product) return [0, 0];
  const order = Number(page.frontMatter.order);
  if (page.frontMatter.order !== undefined && Number.isFinite(order)) return [1, order];
  if (page.section === "decisions") {
    // Numbered records in order, open questions first.
    return [2, page.frontMatter.number ? Number(page.frontMatter.number) : -1];
  }
  const index = ORDER[page.section]?.indexOf(page.slug) ?? -1;
  return index === -1 ? [3, 0] : [2, index];
}

function comparePages(a: DocPage, b: DocPage) {
  const sections = SECTIONS.map((section) => section.id);
  const [tierA, positionA] = rank(a);
  const [tierB, positionB] = rank(b);
  return (
    sections.indexOf(a.section) - sections.indexOf(b.section) ||
    (a.product ?? "").localeCompare(b.product ?? "") ||
    tierA - tierB ||
    positionA - positionB ||
    a.frontMatter.title.localeCompare(b.frontMatter.title)
  );
}

/**
 * Every written page among `files` (repository path → source), in reading
 * order. Files that are not pages are left out, so a section whose folder is
 * empty or missing simply has no pages.
 */
export function collectPages(files: Record<string, string>): DocPage[] {
  return Object.entries(files)
    .map(([key, source]) => toPage(key, source))
    .filter((page): page is DocPage => page !== null)
    .sort(comparePages);
}

const WRITTEN_PAGES = collectPages({ ...designFiles, ...componentFiles });

/**
 * A component raft-ui exports whose doc is not written yet still gets a page:
 * its API and changes, generated from the code.
 */
function generatedComponentPage(folder: string): DocPage {
  const info = API_INDEX[folder]!;
  const title = info.names[0] ?? folder;
  const repoPath = `packages/ui/src/components/${folder}/${folder}.md`;
  return {
    section: "components",
    slug: folder,
    url: `/components/${folder}`,
    repoPath,
    frontMatter: {
      title,
      summary:
        info.description ??
        `${title}: the API generated from raft-ui; the guidelines are not written yet.`,
      status: info.status,
    },
    body: "",
    source: "",
    headings: [],
    anchors: [],
    generated: true,
  };
}

const documentedFolders = new Set(
  WRITTEN_PAGES.filter((page) => page.section === "components" && !page.intro).map(
    (page) => page.slug,
  ),
);

export const PAGES: readonly DocPage[] = [
  ...WRITTEN_PAGES,
  ...Object.keys(API_INDEX)
    .filter((folder) => !documentedFolders.has(folder))
    .map(generatedComponentPage),
].sort(comparePages);

/**
 * design/README.md: what the system is, its materials and principles. The
 * home page renders it; it is not in a section, so it is not in PAGES.
 */
export const README: DocPage | null = (() => {
  const source = Object.values(readmeSource)[0];
  if (!source) return null;
  const { data, content } = parseFrontMatter(source);
  const body = content.replace(/^\s*# .+\r?\n+/, "").trim();
  return {
    section: "foundations",
    slug: "",
    url: "/",
    repoPath: "design/README.md",
    frontMatter: { ...data, title: data.title || "Raft Design System" },
    body,
    source,
    ...headingsOf(body),
  };
})();

const pageByUrl = new Map(PAGES.map((page) => [page.url, page]));
const pageByRepoPath = new Map(PAGES.map((page) => [page.repoPath, page]));

export function pageAt(url: string) {
  return pageByUrl.get(url.replace(/\/+$/, ""));
}

export function pageForFile(repoPath: string) {
  return pageByRepoPath.get(repoPath);
}

/** A section's pages in reading order, without its introduction. */
export function pagesIn(section: SectionId) {
  return PAGES.filter((page) => page.section === section && !page.intro);
}

/** The section's introduction, when its folder has one. */
export function sectionIntro(section: SectionId) {
  return PAGES.find((page) => page.section === section && page.intro);
}

export function sectionOf(id: SectionId) {
  return SECTIONS.find((section) => section.id === id)!;
}
