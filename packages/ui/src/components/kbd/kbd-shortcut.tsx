import {
  ArrowBigUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  Option,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { markInlinePart } from "../../lib/inline-part";
import { tv } from "../../lib/tv";
import { useKeyboardPlatform } from "../../lib/use-platform";
import type { KeyboardPlatform } from "../../lib/use-platform";
import { Kbd, KbdGroup } from "./kbd";
import type { KbdSize } from "./kbd";
import { resolveKbdKeys } from "./kbd-keys";
import type { KbdKeyIcon, KbdKeyName } from "./kbd-keys";

const ICONS: Record<KbdKeyIcon, LucideIcon> = {
  "chevron-up": ChevronUp,
  option: Option,
  "arrow-big-up": ArrowBigUp,
  command: Command,
  "corner-down-left": CornerDownLeft,
  delete: Delete,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
};

const kbdShortcut = tv({
  slots: {
    root: ["inline-flex shrink-0 items-center"],
    cap: ["data-[glyph=icon]:px-0"],
    text: ["block leading-none [text-box:trim-both_cap_alphabetic]"],
    icon: ["block shrink-0"],
    label: ["sr-only"],
  },
  variants: {
    size: {
      sm: { cap: ["h-4"] },
      md: {},
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type KbdShortcutProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /**
   * The keys, by name, case-insensitive, in any order: `["mod", "shift",
   * "enter"]`. `KeyboardEvent.key` values work too (`ArrowUp`, `Meta`).
   * Modifiers are drawn first, in the platform's order; the other keys
   * follow in the order written.
   */
  keys: readonly KbdKeyName[];
  /** The size of every cap, as `Kbd`'s. */
  size?: KbdSize;
  /**
   * The keyboard to draw for. Without it, the platform the page runs on,
   * detected once on the client (`other` on the server and while hydrating).
   */
  platform?: KeyboardPlatform;
  /**
   * What a screen reader says instead of the key names, which are English:
   * pass the product's own words for another language ("Shift Command 回车").
   */
  label?: string;
};

/**
 * One shortcut from key names: a cap per key, with the platform's drawings
 * (icons on a Mac, words elsewhere), and the shortcut in words for a screen
 * reader. Alternatives ("⌘↑ / ⌘↓") are two KbdShortcut with a separator
 * between them, written by the caller.
 */
export function KbdShortcut({
  keys,
  size = "sm",
  platform: platformProp,
  label,
  className,
  ...props
}: KbdShortcutProps) {
  const detected = useKeyboardPlatform();
  const platform = platformProp ?? detected;
  const resolved = resolveKbdKeys(keys, platform);
  const slots = kbdShortcut({ size });

  return (
    <span
      data-slot="kbd-shortcut"
      data-platform={platform}
      className={slots.root({ className })}
      {...props}
    >
      <KbdGroup aria-hidden="true">
        {resolved.map((key, index) => {
          const Icon = key.icon ? ICONS[key.icon] : undefined;
          return (
            <Kbd
              key={`${index}-${key.name}`}
              size={size}
              data-glyph={Icon ? "icon" : "text"}
              className={slots.cap()}
            >
              {Icon ? (
                <Icon data-slot="kbd-icon" className={slots.icon()} aria-hidden="true" />
              ) : (
                <span data-slot="kbd-text" className={slots.text()}>
                  {key.text}
                </span>
              )}
            </Kbd>
          );
        })}
      </KbdGroup>
      <span data-slot="kbd-shortcut-label" className={slots.label()}>
        {label ?? resolved.map((key) => key.label).join(" ")}
      </span>
    </span>
  );
}

markInlinePart(KbdShortcut);
