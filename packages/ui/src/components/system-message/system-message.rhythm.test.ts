/**
 * System-note rhythm contract — 2026-10-11 (cindyz's circles: single and
 * collapsed lines keep a net 12/12; expanded rows read 6 apart; both themes).
 *
 * The note owns only its 4px lead-in; the message that follows cancels the
 * rest via data-follows-system on the message row (message-item recipe).
 */
import { expect, test } from "vite-plus/test";
import { messageSystem } from "./system-message.recipe";
import { messageItem } from "../message-item/message-item.recipe";

test("system rows keep their lead and no trailing margin (per Josh's table)", () => {
  const { systemRoot, systemGroup, systemGroupHeader } = messageSystem({ theme: "elegant" });
  // Single elegant notes read 3px; inner rows re-assert 4 from the app side.
  expect(systemRoot()).toContain("pt-[3px]");
  expect(systemRoot()).toContain("pb-0");
  expect(systemRoot()).not.toContain("py-1.5");
  expect(systemGroup()).not.toContain("mb-1");
  expect(systemGroupHeader()).toContain("pt-px");
  expect(systemGroupHeader()).toContain("pb-0");
});

test("the message following a system note completes the 12/12 rhythm", () => {
  const { root } = messageItem({ theme: "elegant" });
  expect(root()).toContain("data-follows-system:pt-[12px]");
});

test("brutal closes the same 12 seams on its own rhythm", () => {
  const { systemRoot, systemGroupDisclosure } = messageSystem({ theme: "brutal" });
  expect(systemRoot()).toContain("pt-0");
  expect(systemGroupDisclosure()).toContain("pt-px");
  expect(systemGroupDisclosure()).toContain("-mb-2");
  // Positioned elements hit-test above the pulled-up neighbours, so the
  // negative margin's overlap zone still belongs to the button.
  expect(systemGroupDisclosure()).toContain("relative");
  const { root } = messageItem({ theme: "brutal" });
  expect(root()).toContain("data-follows-system:mt-[5px]");
});
