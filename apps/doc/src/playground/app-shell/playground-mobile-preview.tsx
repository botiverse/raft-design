import { useCallback, useEffect, useRef } from "react";
import type { ThemeMode } from "@botiverse/raft-ui";

const THEME_MESSAGE = "playground-preview-theme";
const PREVIEW_READY_MESSAGE = "playground-preview-ready";

type PlaygroundThemeMessage = {
  type: typeof THEME_MESSAGE;
  mode: ThemeMode;
};

type PlaygroundPreviewReadyMessage = {
  type: typeof PREVIEW_READY_MESSAGE;
};

type PlaygroundMobilePreviewProps = {
  src: string;
  mode: ThemeMode;
};

export function PlaygroundMobilePreview({ src, mode }: PlaygroundMobilePreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const syncTheme = useCallback(() => {
    const message: PlaygroundThemeMessage = { type: THEME_MESSAGE, mode };
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [mode]);

  useEffect(() => {
    syncTheme();
  }, [syncTheme]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        !isPreviewReadyMessage(event.data)
      ) {
        return;
      }

      syncTheme();
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [syncTheme]);

  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-auto bg-fill-muted px-4 pt-10 pb-4">
      <iframe
        ref={frameRef}
        src={src}
        title="Mobile Playground preview"
        className="h-[min(844px,calc(100dvh-56px))] w-[390px] max-w-full shrink-0 bg-white shadow-[0_0_0_0.5px_oklch(0_0_0/0.12)]"
        onLoad={syncTheme}
      />
    </div>
  );
}

function isPreviewReadyMessage(value: unknown): value is PlaygroundPreviewReadyMessage {
  if (!value || typeof value !== "object") return false;
  return (value as Partial<PlaygroundPreviewReadyMessage>).type === PREVIEW_READY_MESSAGE;
}
