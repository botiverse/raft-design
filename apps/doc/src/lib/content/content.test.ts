import { describe, expect, it } from "vitest";

import { EXAMPLE_KEYS } from "#/lib/examples.ts";
import { tokenGroup } from "#/lib/tokens/tokens.ts";

import { parseFrontMatter } from "./front-matter.ts";
import { resolveDocLink, resolveDocLinkForMarkdown } from "./links.ts";
import { locate, PAGES, pageAt } from "./pages.ts";
import { headingSlug } from "./slug.ts";
import { renderMarkdownTwin } from "./twin.ts";

const BLOCK = /```(example|tokens)[ \t]*\r?\n([^\n]+)\r?\n```/g;
const LINK = /\]\(([^)\s]+)\)/g;

function outsideFences(markdown: string) {
  return markdown.split(/```[\s\S]*?```/g).join("\n");
}

describe("front matter", () => {
  it("reads strings, lists and zero-padded numbers", () => {
    const { data, content } = parseFrontMatter(
      "---\ntitle: Drawer\nsummary: A panel: it slides in.\naliases: [Sheet, BottomSheet]\nnumber: 0013\n---\n\n# Drawer\n",
    );
    expect(data).toMatchObject({
      title: "Drawer",
      summary: "A panel: it slides in.",
      aliases: ["Sheet", "BottomSheet"],
      number: "0013",
    });
    expect(content.trim()).toBe("# Drawer");
  });
});

describe("page addresses", () => {
  it("maps each kind of file to its URL", () => {
    expect(locate("design/foundations/color.md")).toMatchObject({
      section: "foundations",
      slug: "color",
    });
    expect(locate("design/products/raft-chat/README.md")).toMatchObject({ slug: "raft-chat" });
    expect(locate("design/products/raft-chat/home.md")).toMatchObject({ slug: "raft-chat/home" });
    expect(locate("packages/ui/src/components/drawer/drawer.md")).toMatchObject({
      section: "components",
      slug: "drawer",
    });
    expect(locate("design/authoring/README.md")).toBeNull();
  });

  it("writes anchors the way GitHub does", () => {
    expect(headingSlug("Meanings of color")).toBe("meanings-of-color");
    expect(headingSlug("Empty, loading and failed")).toBe("empty-loading-and-failed");
  });

  it("resolves relative links to pages, sections and GitHub", () => {
    expect(
      resolveDocLink("design/patterns/feedback.md", "./choosing-components.md#waiting"),
    ).toMatch(/^(\/patterns\/choosing-components|https:\/\/github\.com\/.+)#waiting$/);
    expect(resolveDocLink("design/products/raft-chat/README.md", "../../foundations/")).toBe(
      "/foundations",
    );
    expect(resolveDocLink("design/foundations/brand.md", "../assets/logo.svg")).toBe(
      "https://github.com/botiverse/raft-design/blob/main/design/assets/logo.svg",
    );
    expect(resolveDocLink("design/foundations/color.md", "#stickers")).toBe("#stickers");
  });
});

// The docs are content: these checks fail the build when a page names an
// example, a token group or a page that does not exist.
describe.each(PAGES.map((page) => [page.repoPath, page] as const))("%s", (_, page) => {
  it("has a title and a one-sentence summary", () => {
    expect(page.frontMatter.title).not.toBe("");
    expect(page.frontMatter.summary).not.toBe("");
    expect(page.frontMatter.summary).not.toContain("\n");
  });

  it("names only examples and token groups that exist", () => {
    for (const [, kind, argument] of page.body.matchAll(BLOCK)) {
      const name = argument!.trim();
      if (kind === "example") expect(EXAMPLE_KEYS, `example ${name}`).toContain(name);
      else expect(tokenGroup(name), `tokens ${name}`).not.toBeNull();
    }
  });

  it("links only to pages and headings that exist", () => {
    for (const [, href] of outsideFences(page.body).matchAll(LINK)) {
      const resolved = resolveDocLink(page.repoPath, href!);
      if (!resolved.startsWith("/") && !resolved.startsWith("#")) continue;
      const [path, hash] = resolved.split("#", 2) as [string, string | undefined];
      const target = path === "" ? page : pageAt(path);
      if (path !== "" && !target) {
        // A section folder ("/foundations") or the home page.
        expect(
          ["/", "/foundations", "/patterns", "/products", "/decisions", "/components"],
          href,
        ).toContain(path);
        continue;
      }
      if (hash && target) {
        expect(target.anchors, `${href} from ${page.repoPath}`).toContain(hash);
      }
    }
  });
});

describe("Markdown twin", () => {
  it("inlines examples and tokens and makes links absolute", async () => {
    const page = PAGES.find((item) => /```(example|tokens)/.test(item.body));
    if (!page) return;
    const twin = await renderMarkdownTwin(page);
    expect(twin).not.toMatch(/```(example|tokens)\n/);
    expect(twin.startsWith(`# ${page.frontMatter.title}\n\n> ${page.frontMatter.summary}`)).toBe(
      true,
    );
    expect(twin).not.toMatch(/\]\(\.\.?\//);
  });

  it("points page links at the .md twin", () => {
    expect(resolveDocLinkForMarkdown("design/foundations/color.md", "#stickers")).toBe("#stickers");
    expect(
      resolveDocLinkForMarkdown("design/products/raft-chat/README.md", "../../foundations/"),
    ).toBe("https://raft-design.botiverse.build/foundations");
  });
});

describe("front matter lists", () => {
  it("reads a list the formatter wrapped, and a list of `- item` lines", () => {
    const wrapped = parseFrontMatter(
      "---\ntitle: A\nrelated:\n  [\n    b,\n    c,\n  ]\naliases:\n  - D\n  - E\n---\n",
    );
    expect(wrapped.data.related).toEqual(["b", "c"]);
    expect(wrapped.data.aliases).toEqual(["D", "E"]);
  });
});
