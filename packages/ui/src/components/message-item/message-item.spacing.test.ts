/**
 * Message rhythm contract — 2026-10-11 (cindyz's 16/24 call; Josh's measures).
 *
 * A compact (continuation) row drops its top padding so it sits under the
 * row it continues; the avatar size is variable-driven (`--mi-avatar`, which
 * the app raises on the large font tier) and centred in its slot.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./message-item.recipe";

test("compact rows keep their own rhythm (pt-0, no min height)", () => {
  const regular = messageItem().root();
  expect(regular).toContain("py-2");
  const compact = messageItem({ compact: true }).root();
  expect(compact).toContain("pt-0");
  expect(compact).toContain("min-h-0");
});

test("message avatars are var-driven (35 by default), centred in the 35 slot", () => {
  const cls = messageItem().avatarSlot();
  expect(cls).toContain("[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,35px)");
  // The slot centers the avatar's wrapper (the image's own mx-auto did
  // nothing — the wrapper is what occupies the slot).
  expect(cls).toContain("flex w-[35px] justify-center");
});
