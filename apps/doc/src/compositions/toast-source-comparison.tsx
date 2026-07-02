import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, CircleAlert, Info, Send } from "lucide-react";
import { Button, useThemeFamily } from "raft-ui";
import {
  ToastAction,
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
  icon?: "check" | "info" | "send" | "alert";
};

const ICONS = {
  check: Check,
  info: Info,
  send: Send,
  alert: CircleAlert,
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

export function ToastComposition({
  seed = "copy",
  controls = false,
  className,
}: {
  seed?: "copy" | "forward" | "clipboard-error" | "image-error";
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
      <ToastProvider key={theme} timeout={controls ? 3600 : 0} limit={3}>
        {controls ? <ToastDemoControls /> : <SeedToast seed={seed} />}
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

function SeedToast({ seed }: { seed: "copy" | "forward" | "clipboard-error" | "image-error" }) {
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
        description: "3 message links are ready to paste.",
        data: { icon: "info" },
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
      id: seed === "image-error" ? "image-action-failed" : "blocked",
      type: "error",
      title:
        seed === "image-error"
          ? "Image action failed: Clipboard write blocked."
          : "Clipboard write blocked.",
      description:
        seed === "image-error"
          ? "Click to dismiss."
          : "Grant clipboard access or copy the links manually.",
      priority: "high",
      data: { icon: "alert" },
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
            data: { icon: "info" },
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

  if (theme === "brutal") {
    return (
      <ToastRoot toast={toast}>
        <ToastContent>
          <ToastTitle />
        </ToastContent>
      </ToastRoot>
    );
  }

  return (
    <ToastRoot toast={toast}>
      <ToastContent>
        <ToastIcon>
          <ToastIconGlyph toast={toast} />
        </ToastIcon>
        <ToastBody>
          <ToastTitle />
          <ToastDescription />
        </ToastBody>
        <ToastAction />
        <ToastClose />
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
