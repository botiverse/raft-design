import { ChevronDown } from "lucide-react";
import { createContext, useContext } from "react";
import type { ComponentProps } from "react";

import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { Button } from "./button";
import type { ButtonProps } from "./button";

// Raft Design System › Button › Split buttons: a Button with its ▾ menu, one
// shape in two parts. The parts touch and share one radius-control outline;
// the menu part's start border is the divider (the main part draws no end
// border), so two parts of the same fill don't read as one undivided button.
// Each part hovers and presses on its own with its variant's medium tier: the
// shared fill and edge already say they belong together. In dark mode a
// sticker's die-cut edge goes around the whole shape, on the group, not around
// each part, where it would show as a light seam beside the divider.
export const buttonSplit = tv({
  base: [
    "relative isolate inline-flex shrink-0 items-stretch",
    "rounded-control ring-sticker-edge",
    "has-[>[data-split-sticker]:not(:disabled,[aria-disabled=true])]:ring-[1.5px]",
  ],
});

export const buttonSplitMain = tv({
  base: ["rounded-e-none border-e-0", "ring-0 focus-visible:z-1"],
});

// 28px wide beside a 32px height: narrower than the 32px icon button, so it
// reads as the main button's appendix, and the 16px chevron's 8px of ink sits
// about 8px from each edge. On a touch screen `lg` is 44px tall and the part
// 36px wide. The hit area reaches past the part's end to 44px wide (measured
// from inside its 1.5px border); its height comes from the Button size.
export const buttonSplitMenu = tv({
  base: ["min-w-0 rounded-s-none px-0", "ring-0 focus-visible:z-1", "after:inset-s-0"],
  variants: {
    variant: {
      primary: "data-popup-open:overlay-sticker-medium",
      warning: "data-popup-open:overlay-sticker-medium",
      danger: "data-popup-open:overlay-sticker-medium",
      default: "data-popup-open:overlay-medium",
    },
    size: {
      md: ["w-7", "after:-inset-e-[calc(--spacing(4)+1.5px)]"],
      lg: [
        "w-9 md:pointer-fine:w-7",
        "after:-inset-e-[calc(--spacing(2)+1.5px)] md:pointer-fine:after:-inset-e-[calc(--spacing(4)+1.5px)]",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

/** The Button variants a split button takes: the filled ones and the bordered one. */
export type ButtonSplitVariant = "primary" | "default" | "warning" | "danger";

/** The Button sizes a split button takes. */
export type ButtonSplitSize = "md" | "lg";

const STICKERS = new Set<ButtonSplitVariant>(["primary", "warning", "danger"]);

const ButtonSplitDisabledContext = createContext(false);

export type ButtonSplitProps = ComponentProps<"div"> &
  DataAttributes & {
    /** Disables both parts. Either part can also be disabled on its own. */
    disabled?: boolean;
  };

/**
 * A Button with a menu beside it, such as Create agent and its ▾: a
 * `ButtonSplitMain`, then a `ButtonSplitMenu` as the trigger of a DropdownMenu.
 * The two parts touch and read as one button. A `role="group"`: name it with
 * `aria-label`, not with the main part's name. For a frameless split in a
 * panel header, use `PanelSplitAction`.
 */
export function ButtonSplit({ disabled, className, ...props }: ButtonSplitProps) {
  return (
    <ButtonSplitDisabledContext.Provider value={disabled ?? false}>
      <div
        role="group"
        {...props}
        data-slot="button-split"
        className={buttonSplit({ className })}
      />
    </ButtonSplitDisabledContext.Provider>
  );
}

type ButtonSplitPartProps = Omit<ButtonProps, "variant" | "size"> & {
  /** The Button variant; give both parts the same one. */
  variant?: ButtonSplitVariant;
  /** The Button size; give both parts the same one. */
  size?: ButtonSplitSize;
};

export type ButtonSplitMainProps = ButtonSplitPartProps;

/** The action of a split button: a Button, rounded only on its start side. */
export function ButtonSplitMain({
  variant = "default",
  size = "md",
  disabled,
  className,
  ...props
}: ButtonSplitMainProps) {
  const groupDisabled = useContext(ButtonSplitDisabledContext);
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={disabled || groupDisabled}
      data-split-part="main"
      data-split-sticker={STICKERS.has(variant) ? "" : undefined}
      className={buttonSplitMain({ className })}
    />
  );
}

export type ButtonSplitMenuProps = ButtonSplitPartProps;

/**
 * The narrow part of a split button that opens its menu, with a chevron by
 * default; its start border is the divider. Render it as the trigger of a
 * DropdownMenu:
 * `<DropdownMenuTrigger render={<ButtonSplitMenu aria-label="More ways to create an agent" />} />`.
 */
export function ButtonSplitMenu({
  variant = "default",
  size = "md",
  disabled,
  className,
  children,
  ...props
}: ButtonSplitMenuProps) {
  const groupDisabled = useContext(ButtonSplitDisabledContext);
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={disabled || groupDisabled}
      data-split-part="menu"
      data-split-sticker={STICKERS.has(variant) ? "" : undefined}
      className={buttonSplitMenu({ variant, size, className })}
    >
      {children ?? <ChevronDown aria-hidden />}
    </Button>
  );
}
