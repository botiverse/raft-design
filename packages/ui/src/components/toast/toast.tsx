import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type {
  ComponentProps,
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Spinner } from "../spinner/index";
import { cn } from "../../lib/cn";

const toastStyles = tv({
  slots: {
    viewport: ["pointer-events-none isolate z-70 w-[min(24rem,calc(100vw-2rem))]", "outline-none"],
    positioner: ["isolate z-[calc(70-var(--toast-index))] outline-none"],
    root: [
      "group/toast pointer-events-auto",
      "select-text",
      "outline-1 outline-offset-2 outline-transparent",
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
      "rounded-container bg-layer-hud text-foreground-on-hud",
      "shadow-float",
      "focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-foreground",
    ],
    content: [
      "relative grid grid-cols-[minmax(0,1fr)] items-center overflow-hidden",
      // The content layout keys off `data-has-*` attributes that
      // DefaultToastItem writes at render time, instead of `:has()`: an
      // ancestor `:has()` that styles descendants makes Chromium recalculate
      // the whole page on unrelated mutations (measured: ~55ms per text-node
      // change in a 300-message channel, #386). Manual compositions must set
      // the same attributes to keep the layout (see ToastContent).
      "[&[data-has-description]_[data-slot=toast-body]]:self-start [&[data-has-description]_[data-slot=toast-icon]]:self-start",
      "[&:not([data-has-icon]):not([data-has-actions]):not([data-has-description])]:min-h-(--toast-title-only-min-h,2.25rem)",
      "[&:not([data-has-icon]):not([data-has-actions]):not([data-has-description])]:min-w-(--toast-title-only-min-w,7rem)",
      "[&:not([data-has-icon]):not([data-has-actions]):not([data-has-description])]:px-(--toast-title-only-px,0.75rem)",
      "[&:not([data-has-icon]):not([data-has-actions]):not([data-has-description])]:py-(--toast-title-only-py,0.5rem)",
      "[&:not([data-has-description])>[data-slot=toast-body]:only-child]:justify-self-center [&:not([data-has-description])>[data-slot=toast-body]:only-child]:text-center",
      "transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "motion-reduce:transition-none",
      "gap-x-3 gap-y-2 px-4 py-3 font-sans text-callout",
      "[--toast-title-only-min-h:2.75rem] [--toast-title-only-px:1rem] [--toast-title-only-py:0.75rem]",
      "data-has-icon:grid-cols-[auto_minmax(0,1fr)]",
      "data-has-actions:grid-cols-[minmax(0,1fr)_auto]",
      "[&[data-has-icon][data-has-actions]]:grid-cols-[auto_minmax(0,1fr)_auto]",
    ],
    icon: [
      "flex h-lh w-5 shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "[&_svg]:size-4",
    ],
    body: ["min-w-0"],
    title: ["m-0 truncate text-callout", "font-normal text-foreground-on-hud"],
    description: ["m-0 text-callout", "text-foreground-on-hud/70"],
    actions: ["flex items-center justify-end", "gap-4"],
    progress: [
      "pointer-events-none absolute h-[3px] origin-left",
      "animate-[raft-toast-timeout-progress_var(--toast-progress-duration)_linear_forwards]",
      "group-hover/toast:[animation-play-state:paused] group-focus-within/toast:[animation-play-state:paused]",
      "motion-reduce:animate-none motion-reduce:scale-x-100",
      "inset-x-4 bottom-1.5 rounded-[2px] bg-foreground-on-hud/40",
    ],
    close: [
      "inline-flex items-center justify-center",
      "outline-1 outline-offset-2 outline-transparent",
      "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
      "disabled:pointer-events-none disabled:opacity-40",
      "relative inset-auto order-1 size-auto shrink-0 whitespace-nowrap",
      "border-0 bg-transparent p-0 shadow-none",
      "font-sans text-callout font-bold text-foreground-on-hud",
      "decoration-[1.5px] underline-offset-[3px] not-disabled:hover:underline",
      "after:absolute after:-inset-x-2 after:-inset-y-3 after:rounded-control after:content-['']",
      "active:after:bg-foreground-on-hud/15",
      "focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-foreground-on-hud",
      "[&_svg]:size-4",
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
    placement: {
      "bottom-center": {
        viewport: [
          "bottom-[calc(max(var(--toast-viewport-bottom,0px),env(safe-area-inset-bottom))+1rem)]",
          "left-1/2 -translate-x-1/2",
        ],
      },
      "bottom-right": {
        viewport: [
          "bottom-[calc(max(var(--toast-viewport-bottom,0px),env(safe-area-inset-bottom))+1rem)]",
          "right-4",
        ],
      },
      "top-center": {
        viewport: [
          "top-[calc(max(var(--toast-viewport-top,0px),env(safe-area-inset-top))+1rem)]",
          "left-1/2 -translate-x-1/2",
        ],
      },
      "top-right": {
        viewport: [
          "top-[calc(max(var(--toast-viewport-top,0px),env(safe-area-inset-top))+1rem)]",
          "right-4",
        ],
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
          "absolute inset-x-0 bottom-0 mx-auto h-(--toast-stack-height) origin-bottom",
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
          "w-max max-w-full",
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
  },
  defaultVariants: {
    placement: "bottom-center",
    layout: "stacked",
    strategy: "fixed",
  },
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
const DEFAULT_TOAST_ACTION_TIMEOUT_MS = 8000;
const ToastProviderConfigContext = createContext({ timeout: DEFAULT_TOAST_TIMEOUT_MS });
const ToastPlacementContext = createContext<ToastPlacement | undefined>(undefined);

// A toast swipes away the way it came: up from the top, down or right from
// the bottom.
const SWIPE_DIRECTION_BY_EDGE = {
  top: ["up"],
  bottom: ["down", "right"],
} as const satisfies Record<string, BaseToast.Root.Props["swipeDirection"]>;

function getSwipeDirection(placement: ToastPlacement | undefined) {
  if (placement?.startsWith("top-")) return [...SWIPE_DIRECTION_BY_EDGE.top];
  if (placement?.startsWith("bottom-")) return [...SWIPE_DIRECTION_BY_EDGE.bottom];
  return undefined;
}

function resolveActionTimeout(timeout: number, actionTimeout: number | undefined) {
  if (actionTimeout !== undefined) return actionTimeout;
  return timeout > 0 ? Math.max(timeout, DEFAULT_TOAST_ACTION_TIMEOUT_MS) : 0;
}

// The `toast` command API is bound to the default manager, so it takes its
// timing from the ToastProvider that mounts that manager.
const defaultManagerTiming = {
  actionTimeout: DEFAULT_TOAST_ACTION_TIMEOUT_MS,
};

// A toast's action is a text action on the HUD: bold type that underlines on
// hover (design/foundations/states.md#clickable-text), a pressed veil on a hit
// area larger than the word, the HUD ink as its focus outline. It carries its
// own content and loading slots (a button's would bring a button's fill and
// focus ring onto the dark toast).
const toastAction = tv({
  slots: {
    root: [
      "relative order-2 inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none",
      "border-0 bg-transparent p-0",
      "font-sans text-callout font-bold text-foreground-on-hud",
      "decoration-[1.5px] underline-offset-[3px] not-disabled:not-aria-disabled:hover:underline",
      "after:absolute after:-inset-x-2 after:-inset-y-3 after:rounded-control after:content-['']",
      "active:after:bg-foreground-on-hud/15",
      "outline-1 outline-offset-2 outline-transparent focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-foreground-on-hud",
      "disabled:pointer-events-none disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
      "data-[loading=true]:cursor-wait data-[loading=true]:opacity-100",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 **:data-icon:size-[1em] [&_svg:not([class*='size-'])]:size-3",
    ],
    content:
      "relative z-10 inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
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
  leading?: ReactNode;
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
  /**
   * Show `ToastClose` (Dismiss). Defaults to `false`: every toast closes by
   * itself, swipes away and closes with Esc.
   */
  dismissible?: boolean;
  /** Show the intent's icon in `ToastIcon`. Defaults to `true`. */
  icon?: boolean;
  /**
   * Replaces the intent's icon in `ToastIcon` with this node, such as an xs
   * `Avatar` for the person or agent the toast is about. Rendered
   * hidden from assistive technology: the title must already carry the name.
   * Shown even when `icon` is `false`.
   */
  leading?: ReactNode;
  progress?: boolean;
};

const defaultToastManager = createToastManager<ToastData>();

function addDefaultToast(
  intent: ToastIntent,
  title: string,
  options: ToastCommandOptions<ToastData> = {},
) {
  const {
    action,
    contentClassName,
    dismissible,
    icon,
    leading,
    priority,
    progress,
    timeout,
    ...toastOptions
  } = options;
  const needsTimeToAct = Boolean(action) || intent === "error";

  return defaultToastManager.add({
    ...toastOptions,
    timeout: timeout ?? (needsTimeToAct ? defaultManagerTiming.actionTimeout : undefined),
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
      leading,
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
  /**
   * How long a toast from the `toast` command API stays when it has an action
   * or is an `error`, in ms. Defaults to 8000, or to `timeout` when that is
   * longer, and to 0 when `timeout` is 0.
   */
  actionTimeout?: number;
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
  actionTimeout,
  children,
  limit = 1,
  portalContainer,
  renderViewport = true,
  toastManager = defaultToastManager,
  timeout = DEFAULT_TOAST_TIMEOUT_MS,
  viewportClassName,
  viewportPlacement = "bottom-center",
  viewportStrategy = "fixed",
  ...props
}: ToastProviderProps) {
  const config = useMemo(() => ({ timeout }), [timeout]);
  const resolvedActionTimeout = resolveActionTimeout(timeout, actionTimeout);

  useLayoutEffect(() => {
    if (toastManager !== defaultToastManager) return;
    defaultManagerTiming.actionTimeout = resolvedActionTimeout;
    return () => {
      defaultManagerTiming.actionTimeout = DEFAULT_TOAST_ACTION_TIMEOUT_MS;
    };
  }, [resolvedActionTimeout, toastManager]);

  return (
    <ToastProviderConfigContext.Provider value={config}>
      <BaseToast.Provider toastManager={toastManager} timeout={timeout} limit={limit} {...props}>
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
  const { viewport } = toastStyles({ placement, strategy });

  return (
    <ToastPlacementContext.Provider value={placement}>
      <BaseToast.Viewport
        data-slot="toast-viewport"
        data-toast-placement={placement}
        className={viewport({ className })}
        {...props}
      />
    </ToastPlacementContext.Provider>
  );
}

export type ToastPositionerProps = StyledProps<BaseToast.Positioner.Props>;

export function ToastPositioner({ className, ...props }: ToastPositionerProps) {
  const { positioner } = toastStyles();

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

/**
 * A toast pushed past the provider's `limit` by a newer one is closed, not
 * held back: toasts replace each other and never queue, so an older toast
 * can't come back when the newer one goes. Its swipe direction follows the
 * viewport's edge unless `swipeDirection` is passed.
 */
export function ToastRoot({
  layout = "stacked",
  className,
  swipeDirection,
  toast: toastObject,
  ...props
}: ToastRootProps) {
  const { root } = toastStyles({ layout });
  const placement = useContext(ToastPlacementContext);
  const { close } = useToastManager();
  const replaced = toastObject.limited === true && toastObject.transitionStatus !== "ending";

  useLayoutEffect(() => {
    if (replaced) close(toastObject.id);
  }, [close, replaced, toastObject.id]);

  return (
    <BaseToast.Root
      data-slot="toast"
      data-toast-type={toastObject.type ?? "info"}
      swipeDirection={swipeDirection ?? getSwipeDirection(placement)}
      toast={toastObject}
      className={root({ className })}
      {...props}
    />
  );
}

export type ToastContentProps = StyledProps<BaseToast.Content.Props> & {
  ref?: Ref<HTMLDivElement>;
};

/**
 * The content layout (self-start, title-only sizing, body centering) needs to
 * know which parts actually rendered. That used to be an ancestor `:has()`
 * styling descendants — a whole-page recalculation trap in Chromium (#386).
 * It measures the rendered DOM after layout instead, so wrapped parts and
 * parts that render nothing behave exactly like the old selectors did.
 *
 * The three attributes are not React-managed props: the layout effect toggles
 * them on this element directly (an attribute write on the component's own
 * node, not a structural change, so it stays outside the #386 invalidation
 * pattern). The measurement re-runs whenever this component renders; the
 * default item rebuilds the content on every toast update, and a hand-written
 * composition that flips a part without re-rendering ToastContent is not
 * observed.
 */
export function ToastContent({ children, className, ref, ...props }: ToastContentProps) {
  const { content } = toastStyles();
  const internalRef = useRef<HTMLDivElement>(null);

  // Merge the caller's ref with ours; the measurement needs the node, and a
  // caller ref must not displace it.
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useLayoutEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const slots: Array<[attribute: string, selector: string]> = [
      ["data-has-icon", '[data-slot="toast-icon"]'],
      ["data-has-description", '[data-slot="toast-description"]'],
      ["data-has-actions", '[data-slot="toast-actions"]'],
    ];
    for (const [attribute, selector] of slots) {
      const present = el.querySelector(selector) !== null;
      if (present !== el.hasAttribute(attribute)) {
        el.toggleAttribute(attribute, present);
      }
    }
  });

  return (
    <BaseToast.Content
      ref={setRef}
      data-slot="toast-content"
      className={content({ className })}
      {...props}
    >
      {children}
    </BaseToast.Content>
  );
}

export type ToastIconProps = ComponentPropsWithRef<"div">;

export function ToastIcon({ className, ...props }: ToastIconProps) {
  const { icon } = toastStyles();

  return <div data-slot="toast-icon" className={icon({ className })} {...props} />;
}

export type ToastBodyProps = ComponentPropsWithRef<"div">;

export function ToastBody({ className, ...props }: ToastBodyProps) {
  const { body } = toastStyles();

  return <div data-slot="toast-body" className={body({ className })} {...props} />;
}

export type ToastActionsProps = ComponentPropsWithRef<"div">;

export function ToastActions({ className, ...props }: ToastActionsProps) {
  const { actions } = toastStyles();

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
  const { progress } = toastStyles();
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
  const { title } = toastStyles();

  return <BaseToast.Title data-slot="toast-title" className={title({ className })} {...props} />;
}

export type ToastDescriptionProps = StyledProps<BaseToast.Description.Props>;

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  const { description } = toastStyles();

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
  const { root, content, loadingIndicator } = toastAction();

  const renderAction = useCallback(
    (renderProps: ToastActionRenderProps, state: ToastActionRenderState) => {
      const actionChildren = (
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
            {renderProps.children}
          </span>
        </>
      );
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
    },
    [content, loading, loadingIndicator, loadingLabel, render],
  );

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
  const { close } = toastStyles();
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
  const { arrow } = toastStyles();

  return (
    <BaseToast.Arrow data-slot="toast-arrow" className={arrow({ className })} {...props}>
      <ToastArrowSvg />
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
        <DefaultToastList />
      </ToastViewport>
    </ToastPortal>
  );
}

function DefaultToastList() {
  const { toasts } = useToastManager<ToastData>();

  return toasts.map((toastObject) => <DefaultToastItem key={toastObject.id} toast={toastObject} />);
}

function DefaultToastItem({ toast: toastObject }: { toast: ToastObject<ToastData> }) {
  const { timeout } = useContext(ToastProviderConfigContext);
  const showDescription = Boolean(toastObject.description);
  const showAction = Boolean(toastObject.actionProps?.children);
  const showClose = toastObject.data?.hasClose === true;
  const showIcon = hasLeading(toastObject) || toastObject.data?.hasIcon !== false;
  const progressDuration = toastObject.timeout ?? timeout;
  const showProgress =
    toastObject.data?.hasProgress === true &&
    toastObject.type !== "loading" &&
    progressDuration > 0;

  return (
    <ToastRoot toast={toastObject}>
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

const TOAST_ICON = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: TriangleAlert,
} as const satisfies Record<ToastIntent, LucideIcon>;

function hasLeading(toastObject: ToastObject<ToastData>) {
  const leading = toastObject.data?.leading;
  return leading !== undefined && leading !== null && leading !== false;
}

function DefaultToastIcon({ toast: toastObject }: { toast: ToastObject<ToastData> }) {
  if (hasLeading(toastObject)) {
    return <ToastIcon aria-hidden>{toastObject.data?.leading}</ToastIcon>;
  }

  const intent = toastObject.data?.intent ?? getToastTone(toastObject.type);
  const Icon = TOAST_ICON[intent];

  return (
    <ToastIcon>
      <Icon aria-hidden />
    </ToastIcon>
  );
}

function ToastArrowSvg(props: ComponentProps<"svg">) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" {...props}>
      <path d="M1 0H11L6 5.25Z" className="fill-layer-hud" />
    </svg>
  );
}
