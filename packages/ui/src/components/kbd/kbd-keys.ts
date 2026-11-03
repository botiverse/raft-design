import type { KeyboardPlatform } from "../../lib/use-platform";

/**
 * A key, by name. `mod` is Command on a Mac and Ctrl elsewhere; `ctrl` is
 * always the Control key. `alt` and `option` are the same key. Any other
 * string is a key written as it reads: a single character ("k", "/", "1") is
 * drawn uppercase, a longer one ("F5") as written.
 */
export type KbdKeyName =
  | "mod"
  | "ctrl"
  | "alt"
  | "option"
  | "shift"
  | "enter"
  | "backspace"
  | "delete"
  | "escape"
  | "tab"
  | "space"
  | "up"
  | "down"
  | "left"
  | "right"
  | (string & {});

/** The Lucide icons a cap can draw (lucide-react names, kebab-case). */
export type KbdKeyIcon =
  | "chevron-up"
  | "option"
  | "arrow-big-up"
  | "command"
  | "corner-down-left"
  | "delete"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right";

/** How one key is drawn on a platform: an icon or a text, and its words. */
export type KbdResolvedKey = {
  /** The key name the caller wrote. */
  name: string;
  /** The icon drawn in the cap, when the key is drawn as an icon. */
  icon?: KbdKeyIcon;
  /** The text drawn in the cap, when the key is drawn as text. */
  text?: string;
  /** What a screen reader says for the key. */
  label: string;
};

type Drawing = { icon?: KbdKeyIcon; text?: string; label: string };
type Modifier = "control" | "option" | "shift" | "command";

/** The modifier a key name presses on a platform, or none. */
function modifierOf(name: string, platform: KeyboardPlatform): Modifier | undefined {
  switch (name) {
    case "mod":
      return platform === "mac" ? "command" : "control";
    case "ctrl":
      return "control";
    case "alt":
    case "option":
      return "option";
    case "shift":
      return "shift";
    default:
      return undefined;
  }
}

// Apple's order (HIG): Control, Option, Shift, Command. Windows and Linux:
// Ctrl, Alt, Shift. Command never resolves on other platforms.
const MODIFIER_ORDER: Record<KeyboardPlatform, Modifier[]> = {
  mac: ["control", "option", "shift", "command"],
  other: ["control", "option", "shift"],
};

const MODIFIERS: Record<KeyboardPlatform, Record<Modifier, Drawing>> = {
  mac: {
    control: { icon: "chevron-up", label: "Control" },
    option: { icon: "option", label: "Option" },
    shift: { icon: "arrow-big-up", label: "Shift" },
    command: { icon: "command", label: "Command" },
  },
  other: {
    control: { text: "Ctrl", label: "Control" },
    option: { text: "Alt", label: "Alt" },
    shift: { text: "Shift", label: "Shift" },
    command: { text: "Ctrl", label: "Control" },
  },
};

const ARROWS: Record<string, Drawing> = {
  up: { icon: "arrow-up", label: "Up Arrow" },
  down: { icon: "arrow-down", label: "Down Arrow" },
  left: { icon: "arrow-left", label: "Left Arrow" },
  right: { icon: "arrow-right", label: "Right Arrow" },
};

const NAMED: Record<KeyboardPlatform, Record<string, Drawing>> = {
  mac: {
    ...ARROWS,
    enter: { icon: "corner-down-left", label: "Return" },
    backspace: { icon: "delete", label: "Delete" },
    // Lucide has no forward-delete (⌦) drawing; the word reads on any keyboard.
    delete: { text: "Del", label: "Forward Delete" },
    escape: { text: "Esc", label: "Escape" },
    tab: { text: "Tab", label: "Tab" },
    space: { text: "Space", label: "Space" },
  },
  other: {
    ...ARROWS,
    enter: { text: "Enter", label: "Enter" },
    backspace: { text: "Backspace", label: "Backspace" },
    delete: { text: "Del", label: "Delete" },
    escape: { text: "Esc", label: "Escape" },
    tab: { text: "Tab", label: "Tab" },
    space: { text: "Space", label: "Space" },
  },
};

/** What a screen reader is told for a punctuation key, which it may skip. */
const CHARACTER_LABELS: Record<string, string> = {
  "/": "Slash",
  "\\": "Backslash",
  ".": "Period",
  ",": "Comma",
  ";": "Semicolon",
  "'": "Quote",
  "`": "Backtick",
  "-": "Minus",
  "=": "Equals",
  "+": "Plus",
  "[": "Left Bracket",
  "]": "Right Bracket",
  "?": "Question Mark",
};

function drawingOf(name: string, platform: KeyboardPlatform): Drawing {
  const modifier = modifierOf(name, platform);
  if (modifier) return MODIFIERS[platform][modifier];
  const named = NAMED[platform][name];
  if (named) return named;
  if (/^.$/u.test(name)) {
    const text = name.toUpperCase();
    return { text, label: CHARACTER_LABELS[name] ?? text };
  }
  return { text: name, label: name };
}

/**
 * The keys of a shortcut as a platform draws them: the modifiers first, in
 * the platform's order whatever order they were written in (each once), then
 * the other keys in the order written.
 */
export function resolveKbdKeys(
  keys: readonly KbdKeyName[],
  platform: KeyboardPlatform,
): KbdResolvedKey[] {
  const order = MODIFIER_ORDER[platform];
  const modifiers = new Map<Modifier, string>();
  const rest: string[] = [];

  for (const key of keys) {
    const name = key.length > 1 ? key.toLowerCase() : key;
    const modifier = modifierOf(name, platform);
    if (modifier) {
      if (!modifiers.has(modifier)) modifiers.set(modifier, key);
    } else {
      rest.push(key);
    }
  }

  const sorted = [...modifiers.entries()].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));

  return [...sorted.map(([, key]) => key), ...rest].map((key) => {
    const name = key.length > 1 ? key.toLowerCase() : key;
    const known = modifierOf(name, platform) || NAMED[platform][name];
    return { name: key, ...drawingOf(known ? name : key, platform) };
  });
}
