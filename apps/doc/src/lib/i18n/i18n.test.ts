import { describe, expect, it } from "vitest";

import { resolveDocLinkForMarkdown } from "../content/links.ts";
import { CATEGORIES, LAYERS, navSections } from "../content/nav.ts";
import { localize, pageAt, PAGES, README, SECTIONS } from "../content/pages.ts";
import { searchDocs } from "../content/search.ts";
import { parseHeading } from "../content/slug.ts";
import { localeOfPath, localizePath, stripLocale } from "./locales.ts";
import { messagesFor } from "./messages.ts";
import { sourceHash } from "./source-hash.ts";

describe("language prefix", () => {
  it("reads the language from the public path", () => {
    expect(localeOfPath("/zh/foundations/color")).toBe("zh");
    expect(localeOfPath("/zh")).toBe("zh");
    expect(localeOfPath("/zh?x=1")).toBe("zh");
    expect(localeOfPath("/foundations/color")).toBe("en");
    // A path that only starts with the letters is not the prefix.
    expect(localeOfPath("/zhuyin")).toBe("en");
  });

  it("strips and adds the prefix", () => {
    expect(stripLocale("/zh/foundations/color")).toBe("/foundations/color");
    expect(stripLocale("/zh")).toBe("/");
    expect(stripLocale("/zh/")).toBe("/");
    expect(stripLocale("/foundations")).toBe("/foundations");
    expect(localizePath("/foundations/color", "zh")).toBe("/zh/foundations/color");
    expect(localizePath("/", "zh")).toBe("/zh");
    expect(localizePath("/zh/foundations", "zh")).toBe("/zh/foundations");
    expect(localizePath("/foundations", "en")).toBe("/foundations");
    expect(localizePath("https://github.com/x", "zh")).toBe("https://github.com/x");
    expect(localizePath("#anchor", "zh")).toBe("#anchor");
  });
});

describe("translated pages", () => {
  it("keeps the English anchor on a translated heading", () => {
    expect(parseHeading("颜色的含义 {#meanings-of-color}")).toEqual({
      id: "meanings-of-color",
      title: "颜色的含义",
    });
    expect(parseHeading("Meanings of color")).toEqual({
      id: "meanings-of-color",
      title: "Meanings of color",
    });
  });

  it("shows a translation with the English page's anchors", () => {
    const english = pageAt("/foundations/color")!;
    const zh = localize(english, "zh");
    expect(zh.translation).toBe("current");
    expect(zh.url).toBe(english.url);
    expect(zh.frontMatter.title).not.toBe(english.frontMatter.title);
    expect(zh.englishTitle).toBe(english.frontMatter.title);
    expect(zh.anchors).toEqual(english.anchors);
  });

  // Whether a translation is current is a warning (scripts/i18n.mjs check), not a
  // failure: an English page may change before its translation does.
  it("every translation has the anchors of its English page", () => {
    const translated = [...PAGES, README!]
      .map((page) => [page, localize(page, "zh")] as const)
      .filter(([, zh]) => zh.translation !== "missing");
    expect(translated.length).toBeGreaterThan(0);
    for (const [english, zh] of translated) {
      expect(zh.anchors, english.repoPath).toEqual(english.anchors);
    }
  });

  it("shows the English text, marked, where there is no translation", () => {
    const english = pageAt("/components/button")!;
    const zh = localize(english, "zh");
    expect(zh.translation).toBe("missing");
    expect(zh.body).toBe(english.body);
    expect(localize(english, "en")).toBe(english);
  });

  it("hashes the English source the same on every platform", () => {
    expect(sourceHash("a\r\nb")).toBe(sourceHash("a\nb"));
    expect(sourceHash("abc")).toBe("1a47e90b");
  });
});

describe("links and search in another language", () => {
  it("links a Markdown twin to the translated twin, or to the English one", () => {
    expect(
      resolveDocLinkForMarkdown("design/foundations/shape.md", "./color.md#stickers", "zh"),
    ).toBe("https://raft-design.botiverse.build/zh/foundations/color.md#stickers");
    expect(
      resolveDocLinkForMarkdown(
        "design/foundations/shape.md",
        "../../packages/ui/src/components/button/button.md",
        "zh",
      ),
    ).toBe("https://raft-design.botiverse.build/components/button.md");
  });

  it("finds a translated page by its English title too", () => {
    const zhTitle = localize(pageAt("/foundations/color")!, "zh").frontMatter.title;
    expect(searchDocs(zhTitle, 12, "zh")[0]?.page.url).toBe("/foundations/color");
    expect(searchDocs("Color", 12, "zh").some((hit) => hit.page.url === "/foundations/color")).toBe(
      true,
    );
  });

  it("titles the sidebar in the language", () => {
    const zh = navSections("zh");
    expect(zh.map((section) => section.title)).toContain("基础");
    expect(
      zh.flatMap((section) => section.items).find((item) => item.url === "/foundations/color")
        ?.title,
    ).toBe(localize(pageAt("/foundations/color")!, "zh").frontMatter.title);
  });
});

describe("the site's own words", () => {
  it("say in English what the content modules say", () => {
    const en = messagesFor("en");
    for (const section of SECTIONS) {
      expect(en.sections[section.id]).toEqual({ title: section.title, summary: section.summary });
    }
    for (const category of CATEGORIES) expect(en.categories[category.id]).toBe(category.title);
    for (const layer of LAYERS) expect(en.layers[layer.id]).toBe(layer.title);
  });

  it("give every category and layer in every language", () => {
    const zh = messagesFor("zh");
    for (const category of CATEGORIES) expect(zh.categories[category.id]).toBeTruthy();
    for (const layer of LAYERS) expect(zh.layers[layer.id]).toBeTruthy();
  });
});
