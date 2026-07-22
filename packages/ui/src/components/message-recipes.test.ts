import { describe, expect, it } from "vite-plus/test";

import { messageActionCard } from "./message-action-card/message-action-card.recipe";
import { messageAttachment } from "./message-attachment/message-attachment.recipe";
import { messageForwardedBundle } from "./message-forwarded-bundle/message-forwarded-bundle.recipe";
import { messageFooter } from "./message-item/message-footer.recipe";
import { messageReaction } from "./message-item/message-reaction.recipe";
import { messageMedia } from "./message-media/message-media.recipe";
import { messageQuotedPreview } from "./message-quoted-preview/message-quoted-preview.recipe";

describe("message composition recipes", () => {
  it("adds a single reply trigger without changing the granular layout recipe", () => {
    const { inlineReplies, inlineRepliesSummary, inlineRepliesTrigger, inlineReplyRow } =
      messageFooter({
        theme: "brutal",
      });

    expect(inlineReplies()).toContain("border-l-2");
    expect(inlineRepliesTrigger()).toContain("flex w-full flex-col");
    expect(inlineRepliesTrigger()).toContain("bg-black/[0.04]");
    expect(inlineRepliesTrigger()).toContain("hover:bg-black/[0.12]");
    expect(inlineRepliesSummary()).toContain("text-[12.5px]");
    expect(inlineReplyRow()).toContain("min-w-0");
  });

  it("keeps interactive and static reaction picker chrome independently addressable", () => {
    const brutal = messageReaction({ theme: "brutal" });
    const elegant = messageReaction({ theme: "elegant" });

    expect(brutal.pickerContent()).toContain("border-2");
    expect(brutal.pickerStatic()).toContain("border-2");
    expect(elegant.pickerContent()).toContain("flex-row");
    expect(elegant.pickerStatic()).toContain("bg-layer-popover");
  });

  it("models the source gallery column and item-size matrix", () => {
    expect(messageMedia({ rowLayout: "single" }).galleryRow()).toContain("grid-cols-1");
    expect(messageMedia({ rowLayout: "pair" }).galleryRow()).toContain("grid-cols-2");
    expect(messageMedia({ rowLayout: "triple" }).galleryRow()).toContain("md:grid-cols-3");
    expect(messageMedia({ itemSize: "regular" }).galleryItem()).toContain("sm:h-36");
    expect(messageMedia({ itemSize: "dense" }).galleryItem()).toContain("sm:h-32");
    expect(messageMedia({ itemSize: "single" }).galleryItem()).toContain("max-w-[26rem]");
  });

  it("preserves single, wide, and tall image fitting geometry", () => {
    expect(messageMedia({ mediaGeometry: "normal" }).galleryMedia()).toContain("object-cover");
    expect(messageMedia({ mediaGeometry: "single" }).galleryMedia()).toContain("object-contain");
    expect(messageMedia({ mediaGeometry: "wide" }).galleryMedia()).toContain("object-contain");
    expect(messageMedia({ mediaGeometry: "tall" }).galleryMedia()).toContain("object-contain");
    expect(messageMedia({ mediaFit: "cover", mediaGeometry: "wide" }).galleryMedia()).toContain(
      "object-cover",
    );
  });

  it("positions the secondary attachment action as a sibling of the primary card", () => {
    const { frame } = messageAttachment();

    expect(frame()).toContain("relative inline-block");
    expect(frame()).toContain("[&>[data-slot=message-attachment-action]]:right-7");
    expect(frame()).toContain("[&>[data-slot=message-attachment-action]]:bottom-1.5");
  });

  it("owns collapsed forwarded-bundle clipping in a named part", () => {
    const { collapsedItems } = messageForwardedBundle({ theme: "elegant" });

    expect(collapsedItems()).toContain("max-h-[144px]");
    expect(collapsedItems()).toContain("sm:max-h-[180px]");
    expect(collapsedItems()).toContain("divide-line-subtle");
  });

  it("keeps product-state composition styles with their owning components", () => {
    expect(messageActionCard({ theme: "brutal" }).root()).toContain("border-black/30");
    expect(messageQuotedPreview({ theme: "elegant" }).root()).toContain("border-line-subtle");
  });
});
