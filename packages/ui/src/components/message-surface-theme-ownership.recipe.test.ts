import { describe, expect, it } from "vite-plus/test";
import { messageActionCard } from "./message-action-card/message-action-card.recipe";
import { messageForwardedBundle } from "./message-forwarded-bundle/message-forwarded-bundle.recipe";
import { messageImageGallery } from "./message-attachment/message-image-gallery.recipe";
import { messageVideoPreview } from "./message-attachment/message-video-preview.recipe";
import { messageSystem } from "./system-message/system-message.recipe";

describe("message surface theme ownership", () => {
  it("keeps Brutal's coarse borders while Elegant selects its own thin treatments", () => {
    const actionBrutal = messageActionCard({ theme: "brutal" });
    const actionElegant = messageActionCard({ theme: "elegant" });
    const galleryBrutal = messageImageGallery({ theme: "brutal" });
    const galleryElegant = messageImageGallery({ theme: "elegant" });
    const videoElegant = messageVideoPreview({ theme: "elegant" });

    expect(actionBrutal.root()).toContain("border-2");
    expect(actionElegant.root()).not.toContain("border-2");
    expect(actionElegant.hint()).not.toContain("border-l-2");
    expect(galleryBrutal.item()).toContain("border-2");
    expect(galleryElegant.item()).not.toContain("border-2");
    expect(videoElegant.root()).not.toContain("border-2");
    expect(galleryElegant.item()).toContain("hover:shadow-sm");
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
