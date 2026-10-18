/**
 * Reply-preview time contract — 2026-10-11 (cindyz's circles, gzj's evidence).
 *
 * The reply time takes the message-header time's type — mono, the mono-meta
 * step, tabular numerals, hint ink — so the two times read as one.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "../message-item/message-item.recipe";
import { messageReplies } from "./message-replies.recipe";

test("reply time is mono, mono-meta, tabular — the message-header time's type", () => {
  const reply = messageReplies().time();
  const header = messageItem().time();
  for (const token of ["font-mono", "text-mono-meta", "tabular-nums", "text-foreground-hint"]) {
    expect(reply, `reply time ${token}`).toContain(token);
    expect(header, `header time ${token}`).toContain(token);
  }
  expect(reply).not.toContain("font-sans");
});
