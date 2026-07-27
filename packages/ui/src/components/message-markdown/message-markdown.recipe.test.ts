import { describe, expect, it } from "vite-plus/test";
import { messageMarkdown } from "./message-markdown.recipe";

describe("messageMarkdown recipe theme ownership", () => {
  it("keeps brutal table borders out of elegant output", () => {
    const brutal = messageMarkdown({ theme: "brutal" });
    const elegant = messageMarkdown({ theme: "elegant" });

    expect(brutal.root()).toContain("[&_table]:border-2");
    expect(elegant.root()).not.toContain("[&_table]:border-2");
    expect(elegant.root()).toContain("[&_th]:bg-layer-muted");
    expect(elegant.root()).toContain("[&_th:not(:last-child)]:border-line-subtle");
    expect(elegant.root()).toContain("[&_blockquote]:border-l-2");
  });
});
