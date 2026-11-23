import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import { controlIconInset } from "../../lib/head-edges";
import type { StyledProps } from "../../lib/styled-props";
import { Spinner } from "../spinner/index";

// Raft Design System › Button: a pink sticker for the one primary action, an
// ink outline for the rest, no frame for cancel and minor actions, orange for
// what interrupts and red for what cannot be undone. Underlined text, the step
// below a frameless button, is TextLink, not a variant here. Every button that is not
// disabled lays the medium hover tier on hover and press instead of changing fill.
// A frameless icon button that is disabled only greys its icon: no box appears
// (DS IconButton), while a disabled text button keeps the sunken fill.
const sticker = (fill: string) => [
  `border-sticker-ink ${fill} text-sticker-ink ring-[1.5px] ring-sticker-edge`,
  "hover:overlay-sticker-medium active:overlay-sticker-medium",
];
const outline = (ink: string) => [
  `border-line-strong bg-layer-card ${ink}`,
  "hover:overlay-medium active:overlay-medium",
];

// Three text sizes and three icon sizes, nothing in between, so a button reads
// the same wherever it sits; the 32px ones (34px with a mouse on a desktop)
// keep a 44px hit area through an overhanging ::after. An absolute ::after is
// placed from the padding box, so each overhang adds the 1.5px border back:
// 32 - 3 + 2 x (6 + 1.5) = 44, and with a mouse 34 - 3 + 2 x (5 + 1.5) = 44. `lg`, `icon-lg` and `xl` take the control height, 44px
// (52px) on a phone and 34px (40px) with a mouse on a desktop, from the token layer; there
// `lg` and `icon-lg` overhang by `control-hit` to keep 44px. `xs` and `sm`
// are deprecated aliases of `md`, and `icon-xs` of `icon-md`, kept until
// raft-ui 1.0 (codemods/button-sizes.mjs renames them).
// `icon-sm` is a row's action, the icon-only button on a line of a row or a
// card (a comment header's More): 28px with every pointer (`row-action-size`,
// the bar button's size on a desktop), a 16px icon, and a 44px hit area: past
// each side by what it lacks of the control target (the control height plus
// its hit inset, 44 with every pointer), plus the 1.5px border.
// With a mouse on a desktop `md` is the control height (34px), the one
// desktop size of a field, a select, a tab and a menu row (stdrc, 2026-11-04),
// its hit area reaching the control's 44px.
// An icon marked `data-icon` that isn't an svg (an `<img>` mark) takes the
// svg's size at that size, not the font's: 16px in `md`, 18px in `lg` and
// `xl` (Iconography › Sizes). A `size-` class of its own still wins.
const textMd = [
  "h-control-small gap-2 rounded-control px-3 py-0 text-control",
  "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
  "[&_svg:not([class*='size-'])]:size-4 [&_[data-icon]:not(svg):not([class*='size-'])]:size-4",
  "after:absolute after:inset-x-0 after:-inset-y-[calc(--spacing(1.5)+1.5px)]",
  "md:pointer-fine:after:-inset-y-[calc(var(--control-hit-inset)+1.5px)]",
];
const iconSm = [
  "size-row-action rounded-chip p-0 [&_svg:not([class*='size-'])]:size-4",
  "after:absolute after:-inset-[calc((var(--control-height)+2*var(--control-hit-inset)-var(--row-action-size))/2+1.5px)]",
];
const iconMd = [
  "size-control-small rounded-control p-0 [&_svg:not([class*='size-'])]:size-[18px]",
  "after:absolute after:-inset-[calc(--spacing(1.5)+1.5px)]",
  "md:pointer-fine:after:-inset-[calc(var(--control-hit-inset)+1.5px)]",
];

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "whitespace-nowrap select-none",
      "rounded-none border-[1.5px] font-sans font-bold shadow-none",
      "outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-transparent",
      "focus-visible:shadow-focus",
      "data-[loading=true]:cursor-wait data-[loading=true]:opacity-100",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      // Native-disabled buttons swallow pointer events. The
      // focusableWhenDisabled path (aria-disabled) keeps them so a wrapping
      // Tooltip can say why the action is unavailable, and mirrors every
      // disabled: class so both paths look the same: grey fill, no overlay,
      // nothing that moves on hover or press. A busy button is aria-disabled
      // too (it keeps its focus) but keeps its colors: data-loading marks it,
      // so the grey skips it and its hover overlay stays off.
      "disabled:pointer-events-none aria-disabled:cursor-not-allowed",
      "disabled:transform-none aria-disabled:transform-none",
      "aria-disabled:hover:translate-none",
      "aria-disabled:active:translate-none aria-disabled:active:scale-none",
      "disabled:opacity-100 aria-disabled:opacity-100",
      "disabled:border-line-hairline disabled:bg-fill-muted disabled:bg-none disabled:text-foreground-disabled disabled:ring-0",
      "aria-disabled:not-data-[loading=true]:border-line-hairline aria-disabled:not-data-[loading=true]:bg-fill-muted aria-disabled:not-data-[loading=true]:bg-none aria-disabled:not-data-[loading=true]:text-foreground-disabled aria-disabled:not-data-[loading=true]:ring-0",
      "data-[loading=true]:bg-none",
    ],
    content:
      "relative z-raised inline-flex min-w-0 max-w-full items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator:
      "pointer-events-none absolute inset-0 z-raised flex items-center justify-center",
  },
  variants: {
    variant: {
      primary: { root: sticker("bg-attention-400") },
      accent: { root: sticker("bg-attention-400") },
      warning: { root: sticker("bg-warning") },
      danger: { root: sticker("bg-danger") },
      default: { root: outline("text-foreground") },
      outline: { root: outline("text-foreground") },
      information: { root: outline("text-foreground") },
      muted: { root: outline("text-foreground") },
      success: { root: outline("text-foreground") },
      "danger-secondary": { root: outline("text-danger-strong") },
      "danger-outline": { root: outline("text-danger-strong") },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground",
          "hover:bg-fill-medium active:bg-fill-medium",
        ],
      },
      // Frameless, on the yellow frame (rail, top bar, desktop title bar): the
      // frame's ink, and frame-pressed on hover, press and while its popup is
      // open. Disabled, it only greys: a box would sit on the frame.
      "on-frame": {
        root: [
          "border-transparent bg-transparent text-foreground-on-frame",
          "hover:bg-fill-frame-medium active:bg-fill-frame-medium",
          "aria-expanded:bg-fill-frame-medium data-popup-open:bg-fill-frame-medium",
          "disabled:border-transparent disabled:bg-transparent",
          "aria-disabled:not-data-[loading=true]:border-transparent aria-disabled:not-data-[loading=true]:bg-transparent",
        ],
      },
    },
    size: {
      xs: { root: textMd },
      sm: { root: textMd },
      md: { root: textMd },
      // Dialog and sheet footers, forms.
      lg: {
        root: [
          "h-control gap-2 rounded-(--control-radius) px-4 py-0 text-subhead",
          "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5",
          "[&_svg:not([class*='size-'])]:size-[18px] [&_[data-icon]:not(svg):not([class*='size-'])]:size-[18px]",
          "after:absolute after:inset-x-0 after:-inset-y-[calc(var(--spacing-control-hit)+1.5px)]",
        ],
      },
      // A full-width call to action. Its content is centred in the full
      // width, so it needs no tighter padding on an icon's side.
      xl: {
        root: [
          "h-control-cta gap-2 rounded-control px-5 py-0 text-body",
          "[&_svg:not([class*='size-'])]:size-[18px] [&_[data-icon]:not(svg):not([class*='size-'])]:size-[18px]",
        ],
      },
      "icon-xs": { root: iconMd },
      "icon-sm": { root: iconSm },
      "icon-md": { root: iconMd },
      "icon-lg": {
        root: [
          "size-control rounded-(--control-radius) p-0 [&_svg:not([class*='size-'])]:size-control-icon",
          "after:absolute after:-inset-[calc(var(--spacing-control-hit)+1.5px)]",
        ],
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
  compoundVariants: [
    // Stacked full width (a dialog footer whose buttons don't fit on one
    // line, a bottom sheet's actions: `data-stacked`), a frameless button
    // reads as a line of text, not a button: each button in a stack needs its
    // own box (stdrc, 2026-10-22). There a ghost text button takes the ink
    // border of `default`, with its hover and press. `in-data-stacked:` is a
    // `:where()`, so the disabled fill still wins.
    {
      variant: "ghost",
      size: ["xs", "sm", "md", "lg", "xl"],
      class: {
        root: [
          "in-data-stacked:border-line-strong in-data-stacked:bg-layer-card",
          "in-data-stacked:hover:bg-layer-card in-data-stacked:active:bg-layer-card",
          "in-data-stacked:hover:overlay-medium in-data-stacked:active:overlay-medium",
        ],
      },
    },
    {
      variant: "ghost",
      size: ["icon-xs", "icon-sm", "icon-md", "icon-lg"],
      class: {
        root: [
          "disabled:border-transparent disabled:bg-transparent",
          "aria-disabled:not-data-[loading=true]:border-transparent aria-disabled:not-data-[loading=true]:bg-transparent",
        ],
      },
    },
    // A frameless icon button aligns by its icon box: it declares how far the
    // box sits inside its edge, and a head pulls it out by that much
    // (lib/head-edges.ts). A button with a frame aligns by its shape.
    {
      variant: ["ghost", "on-frame"],
      size: "icon-lg",
      class: { root: controlIconInset },
    },
    {
      variant: "ghost",
      size: "icon-sm",
      // Its 16px icon box from its edge: 6px in a 28px button.
      class: { root: "[--icon-inset:calc((var(--row-action-size)-16px)/2)]" },
    },
    {
      variant: "ghost",
      size: ["icon-xs", "icon-md"],
      // Its icon box from its edge: 7px in the 32px button, 8px in the 34px
      // one with a mouse (`control-height-small`).
      class: { root: "[--icon-inset:calc((var(--control-height-small)-18px)/2)]" },
    },
    // On the frame the controls are the frame item (`frame-item-height`: 36px, the 34px control height with a mouse) of the top bar
    // and title bar (DS `rf-topbar__ws`: 15/20 700, 10px each side), with a
    // 20px icon; the hit area still reaches 44.
    {
      variant: "on-frame",
      size: ["xs", "sm", "md"],
      class: {
        root: "h-(--frame-item-height) px-2.5 text-subhead after:-inset-y-[calc((44px-var(--frame-item-height))/2+1.5px)]",
      },
    },
    {
      variant: "on-frame",
      size: ["icon-xs", "icon-md"],
      class: {
        root: [
          "size-(--frame-item-height) after:-inset-[calc((44px-var(--frame-item-height))/2+1.5px)] [&_svg:not([class*='size-'])]:size-5",
          "[--icon-inset:calc((var(--frame-item-height)-20px)/2)]",
        ],
      },
    },
  ],
});

const FRAMELESS = new Set(["ghost", "on-frame"]);
const ICON_SIZES = new Set(["icon-xs", "icon-sm", "icon-md", "icon-lg"]);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** The Button sizes: `md`, `lg`, `xl`, `icon-sm`, `icon-md` and `icon-lg`. */
export type ButtonSize = "md" | "lg" | "xl" | "icon-sm" | "icon-md" | "icon-lg";

/**
 * Deprecated: `xs` and `sm` render as `md`, `icon-xs` as `icon-md`. Removed
 * in raft-ui 1.0; run
 * `node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <src>`.
 */
export type DeprecatedButtonSize = "xs" | "sm" | "icon-xs";

export type ButtonProps = StyledProps<BaseButton.Props> &
  Omit<ButtonVariantProps, "size"> &
  DataAttributes & {
    /**
     * `md` (32px) and `icon-md` for rows, cards, banners, toolbars and panel
     * headers; `lg` and `icon-lg` (the control height) for dialog footers,
     * forms and beside a field; `xl` for a full-width call to action;
     * `icon-sm` (28px, a 44px hit area) for an icon-only action on a line of
     * a row or a card, such as a comment header's More, never in a toolbar.
     * The size follows the place: see Button › Size by place.
     *
     * `xs`, `sm` and `icon-xs` are deprecated aliases of `md` and `icon-md`,
     * removed in raft-ui 1.0 (`codemods/button-sizes.mjs`).
     */
    size?: "md" | "lg" | "xl" | "icon-sm" | "icon-md" | "icon-lg" | DeprecatedButtonSize;
    /**
     * Busy: shows the spinner and blocks activation (click, Enter, Space and
     * form submission) while keeping the button focusable. A busy button is
     * `aria-disabled`, not natively `disabled`, so the focus a press left on
     * it stays there and is still there when the wait ends.
     */
    loading?: boolean;
    /** The spinner's accessible name while `loading`: say what is happening. */
    loadingLabel?: string;
  };

export function Button({
  variant,
  size,
  loading = false,
  loadingLabel = "Loading",
  disabled,
  focusableWhenDisabled,
  className,
  children,
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const { root, content, loadingIndicator } = buttonVariants({
    variant,
    size,
  });

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="button"
      data-icon-inset={
        FRAMELESS.has(variant ?? "default") && ICON_SIZES.has(size ?? "md") ? "" : undefined
      }
      className={root({ className })}
      // Busy, not disabled: what keeps the button's colors (see the recipe).
      // A disabled button that is also loading greys like any disabled one.
      data-loading={loading && !disabled ? "true" : undefined}
      disabled={disabled || loading}
      // A busy button must not drop the focus a press left on it: natively
      // disabling a focused button sends focus to <body>, and it doesn't come
      // back when the wait ends. While loading (and not otherwise disabled)
      // Base UI's focusableWhenDisabled path keeps it focusable and
      // aria-disabled, and still blocks click, Enter, Space and form
      // submission. A disabled button stays natively disabled.
      focusableWhenDisabled={(loading && !disabled) || focusableWhenDisabled}
      // Only set aria-disabled when loading: an explicit `undefined` here
      // would override Base UI's computed aria-disabled on the
      // focusableWhenDisabled path.
      {...(loading ? { "aria-disabled": true } : {})}
    >
      {loading ? (
        <span data-slot="button-loading-indicator" className={loadingIndicator()}>
          <Spinner aria-label={loadingLabel} />
        </span>
      ) : null}
      <span
        data-slot="button-content"
        data-loading={loading ? "true" : undefined}
        className={content()}
      >
        {children}
      </span>
    </BaseButton>
  );
}
