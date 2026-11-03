/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "./kbd";
import { KbdShortcut } from "./kbd-shortcut";
import { resolveKbdKeys } from "./kbd-keys";
import type { KbdKeyName } from "./kbd-keys";
import { resetDetectedPlatform } from "../../lib/use-platform";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetDetectedPlatform();
});

const MOD_SHIFT_ENTER: KbdKeyName[] = ["mod", "shift", "enter"];
const ESCAPE: KbdKeyName[] = ["escape"];
const K: KbdKeyName[] = ["k"];
const MOD_K: KbdKeyName[] = ["mod", "k"];

const classes = (element: Element) => element.getAttribute("class")!.split(/\s+/);

/** Each cap as drawn: its icon name, or its text. */
const drawn = (keys: KbdKeyName[], platform: "mac" | "other") =>
  resolveKbdKeys(keys, platform).map((key) => key.icon ?? key.text);

// The classes of Kbd before sizes existed (origin/main, v0.59.2), exactly:
// sm changes nothing for existing callers, its 3px radius included.
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
  "rounded-[3px]",
];

describe("Kbd sizes", () => {
  test("the default is sm, today's hint, class for class", () => {
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
    // The hint's ink, size, 3px radius and the tooltip's on-hud colors are sm only.
    expect(list).not.toContain("rounded-[3px]");
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
    expect(list).not.toContain("rounded-[3px]");
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
    for (const size of ["sm", "md"] as const) {
      render(<KbdShortcut data-testid={size} keys={MOD_K} platform="mac" size={size} />);
      const [icon, text] = screen.getByTestId(size).querySelectorAll('[data-slot="kbd"]');
      expect(icon!.getAttribute("data-glyph")).toBe("icon");
      expect(text!.getAttribute("data-glyph")).toBe("text");
      // The padding drops on data-glyph="icon" only, above the size's own px.
      expect(classes(icon!)).toContain("data-[glyph=icon]:px-0");
      expect(classes(icon!)).toContain(size === "md" ? "px-1.5" : "px-1");
    }
  });

  test("label replaces the spoken words, for a language other than English", () => {
    render(
      <KbdShortcut
        data-testid="s"
        keys={MOD_SHIFT_ENTER}
        platform="mac"
        label="Shift Command 回车"
      />,
    );
    const root = screen.getByTestId("s");
    expect(root.querySelector('[data-slot="kbd-shortcut-label"]')!.textContent).toBe(
      "Shift Command 回车",
    );
    // The caps are still drawn from the key names.
    expect(root.querySelectorAll('[data-slot="kbd-icon"]')).toHaveLength(3);
  });
});

describe("KbdShortcut without a platform prop", () => {
  const spoken = () =>
    screen.getByTestId("s").querySelector('[data-slot="kbd-shortcut-label"]')!.textContent;

  test("navigator.platform MacIntel draws a Mac shortcut", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    render(<KbdShortcut data-testid="s" keys={MOD_K} />);
    expect(screen.getByTestId("s").getAttribute("data-platform")).toBe("mac");
    expect(spoken()).toBe("Command K");
  });

  test("navigator.platform Win32 draws Ctrl", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32");
    render(<KbdShortcut data-testid="s" keys={MOD_K} />);
    expect(screen.getByTestId("s").getAttribute("data-platform")).toBe("other");
    expect(spoken()).toBe("Control K");
  });

  test("Client Hints win over navigator.platform", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32");
    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      value: { platform: "macOS" },
    });
    try {
      render(<KbdShortcut data-testid="s" keys={MOD_K} />);
      expect(spoken()).toBe("Command K");
    } finally {
      delete (navigator as { userAgentData?: unknown }).userAgentData;
    }
  });
});

describe("key aliases and KeyboardEvent.key values", () => {
  test("names are case-insensitive and aliases sort as modifiers", () => {
    expect(drawn(["shift", "cmd", "k"], "mac")).toEqual(["arrow-big-up", "command", "K"]);
    expect(drawn(["Control", "Shift", "ArrowUp"], "mac")).toEqual([
      "chevron-up",
      "arrow-big-up",
      "arrow-up",
    ]);
    expect(drawn(["Shift", "Control", "ArrowUp"], "other")).toEqual(["Ctrl", "Shift", "arrow-up"]);
    expect(drawn(["SHIFT", "Opt", "MOD", "k"], "mac")).toEqual([
      "option",
      "arrow-big-up",
      "command",
      "K",
    ]);
  });

  test("every alias resolves to its key", () => {
    const one = (key: string, platform: "mac" | "other") => drawn([key], platform)[0];
    expect(one("control", "other")).toBe("Ctrl");
    expect(one("opt", "other")).toBe("Alt");
    expect(one("option", "mac")).toBe("option");
    expect(one("Alt", "other")).toBe("Alt");
    expect(one("return", "other")).toBe("Enter");
    expect(one("Enter", "mac")).toBe("corner-down-left");
    expect(one("esc", "mac")).toBe("Esc");
    expect(one("Escape", "other")).toBe("Esc");
    expect(one(" ", "other")).toBe("Space");
    expect(one("Backspace", "other")).toBe("Backspace");
    expect(one("Tab", "mac")).toBe("Tab");
    expect(one("del", "other")).toBe("Del");
    expect(one("ArrowDown", "other")).toBe("arrow-down");
    expect(one("ARROWLEFT", "mac")).toBe("arrow-left");
    expect(one("ArrowRight", "mac")).toBe("arrow-right");
  });

  test("meta is Command on a Mac and the Windows key elsewhere; mod is Command or Ctrl", () => {
    for (const name of ["meta", "Meta", "cmd", "command"]) {
      expect(drawn([name], "mac")).toEqual(["command"]);
      expect(drawn([name], "other")).toEqual(["Win"]);
    }
    expect(resolveKbdKeys(["meta"], "other")[0]!.label).toBe("Windows");
    // The Windows key comes after Ctrl, Alt and Shift.
    expect(drawn(["meta", "shift", "s"], "other")).toEqual(["Shift", "Win", "S"]);
    expect(drawn(["meta", "mod", "d"], "other")).toEqual(["Ctrl", "Win", "D"]);
  });
});

describe("edge cases", () => {
  test("F-keys are uppercase", () => {
    expect(drawn(["f5"], "other")).toEqual(["F5"]);
    expect(drawn(["F12"], "mac")).toEqual(["F12"]);
    expect(drawn(["mod", "f1"], "mac")).toEqual(["command", "F1"]);
  });

  test("only ASCII letters are uppercased", () => {
    expect(drawn(["ß"], "other")).toEqual(["ß"]);
    expect(drawn(["é"], "mac")).toEqual(["é"]);
    expect(drawn(["a"], "mac")).toEqual(["A"]);
  });

  test("an empty key is skipped, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(drawn(["mod", "", "j"], "mac")).toEqual(["command", "J"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("empty key name");
  });

  test("two names that press one key are drawn once, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(drawn(["mod", "ctrl", "y"], "other")).toEqual(["Ctrl", "Y"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain('"mod" and "ctrl" are the same key');
    // On a Mac they are two keys: no warning.
    warn.mockClear();
    expect(drawn(["mod", "ctrl", "y"], "mac")).toEqual(["chevron-up", "command", "Y"]);
    expect(warn).not.toHaveBeenCalled();
  });

  test("punctuation has spoken names", () => {
    const word = (key: string) => resolveKbdKeys([key], "mac")[0]!.label;
    expect(word("!")).toBe("Exclamation Mark");
    expect(word("@")).toBe("At");
    expect(word("#")).toBe("Number Sign");
    expect(word("*")).toBe("Asterisk");
    expect(word("<")).toBe("Less Than");
    expect(word(">")).toBe("Greater Than");
    expect(word("~")).toBe("Tilde");
    expect(word("&")).toBe("Ampersand");
    expect(word("|")).toBe("Vertical Bar");
    expect(word("/")).toBe("Slash");
  });
});
