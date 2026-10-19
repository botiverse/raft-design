import { REPOSITORY_URL } from "./links.ts";
import { pagesIn, SECTIONS, sectionIntro } from "./pages.ts";
import type { DocPage, SectionId } from "./pages.ts";

export type NavItem = {
  title: string;
  url: string;
  /** The label the item is listed under: a component category, a product. */
  group?: string;
  /** For components: the layer the group belongs to, a label above the groups. */
  layer?: string;
  status?: string;
  /** A page outside the site, such as CONTRIBUTING.md on GitHub. */
  external?: boolean;
};
export type NavSection = { id: SectionId; title: string; items: NavItem[] };

/**
 * Component layers. Core components hold for any product; collaboration
 * components are built for people and agents working together.
 */
export const LAYERS: readonly { id: string; title: string }[] = [
  { id: "core", title: "Core" },
  { id: "collaboration", title: "Collaboration" },
];

/** Component categories in reading order, each in its layer. */
export const CATEGORIES: readonly { id: string; title: string; layer: string }[] = [
  { id: "actions", title: "Actions", layer: "core" },
  { id: "inputs", title: "Inputs", layer: "core" },
  { id: "navigation", title: "Navigation", layer: "core" },
  { id: "overlays", title: "Overlays", layer: "core" },
  { id: "feedback", title: "Feedback", layer: "core" },
  { id: "layout", title: "Layout", layer: "core" },
  { id: "data-display", title: "Data Display", layer: "core" },
  { id: "identity", title: "Identity", layer: "core" },
  { id: "messages", title: "Messages", layer: "collaboration" },
  { id: "tasks", title: "Tasks", layer: "collaboration" },
  { id: "agents", title: "Agents", layer: "collaboration" },
  { id: "inbox", title: "Inbox", layer: "collaboration" },
  { id: "search", title: "Search", layer: "collaboration" },
  { id: "files", title: "Files", layer: "collaboration" },
];

const NOT_DOCUMENTED = "Not documented yet";

export function categoryTitle(id: string | undefined) {
  return CATEGORIES.find((category) => category.id === id)?.title ?? "Other";
}

/**
 * A component's layer: its `layer`, or while that is missing the layer of its
 * category. Undefined for a component with neither, which is listed after both
 * layers.
 */
export function layerOf(page: DocPage) {
  const declared = page.frontMatter.layer;
  if (declared && LAYERS.some((layer) => layer.id === declared)) return declared;
  if (page.generated) return undefined;
  return CATEGORIES.find((category) => category.id === page.frontMatter.category)?.layer;
}

export function layerTitle(id: string | undefined) {
  return LAYERS.find((layer) => layer.id === id)?.title;
}

/** The group a component is listed under: its category, or "Not documented yet". */
export function componentGroup(page: DocPage) {
  return page.generated ? NOT_DOCUMENTED : categoryTitle(page.frontMatter.category);
}

/** "Core · Actions": the group with its layer, where one label has to carry both. */
export function componentGroupPath(page: DocPage) {
  const layer = layerTitle(layerOf(page));
  return layer ? `${layer} · ${componentGroup(page)}` : componentGroup(page);
}

function componentRank(page: DocPage): [number, number] {
  const layer = LAYERS.findIndex((item) => item.id === layerOf(page));
  const layerRank = layer === -1 ? LAYERS.length : layer;
  if (page.generated) return [layerRank, CATEGORIES.length + 1];
  const category = CATEGORIES.findIndex((item) => item.id === page.frontMatter.category);
  return [layerRank, category === -1 ? CATEGORIES.length : category];
}

/**
 * Components by layer, then by category in reading order, then by name;
 * undocumented ones last in their layer. Every component, deprecated ones
 * included: what agents read (llms.txt, components.json).
 */
export function sortComponents(pages: readonly DocPage[]): DocPage[] {
  return [...pages].sort((a, b) => {
    const [layerA, categoryA] = componentRank(a);
    const [layerB, categoryB] = componentRank(b);
    return (
      layerA - layerB ||
      categoryA - categoryB ||
      a.frontMatter.title.localeCompare(b.frontMatter.title)
    );
  });
}

export function componentPages(): DocPage[] {
  return sortComponents(pagesIn("components"));
}

/**
 * The components the sidebar and the index list: deprecated ones are left
 * out. Their pages stay, with the deprecation notice, for links and search.
 */
export function listedComponents(pages: readonly DocPage[]): DocPage[] {
  return sortComponents(pages.filter((page) => page.frontMatter.status !== "deprecated"));
}

/** "Raft Chat — Home" → "Home": the product is already the group label. */
export function shortTitle(page: DocPage) {
  if (page.section !== "products" || page.slug === page.product) return page.frontMatter.title;
  return page.frontMatter.title.replace(/^.+?\s+—\s+/, "");
}

/** Components as sidebar rows, grouped by category under their layer. */
export function componentItems(pages: readonly DocPage[] = pagesIn("components")): NavItem[] {
  return listedComponents(pages).map((page) => ({
    title: page.frontMatter.title,
    url: page.url,
    group: componentGroup(page),
    layer: layerTitle(layerOf(page)),
    status: page.frontMatter.status,
  }));
}

function productItems(): NavItem[] {
  const pages = pagesIn("products");
  const intro = sectionIntro("products");
  const overview = intro ? [{ title: "Overview", url: intro.url }] : [];
  return [
    ...overview,
    ...pages.map((page) => {
      const readme = pages.find((item) => item.slug === page.product);
      return {
        title: page.slug === page.product ? "Overview" : shortTitle(page),
        url: page.url,
        group: readme?.frontMatter.title ?? page.product,
      };
    }),
  ];
}

function decisionItems(): NavItem[] {
  if (pagesIn("decisions").length === 0) return [];
  const openQuestions = pagesIn("decisions").find((page) => page.slug === "open-questions");
  return [
    { title: "Decisions", url: "/decisions" },
    ...(openQuestions ? [{ title: openQuestions.frontMatter.title, url: openQuestions.url }] : []),
  ];
}

export const CONTRIBUTING_URL = `${REPOSITORY_URL}/blob/main/CONTRIBUTING.md`;

/**
 * About: the pages in design/about, then the decision records (their own
 * section, at /decisions), the changelog and how to contribute.
 */
function aboutItems(): NavItem[] {
  return [
    ...pageItems("about"),
    ...decisionItems(),
    { title: "Changelog", url: "/changelog" },
    { title: "Contributing", url: CONTRIBUTING_URL, external: true },
  ];
}

/** A section's pages, after an Overview row when its folder has an introduction. */
function pageItems(section: SectionId): NavItem[] {
  const intro = sectionIntro(section);
  return [
    ...(intro ? [{ title: "Overview", url: intro.url }] : []),
    ...pagesIn(section).map((page) => ({ title: page.frontMatter.title, url: page.url })),
  ];
}

/**
 * The sidebar: each top-level section's pages, in reading order. A section
 * listed under another one (decisions, under About) is not a section of its
 * own here. Sections without pages are left out.
 */
export function navSections(): NavSection[] {
  return SECTIONS.filter((section) => !section.parent)
    .map((section) => {
      let items: NavItem[];
      if (section.id === "components") {
        const intro = sectionIntro("components");
        items = [...(intro ? [{ title: "Overview", url: intro.url }] : []), ...componentItems()];
      } else if (section.id === "products") items = productItems();
      else if (section.id === "about") items = aboutItems();
      else items = pageItems(section.id);
      return { id: section.id, title: section.title, items };
    })
    .filter((section) => section.items.length > 0);
}
