import { useEffect, useRef, useState } from "react";
import { Check, Copy, Info, SendHorizontal, TriangleAlert } from "lucide-react";
import {
  Button,
  createToastManager,
  ToastAction,
  ToastActions,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastArrow,
  ToastIcon,
  ToastPortal,
  ToastPositioner,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
  useThemeFamily,
  type ToastObject,
} from "raft-ui";

type ToastDemoData = {
  icon?: "check" | "info" | "send" | "alert" | "copy";
  hasIcon?: boolean;
  hasClose?: boolean;
  contentClassName?: string;
};

export type ToastDemoOptions = {
  mode: "stacked" | "anchored";
  placement: "bottom-center" | "bottom-right" | "top-center" | "top-right";
  side: "top" | "right" | "bottom" | "left";
  align: "start" | "center" | "end";
  icon: boolean;
  description: boolean;
  action: boolean;
  dismissible: boolean;
};

const DEFAULT_TOAST_DEMO_OPTIONS: ToastDemoOptions = {
  mode: "stacked",
  placement: "bottom-center",
  side: "bottom",
  align: "center",
  icon: true,
  description: true,
  action: true,
  dismissible: true,
};

const ICONS = {
  check: Check,
  info: Info,
  send: SendHorizontal,
  alert: TriangleAlert,
  copy: Copy,
} as const;

export function ToastComposition({
  seed = "copy",
  controls = false,
  demoOptions = DEFAULT_TOAST_DEMO_OPTIONS,
  className,
}: {
  seed?: "copy" | "forward" | "clipboard-error";
  controls?: boolean;
  demoOptions?: ToastDemoOptions;
  className?: string;
}) {
  const theme = useThemeFamily();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [toastManager] = useState(() => createToastManager<ToastDemoData>());

  return (
    <div
      ref={setPortalContainer}
      className={["relative h-44 w-full overflow-hidden", className].filter(Boolean).join(" ")}
    >
      <ToastPreviewScene />
      <ToastProvider
        key={theme}
        toastManager={toastManager}
        timeout={controls ? 3600 : 0}
        limit={3}
        renderViewport={false}
      >
        {controls ? <ToastDemoControls options={demoOptions} /> : <SeedToast seed={seed} />}
        {controls || portalContainer ? (
          <ToastPortal container={controls ? undefined : portalContainer}>
            <ToastViewport
              strategy={controls ? "fixed" : "absolute"}
              placement={demoOptions.mode === "anchored" ? "none" : demoOptions.placement}
            >
              <ToastList
                placement={demoOptions.mode === "anchored" ? "none" : demoOptions.placement}
              />
            </ToastViewport>
          </ToastPortal>
        ) : null}
      </ToastProvider>
    </div>
  );
}

export function ToastPreviewScene() {
  const theme = useThemeFamily();

  if (theme === "brutal") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[oklch(0.955_0.003_286)] dark:bg-[oklch(0.115_0.004_286)]"
    >
      <div className="absolute inset-x-8 top-7 h-10 rounded-lg bg-white/68 shadow-[0_1px_0_oklch(1_0_0_/_0.75)_inset,0_0_0_1px_oklch(0_0_0_/_0.025)] dark:bg-white/[0.07]" />
      <div className="absolute left-10 top-10 h-2 w-28 rounded-full bg-foreground/[0.11] dark:bg-white/[0.18]" />
      <div className="absolute right-10 top-10 h-2 w-16 rounded-full bg-foreground/[0.08] dark:bg-white/[0.12]" />
      <div className="absolute inset-x-8 top-24 grid grid-cols-3 gap-3">
        <div className="h-12 rounded-md bg-white/58 shadow-[0_0_0_1px_oklch(0_0_0_/_0.02)] dark:bg-white/[0.055]" />
        <div className="h-12 rounded-md bg-white/45 shadow-[0_0_0_1px_oklch(0_0_0_/_0.018)] dark:bg-white/[0.045]" />
        <div className="h-12 rounded-md bg-white/58 shadow-[0_0_0_1px_oklch(0_0_0_/_0.02)] dark:bg-white/[0.055]" />
      </div>
    </div>
  );
}

function SeedToast({ seed }: { seed: "copy" | "forward" | "clipboard-error" }) {
  const seededRef = useRef(false);
  const toastManager = useToastManager<ToastDemoData>();

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    if (seed === "copy") {
      toastManager.add({
        id: "copy-links",
        type: "info",
        title: "3 links copied.",
        data: { hasIcon: false, hasClose: false },
      });
      return;
    }

    if (seed === "forward") {
      toastManager.add({
        id: "forwarded",
        type: "info",
        title: "Forwarded to #design-system.",
        description: "The selected messages were sent.",
        data: { icon: "send" },
        actionProps: {
          children: "View",
          onClick: () => toastManager.close("forwarded"),
        },
      });
      return;
    }

    toastManager.add({
      id: "blocked",
      type: "error",
      title: "Clipboard write blocked.",
      description: "Grant clipboard access or copy the links manually.",
      priority: "high",
      data: { icon: "alert" },
      actionProps: {
        children: "Retry",
        onClick: () => toastManager.close("blocked"),
      },
    });
  }, [seed, toastManager]);

  return null;
}

function ToastDemoControls({ options }: { options: ToastDemoOptions }) {
  const toastManager = useToastManager<ToastDemoData>();
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);
  const forwardButtonRef = useRef<HTMLButtonElement | null>(null);
  const errorButtonRef = useRef<HTMLButtonElement | null>(null);

  const getPositionerProps = (anchor: HTMLButtonElement | null) =>
    options.mode === "anchored" && anchor
      ? {
          anchor,
          side: options.side,
          align: options.align,
          sideOffset: 8,
        }
      : undefined;

  return (
    <div className="absolute inset-0 z-10 flex flex-wrap items-center justify-center gap-2 px-4">
      <Button
        ref={copyButtonRef}
        type="button"
        size="sm"
        variant="primary"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Link copied.",
            description: options.description ? "The message link is ready to paste." : undefined,
            positionerProps: getPositionerProps(copyButtonRef.current),
            data: {
              icon: "copy",
              hasIcon: options.icon,
              hasClose: options.dismissible,
            },
            actionProps: options.action
              ? {
                  children: "Copy again",
                  onClick: () => toastManager.close(),
                }
              : undefined,
          })
        }
      >
        Copy link
      </Button>
      <Button
        ref={forwardButtonRef}
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Forwarded to #design-system.",
            description: options.description ? "The selected messages were sent." : undefined,
            positionerProps: getPositionerProps(forwardButtonRef.current),
            data: {
              icon: "send",
              hasIcon: options.icon,
              hasClose: options.dismissible,
            },
            actionProps: options.action
              ? {
                  children: "View",
                  onClick: () => toastManager.close(),
                }
              : undefined,
          })
        }
      >
        Forward
      </Button>
      <Button
        ref={errorButtonRef}
        type="button"
        size="sm"
        variant="danger-outline"
        onClick={() =>
          toastManager.add({
            type: "error",
            title: "Clipboard write blocked.",
            description: options.description
              ? "Grant clipboard access or copy the links manually."
              : undefined,
            positionerProps: getPositionerProps(errorButtonRef.current),
            priority: "high",
            data: {
              icon: "alert",
              hasIcon: options.icon,
              hasClose: options.dismissible,
            },
            actionProps: options.action
              ? {
                  children: "Retry",
                  onClick: () => toastManager.close(),
                }
              : undefined,
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

function ToastList({ placement }: { placement: ToastDemoOptions["placement"] | "none" }) {
  const { toasts } = useToastManager<ToastDemoData>();

  return toasts.map((toast) =>
    toast.positionerProps ? (
      <ToastPositioner key={toast.id} toast={toast}>
        <DemoToast toast={toast} layout="inline" placement={placement} showArrow />
      </ToastPositioner>
    ) : (
      <DemoToast key={toast.id} toast={toast} placement={placement} />
    ),
  );
}

function DemoToast({
  toast,
  layout,
  placement,
  showArrow = false,
}: {
  toast: ToastObject<ToastDemoData>;
  layout?: "stacked" | "inline";
  placement: ToastDemoOptions["placement"] | "none";
  showArrow?: boolean;
}) {
  const theme = useThemeFamily();
  const showDescription = Boolean(toast.description);
  const showAction = Boolean(toast.actionProps?.children);
  const showIcon = toast.data?.hasIcon !== false;
  const showClose = toast.data?.hasClose !== false;

  if (theme === "brutal") {
    return (
      <ToastRoot
        toast={toast}
        layout={layout}
        swipeDirection={placement.startsWith("top-") ? ["up", "right"] : undefined}
      >
        {showArrow ? <ToastArrow /> : null}
        <ToastContent>
          {showIcon ? (
            <ToastIcon>
              <ToastIconGlyph toast={toast} />
            </ToastIcon>
          ) : null}
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
        </ToastContent>
      </ToastRoot>
    );
  }

  return (
    <ToastRoot
      toast={toast}
      layout={layout}
      swipeDirection={placement.startsWith("top-") ? ["up", "right"] : undefined}
    >
      {showArrow ? <ToastArrow /> : null}
      <ToastContent>
        {showIcon ? (
          <ToastIcon>
            <ToastIconGlyph toast={toast} />
          </ToastIcon>
        ) : null}
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
      </ToastContent>
    </ToastRoot>
  );
}

function ToastIconGlyph({ toast }: { toast: ToastObject<ToastDemoData> }) {
  const Icon = ICONS[toast.data?.icon ?? iconForType(toast.type)];
  return <Icon aria-hidden />;
}

function iconForType(type: string | undefined): keyof typeof ICONS {
  if (type === "success") return "check";
  if (type === "error") return "alert";
  if (type === "warning") return "alert";
  return "info";
}
