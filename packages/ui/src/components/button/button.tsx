import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { Spinner } from "../spinner/index";

// Raft Design System › Button: a pink sticker for the one primary action, an
// ink outline for the rest, no frame for cancel and minor actions, orange for
// what interrupts and red for what cannot be undone. Underlined text, the step
// below a frameless button, is TextLink, not a variant here. Every button that is not
// disabled shows the press overlay on hover and press instead of changing fill.
// A frameless icon button that is disabled only greys its icon: no box appears
// (DS IconButton), while a disabled text button keeps the sunken fill.
const sticker = (fill: string) => [
  `border-sticker-ink ${fill} text-sticker-ink ring-[1.5px] ring-sticker-edge`,
  "hover:press-overlay-sticker active:press-overlay-sticker",
];
const outline = (ink: string) => [
  `border-line-strong bg-layer-card ${ink}`,
  "hover:press-overlay active:press-overlay",
];

// Three text sizes and two icon sizes, nothing in between, so a button reads
// the same wherever it sits; the 32px ones keep a 44px hit area through an
// overhanging ::after. `lg`, `icon-lg` and `xl` take the control height, 44px
// (52px) on a phone and 32px (40px) on a desktop, from the token layer; there
// `lg` and `icon-lg` overhang by `control-hit` to keep 44px. `xs` and `sm` are
// the old names of `md`, `icon-xs` and `icon-sm` of `icon-md`.
const textMd = [
  "h-8 gap-2 rounded-control px-3 py-0 text-control",
  "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
  "[&_svg:not([class*='size-'])]:size-4 **:data-icon:size-[1em]",
  "after:absolute after:inset-x-0 after:-inset-y-1.5",
];
const iconMd = [
  "size-8 rounded-control p-0 [&_svg:not([class*='size-'])]:size-[18px]",
  "after:absolute after:-inset-1.5",
];

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "whitespace-nowrap select-none",
      "rounded-none border-[1.5px] font-sans font-bold shadow-none",
      "transition-colors duration-100",
      "outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-transparent",
      "focus-visible:shadow-focus",
      "data-[loading=true]:cursor-wait data-[loading=true]:opacity-100",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      // Native-disabled buttons swallow pointer events. The
      // focusableWhenDisabled path (aria-disabled) keeps them so a wrapping
      // Tooltip can say why the action is unavailable, and mirrors every
      // disabled: class so both paths look the same: grey fill, no overlay,
      // nothing that moves on hover or press.
      "disabled:pointer-events-none aria-disabled:cursor-not-allowed",
      "disabled:transform-none aria-disabled:transform-none",
      "aria-disabled:hover:translate-none",
      "aria-disabled:active:translate-none aria-disabled:active:scale-none",
      "disabled:opacity-100 aria-disabled:opacity-100",
      "disabled:border-line-hairline disabled:bg-fill-muted disabled:bg-none disabled:text-foreground-disabled disabled:ring-0",
      "aria-disabled:border-line-hairline aria-disabled:bg-fill-muted aria-disabled:bg-none aria-disabled:text-foreground-disabled aria-disabled:ring-0",
    ],
    content:
      "relative z-10 inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
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
          "hover:bg-fill-pressed active:bg-fill-pressed",
        ],
      },
      // Frameless, on the yellow frame (rail, top bar, desktop title bar): the
      // frame's ink, and frame-pressed on hover, press and while its popup is
      // open. Disabled, it only greys: a box would sit on the frame.
      "on-frame": {
        root: [
          "border-transparent bg-transparent text-foreground-on-frame",
          "hover:bg-fill-frame-pressed active:bg-fill-frame-pressed",
          "aria-expanded:bg-fill-frame-pressed data-popup-open:bg-fill-frame-pressed",
          "disabled:border-transparent disabled:bg-transparent",
          "aria-disabled:border-transparent aria-disabled:bg-transparent",
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
          "h-control gap-2 rounded-control px-4 py-0 text-subhead",
          "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5",
          "[&_svg:not([class*='size-'])]:size-[18px] **:data-icon:size-[1em]",
          "after:absolute after:inset-x-0 after:-inset-y-control-hit",
        ],
      },
      // A full-width call to action. Its content is centred in the full
      // width, so it needs no tighter padding on an icon's side.
      xl: {
        root: [
          "h-control-cta gap-2 rounded-control px-5 py-0 text-body",
          "[&_svg:not([class*='size-'])]:size-[18px] **:data-icon:size-[1em]",
        ],
      },
      "icon-xs": { root: iconMd },
      "icon-sm": { root: iconMd },
      "icon-md": { root: iconMd },
      "icon-lg": {
        root: [
          "size-control rounded-control p-0 [&_svg:not([class*='size-'])]:size-control-icon",
          "after:absolute after:-inset-control-hit",
        ],
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
  compoundVariants: [
    {
      variant: "ghost",
      size: ["icon-xs", "icon-sm", "icon-md", "icon-lg"],
      class: {
        root: [
          "disabled:border-transparent disabled:bg-transparent",
          "aria-disabled:border-transparent aria-disabled:bg-transparent",
        ],
      },
    },
    // On the frame the 32px controls are the 36px frame item of the top bar
    // and title bar (DS `rf-topbar__ws`: 15/20 700, 10px each side), with a
    // 20px icon; the hit area still reaches 44.
    {
      variant: "on-frame",
      size: ["xs", "sm", "md"],
      class: { root: "h-9 px-2.5 text-subhead after:-inset-y-1" },
    },
    {
      variant: "on-frame",
      size: ["icon-xs", "icon-sm", "icon-md"],
      class: { root: "size-9 after:-inset-1 [&_svg:not([class*='size-'])]:size-5" },
    },
  ],
});

export type ButtonProps = StyledProps<BaseButton.Props> &
  VariantProps<typeof buttonVariants> &
  DataAttributes & {
    loading?: boolean;
    loadingLabel?: string;
  };

export function Button({
  variant,
  size,
  loading = false,
  loadingLabel = "Loading",
  disabled,
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
      className={root({ className })}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
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
