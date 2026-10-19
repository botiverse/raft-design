/**
 * The toolbar over selected text looks exactly like the hover toolbar (#98):
 * 32px high (28px buttons in a 2px frame, hairline inside), grey pressed
 * hover rather than a menu row's brand-soft, and labels that never wrap.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./message-item.recipe";
import { messageTextSelectionToolbar } from "./message-text-selection-toolbar.recipe";

const classes = (value: string) => value.split(/\s+/);

test("the frame matches the hover toolbar's: 2px padding, inset hairline, container radius", () => {
  const toolbar = classes(messageTextSelectionToolbar().toolbar());
  const hover = classes(messageItem().toolbar());
  for (const cls of [
    "p-0.5",
    "gap-0.5",
    "rounded-container",
    "ring-1",
    "ring-line-seam",
    "ring-inset",
    "shadow-float",
    "bg-layer-popover",
  ]) {
    expect(toolbar).toContain(cls);
    expect(hover).toContain(cls);
  }
});

test("buttons are 28px, hover grey, 16px muted icons, and never wrap", () => {
  const button = classes(messageTextSelectionToolbar().button());
  expect(button).toContain("h-7");
  expect(button).toContain("whitespace-nowrap");
  expect(button).toContain("shrink-0");
  expect(button).toContain("hover:bg-fill-pressed");
  expect(button).toContain("rounded-control");
  expect(button).toContain("[&_svg]:size-4");
  expect(button).toContain("[&_svg]:text-foreground-muted");
  expect(button.some((cls) => cls.includes("brand-soft"))).toBe(false);
});

test("the divider is 20px high with 2px side margins", () => {
  const separator = classes(messageTextSelectionToolbar().separator());
  expect(separator).toEqual(expect.arrayContaining(["w-px", "h-5", "mx-0.5", "bg-line-hairline"]));
});
