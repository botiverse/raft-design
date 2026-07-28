import { describe, expect, it } from "vite-plus/test";
import { messageFooter } from "./message-footer.recipe";
import { messageItem } from "./message-item.recipe";

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
});
