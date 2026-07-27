import { describe, expect, it } from "vite-plus/test";
import { messageQuotedPreview } from "./message-quoted-preview.recipe";

describe("messageQuotedPreview recipe", () => {
  it("keeps skeleton border treatment owned by each theme", () => {
    const brutal = messageQuotedPreview({ theme: "brutal" }).loading();
    const elegant = messageQuotedPreview({ theme: "elegant" }).loading();

    expect(brutal).toContain("border-2");
    expect(elegant).toContain("border-line-subtle");
    expect(elegant).not.toContain("border-2");
  });
});
