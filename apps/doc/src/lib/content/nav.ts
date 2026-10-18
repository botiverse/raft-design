import { pagesIn, SECTIONS } from "./pages.ts";
import type { DocPage, SectionId } from "./pages.ts";

export type NavItem = { title: string; url: string; group?: string; status?: string };
export type NavSection = { id: SectionId; title: string; items: NavItem[] };

/** Component categories in the order design/authoring/README.md lists them. */
export const CATEGORIES: readonly { id: string; title: string }[] = [
  { id: "actions", title: "Actions" },
  { id: "inputs", title: "Inputs" },
  { id: "navigation", title: "Navigation" },
  { id: "identity", title: "Identity" },
  { id: "status", title: "Status" },
  { id: "content", title: "Content" },
  { id: "agents", title: "Agents" },
  { id: "overlays", title: "Overlays" },
  { id: "feedback", title: "Feedback" },
  { id: "layout", title: "Layout" },
];

export function categoryTitle(id: string | undefined) {
  return CATEGORIES.find((category) => category.id === id)?.title ?? "Other";
}

/** The group a component is listed under: its category, or "Not documented yet". */
export function componentGroup(page: DocPage) {
  return page.generated ? "Not documented yet" : categoryTitle(page.frontMatter.category);
}

/** Components by category, in the authoring guide's order; undocumented ones last. */
export function componentPages(): DocPage[] {
  const rank = (page: DocPage) => {
    if (page.generated) return CATEGORIES.length + 1;
    const index = CATEGORIES.findIndex((category) => category.id === page.frontMatter.category);
    return index === -1 ? CATEGORIES.length : index;
  };
  return [...pagesIn("components")].sort(
    (a, b) => rank(a) - rank(b) || a.frontMatter.title.localeCompare(b.frontMatter.title),
  );
}

/** "Raft Chat — Home" → "Home": the product is already the group label. */
export function shortTitle(page: DocPage) {
  if (page.section !== "products" || page.slug === page.product) return page.frontMatter.title;
  return page.frontMatter.title.replace(/^.+?\s+—\s+/, "");
}

function componentItems(): NavItem[] {
  return componentPages().map((page) => ({
    title: page.frontMatter.title,
    url: page.url,
    group: componentGroup(page),
    status: page.frontMatter.status,
  }));
}

function productItems(): NavItem[] {
  const pages = pagesIn("products");
  return pages.map((page) => {
    const readme = pages.find((item) => item.slug === page.product);
    return {
      title: page.slug === page.product ? "Overview" : shortTitle(page),
      url: page.url,
      group: readme?.frontMatter.title ?? page.product,
    };
  });
}

function decisionItems(): NavItem[] {
  const openQuestions = pagesIn("decisions").find((page) => page.slug === "open-questions");
  return [
    { title: "All Decisions", url: "/decisions" },
    ...(openQuestions ? [{ title: openQuestions.frontMatter.title, url: openQuestions.url }] : []),
  ];
}

/** The sidebar: each section's pages, in reading order. Sections without pages are left out. */
export function navSections(): NavSection[] {
  return SECTIONS.map((section) => {
    let items: NavItem[];
    if (section.id === "components") items = componentItems();
    else if (section.id === "products") items = productItems();
    else if (section.id === "decisions") items = pagesIn("decisions").length ? decisionItems() : [];
    else {
      items = pagesIn(section.id).map((page) => ({ title: page.frontMatter.title, url: page.url }));
    }
    return { id: section.id, title: section.title, items };
  }).filter((section) => section.items.length > 0);
}
