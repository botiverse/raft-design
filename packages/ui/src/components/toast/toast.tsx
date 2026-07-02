import {
  cloneElement,
  isValidElement,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { buttonVariants } from "../button/index";
import { Spinner } from "../spinner/index";
import { cn } from "../../lib/cn";

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
      "relative grid min-h-12 min-w-36 grid-cols-[minmax(0,1fr)] items-center gap-x-3 overflow-hidden px-3 py-3",
      "[&:has([data-slot=toast-description])_[data-slot=toast-body]]:self-start [&:has([data-slot=toast-description])_[data-slot=toast-icon]]:self-start",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-h-9",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-w-28",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:px-3",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:py-2",
      "[&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:justify-self-center [&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:text-center",
      "transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[behind]:opacity-0 data-[expanded]:opacity-100",
      "motion-reduce:transition-none",
    ],
    icon: ["flex size-5 shrink-0 items-center justify-center", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
    body: ["min-w-0"],
    title: ["m-0 truncate text-sm leading-5"],
    description: ["m-0 text-sm leading-5"],
    actions: ["flex items-center justify-end gap-1.5"],
    close: [
      "absolute top-1.5 right-1.5 inline-flex size-7 shrink-0 items-center justify-center",
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
        content: ["min-h-0 min-w-0 grid-cols-1 px-3 py-2 font-sans", "gap-y-1.5"],
        icon: ["border border-line-strong bg-brutal-yellow text-black"],
        title: ["font-bold text-black"],
        description: ["font-semibold text-black/75"],
        actions: [
          "col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end gap-1",
        ],
        close: [
          "static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap border-2 border-line-strong bg-white px-2 text-xs font-bold text-black/70 shadow-xs",
          "hover:bg-brutal-yellow hover:text-black active:translate-x-px active:translate-y-px active:shadow-none",
        ],
        arrow: ["border-l-2 border-t-2 border-line-strong bg-soft-signal"],
      },
      elegant: {
        root: [
          "relative rounded-xl bg-[oklch(0.263_0.009_294.9_/_0.50)] text-[oklch(0.965_0.002_286)] backdrop-blur-2xl saturate-150",
          "shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.54)]",
          "data-[expanded]:bg-[oklch(0.244_0.012_300.7_/_0.58)] data-[expanded]:shadow-[0_18px_42px_-16px_oklch(0_0_0_/_0.58)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/35 after:mix-blend-overlay after:content-['']",
          "dark:bg-[oklch(0.230_0.010_294.8_/_0.50)] dark:shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.68)] dark:data-[expanded]:bg-[oklch(0.208_0.010_294.7_/_0.58)]",
        ],
        content: [
          "min-h-14 gap-x-3.5 py-3 pl-3.5 font-sans",
          "[&:has([data-slot=toast-icon])]:min-w-[18rem] [&:has([data-slot=toast-icon])]:grid-cols-[auto_minmax(0,1fr)]",
          "[&:has([data-slot=toast-actions])]:min-w-[18rem]",
          "[&:has([data-slot=toast-description])]:min-w-[18rem] [&:has([data-slot=toast-close])]:pr-3",
          "[&:has([data-slot=toast-actions])]:grid-cols-[minmax(0,1fr)]",
          "[&:has([data-slot=toast-actions])]:gap-y-2",
          "[&:has([data-slot=toast-icon]):has([data-slot=toast-actions])]:grid-cols-[auto_minmax(0,1fr)]",
        ],
        icon: ["text-white/85", "[&_svg]:size-5 [&_svg]:stroke-[1.5]"],
        title: ["font-medium text-[oklch(0.985_0.001_286)]"],
        description: ["text-white/62"],
        actions: ["col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end"],
        close: [
          "static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap rounded-full border-0 bg-transparent px-2 text-xs font-medium text-white/52 shadow-none",
          "hover:bg-white/[0.08] hover:text-white/82 active:scale-[0.985]",
        ],
        arrow: [
          "border-l border-t border-white/20 bg-[oklch(0.263_0.009_294.9_/_0.50)] backdrop-blur-2xl group-data-[expanded]/toast:bg-[oklch(0.244_0.012_300.7_/_0.58)]",
          "dark:bg-[oklch(0.230_0.010_294.8_/_0.50)] dark:group-data-[expanded]/toast:bg-[oklch(0.208_0.010_294.7_/_0.58)]",
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
          "relative w-max max-w-[min(24rem,var(--available-width,calc(100vw-2rem)))]",
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

const toastAction = tv({
  extend: buttonVariants,
  slots: {
    root: [
      "inline-flex min-h-7 shrink-0 items-center justify-center whitespace-nowrap px-2 text-xs leading-none",
      "font-sans shadow-none",
      "outline outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
      "focus-visible:outline-line-strong",
      "[&_[data-icon]]:size-[1em] [&_svg:not([class*='size-'])]:size-3",
    ],
  },
  variants: {
    toastTheme: {
      brutal: {
        root: [
          "order-2 border-2 border-line-strong bg-black font-bold text-white shadow-xs",
          "hover:bg-black/85 active:translate-x-px active:translate-y-px active:shadow-none",
        ],
      },
      elegant: {
        root: [
          "toast-gradient-border order-2 min-h-7 rounded-full bg-white/[0.06] px-3 font-medium text-white/74",
          "[--toast-gradient-border-angle:to_bottom] [--toast-gradient-border-from:rgb(255_255_255_/_0.1)] [--toast-gradient-border-to:rgb(255_255_255_/_0)] [--toast-gradient-border-via:rgb(255_255_255_/_0.05)]",
          "hover:bg-white/[0.1] hover:text-white hover:[--toast-gradient-border-from:rgb(255_255_255_/_0.42)] hover:[--toast-gradient-border-via:rgb(255_255_255_/_0.14)] active:scale-[0.985]",
        ],
      },
    },
  },
  defaultVariants: {
    variant: undefined,
    size: undefined,
  },
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

export type ToastActionsProps = ComponentPropsWithRef<"div">;

export function ToastActions({ className, ...props }: ToastActionsProps) {
  const theme = useThemeFamily();
  const { actions } = toast({ theme });

  return <div data-slot="toast-actions" className={actions({ className })} {...props} />;
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

export type ToastActionProps = StyledProps<BaseToast.Action.Props> & {
  loading?: boolean;
  loadingLabel?: string;
};

type ToastActionRenderFn = Exclude<BaseToast.Action.Props["render"], ReactElement | undefined>;
type ToastActionRenderProps = Parameters<ToastActionRenderFn>[0];
type ToastActionRenderState = Parameters<ToastActionRenderFn>[1];

export function ToastAction({
  className,
  children,
  disabled,
  loading = false,
  loadingLabel = "Loading",
  render,
  ...props
}: ToastActionProps) {
  const theme = useThemeFamily();
  const { root, content, loadingIndicator } = toastAction({ toastTheme: theme });

  const renderActionContent = (actionChildren: ReactNode) => (
    <>
      {loading ? (
        <span data-slot="toast-action-loading-indicator" className={loadingIndicator()}>
          <Spinner aria-label={loadingLabel} />
        </span>
      ) : null}
      <span
        data-slot="toast-action-content"
        data-loading={loading ? "true" : undefined}
        className={content()}
      >
        {actionChildren}
      </span>
    </>
  );

  const renderAction = (renderProps: ToastActionRenderProps, state: ToastActionRenderState) => {
    const actionChildren = renderActionContent(renderProps.children);
    const nextRenderProps = {
      ...renderProps,
      children: actionChildren,
    };

    if (typeof render === "function") {
      return render(nextRenderProps, state);
    }

    if (isValidElement(render)) {
      const renderElement = render as ReactElement<{
        className?: string;
        children?: ReactNode;
      }>;

      return cloneElement(renderElement, {
        ...nextRenderProps,
        className: cn(renderProps.className, renderElement.props.className),
        children: actionChildren,
      });
    }

    return <button {...nextRenderProps} />;
  };

  return (
    <BaseToast.Action
      data-slot="toast-action"
      data-loading={loading ? "true" : undefined}
      className={root({ className })}
      disabled={disabled || loading}
      aria-disabled={loading || undefined}
      render={renderAction}
      {...props}
    >
      {children}
    </BaseToast.Action>
  );
}

export type ToastCloseProps = StyledProps<BaseToast.Close.Props>;

export function ToastClose({ className, children, ...props }: ToastCloseProps) {
  const theme = useThemeFamily();
  const { close } = toast({ theme });
  const usesDefaultText = children == null;

  return (
    <BaseToast.Close
      aria-label={usesDefaultText ? undefined : "Dismiss toast"}
      data-slot="toast-close"
      className={close({ className })}
      {...props}
    >
      {children ?? "Dismiss"}
    </BaseToast.Close>
  );
}

export type ToastArrowProps = StyledProps<BaseToast.Arrow.Props>;

export function ToastArrow({ className, ...props }: ToastArrowProps) {
  const theme = useThemeFamily();
  const { arrow } = toast({ theme });

  return <BaseToast.Arrow data-slot="toast-arrow" className={arrow({ className })} {...props} />;
}
