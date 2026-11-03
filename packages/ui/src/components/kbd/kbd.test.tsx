/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "./kbd";
import { KbdShortcut } from "./kbd-shortcut";
import { resolveKbdKeys } from "./kbd-keys";
import type { KbdKeyName } from "./kbd-keys";

afterEach(cleanup);

const MOD_SHIFT_ENTER: KbdKeyName[] = ["mod", "shift", "enter"];
const ESCAPE: KbdKeyName[] = ["escape"];
const K: KbdKeyName[] = ["k"];
const MOD_K: KbdKeyName[] = ["mod", "k"];

const classes = (element: Element) => element.getAttribute("class")!.split(/\s+/);

/** Each cap as drawn: its icon name, or its text. */
const drawn = (keys: KbdKeyName[], platform: "mac" | "other") =>
  resolveKbdKeys(keys, platform).map((key) => key.icon ?? key.text);

// The classes of Kbd before sizes existed (origin/main, v0.59.2), less the
// off-token rounded-[3px] that radius-sticker replaces.
const HINT_CLASSES = [
  "pointer-events-none",
  "inline-flex",
  "w-fit",
  "shrink-0",
  "items-center",
  "justify-center",
  "gap-1",
  "whitespace-nowrap",
  "select-none",
  "[&_svg]:pointer-events-none",
  "[&_svg:not([class*='size-'])]:size-3",
  "min-w-4",
  "px-1",
  "font-mono",
  "text-mono-meta",
  "font-normal",
  "text-foreground-hint",
  "inset-ring",
  "inset-ring-line-hairline",
  "in-data-[slot=tooltip-content]:text-foreground-on-hud/70",
  "in-data-[slot=tooltip-content]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground-on-hud)_70%,transparent)]",
  "rounded-sticker",
];

describe("Kbd sizes", () => {
  test("the default is sm, today's hint, with radius-sticker for rounded-[3px]", () => {
    render(<Kbd data-testid="kbd">Esc</Kbd>);
    const kbd = screen.getByTestId("kbd");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd.getAttribute("data-slot")).toBe("kbd");
    expect(classes(kbd).sort()).toEqual([...HINT_CLASSES].sort());
  });

  test('size="sm" renders the same classes as no size', () => {
    render(
      <>
        <Kbd data-testid="default">K</Kbd>
        <Kbd data-testid="sm" size="sm">
          K
        </Kbd>
      </>,
    );
    expect(screen.getByTestId("sm").className).toBe(screen.getByTestId("default").className);
  });

  test("md is a 24px cap on fill-muted, at the mono code size, with 14px icons", () => {
    render(
      <Kbd data-testid="kbd" size="md">
        K
      </Kbd>,
    );
    const list = classes(screen.getByTestId("kbd"));
    expect(list).toEqual(
      expect.arrayContaining([
        "h-6",
        "min-w-6",
        "px-1.5",
        "text-mono-code",
        "text-foreground-muted",
        "bg-fill-muted",
        "inset-ring-line-hairline",
        "rounded-sticker",
        "[&_svg:not([class*='size-'])]:size-3.5",
      ]),
    );
    // The hint's ink, size and the tooltip's on-hud colors are sm only.
    expect(list).not.toContain("text-foreground-hint");
    expect(list).not.toContain("text-mono-meta");
    expect(list).not.toContain("min-w-4");
    expect(list.some((name) => name.startsWith("in-data-[slot=tooltip-content]"))).toBe(false);
  });

  test("a caller's className still wins, as in the menu shortcut", () => {
    render(
      <Kbd data-testid="kbd" className="rounded-none p-0 shadow-none">
        ⌘C
      </Kbd>,
    );
    const list = classes(screen.getByTestId("kbd"));
    expect(list).toContain("rounded-none");
    expect(list).not.toContain("rounded-sticker");
    expect(list).not.toContain("px-1");
  });

  test("KbdGroup holds caps 4px apart", () => {
    render(
      <KbdGroup data-testid="group">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    expect(classes(screen.getByTestId("group"))).toEqual(
      expect.arrayContaining(["inline-flex", "items-center", "gap-1"]),
    );
  });
});

describe("key names on a Mac", () => {
  test("modifiers and special keys are Lucide icons", () => {
    expect(drawn(["ctrl", "alt", "shift", "mod"], "mac")).toEqual([
      "chevron-up",
      "option",
      "arrow-big-up",
      "command",
    ]);
    expect(drawn(["option"], "mac")).toEqual(["option"]);
    expect(drawn(["enter"], "mac")).toEqual(["corner-down-left"]);
    expect(drawn(["backspace"], "mac")).toEqual(["delete"]);
    expect(drawn(["up"], "mac")).toEqual(["arrow-up"]);
    expect(drawn(["down"], "mac")).toEqual(["arrow-down"]);
    expect(drawn(["left"], "mac")).toEqual(["arrow-left"]);
    expect(drawn(["right"], "mac")).toEqual(["arrow-right"]);
  });

  test("Esc, Tab, Space and forward delete are words", () => {
    expect(drawn(["escape"], "mac")).toEqual(["Esc"]);
    expect(drawn(["tab"], "mac")).toEqual(["Tab"]);
    expect(drawn(["space"], "mac")).toEqual(["Space"]);
    expect(drawn(["delete"], "mac")).toEqual(["Del"]);
  });

  test("modifiers are drawn in Apple's order, Control Option Shift Command", () => {
    expect(drawn(["mod", "shift", "enter"], "mac")).toEqual([
      "arrow-big-up",
      "command",
      "corner-down-left",
    ]);
    expect(drawn(["mod", "alt", "m"], "mac")).toEqual(["option", "command", "M"]);
    expect(drawn(["shift", "mod", "ctrl", "option", "k"], "mac")).toEqual([
      "chevron-up",
      "option",
      "arrow-big-up",
      "command",
      "K",
    ]);
  });
});

describe("key names on Windows and Linux", () => {
  test("modifiers and named keys are words; arrows are icons", () => {
    expect(drawn(["mod"], "other")).toEqual(["Ctrl"]);
    expect(drawn(["ctrl"], "other")).toEqual(["Ctrl"]);
    expect(drawn(["alt"], "other")).toEqual(["Alt"]);
    expect(drawn(["option"], "other")).toEqual(["Alt"]);
    expect(drawn(["shift"], "other")).toEqual(["Shift"]);
    expect(drawn(["enter"], "other")).toEqual(["Enter"]);
    expect(drawn(["backspace"], "other")).toEqual(["Backspace"]);
    expect(drawn(["delete"], "other")).toEqual(["Del"]);
    expect(drawn(["escape"], "other")).toEqual(["Esc"]);
    expect(drawn(["tab"], "other")).toEqual(["Tab"]);
    expect(drawn(["space"], "other")).toEqual(["Space"]);
    expect(drawn(["up", "down", "left", "right"], "other")).toEqual([
      "arrow-up",
      "arrow-down",
      "arrow-left",
      "arrow-right",
    ]);
  });

  test("modifiers are drawn Ctrl, Alt, Shift, each once", () => {
    expect(drawn(["shift", "mod", "enter"], "other")).toEqual(["Ctrl", "Shift", "Enter"]);
    expect(drawn(["shift", "alt", "mod", "m"], "other")).toEqual(["Ctrl", "Alt", "Shift", "M"]);
    // mod and ctrl are the same key here.
    expect(drawn(["mod", "ctrl", "k"], "other")).toEqual(["Ctrl", "K"]);
  });
});

describe("characters", () => {
  test("letters are uppercase; other keys keep their written order after the modifiers", () => {
    expect(drawn(["k"], "mac")).toEqual(["K"]);
    expect(drawn(["g", "mod", "i"], "other")).toEqual(["Ctrl", "G", "I"]);
    expect(drawn(["/"], "mac")).toEqual(["/"]);
    expect(drawn(["1"], "other")).toEqual(["1"]);
    expect(drawn(["F5"], "other")).toEqual(["F5"]);
  });
});

describe("KbdShortcut", () => {
  test("one cap per key, never a + inside a cap", () => {
    render(<KbdShortcut data-testid="s" keys={MOD_SHIFT_ENTER} platform="other" />);
    const caps = screen.getByTestId("s").querySelectorAll('[data-slot="kbd"]');
    expect([...caps].map((cap) => cap.textContent)).toEqual(["Ctrl", "Shift", "Enter"]);
    for (const cap of caps) expect(cap.textContent).not.toContain("+");
  });

  test("on a Mac, the caps hold Lucide icons", () => {
    render(<KbdShortcut data-testid="s" keys={MOD_SHIFT_ENTER} platform="mac" />);
    const icons = screen.getByTestId("s").querySelectorAll('[data-slot="kbd-icon"]');
    expect([...icons].map((icon) => icon.getAttribute("class"))).toEqual([
      expect.stringContaining("lucide-arrow-big-up"),
      expect.stringContaining("lucide-command"),
      expect.stringContaining("lucide-corner-down-left"),
    ]);
  });

  test("the caps are hidden and the shortcut is said in words, in the drawn order", () => {
    const { rerender } = render(
      <KbdShortcut data-testid="s" keys={MOD_SHIFT_ENTER} platform="mac" />,
    );
    const root = screen.getByTestId("s");
    expect(root.querySelector('[data-slot="kbd-group"]')!.getAttribute("aria-hidden")).toBe("true");
    const label = root.querySelector('[data-slot="kbd-shortcut-label"]')!;
    expect(label.textContent).toBe("Shift Command Return");
    expect(classes(label)).toContain("sr-only");

    rerender(<KbdShortcut data-testid="s" keys={MOD_SHIFT_ENTER} platform="other" />);
    expect(screen.getByTestId("s").textContent).toContain("Control Shift Enter");
    expect(
      screen.getByTestId("s").querySelector('[data-slot="kbd-shortcut-label"]')!.textContent,
    ).toBe("Control Shift Enter");
  });

  test("the words name every key", () => {
    const words = (keys: KbdKeyName[], platform: "mac" | "other") =>
      resolveKbdKeys(keys, platform)
        .map((key) => key.label)
        .join(" ");
    expect(words(["mod", "alt", "m"], "mac")).toBe("Option Command M");
    expect(words(["ctrl", "backspace"], "mac")).toBe("Control Delete");
    expect(words(["mod", "/"], "mac")).toBe("Command Slash");
    expect(words(["mod", "\\"], "other")).toBe("Control Backslash");
    expect(words(["mod", "up"], "other")).toBe("Control Up Arrow");
    expect(words(["escape"], "mac")).toBe("Escape");
    expect(words(["alt", "backspace"], "other")).toBe("Alt Backspace");
  });

  test("Esc is the word Esc on every platform", () => {
    render(
      <>
        <KbdShortcut data-testid="mac" keys={ESCAPE} platform="mac" />
        <KbdShortcut data-testid="other" keys={ESCAPE} platform="other" />
      </>,
    );
    for (const id of ["mac", "other"]) {
      const cap = screen.getByTestId(id).querySelector('[data-slot="kbd"]')!;
      expect(cap.querySelector('[data-slot="kbd-text"]')!.textContent).toBe("Esc");
    }
  });

  test("text is trimmed to cap height so it centers with the icons", () => {
    render(<KbdShortcut data-testid="s" keys={K} platform="mac" />);
    const text = screen.getByTestId("s").querySelector('[data-slot="kbd-text"]')!;
    expect(classes(text)).toEqual(
      expect.arrayContaining(["leading-none", "[text-box:trim-both_cap_alphabetic]"]),
    );
  });

  test("sm by default, with 16px caps; md caps are Kbd md", () => {
    render(
      <>
        <KbdShortcut data-testid="sm" keys={MOD_K} platform="mac" />
        <KbdShortcut data-testid="md" keys={MOD_K} platform="mac" size="md" />
      </>,
    );
    for (const cap of screen.getByTestId("sm").querySelectorAll('[data-slot="kbd"]')) {
      expect(classes(cap)).toEqual(
        expect.arrayContaining(["h-4", "min-w-4", "text-foreground-hint"]),
      );
    }
    for (const cap of screen.getByTestId("md").querySelectorAll('[data-slot="kbd"]')) {
      expect(classes(cap)).toEqual(
        expect.arrayContaining(["h-6", "min-w-6", "bg-fill-muted", "text-foreground-muted"]),
      );
      expect(classes(cap)).not.toContain("h-4");
    }
  });

  test("an icon cap has no side padding, so a single icon key is square", () => {
    render(<KbdShortcut data-testid="s" keys={MOD_K} platform="mac" size="md" />);
    const [icon, text] = screen.getByTestId("s").querySelectorAll('[data-slot="kbd"]');
    expect(icon!.getAttribute("data-glyph")).toBe("icon");
    expect(classes(icon!)).toContain("px-0");
    expect(classes(icon!)).not.toContain("px-1.5");
    expect(text!.getAttribute("data-glyph")).toBe("text");
    expect(classes(text!)).toContain("px-1.5");
  });

  test("without a platform prop it uses the detected platform", () => {
    render(<KbdShortcut data-testid="s" keys={MOD_K} />);
    const root = screen.getByTestId("s");
    // jsdom's navigator.platform is "" (or the host's), so read what was used.
    const platform = root.getAttribute("data-platform");
    expect(["mac", "other"]).toContain(platform);
    expect(root.querySelector('[data-slot="kbd-shortcut-label"]')!.textContent).toBe(
      platform === "mac" ? "Command K" : "Control K",
    );
  });
});
