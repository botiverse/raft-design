import type { ComponentPropsWithRef } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const toast = tv({
  slots: {
    viewport: [
      "pointer-events-none isolate z-[70] w-[min(24rem,calc(100vw-2rem))]",
      "outline-none",
    ],
    positioner: ["isolate z-[70] outline-none"],
    root: [
      "group/toast pointer-events-auto",
      "select-text overflow-hidden text-foreground-strong",
      "outline outline-1 outline-offset-2 outline-transparent",
      "[--toast-scale:calc(max(0.84,1-(var(--toast-index)*0.04)))]",
      "[--toast-peek:0.5rem]",
      "[--toast-gap:0.5rem]",
      "[--toast-stack-height:var(--toast-frontmost-height,var(--toast-height))]",
      "[--toast-y:calc((var(--toast-offset-y)*-1)-(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
      "transition-[transform,opacity,height] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[limited]:opacity-0",
      "data-[starting-style]:opacity-0",
      "data-[ending-style]:opacity-0",
      "motion-reduce:transition-none",
    ],
    content: [
      "grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3 overflow-hidden px-3 py-3",
      "transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[behind]:opacity-0 data-[expanded]:opacity-100",
      "motion-reduce:transition-none",
    ],
    icon: [
      "mt-0.5 flex size-5 shrink-0 items-center justify-center",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    body: ["min-w-0"],
    title: ["m-0 truncate text-sm leading-5"],
    description: ["m-0 text-sm leading-5"],
    action: [
      "inline-flex min-h-7 shrink-0 items-center justify-center whitespace-nowrap px-2 text-xs leading-none",
      "outline outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40",
      "focus-visible:outline-line-strong",
    ],
    close: [
      "inline-flex size-7 shrink-0 items-center justify-center",
      "outline outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40",
      "focus-visible:outline-line-strong",
      "[&_svg]:size-3.5",
    ],
    arrow: ["size-2 rotate-45"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-black bg-soft-signal text-black shadow-[var(--shadow-brutal)]",
          "focus-visible:outline-transparent",
        ],
        content: ["min-h-0 grid-cols-[minmax(0,1fr)] items-center gap-0 px-3 py-2 font-sans"],
        icon: ["border border-line-strong bg-brutal-yellow text-black"],
        title: ["font-bold text-black"],
        description: ["font-semibold text-black/75"],
        action: [
          "border-2 border-line-strong bg-white font-bold text-black shadow-xs",
          "hover:bg-brutal-yellow active:translate-x-px active:translate-y-px active:shadow-none",
        ],
        close: [
          "border-2 border-line-strong bg-white text-black/60 shadow-xs",
          "hover:bg-brutal-yellow hover:text-black active:translate-x-px active:translate-y-px active:shadow-none",
        ],
        arrow: ["border-l-2 border-t-2 border-line-strong bg-soft-signal"],
      },
      elegant: {
        root: [
          "relative rounded-lg bg-[#252429]/50 text-[oklch(0.965_0.002_286)] backdrop-blur-2xl saturate-150",
          "shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.62)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/60 after:mix-blend-overlay after:content-['']",
          "dark:bg-[#1d1c21]/58 dark:shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.78)]",
        ],
        content: [
          "min-h-14 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3.5 px-3.5 py-3 font-sans",
        ],
        icon: [
          "mt-0 flex size-8 rounded-full bg-white/[0.1] text-white/70 shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.1)]",
          "group-data-[toast-type=success]/toast:text-success-light",
          "group-data-[toast-type=warning]/toast:text-warning-light",
          "group-data-[toast-type=error]/toast:text-danger-light",
          "[&_svg]:size-5",
        ],
        title: ["font-medium text-[oklch(0.985_0.001_286)]"],
        description: ["text-white/62"],
        action: [
          "min-h-7 rounded-full bg-white/[0.09] px-3 font-medium text-white/74 shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.1)]",
          "hover:bg-white/[0.14] hover:text-white active:scale-[0.985]",
        ],
        close: [
          "size-auto rounded-sm border-0 bg-transparent p-1 text-white/45 shadow-none",
          "hover:bg-transparent hover:text-white/82 active:scale-[0.96]",
          "[&_svg]:size-4",
        ],
        arrow: [
          "border-l border-t border-white/20 bg-[#252429]/50 backdrop-blur-2xl",
          "dark:bg-[#1d1c21]/58",
        ],
      },
    },
    placement: {
      "bottom-center": {
        viewport: "bottom-4 left-1/2 -translate-x-1/2",
      },
      "bottom-right": {
        viewport: "right-4 bottom-4",
      },
      "top-center": {
        viewport: "top-4 left-1/2 -translate-x-1/2",
      },
      "top-right": {
        viewport: "top-4 right-4",
      },
    },
    strategy: {
      fixed: {
        viewport: "fixed",
      },
      absolute: {
        viewport: "absolute",
      },
    },
    layout: {
      stacked: {
        root: [
          "absolute right-0 bottom-0 left-0 mx-auto h-[var(--toast-stack-height)] w-full origin-bottom",
          "z-[calc(70-var(--toast-index))]",
          "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))))_scale(var(--toast-scale))]",
          "data-[expanded]:h-[var(--toast-height)]",
          "data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-y))_scale(1)]",
          "data-[starting-style]:[transform:translateY(120%)_scale(0.98)]",
          "[&[data-ending-style]:not([data-swipe-direction])]:[transform:translateY(120%)_scale(0.98)]",
          "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+120%))_translateY(var(--toast-y))]",
          "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-120%))_translateY(var(--toast-y))]",
          "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+120%))]",
          "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-120%))]",
        ],
      },
      anchored: {
        root: [
          "relative min-w-[18rem] max-w-[min(24rem,var(--available-width,calc(100vw-2rem)))]",
          "origin-[var(--transform-origin)]",
          "data-[starting-style]:[transform:scale(0.97)]",
          "data-[ending-style]:[transform:scale(0.99)]",
        ],
      },
    },
    tone: {
      info: {},
      success: {},
      warning: {},
      error: {},
    },
  },
  defaultVariants: {
    placement: "bottom-center",
    layout: "stacked",
    strategy: "fixed",
  },
  compoundVariants: [
    {
      theme: "brutal",
      tone: "success",
      class: {
        root: "bg-brutal-lime",
      },
    },
    {
      theme: "brutal",
      tone: "warning",
      class: {
        root: "bg-brutal-orange",
      },
    },
    {
      theme: "brutal",
      tone: "error",
      class: {
        root: "bg-brutal-orange shadow-[var(--shadow-brutal-sm)]",
      },
    },
    {
      theme: "brutal",
      layout: "stacked",
      class: {
        root: "w-max max-w-full",
      },
    },
  ],
});

export const createToastManager = BaseToast.createToastManager;
export const useToastManager = BaseToast.useToastManager;

export type ToastObject<Data extends object = object> = BaseToast.Root.ToastObject<Data>;
export type ToastProviderProps = BaseToast.Provider.Props;

function getToastTone(type: string | undefined) {
  if (type === "success" || type === "warning" || type === "error") {
    return type;
  }

  return "info";
}

export function ToastProvider(props: ToastProviderProps) {
  return <BaseToast.Provider {...props} />;
}

export type ToastPortalProps = BaseToast.Portal.Props;

export function ToastPortal(props: ToastPortalProps) {
  return <BaseToast.Portal data-slot="toast-portal" {...props} />;
}

export type ToastViewportProps = StyledProps<BaseToast.Viewport.Props> &
  Pick<VariantProps<typeof toast>, "placement" | "strategy">;

export function ToastViewport({
  placement = "bottom-center",
  strategy = "fixed",
  className,
  ...props
}: ToastViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = toast({ theme, placement, strategy });

  return (
    <BaseToast.Viewport data-slot="toast-viewport" className={viewport({ className })} {...props} />
  );
}

export type ToastPositionerProps = StyledProps<BaseToast.Positioner.Props>;

export function ToastPositioner({ className, ...props }: ToastPositionerProps) {
  const theme = useThemeFamily();
  const { positioner } = toast({ theme });

  return (
    <BaseToast.Positioner
      data-slot="toast-positioner"
      className={positioner({ className })}
      {...props}
    />
  );
}

export type ToastRootProps = StyledProps<BaseToast.Root.Props> &
  Pick<VariantProps<typeof toast>, "layout">;

export function ToastRoot({
  layout = "stacked",
  className,
  toast: toastObject,
  ...props
}: ToastRootProps) {
  const theme = useThemeFamily();
  const tone = getToastTone(toastObject.type);
  const { root } = toast({ theme, layout, tone });

  return (
    <BaseToast.Root
      data-slot="toast"
      data-toast-type={toastObject.type ?? "info"}
      toast={toastObject}
      className={root({ className })}
      {...props}
    />
  );
}

export type ToastContentProps = StyledProps<BaseToast.Content.Props>;

export function ToastContent({ className, ...props }: ToastContentProps) {
  const theme = useThemeFamily();
  const { content } = toast({ theme });

  return (
    <BaseToast.Content data-slot="toast-content" className={content({ className })} {...props} />
  );
}

export type ToastIconProps = ComponentPropsWithRef<"div">;

export function ToastIcon({ className, ...props }: ToastIconProps) {
  const theme = useThemeFamily();
  const { icon } = toast({ theme });

  return <div data-slot="toast-icon" className={icon({ className })} {...props} />;
}

export type ToastBodyProps = ComponentPropsWithRef<"div">;

export function ToastBody({ className, ...props }: ToastBodyProps) {
  const theme = useThemeFamily();
  const { body } = toast({ theme });

  return <div data-slot="toast-body" className={body({ className })} {...props} />;
}

export type ToastTitleProps = StyledProps<BaseToast.Title.Props>;

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  const theme = useThemeFamily();
  const { title } = toast({ theme });

  return <BaseToast.Title data-slot="toast-title" className={title({ className })} {...props} />;
}

export type ToastDescriptionProps = StyledProps<BaseToast.Description.Props>;

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = toast({ theme });

  return (
    <BaseToast.Description
      data-slot="toast-description"
      className={description({ className })}
      {...props}
    />
  );
}

export type ToastActionProps = StyledProps<BaseToast.Action.Props>;

export function ToastAction({ className, ...props }: ToastActionProps) {
  const theme = useThemeFamily();
  const { action } = toast({ theme });

  return <BaseToast.Action data-slot="toast-action" className={action({ className })} {...props} />;
}

export type ToastCloseProps = StyledProps<BaseToast.Close.Props>;

export function ToastClose({ className, children, ...props }: ToastCloseProps) {
  const theme = useThemeFamily();
  const { close } = toast({ theme });

  return (
    <BaseToast.Close
      aria-label="Dismiss toast"
      data-slot="toast-close"
      className={close({ className })}
      {...props}
    >
      {children ?? <X aria-hidden />}
    </BaseToast.Close>
  );
}

export type ToastArrowProps = StyledProps<BaseToast.Arrow.Props>;

export function ToastArrow({ className, ...props }: ToastArrowProps) {
  const theme = useThemeFamily();
  const { arrow } = toast({ theme });

  return <BaseToast.Arrow data-slot="toast-arrow" className={arrow({ className })} {...props} />;
}
