import { useCallback, useState } from "react";
import { Button, createToastManager, ToastProvider } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { useEffect } from "react";
// @docs-source-strip-end

/**
 * Toasts show at the top center, under the page's header: the app tells the
 * viewport where its header ends with `--toast-viewport-top`. One shows at a
 * time, so Unfollow replaces Save's toast instead of stacking on it, and
 * neither has a Dismiss: each closes by itself, and swipes up on a phone.
 */
export function UnderHeaderContent({ portalContainer }: { portalContainer: HTMLElement | null }) {
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
      viewportClassName="[--toast-viewport-top:3.5rem]"
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
export function UnderHeaderComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative h-64 w-full overflow-hidden bg-layer-panel">
      <div
        aria-hidden
        className="flex h-14 items-center border-b border-line-seam px-5 text-headline font-semibold text-foreground"
      >
        #design
      </div>
      <div aria-hidden className="grid gap-3 px-5 pt-20">
        <div className="h-2 w-2/3 rounded-full bg-ink-6" />
        <div className="h-2 w-1/2 rounded-full bg-ink-6" />
      </div>
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
        {portalContainer ? <UnderHeaderContent portalContainer={portalContainer} /> : null}
      </div>
    </div>
  );
}
// @docs-source-strip-end
