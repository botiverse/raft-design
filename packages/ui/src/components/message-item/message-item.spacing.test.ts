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

test("elegant rows collapse their bottom via the explicit marker", () => {
  const { root } = messageItem({ theme: "elegant" });
  const cls = root();
  expect(cls).toContain("data-[followed-by]:pb-1.5");
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
