import { describe, expect, it } from "vite-plus/test";
import { messageFooter } from "./message-footer.recipe";
import { messageItem } from "./message-item.recipe";
import { messageReference } from "./message-reference.recipe";

describe("message core recipe theme ownership", () => {
  it("keeps the message row border width theme-owned", () => {
    expect(messageItem({ theme: "brutal" }).root()).toContain("border-2");
    expect(messageItem({ theme: "elegant" }).root()).not.toContain("border-2");
  });

  it("does not give elegant footer badges an implicit border", () => {
    expect(messageFooter({ theme: "brutal", badgeStatus: "read" }).badge()).toContain("border");
    expect(messageFooter({ theme: "elegant", badgeStatus: "read" }).badge()).not.toContain(
      "border",
    );
  });

  it("keeps reference chip surfaces in their selected theme", () => {
    const brutal = messageReference({ theme: "brutal", tone: "primary" }).chip();
    const elegant = messageReference({ theme: "elegant", tone: "primary" }).chip();

    expect(brutal).toContain("border-black");
    expect(elegant).toContain("border-primary-400/20");
    expect(elegant).not.toContain("border-black");
  });
});
