/**
 * The toolbar over selected text looks exactly like the hover toolbar (#98):
 * 36px high (28px buttons 4px inside the frame and 4px apart, hairline
 * inside, the embedded corner), grey pressed
 * hover rather than a menu row's brand-soft, and labels that never wrap.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "../message-item/message-item.recipe";
import { textSelectionToolbar } from "./text-selection-toolbar.recipe";

const classes = (value: string) => value.split(/\s+/);

test("the frame matches the hover toolbar's: 4px padding and gap, inset hairline, container radius", () => {
  const toolbar = classes(textSelectionToolbar().toolbar());
  const hover = classes(messageItem().toolbar());
  for (const cls of [
    "p-1",
    "gap-1",
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
  const button = classes(textSelectionToolbar().button());
  expect(button).toContain("h-7");
  expect(button).toContain("whitespace-nowrap");
  expect(button).toContain("shrink-0");
  expect(button).toContain("hover:bg-fill-medium");
  expect(button).toContain("rounded-chip");
  expect(button).toContain("[&_svg]:size-4");
  expect(button).toContain("[&_svg]:text-foreground-muted");
  expect(button.some((cls) => cls.includes("brand-soft"))).toBe(false);
});

test("the divider is 20px high, the toolbar's 4px gap on each side", () => {
  const separator = classes(textSelectionToolbar().separator());
  expect(separator).toEqual(expect.arrayContaining(["w-px", "h-5", "bg-line-hairline"]));
  expect(separator.some((cls) => cls.startsWith("mx-"))).toBe(false);
});

test("the message-named parts stay as deprecated aliases of the generic ones", async () => {
  const message = await import("../message-item/index");
  const generic = await import("./index");
  expect(message.MessageTextSelectionToolbar).toBe(generic.TextSelectionToolbar);
  expect(message.MessageTextSelectionToolbarButton).toBe(generic.TextSelectionToolbarButton);
  expect(message.MessageTextSelectionToolbarSeparator).toBe(generic.TextSelectionToolbarSeparator);
  expect(message.createMessageTextSelectionAnchor).toBe(generic.createTextSelectionAnchor);
});
