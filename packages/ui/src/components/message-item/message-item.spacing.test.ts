/**
 * Message rhythm contract.
 *
 * Every row's highlight sits the row inset (4px) above and below its text
 * (py-timeline-row). A new group adds the rest of the message step, an 8px
 * transparent top border the highlight doesn't paint (bg-clip-padding), both
 * read from the timeline tokens (design/foundations/spacing.md#timeline-rhythm); a compact (continuation) row drops it, so it sits under
 * the row it continues and its highlight stays symmetric; the avatar size is variable-driven (`--mi-avatar`, which
 * the app raises on the large font tier) and centred in its slot.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./message-item.recipe";

test("rows keep 8px between groups outside a symmetric highlight", () => {
  const regular = messageItem().root().split(/\s+/);
  for (const c of [
    "py-timeline-row",
    "border-t-(length:--spacing-timeline-turn)",
    "border-transparent",
    "bg-clip-padding",
  ])
    expect(regular).toContain(c);
  const compact = messageItem({ compact: true }).root().split(/\s+/);
  expect(compact).toContain("border-t-0");
  expect(compact).not.toContain("border-t-(length:--spacing-timeline-turn)");
  expect(compact).toContain("py-timeline-row");
  expect(compact).toContain("min-h-0");
});

test("message avatars are var-driven (35 by default), centred in the 35 slot", () => {
  const cls = messageItem().avatarSlot();
  expect(cls).toContain("[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,35px)");
  // The slot centers the avatar's wrapper (the image's own mx-auto did
  // nothing — the wrapper is what occupies the slot).
  expect(cls).toContain("flex w-[35px] justify-center");
});
