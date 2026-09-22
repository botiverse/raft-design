import { cloneElement, createContext, isValidElement, useContext } from "react";
import type {
  ComponentProps,
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { buttonVariants } from "../button/index";
import { Spinner } from "../spinner/index";
import { cn } from "../../lib/cn";

const toastStyles = tv({
  slots: {
    viewport: ["pointer-events-none isolate z-70 w-[min(24rem,calc(100vw-2rem))]", "outline-none"],
    positioner: ["isolate z-[calc(70-var(--toast-index))] outline-none"],
    root: [
      "group/toast pointer-events-auto",
      "select-text text-foreground",
      "outline outline-1 outline-offset-2 outline-transparent",
      "[--toast-scale:calc(max(0.84,1-(var(--toast-index)*0.04)))]",
      "[--toast-peek:0.5rem]",
      "[--toast-gap:0.5rem]",
      "[--toast-stack-height:var(--toast-frontmost-height,var(--toast-height))]",
      "[--toast-y:calc((var(--toast-offset-y)*-1)-(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
      "transition-[transform,opacity,height] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-limited:opacity-0",
      "data-starting-style:opacity-0",
      "data-ending-style:opacity-0",
      "motion-reduce:transition-none",
    ],
    content: [
      "relative grid grid-cols-[minmax(0,1fr)] items-center gap-x-3 overflow-hidden",
      "[&:has([data-slot=toast-description])_[data-slot=toast-body]]:self-start [&:has([data-slot=toast-description])_[data-slot=toast-icon]]:self-start",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-h-(--toast-title-only-min-h,2.25rem)",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-w-(--toast-title-only-min-w,7rem)",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:px-(--toast-title-only-px,0.75rem)",
      "[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:py-(--toast-title-only-py,0.5rem)",
      "[&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:justify-self-center [&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:text-center",
      "transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "motion-reduce:transition-none",
    ],
    icon: ["flex size-5 shrink-0 items-center justify-center", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
    body: ["min-w-0"],
    title: ["m-0 truncate text-sm/5"],
    description: ["m-0 text-sm/5"],
    actions: ["flex items-center justify-end gap-1.5"],
    progress: [
      "pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left",
      "animate-[raft-toast-timeout-progress_var(--toast-progress-duration)_linear_forwards]",
      "group-hover/toast:[animation-play-state:paused] group-focus-within/toast:[animation-play-state:paused]",
      "motion-reduce:animate-none motion-reduce:scale-x-100",
    ],
    close: [
      "absolute top-1.5 right-1.5 inline-flex size-7 shrink-0 items-center justify-center",
      "outline outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40",
      "focus-visible:outline-line-strong",
      "[&_svg]:size-3.5",
    ],
    arrow: [
      "pointer-events-none flex",
      "data-[side=top]:bottom-[-5px]",
      "data-[side=bottom]:top-[-5px] data-[side=bottom]:rotate-180",
      "data-[side=left]:right-[-7px] data-[side=left]:-rotate-90",
      "data-[side=right]:left-[-7px] data-[side=right]:rotate-90",
      "data-[side=inline-start]:right-[-7px] data-[side=inline-start]:-rotate-90",
      "data-[side=inline-end]:left-[-7px] data-[side=inline-end]:rotate-90",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-primary text-foreground-strong shadow-raft-md",
          "focus-visible:outline-transparent",
        ],
        content: [
          "min-h-0 min-w-0 grid-cols-1 px-3 py-2 font-sans",
          "gap-y-1.5",
          "has-data-[slot=toast-icon]:grid-cols-[auto_minmax(0,1fr)]",
        ],
        icon: ["text-foreground-strong", "[&_svg]:size-4 [&_svg]:stroke-[2.5]"],
        title: ["font-bold text-foreground-strong"],
        description: ["font-semibold text-foreground-strong/75"],
        actions: [
          "col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end gap-1",
        ],
        progress: ["bg-foreground-strong/70"],
        close: [
          "static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap border-2 border-line-strong bg-layer-panel px-2 text-xs font-bold text-foreground-strong shadow-raft-xs",
          "hover:bg-layer-panel hover:text-foreground-strong hover:-translate-y-px hover:shadow-raft-sm",
          "active:translate-px  active:shadow-none",
        ],
        arrow: ["hidden"],
      },
      elegant: {
        root: [
          "relative rounded-xl bg-layer-hud/50 text-layer-hud-foreground backdrop-blur-2xl saturate-150",
          "shadow-[0_18px_42px_-18px_oklch(0_0_0/0.54)]",
          "data-expanded:bg-layer-hud/54 data-expanded:shadow-[0_18px_40px_-18px_oklch(0_0_0/0.54)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/35 after:mix-blend-overlay after:content-['']",
          "dark:bg-layer-popover dark:text-foreground dark:backdrop-blur-none dark:saturate-100 dark:shadow-raft-xl dark:after:hidden",
          "dark:data-expanded:bg-layer-popover dark:data-expanded:shadow-raft-xl",
        ],
        content: [
          "gap-x-3.5 font-sans",
          "has-data-[slot=toast-icon]:grid-cols-[auto_minmax(0,1fr)]",
          "has-data-[slot=toast-actions]:min-w-[18rem]",
          "has-data-[slot=toast-actions]:min-h-14",
          "has-data-[slot=toast-actions]:py-3",
          "has-data-[slot=toast-actions]:pl-3.5",
          "has-data-[slot=toast-actions]:pr-3",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:min-h-14",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:min-w-[18rem]",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:py-3",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:pl-3.5",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:min-h-14",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:min-w-[18rem]",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:py-3",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:pl-3.5",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:min-h-14",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:min-w-[18rem]",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:py-3",
          "[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:pl-3.5",
          "has-data-[slot=toast-close]:pr-3",
          "[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-w-0",
          "[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-h-10",
          "[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:pl-3.5",
          "[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:py-2",
          "[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:pr-3.5",
          "has-data-[slot=toast-actions]:grid-cols-[minmax(0,1fr)]",
          "has-data-[slot=toast-actions]:gap-y-2",
          "[&:has([data-slot=toast-icon]):has([data-slot=toast-actions])]:grid-cols-[auto_minmax(0,1fr)]",
        ],
        icon: ["text-white/85 dark:text-foreground-muted", "[&_svg]:size-4.5 [&_svg]:stroke-[1.5]"],
        title: ["font-medium text-[oklch(0.985_0.001_286)] dark:text-foreground"],
        description: ["text-white/62 dark:text-foreground-muted"],
        actions: ["col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end"],
        progress: ["rounded-b-xl bg-primary-400/80 dark:bg-primary-400"],
        close: [
          "static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap rounded-full border-0 bg-transparent px-2 text-xs font-medium text-white/52 shadow-none",
          "dark:text-foreground-muted",
          "hover:bg-white/5 hover:text-white/72 dark:hover:bg-ink-4 dark:hover:text-foreground active:scale-[0.985]",
        ],
        arrow: [],
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
      none: {
        viewport: "contents",
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
          "absolute inset-x-0 bottom-0 mx-auto h-(--toast-stack-height) w-full origin-bottom",
          "z-[calc(70-var(--toast-index))]",
          "before:pointer-events-auto before:absolute before:inset-x-0 before:top-full before:h-[calc(var(--toast-gap)+3px)] before:content-['']",
          "[--toast-peek-dir:-1]",
          "transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek)*var(--toast-peek-dir))))_scale(var(--toast-scale))]",
          "data-expanded:h-(--toast-height)",
          "data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-y))_scale(1)]",
          "data-starting-style:transform-[translateY(120%)_scale(0.98)]",
          "[&[data-ending-style]:not([data-swipe-direction])]:transform-[translateY(120%)_scale(0.98)]",
          "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+120%))_translateY(var(--toast-y))]",
          "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-120%))_translateY(var(--toast-y))]",
          "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+120%))]",
          "data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-120%))]",
          "[&_[data-slot=toast-content][data-behind]]:opacity-0 [&_[data-slot=toast-content][data-expanded]]:opacity-100",
          "in-data-[toast-placement$=right]:left-auto in-data-[toast-placement$=right]:mx-0",
          "in-data-[toast-placement^=top]:top-0 in-data-[toast-placement^=top]:bottom-auto in-data-[toast-placement^=top]:origin-top",
          "in-data-[toast-placement^=top]:before:top-auto in-data-[toast-placement^=top]:before:bottom-full",
          "in-data-[toast-placement^=top]:[--toast-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
          "in-data-[toast-placement^=top]:[--toast-peek-dir:1]",
          "[[data-toast-placement^=top]_&[data-starting-style]]:transform-[translateY(-120%)_scale(0.98)]",
          "[[data-toast-placement^=top]_&[data-ending-style]:not([data-swipe-direction])]:transform-[translateY(-120%)_scale(0.98)]",
        ],
      },
      inline: {
        root: [
          "relative mx-auto w-max max-w-[min(24rem,var(--available-width,calc(100vw-2rem)))] overflow-visible",
          "origin-(--transform-origin)",
          "data-starting-style:transform-[scale(0.97)]",
          "data-ending-style:transform-[scale(0.99)]",
          "**:data-[slot=toast-content]:opacity-100",
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
        root: "bg-brutal-orange shadow-raft-sm",
      },
    },
    {
      theme: "brutal",
      layout: "stacked",
      class: {
        root: "w-max max-w-full",
      },
    },
    {
      theme: "elegant",
      layout: "stacked",
      class: {
        root: "w-max max-w-full",
      },
    },
    {
      theme: "elegant",
      layout: "inline",
      class: {
        root: "bg-layer-hud/62 after:hidden dark:bg-layer-popover",
      },
    },
  ],
});

const TOAST_PROGRESS_STYLE = `
@keyframes raft-toast-timeout-progress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="toast-progress"] {
    animation: none;
    transform: scaleX(1);
  }
}
`;

const toastProgressStyle = (
  <style href="raft-ui-toast-progress" precedence="default">
    {TOAST_PROGRESS_STYLE}
  </style>
);

type ToastPlacement = NonNullable<VariantProps<typeof toastStyles>["placement"]>;
const DEFAULT_TOAST_TIMEOUT_MS = 5000;
const ToastProviderConfigContext = createContext({ timeout: DEFAULT_TOAST_TIMEOUT_MS });

const toastAction = tv({
  extend: buttonVariants,
  slots: {
    root: [
      "inline-flex min-h-7 shrink-0 items-center justify-center whitespace-nowrap px-2 text-xs/[1]",
      "font-sans shadow-none",
      "outline outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
      "focus-visible:outline-line-strong",
      "**:data-icon:size-[1em] [&_svg:not([class*='size-'])]:size-3",
    ],
  },
  variants: {
    toastTheme: {
      brutal: {
        root: [
          "order-2 border-2 border-line-strong bg-foreground-strong font-bold text-white shadow-raft-xs",
          "hover:bg-foreground-strong/85 hover:-translate-y-px hover:shadow-raft-sm",
          "active:translate-px  active:shadow-none",
        ],
      },
      elegant: {
        root: [
          "relative order-2 min-h-7 rounded-full bg-white/6 px-3 font-medium text-white/74",
          "[&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-0 [&::before]:rounded-[inherit] [&::before]:p-(--toast-gradient-border-width,1px)",
          "[&::before]:[content:''] [&::before]:[background:var(--toast-gradient-border,linear-gradient(var(--toast-gradient-border-angle,to_bottom),var(--toast-gradient-border-from,oklch(1_0_0/0.24)),var(--toast-gradient-border-via,oklch(1_0_0/0.1)),var(--toast-gradient-border-to,transparent)))]",
          "[&::before]:[-webkit-mask-image:linear-gradient(oklch(1_0_0)_0_0),linear-gradient(oklch(1_0_0)_0_0)] [&::before]:[-webkit-mask-origin:content-box,border-box] [&::before]:[-webkit-mask-clip:content-box,border-box] [&::before]:[-webkit-mask-composite:xor]",
          "[&::before]:mask-[linear-gradient(oklch(1_0_0)_0_0),linear-gradient(oklch(1_0_0)_0_0)] [&::before]:[mask-origin:content-box,border-box] [&::before]:[mask-clip:content-box,border-box] [&::before]:mask-exclude",
          "[--toast-gradient-border-angle:to_bottom] [--toast-gradient-border-from:oklch(1_0_0/0.1)] [--toast-gradient-border-to:oklch(1_0_0/0)] [--toast-gradient-border-via:oklch(1_0_0/0.05)]",
          "dark:bg-fill-muted dark:text-foreground-muted",
          "dark:[--toast-gradient-border-from:oklch(0.985_0.004_106.42/0.14)] dark:[--toast-gradient-border-via:oklch(0.985_0.004_106.42/0.07)]",
          "dark:hover:bg-fill-strong dark:hover:text-foreground dark:hover:[--toast-gradient-border-from:oklch(0.985_0.004_106.42/0.22)] dark:hover:[--toast-gradient-border-via:oklch(0.985_0.004_106.42/0.11)]",
          "hover:bg-white/7.5 hover:text-white/88 hover:[--toast-gradient-border-from:oklch(1_0_0/0.24)] hover:[--toast-gradient-border-via:oklch(1_0_0/0.08)] active:scale-[0.985]",
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

export type ToastIntent = "info" | "success" | "warning" | "error";
export type ToastData = {
  intent?: ToastIntent;
  hasClose?: boolean;
  hasIcon?: boolean;
  hasProgress?: boolean;
  contentClassName?: string;
};
export type ToastObject<Data extends object = object> = BaseToast.Root.ToastObject<Data>;

type ToastCommandOptions<Data extends object = ToastData> = Omit<
  Partial<ToastObject<Data>>,
  "actionProps" | "data" | "title" | "type"
> & {
  action?: {
    label: ReactNode;
    onClick?: ComponentPropsWithRef<"button">["onClick"];
  };
  contentClassName?: string;
  dismissible?: boolean;
  icon?: boolean;
  progress?: boolean;
};

const defaultToastManager = createToastManager<ToastData>();

function addDefaultToast(
  intent: ToastIntent,
  title: string,
  options: ToastCommandOptions<ToastData> = {},
) {
  const { action, contentClassName, dismissible, icon, priority, progress, ...toastOptions } =
    options;

  return defaultToastManager.add({
    ...toastOptions,
    actionProps: action
      ? {
          children: action.label,
          onClick: action.onClick,
        }
      : undefined,
    title,
    type: intent,
    priority: priority ?? (intent === "error" ? "high" : undefined),
    data: {
      intent,
      contentClassName,
      hasClose: dismissible,
      hasIcon: icon,
      hasProgress: progress,
    },
  });
}

export const toast = {
  add(options: ToastCommandOptions<ToastData> & { title: string; type?: ToastIntent }) {
    const { title, type = "info", ...toastOptions } = options;

    return addDefaultToast(type, title, toastOptions);
  },
  info(title: string, options?: ToastCommandOptions<ToastData>) {
    return addDefaultToast("info", title, options);
  },
  success(title: string, options?: ToastCommandOptions<ToastData>) {
    return addDefaultToast("success", title, options);
  },
  warning(title: string, options?: ToastCommandOptions<ToastData>) {
    return addDefaultToast("warning", title, options);
  },
  error(title: string, options?: ToastCommandOptions<ToastData>) {
    return addDefaultToast("error", title, options);
  },
  dismiss(id?: string) {
    return defaultToastManager.close(id);
  },
};

export type ToastProviderProps = BaseToast.Provider.Props & {
  portalContainer?: BaseToast.Portal.Props["container"];
  renderViewport?: boolean;
  viewportClassName?: string;
  viewportPlacement?: ToastViewportProps["placement"];
  viewportStrategy?: ToastViewportProps["strategy"];
};

function getToastTone(type: string | undefined) {
  if (type === "success" || type === "warning" || type === "error") {
    return type;
  }

  return "info";
}

export function ToastProvider({
  children,
  portalContainer,
  renderViewport = true,
  toastManager = defaultToastManager,
  timeout = DEFAULT_TOAST_TIMEOUT_MS,
  viewportClassName,
  viewportPlacement = "bottom-center",
  viewportStrategy = "fixed",
  ...props
}: ToastProviderProps) {
  return (
    <ToastProviderConfigContext.Provider value={{ timeout }}>
      <BaseToast.Provider toastManager={toastManager} timeout={timeout} {...props}>
        {children}
        {renderViewport ? (
          <DefaultToastLayer
            placement={viewportPlacement}
            portalContainer={portalContainer}
            strategy={viewportStrategy}
            viewportClassName={viewportClassName}
          />
        ) : null}
      </BaseToast.Provider>
    </ToastProviderConfigContext.Provider>
  );
}

export type ToastPortalProps = BaseToast.Portal.Props;

export function ToastPortal(props: ToastPortalProps) {
  return <BaseToast.Portal data-slot="toast-portal" {...useThemeScopeProps(props)} />;
}

export type ToastViewportProps = StyledProps<BaseToast.Viewport.Props> &
  Pick<VariantProps<typeof toastStyles>, "placement" | "strategy">;

export function ToastViewport({
  placement = "bottom-center",
  strategy = "fixed",
  className,
  ...props
}: ToastViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = toastStyles({ theme, placement, strategy });

  return (
    <BaseToast.Viewport
      data-slot="toast-viewport"
      data-toast-placement={placement}
      className={viewport({ className })}
      {...props}
    />
  );
}

export type ToastPositionerProps = StyledProps<BaseToast.Positioner.Props>;

export function ToastPositioner({ className, ...props }: ToastPositionerProps) {
  const theme = useThemeFamily();
  const { positioner } = toastStyles({ theme });

  return (
    <BaseToast.Positioner
      data-slot="toast-positioner"
      className={positioner({ className })}
      {...props}
    />
  );
}

export type ToastRootProps = StyledProps<BaseToast.Root.Props> &
  Pick<VariantProps<typeof toastStyles>, "layout">;

export function ToastRoot({
  layout = "stacked",
  className,
  toast: toastObject,
  ...props
}: ToastRootProps) {
  const theme = useThemeFamily();
  const tone = getToastTone(toastObject.type);
  const { root } = toastStyles({ theme, layout, tone });

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

export function ToastContent({ children, className, ...props }: ToastContentProps) {
  const theme = useThemeFamily();
  const { content } = toastStyles({ theme });

  return (
    <BaseToast.Content data-slot="toast-content" className={content({ className })} {...props}>
      {children}
    </BaseToast.Content>
  );
}

export type ToastIconProps = ComponentPropsWithRef<"div">;

export function ToastIcon({ className, ...props }: ToastIconProps) {
  const theme = useThemeFamily();
  const { icon } = toastStyles({ theme });

  return <div data-slot="toast-icon" className={icon({ className })} {...props} />;
}

export type ToastBodyProps = ComponentPropsWithRef<"div">;

export function ToastBody({ className, ...props }: ToastBodyProps) {
  const theme = useThemeFamily();
  const { body } = toastStyles({ theme });

  return <div data-slot="toast-body" className={body({ className })} {...props} />;
}

export type ToastActionsProps = ComponentPropsWithRef<"div">;

export function ToastActions({ className, ...props }: ToastActionsProps) {
  const theme = useThemeFamily();
  const { actions } = toastStyles({ theme });

  return <div data-slot="toast-actions" className={actions({ className })} {...props} />;
}

export type ToastProgressProps = ComponentPropsWithRef<"div"> & {
  duration?: number;
};

export function ToastProgress({
  className,
  duration = DEFAULT_TOAST_TIMEOUT_MS,
  style,
  ...props
}: ToastProgressProps) {
  const theme = useThemeFamily();
  const { progress } = toastStyles({ theme });
  const progressStyle = {
    ...style,
    "--toast-progress-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      aria-hidden
      data-slot="toast-progress"
      className={progress({ className })}
      style={progressStyle}
      {...props}
    >
      {toastProgressStyle}
    </div>
  );
}

export type ToastTitleProps = StyledProps<BaseToast.Title.Props>;

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  const theme = useThemeFamily();
  const { title } = toastStyles({ theme });

  return <BaseToast.Title data-slot="toast-title" className={title({ className })} {...props} />;
}

export type ToastDescriptionProps = StyledProps<BaseToast.Description.Props>;

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = toastStyles({ theme });

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
          <Spinner aria-label={loadingLabel} variant={theme === "brutal" ? "inverse" : "default"} />
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
  const { close } = toastStyles({ theme });
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
  const { arrow } = toastStyles({ theme });

  if (theme === "elegant") {
    return null;
  }

  return (
    <BaseToast.Arrow data-slot="toast-arrow" className={arrow({ className })} {...props}>
      <ToastArrowSvg theme={theme} />
    </BaseToast.Arrow>
  );
}

function DefaultToastLayer({
  placement,
  portalContainer,
  strategy,
  viewportClassName,
}: {
  placement: ToastPlacement;
  portalContainer?: BaseToast.Portal.Props["container"];
  strategy: ToastViewportProps["strategy"];
  viewportClassName?: string;
}) {
  return (
    <ToastPortal container={portalContainer}>
      <ToastViewport placement={placement} strategy={strategy} className={viewportClassName}>
        <DefaultToastList placement={placement} />
      </ToastViewport>
    </ToastPortal>
  );
}

function DefaultToastList({ placement }: { placement: ToastPlacement }) {
  const { toasts } = useToastManager<ToastData>();

  return toasts.map((toastObject) => (
    <DefaultToastItem key={toastObject.id} placement={placement} toast={toastObject} />
  ));
}

function DefaultToastItem({
  placement,
  toast: toastObject,
}: {
  placement: ToastPlacement;
  toast: ToastObject<ToastData>;
}) {
  const { timeout } = useContext(ToastProviderConfigContext);
  const showDescription = Boolean(toastObject.description);
  const showAction = Boolean(toastObject.actionProps?.children);
  const showClose = toastObject.data?.hasClose !== false;
  const showIcon = toastObject.data?.hasIcon !== false;
  const progressDuration = toastObject.timeout ?? timeout;
  const showProgress =
    toastObject.data?.hasProgress === true &&
    toastObject.type !== "loading" &&
    progressDuration > 0;

  return (
    <ToastRoot
      toast={toastObject}
      swipeDirection={placement.startsWith("top-") ? ["up", "right"] : undefined}
    >
      <ToastContent className={toastObject.data?.contentClassName}>
        {showIcon ? <DefaultToastIcon toast={toastObject} /> : null}
        <ToastBody>
          <ToastTitle />
          {showDescription ? <ToastDescription /> : null}
        </ToastBody>
        {showAction || showClose ? (
          <ToastActions>
            {showClose ? <ToastClose /> : null}
            {showAction ? <ToastAction /> : null}
          </ToastActions>
        ) : null}
        {showProgress ? <ToastProgress duration={progressDuration} /> : null}
      </ToastContent>
    </ToastRoot>
  );
}

function DefaultToastIcon({ toast: toastObject }: { toast: ToastObject<ToastData> }) {
  const intent = toastObject.data?.intent ?? getToastTone(toastObject.type);
  const Icon =
    intent === "success"
      ? CheckCircle2
      : intent === "warning" || intent === "error"
        ? AlertTriangle
        : Info;

  return (
    <ToastIcon>
      <Icon aria-hidden />
    </ToastIcon>
  );
}

function ToastArrowSvg({
  theme,
  ...props
}: ComponentProps<"svg"> & { theme: ReturnType<typeof useThemeFamily> }) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" {...props}>
      <path
        d="M1 0H11L6 5.25Z"
        className={theme === "elegant" ? "fill-layer-hud/50" : "fill-primary"}
      />
      {theme === "elegant" ? null : (
        <path
          d="M1 0.5L6 5.25L11 0.5"
          className="stroke-line-strong"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
