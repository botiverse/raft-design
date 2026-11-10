import { ChevronDown } from "lucide-react";
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
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
// each part, where it would show as a light seam beside the divider: each
// enabled sticker part registers with the group, which then sets
// `data-sticker-edge`.
export const buttonSplit = tv({
  base: [
    "relative isolate inline-flex shrink-0 items-stretch",
    "rounded-control ring-sticker-edge",
    "data-sticker-edge:ring-[1.5px]",
    // An `lg` split is a control at the control height: its parts take the
    // control radius (10px on a touch screen), so the group's outline does too.
    "data-[size=lg]:rounded-(--control-radius)",
  ],
});

export const buttonSplitMain = tv({
  base: ["rounded-e-none border-e-0", "ring-0 focus-visible:z-raised"],
});

// 28px wide beside a 32px height (34px with a mouse on a desktop): narrower than the icon button, so it
// reads as the main button's appendix, and the 16px chevron's 8px of ink sits
// about 8px from each edge. On a touch screen `lg` is 44px tall and the part
// 36px wide. The hit area reaches past the part's end to 44px wide (measured
// from inside its 1.5px border); its height comes from the Button size.
export const buttonSplitMenu = tv({
  base: ["min-w-0 rounded-s-none px-0", "ring-0 focus-visible:z-raised", "after:inset-s-0"],
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

const ButtonSplitContext = createContext<{
  disabled: boolean;
  registerStickerPart: () => () => void;
  setSize: (size: ButtonSplitSize) => void;
}>({ disabled: false, registerStickerPart: () => () => {}, setSize: () => {} });

/** An enabled sticker part asks its group to draw the die-cut edge while it is mounted. */
function useStickerEdge(active: boolean) {
  const { registerStickerPart } = useContext(ButtonSplitContext);
  useLayoutEffect(
    () => (active ? registerStickerPart() : undefined),
    [active, registerStickerPart],
  );
}

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
export function ButtonSplit({ disabled = false, className, ...props }: ButtonSplitProps) {
  const [stickerParts, setStickerParts] = useState(0);
  const registerStickerPart = useCallback(() => {
    setStickerParts((count) => count + 1);
    return () => setStickerParts((count) => count - 1);
  }, []);
  // The main part tells the group its size, so the group's outline (the
  // sticker edge) follows the parts' corner.
  const [size, setSize] = useState<ButtonSplitSize>("md");
  const context = useMemo(
    () => ({ disabled, registerStickerPart, setSize }),
    [disabled, registerStickerPart],
  );
  return (
    <ButtonSplitContext.Provider value={context}>
      <div
        role="group"
        {...props}
        data-slot="button-split"
        data-sticker-edge={stickerParts > 0 ? "" : undefined}
        data-size={size}
        className={buttonSplit({ className })}
      />
    </ButtonSplitContext.Provider>
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
  const group = useContext(ButtonSplitContext);
  const isDisabled = disabled || group.disabled;
  useStickerEdge(STICKERS.has(variant) && !isDisabled && !props.loading);
  const { setSize } = group;
  useLayoutEffect(() => setSize(size), [setSize, size]);
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={isDisabled}
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
  const group = useContext(ButtonSplitContext);
  const isDisabled = disabled || group.disabled;
  useStickerEdge(STICKERS.has(variant) && !isDisabled && !props.loading);
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={isDisabled}
      data-split-part="menu"
      data-split-sticker={STICKERS.has(variant) ? "" : undefined}
      className={buttonSplitMenu({ variant, size, className })}
    >
      {children ?? <ChevronDown aria-hidden />}
    </Button>
  );
}
