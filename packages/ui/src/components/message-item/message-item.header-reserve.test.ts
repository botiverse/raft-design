/**
 * Message-header reserve contract — 2026-10-11 (#737 meta-priority round).
 *
 * The header keeps a right-side reserve so its text never runs under the
 * hover toolbar. That reserve is now variable-driven: narrow hosts (the
 * Thread panel, ~300px inside a 1600px window) lower it locally with
 * `--mi-hdr-pr`, while the 6rem default keeps every other surface unchanged.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./message-item.recipe";

for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme} header reserve is variable-driven with a 6rem default`, () => {
    const { header } = messageItem({ theme });
    expect(header()).toContain("pr-(--mi-hdr-pr,6rem)");
  });
}
