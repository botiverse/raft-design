import { describe, expect, it } from "vite-plus/test";
import { messageActionCard } from "./message-action-card/message-action-card.recipe";
import { messageAttachmentPreview } from "./message-attachment/message-attachment-preview.recipe";
import { messageForwardedBundle } from "./message-forwarded-bundle/message-forwarded-bundle.recipe";
import { messageMedia } from "./message-media/message-media.recipe";
import { messageSystem } from "./system-message/system-message.recipe";

describe("message surface theme ownership", () => {
  it("keeps Brutal's coarse borders while Elegant selects its own thin treatments", () => {
    const actionBrutal = messageActionCard({ theme: "brutal" });
    const actionElegant = messageActionCard({ theme: "elegant" });
    const previewBrutal = messageAttachmentPreview({ theme: "brutal" });
    const previewElegant = messageAttachmentPreview({ theme: "elegant" });
    const mediaBrutal = messageMedia({ theme: "brutal" });
    const mediaElegant = messageMedia({ theme: "elegant" });

    expect(actionBrutal.root()).toContain("border-2");
    expect(actionElegant.root()).not.toContain("border-2");
    expect(actionElegant.hint()).not.toContain("border-l-2");
    expect(previewBrutal.audioPreviewCard()).toContain("border-2");
    expect(previewElegant.audioPreviewCard()).not.toContain("border-2");
    expect(mediaBrutal.galleryItem()).toContain("border-2");
    expect(mediaElegant.galleryItem()).not.toContain("border-2");
    expect(mediaElegant.video()).not.toContain("border-2");
    expect(mediaElegant.galleryItem()).toContain("hover:shadow-sm");
  });

  it("keeps typography and density with the active theme", () => {
    const forwardedBrutal = messageForwardedBundle({ theme: "brutal" });
    const forwardedElegant = messageForwardedBundle({ theme: "elegant" });
    const systemBrutal = messageSystem({ theme: "brutal" });
    const systemElegant = messageSystem({ theme: "elegant" });

    expect(forwardedBrutal.headerLabel()).toContain("font-black");
    expect(forwardedElegant.headerLabel()).toContain("font-medium");
    expect(systemBrutal.systemTime()).toContain("font-mono");
    expect(systemElegant.systemTime()).toContain("font-sans");
  });
});
