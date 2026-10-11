/**
 * Message rhythm contract — 2026-10-11 (cindyz's 16/24 call; Josh's measures).
 *
 * Rows inside a group sit 16 apart and groups 24, with one explicit marker
 * doing the work: `data-followed-by` on any row that another row follows
 * (sibling selectors can't see across the app's per-message wrappers — the
 * old `has(+[data-compact])` never matched). Group-first rows carry +3 top
 * padding so every group break measures 24; the reply-preview card's row
 * collapses the same way, which lands its frame-to-name gap on 24 too.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./message-item.recipe";

test("elegant rows collapse their bottom via the explicit marker, split by follower", () => {
  const { root } = messageItem({ theme: "elegant" });
  const cls = root();
  // A continuation collapses harder (group interiors read 12) than a new
  // group does (breaks read 24).
  expect(cls).toContain("data-[followed-by=compact]:pb-0.5");
  expect(cls).toContain("data-[followed-by=group]:pb-1.5");
  expect(cls).not.toContain("has-[+[data-compact=true]]");
});

test("elegant group-first rows keep the +3 break (24 vs 21)", () => {
  const { root } = messageItem({ theme: "elegant" });
  expect(root()).toContain("pt-[17px]");
});

test("elegant compact rows keep their own rhythm (pt-1.5 pb-1.5)", () => {
  const { root } = messageItem({ theme: "elegant", compact: true });
  const cls = root();
  expect(cls).toContain("pt-1.5");
  expect(cls).toContain("pb-1.5");
  expect(cls).toContain("min-h-0");
});

test("brutal rhythm is untouched", () => {
  const { root } = messageItem({ theme: "brutal" });
  const cls = root();
  expect(cls).not.toContain("data-[followed-by]");
  expect(cls).not.toContain("pt-[17px]");
});

test("elegant message avatars read at 32 (var-driven), centered in the unchanged 36 slot", () => {
  const { avatarSlot } = messageItem({ theme: "elegant" });
  const cls = avatarSlot();
  // --mi-avatar defaults to 2rem (32) and the app raises it to 34px on the
  // large font tier; the slot itself stays 36.
  expect(cls).toContain("[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,2rem)");
  // The slot centers the avatar's wrapper (the image's own mx-auto did
  // nothing — the wrapper is what occupies the slot).
  expect(cls).toContain("flex justify-center");
  expect(cls).not.toContain("[&_[data-slot=avatar][data-size=md]]:size-9");
});

test("brutal avatars share the variable and sit 3px lower to meet the name line", () => {
  const { avatarSlot } = messageItem({ theme: "brutal" });
  const cls = avatarSlot();
  expect(cls).toContain("[&_[data-slot=avatar][data-size=md]]:size-(--mi-avatar,2rem)");
  expect(cls).toContain("flex justify-center");
  expect(cls).toContain("[&_[data-slot=avatar][data-size=md]]:mt-(--mi-avatar-shift,3px)");
});
