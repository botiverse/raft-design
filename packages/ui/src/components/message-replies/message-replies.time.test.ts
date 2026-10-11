/**
 * Reply-preview time contract — 2026-10-11 (cindyz's circles, gzj's evidence).
 *
 * Elegant drops mono and takes the 11.5px note size with tabular numerals,
 * matching the message-header time; brutal takes mono so it matches its own
 * header time (it was the odd sans one out).
 */
import { expect, test } from "vite-plus/test";
import { messageReplies } from "./message-replies.recipe";

test("elegant reply time is sans, 11.5px, tabular", () => {
  const { time } = messageReplies({ theme: "elegant" });
  const cls = time();
  expect(cls).toContain("font-sans");
  expect(cls).toContain("text-[11.5px]");
  expect(cls).toContain("tabular-nums");
  expect(cls).not.toContain("font-mono");
});

test("brutal reply time is mono, 11.5px, tabular", () => {
  const { time } = messageReplies({ theme: "brutal" });
  const cls = time();
  expect(cls).toContain("font-mono");
  expect(cls).toContain("text-[11.5px]");
  expect(cls).toContain("tabular-nums");
});
