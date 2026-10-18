import { describe, expect, it } from "vitest";

import type { DocPage } from "./pages.ts";
import { searchIn } from "./search.ts";

function page(
  slug: string,
  title: string,
  extra: Partial<DocPage["frontMatter"]> = {},
  headings: string[] = [],
) {
  return {
    section: "components",
    slug,
    url: `/components/${slug}`,
    repoPath: `packages/ui/src/components/${slug}/${slug}.md`,
    frontMatter: { title, summary: `${title} summary.`, ...extra },
    body: "",
    source: "",
    headings: headings.map((heading) => ({
      id: heading.toLowerCase(),
      title: heading,
      depth: 2 as const,
    })),
    anchors: [],
  } satisfies DocPage;
}

const PAGES = [
  page("drawer", "Drawer", { aliases: ["Sheet", "BottomSheet"] }),
  page("toast", "Toast", { aliases: ["Snackbar"] }),
  page("sheet-music", "SheetMusic"),
  page("button", "Button", {}, ["Icon buttons"]),
];

describe("search", () => {
  it("finds a component by a former or common name and says which", () => {
    const [hit] = searchIn(PAGES, "snackbar");
    expect(hit?.page.slug).toBe("toast");
    expect(hit?.alias).toBe("Snackbar");
  });

  it("ranks a title prefix above an alias, and an exact alias above a partial one", () => {
    expect(searchIn(PAGES, "sheet").map((hit) => hit.page.slug)).toEqual(["sheet-music", "drawer"]);
  });

  it("finds a section of a page by its heading", () => {
    const hit = searchIn(PAGES, "icon buttons").find((item) => item.heading);
    expect(hit?.page.slug).toBe("button");
    expect(hit?.heading?.title).toBe("Icon buttons");
  });

  it("returns nothing for an empty query", () => {
    expect(searchIn(PAGES, "  ")).toEqual([]);
  });
});
