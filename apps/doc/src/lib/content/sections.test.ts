import { describe, expect, it } from "vitest";

import {
  componentGroupPath,
  componentItems,
  layerOf,
  listedComponents,
  sortComponents,
} from "./nav.ts";
import { collectPages, locate, urlOf } from "./pages.ts";
import type { DocPage } from "./pages.ts";
import { frontMatterRedirects, redirectFor } from "./redirects.ts";

// Fixtures, not the real docs: the section folders are written in other
// pull requests, and these rules must hold whatever they contain.

function doc(fields: Record<string, string>, body = "Text.") {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
  return `---\n${lines.join("\n")}\n---\n\n# ${fields.title ?? "Untitled"}\n\n${body}\n`;
}

describe("section discovery", () => {
  const files = {
    "design/principles/README.md": doc({ title: "Principles", summary: "Why." }),
    "design/principles/principles.md": doc({ title: "The rules", summary: "R.", order: "1" }),
    "design/principles/designing-a-new-feature.md": doc({
      title: "Designing a new feature",
      summary: "D.",
      order: "3",
    }),
    "design/principles/why-raft-looks-this-way.md": doc({
      title: "Why Raft looks this way",
      summary: "W.",
      order: "2",
    }),
    "design/principles/appendix.md": doc({ title: "Appendix", summary: "A." }),
    "design/people-and-agents/agents.md": doc({ title: "Agents", summary: "A." }),
    "design/about/use-raft-ui.md": doc({ title: "Use raft-ui", summary: "U." }),
    "design/components/overview.md": doc({ title: "Components", summary: "C." }),
    "design/decisions/0002-b.md": doc({ title: "B", summary: "B.", number: "0002" }),
    "design/decisions/0001-a.md": doc({ title: "A", summary: "A.", number: "0001" }),
    "design/decisions/open-questions.md": doc({ title: "Open questions", summary: "Q." }),
    // Not pages: the authoring guide, a folder that is not a section, a template.
    "design/authoring/README.md": doc({ title: "Authoring", summary: "How." }),
    "design/drafts/idea.md": doc({ title: "Idea", summary: "I." }),
    "design/authoring/templates/page.md": doc({ title: "Template", summary: "T." }),
  };
  const pages = collectPages(files);
  const urls = pages.map((page) => page.url);

  it("finds the pages of every section folder, and nothing else", () => {
    expect(urls).toEqual([
      "/principles",
      "/principles/principles",
      "/principles/why-raft-looks-this-way",
      "/principles/designing-a-new-feature",
      "/principles/appendix",
      "/people-and-agents/agents",
      "/components",
      "/about/use-raft-ui",
      "/decisions/open-questions",
      "/decisions/0001-a",
      "/decisions/0002-b",
    ]);
  });

  it("orders sections as the site reads, pages by `order` then title", () => {
    const sections = [...new Set(pages.map((page) => page.section))];
    expect(sections).toEqual([
      "principles",
      "people-and-agents",
      "components",
      "about",
      "decisions",
    ]);
  });

  it("makes a folder's README, and the components overview, the section's introduction", () => {
    expect(pages.find((page) => page.url === "/principles")).toMatchObject({
      intro: true,
      slug: "",
      repoPath: "design/principles/README.md",
    });
    expect(locate("design/components/overview.md")).toEqual({
      section: "components",
      slug: "",
      intro: true,
    });
    expect(urlOf({ section: "about", slug: "" })).toBe("/about");
  });

  it("tolerates empty and missing folders", () => {
    expect(collectPages({})).toEqual([]);
    expect(collectPages({ "design/content/README.md": doc({ summary: "S." }) })).toMatchObject([
      // No title in the file: the section's.
      { url: "/content", intro: true, frontMatter: { title: "Untitled" } },
    ]);
    expect(locate("design/content/writing.md")).toEqual({ section: "content", slug: "writing" });
  });
});

function page(slug: string, fields: Partial<DocPage["frontMatter"]>, generated = false): DocPage {
  return {
    section: "components",
    slug,
    url: `/components/${slug}`,
    repoPath: `packages/ui/src/components/${slug}/${slug}.md`,
    frontMatter: { title: slug, summary: `${slug}.`, ...fields },
    body: "",
    source: "",
    headings: [],
    anchors: [],
    ...(generated ? { generated: true } : {}),
  };
}

describe("component layers", () => {
  const components = [
    page("message-item", { layer: "collaboration", category: "messages" }),
    page("button", { layer: "core", category: "actions" }),
    page("float-button", { layer: "core", category: "actions", status: "deprecated" }),
    page("task-card", { category: "tasks" }),
    page("avatar", { category: "identity" }),
    page("badge", { category: "data-display" }),
    page("table", { layer: "core", category: "data-display" }),
    page("mystery", { layer: "collaboration" }),
    page("undocumented", {}, true),
  ];

  it("groups by layer, then category, undocumented last", () => {
    expect(sortComponents(components).map((item) => componentGroupPath(item))).toEqual([
      "Core · Actions",
      "Core · Actions",
      "Core · Data Display",
      "Core · Data Display",
      "Core · Identity",
      "Collaboration · Messages",
      "Collaboration · Tasks",
      "Collaboration · Other",
      "Not documented yet",
    ]);
  });

  it("falls back to the category's layer while `layer` is missing", () => {
    expect(layerOf(components.find((item) => item.slug === "task-card")!)).toBe("collaboration");
    expect(layerOf(components.find((item) => item.slug === "avatar")!)).toBe("core");
    expect(layerOf(page("unknown", { category: "gadgets" }))).toBeUndefined();
    expect(layerOf(page("typo", { layer: "kore", category: "actions" }))).toBe("core");
  });

  it("leaves deprecated components out of the sidebar and the index", () => {
    expect(listedComponents(components).map((item) => item.slug)).not.toContain("float-button");
    expect(sortComponents(components).map((item) => item.slug)).toContain("float-button");
    const items = componentItems(components);
    expect(items.map((item) => item.url)).not.toContain("/components/float-button");
    expect(items[0]).toMatchObject({ title: "button", layer: "Core", group: "Actions" });
  });
});

describe("redirectFrom", () => {
  const pages = collectPages({
    "design/people-and-agents/agents.md": doc({
      title: "Agents",
      summary: "A.",
      redirectFrom: "[patterns/agents, /patterns/agent-states.md]",
    }),
    "design/content/writing.md": doc({
      title: "Writing",
      summary: "W.",
      order: "1",
      redirectFrom: "foundations/writing/",
    }),
    "design/content/voice.md": doc({
      title: "Voice",
      summary: "V.",
      order: "2",
      redirectFrom: "[content/writing, foundations/writing]",
    }),
  });
  const { redirects, conflicts } = frontMatterRedirects(pages);

  it("redirects each old path, and its .md twin, to the page", () => {
    expect(Object.fromEntries(redirects)).toEqual({
      "/patterns/agents": "/people-and-agents/agents",
      "/patterns/agents.md": "/people-and-agents/agents.md",
      "/patterns/agent-states": "/people-and-agents/agents",
      "/patterns/agent-states.md": "/people-and-agents/agents.md",
      "/foundations/writing": "/content/writing",
      "/foundations/writing.md": "/content/writing.md",
    });
  });

  it("never redirects away from a live page, nor from a path claimed twice", () => {
    expect(conflicts).toEqual([
      "design/content/voice.md: redirectFrom content/writing is a live page",
      "design/content/voice.md: redirectFrom foundations/writing is claimed by another page",
    ]);
  });

  it("resolves a request path, with or without a trailing slash", () => {
    expect(redirectFor("/patterns/agent-states/", redirects)).toBe("/people-and-agents/agents");
    expect(redirectFor("/patterns/agent-states.md", redirects)).toBe(
      "/people-and-agents/agents.md",
    );
    expect(redirectFor("/nowhere", redirects)).toBeUndefined();
  });

  it("keeps the older moves", () => {
    const none = new Map<string, string>();
    expect(redirectFor("/tokens/colors", none)).toBe("/foundations/color");
    expect(redirectFor("/tokens/anything", none)).toBe("/foundations");
    expect(redirectFor("/guides/forms", none)).toBe("/patterns/forms");
    expect(redirectFor("/guides/gone", none)).toBe("/");
    expect(redirectFor("/components/task-chip", none)).toBe("/components/task-card");
    expect(redirectFor("/playground", none)).toBe("/");
    expect(redirectFor("/playground/s/raft/channel/all", none)).toBe("/");
    expect(redirectFor("/tokens/colors.md", none)).toBeUndefined();
    expect(redirectFor("/components/overview", none)).toBe("/components");
    expect(redirectFor("/components/overview.md", none)).toBe("/components.md");
  });
});
