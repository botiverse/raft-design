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
    const brutal = messageReference({ theme: "brutal", variant: "primary" }).chip();
    const brutalText = messageReference({ theme: "brutal" }).text();
    const elegant = messageReference({ theme: "elegant", variant: "primary" }).chip();

    expect(brutal).toContain("border-black");
    expect(brutalText).toContain("bg-primary-400/40");
    expect(brutalText).toContain("text-primary-900");
    expect(elegant).toContain("bg-[oklch(0.886_0.155_91.41)]");
    expect(elegant).not.toContain("border-black");
  });

  it("preserves distinct elegant reference surfaces after the renderer split", () => {
    const elegant = messageReference({ theme: "elegant", variant: "primary" });
    const accent = messageReference({ theme: "elegant", variant: "accent" }).chip();
    const neutral = messageReference({ theme: "elegant", variant: "neutral" }).chip();
    const link = messageReference({ theme: "elegant", variant: "link" }).chip();

    expect(elegant.text()).toContain("rounded-full");
    expect(elegant.text()).toContain("bg-[oklch(0.955_0.067_93.62)]");
    expect(elegant.chip()).toContain("bg-[oklch(0.886_0.155_91.41)]");
    expect(accent).toContain("bg-[oklch(0.914_0.048_358.59)]");
    expect(neutral).toContain("bg-[oklch(0.91_0.056_224.02)]");
    expect(link).toContain("bg-layer-muted");
    expect(elegant.pending()).toContain("rounded-full");
    expect(elegant.unavailable()).toContain("rounded-full");
  });

  it("defaults reference chips to the muted variant", () => {
    expect(messageReference({ theme: "brutal" }).chip()).toContain("bg-soft-signal/40");
    expect(messageReference({ theme: "elegant" }).chip()).toContain("border-line-subtle");
  });

  it("keeps direct reference icons at a stable size and baseline in both themes", () => {
    const brutal = messageReference({ theme: "brutal", variant: "accent" });
    const elegant = messageReference({ theme: "elegant", variant: "accent" });

    expect(brutal.chip()).toContain("[&_svg]:size-3");
    expect(brutal.chip()).toContain("items-center");
    expect(elegant.chip()).toContain("[&_svg]:size-3");
    expect(elegant.chip()).toContain("items-center");
  });
});
