import { useCallback, useState } from "react";
import { Button, createToastManager, ToastProvider } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { useEffect } from "react";
// @docs-source-strip-end

/**
 * Toasts show at the bottom center, just above the composer: the app tells
 * the viewport where the composer's top edge is with `--toast-viewport-bottom`.
 * One shows at a time, so Unfollow replaces Save's toast instead of stacking
 * on it, and neither has a Dismiss: each closes by itself, and swipes down on
 * a phone.
 */
export function AboveComposerContent({ portalContainer }: { portalContainer: HTMLElement | null }) {
  const [toastManager] = useState(() => createToastManager());

  const save = useCallback(() => {
    toastManager.add({ id: "saved", type: "success", title: "Channel settings saved." });
  }, [toastManager]);

  const unfollow = useCallback(() => {
    toastManager.add({
      id: "unfollowed",
      type: "info",
      title: "Wug no longer follows this thread.",
      timeout: 8000,
      actionProps: { children: "Undo", onClick: () => toastManager.close("unfollowed") },
    });
  }, [toastManager]);

  // @docs-source-strip-start
  useEffect(() => {
    toastManager.add({
      id: "unfollowed",
      type: "info",
      title: "Wug no longer follows this thread.",
      timeout: 0,
      actionProps: { children: "Undo", onClick: () => toastManager.close("unfollowed") },
    });
    return () => toastManager.close();
  }, [toastManager]);
  // @docs-source-strip-end

  return (
    <ToastProvider
      toastManager={toastManager}
      portalContainer={portalContainer}
      viewportStrategy="absolute"
      viewportClassName="[--toast-viewport-bottom:4.5rem]"
    >
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={save}>
          Save Settings
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={unfollow}>
          Unfollow
        </Button>
      </div>
    </ToastProvider>
  );
}

// @docs-source-strip-start
export function AboveComposerComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative h-64 w-full overflow-hidden bg-layer-panel">
      <div className="absolute inset-x-0 top-6 z-10 flex justify-center">
        {portalContainer ? <AboveComposerContent portalContainer={portalContainer} /> : null}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="flex h-14 items-center rounded-container border border-line-seam bg-layer-card px-4 text-callout text-foreground-muted">
          Message #design
        </div>
      </div>
    </div>
  );
}
// @docs-source-strip-end
