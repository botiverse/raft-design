import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Info, SendHorizontal, TriangleAlert } from "lucide-react";
import { Button, useThemeFamily } from "raft-ui";
import {
  ToastAction,
  ToastActions,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
  type ToastObject,
} from "raft-ui/wip";

export const TOAST_COMPOSITION_PATH =
  "apps/doc/src/compositions/toast-source-comparison.tsx" as const;

type ToastDemoData = {
  icon?: "check" | "info" | "send" | "alert" | "copy";
  hasIcon?: boolean;
  hasClose?: boolean;
};

const ICONS = {
  check: Check,
  info: Info,
  send: SendHorizontal,
  alert: TriangleAlert,
  copy: Copy,
} as const;

export function SourceSelectionToastPreview({ message = "3 links copied." }: { message?: string }) {
  return (
    <div className="relative h-36 w-full overflow-hidden bg-white">
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 border-2 border-black bg-soft-signal px-3 py-2 text-sm font-bold text-black shadow-[var(--shadow-brutal)]"
        role="status"
        data-testid="forward-toast"
      >
        {message}
      </div>
    </div>
  );
}

export function SourceImageActionErrorPreview({
  message = "Clipboard write blocked",
}: {
  message?: string;
}) {
  return (
    <div className="relative h-36 w-full overflow-hidden bg-white">
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 border-2 border-black bg-brutal-orange px-3 py-2 text-xs font-bold text-black shadow-[var(--shadow-brutal-sm)]"
        role="alert"
        data-testid="select-share-error"
      >
        Image action failed: {message} — click to dismiss.
      </div>
    </div>
  );
}

export function ImageActionErrorComposition({
  message = "Clipboard write blocked",
}: {
  message?: string;
}) {
  const theme = useThemeFamily();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative h-36 w-full overflow-hidden">
      <ToastPreviewScene />
      <ToastProvider key={theme} timeout={0} limit={1}>
        <SeedImageActionErrorToast message={message} />
        {portalContainer ? (
          <ToastPortal container={portalContainer}>
            <ToastViewport strategy="absolute" placement="bottom-center">
              <ImageActionErrorToastList />
            </ToastViewport>
          </ToastPortal>
        ) : null}
      </ToastProvider>
    </div>
  );
}

function SeedImageActionErrorToast({ message }: { message: string }) {
  const seededRef = useRef(false);
  const toastManager = useToastManager<ToastDemoData>();

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    toastManager.add({
      id: "image-action-failed",
      type: "error",
      title: "Image action failed",
      description: message,
      priority: "high",
      data: { icon: "alert", hasClose: true },
    });
  }, [message, toastManager]);

  return null;
}

function ImageActionErrorToastList() {
  const toastManager = useToastManager<ToastDemoData>();

  return toastManager.toasts.map((toast) => (
    <ToastRoot key={toast.id} toast={toast} layout="anchored">
      <ToastContent>
        <ToastIcon>
          <ToastIconGlyph toast={toast} />
        </ToastIcon>
        <ToastBody>
          <ToastTitle />
          <ToastDescription />
        </ToastBody>
        <ToastActions>
          <ToastClose />
        </ToastActions>
      </ToastContent>
    </ToastRoot>
  ));
}

export function ToastComposition({
  seed = "copy",
  controls = false,
  className,
}: {
  seed?: "copy" | "forward" | "clipboard-error";
  controls?: boolean;
  className?: string;
}) {
  const theme = useThemeFamily();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setPortalContainer}
      className={["relative h-44 w-full overflow-hidden", className].filter(Boolean).join(" ")}
    >
      <ToastPreviewScene />
      <ToastProvider key={theme} timeout={controls ? 3600 : 0} limit={3}>
        {controls ? (
          <div className="relative z-10">
            <ToastDemoControls />
          </div>
        ) : (
          <SeedToast seed={seed} />
        )}
        {portalContainer ? (
          <ToastPortal container={portalContainer}>
            <ToastViewport strategy="absolute" placement="bottom-center">
              <ToastList />
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

function ToastDemoControls() {
  const toastManager = useToastManager<ToastDemoData>();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Link copied.",
            description: "The message link is ready to paste.",
            data: { icon: "copy" },
            actionProps: {
              children: "Copy again",
              onClick: () => toastManager.close(),
            },
          })
        }
      >
        Copy link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          toastManager.add({
            type: "info",
            title: "Forwarded to #design-system.",
            description: "The selected messages were sent.",
            data: { icon: "send" },
            actionProps: {
              children: "View",
              onClick: () => toastManager.close(),
            },
          })
        }
      >
        Forward
      </Button>
      <Button
        type="button"
        size="sm"
        variant="danger-outline"
        onClick={() =>
          toastManager.add({
            type: "error",
            title: "Clipboard write blocked.",
            description: "Grant clipboard access or copy the links manually.",
            priority: "high",
            data: { icon: "alert" },
            actionProps: {
              children: "Retry",
              onClick: () => toastManager.close(),
            },
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

function ToastList() {
  const { toasts } = useToastManager<ToastDemoData>();

  return toasts.map((toast) => <DemoToast key={toast.id} toast={toast} />);
}

function DemoToast({ toast }: { toast: ToastObject<ToastDemoData> }) {
  const theme = useThemeFamily();
  const showDescription = Boolean(toast.description);
  const showAction = Boolean(toast.actionProps?.children);
  const showIcon = toast.data?.hasIcon !== false;
  const showClose = toast.data?.hasClose !== false;
  const layout =
    !showIcon && !showDescription && !showAction && !showClose ? "anchored" : "stacked";

  if (theme === "brutal") {
    return (
      <ToastRoot toast={toast} layout={layout}>
        <ToastContent>
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
    <ToastRoot toast={toast} layout={layout}>
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

export function ToastUsageExample({ children }: { children?: ReactNode }) {
  return (
    <ToastProvider timeout={3600}>
      {children ?? <ToastDemoControls />}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
