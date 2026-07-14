import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { SetTheme, Theme, ThemeMode } from "raft-ui";

const THEME_MESSAGE = "playground-preview-theme";
const PREVIEW_READY_MESSAGE = "playground-preview-ready";

type PlaygroundThemeMessage = {
  type: typeof THEME_MESSAGE;
  theme: Theme;
  mode: ThemeMode;
};

type PlaygroundPreviewReadyMessage = {
  type: typeof PREVIEW_READY_MESSAGE;
};

type PlaygroundMobilePreviewProps = {
  src: string;
  theme: Theme;
  mode: ThemeMode;
};

const subscribeToEmbeddingState = () => () => undefined;
const readEmbeddingState = () => window.self !== window.top;
const readServerEmbeddingState = () => false;

export function PlaygroundMobilePreview({ src, theme, mode }: PlaygroundMobilePreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const syncTheme = useCallback(() => {
    const message: PlaygroundThemeMessage = { type: THEME_MESSAGE, theme, mode };
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [mode, theme]);

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
    <div className="flex h-full min-h-0 items-center justify-center overflow-auto bg-layer-muted px-4 pt-10 pb-4">
      <iframe
        ref={frameRef}
        src={src}
        title="Mobile Playground preview"
        className="h-[min(844px,calc(100dvh-3.5rem))] w-[390px] max-w-full shrink-0 bg-white shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.12)]"
        onLoad={syncTheme}
      />
    </div>
  );
}

export function usePlaygroundEmbeddedPreview(setTheme: SetTheme) {
  const embedded = useSyncExternalStore(
    subscribeToEmbeddingState,
    readEmbeddingState,
    readServerEmbeddingState,
  );
  useEffect(() => {
    if (!embedded) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        !isThemeMessage(event.data)
      ) {
        return;
      }

      if (event.data.theme === "brutal") {
        setTheme("brutal");
      } else {
        setTheme("elegant", { mode: event.data.mode });
      }
    };

    window.addEventListener("message", handleMessage);
    const readyMessage: PlaygroundPreviewReadyMessage = { type: PREVIEW_READY_MESSAGE };
    window.parent.postMessage(readyMessage, window.location.origin);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedded, setTheme]);

  return embedded;
}

function isThemeMessage(value: unknown): value is PlaygroundThemeMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<PlaygroundThemeMessage>;
  return (
    message.type === THEME_MESSAGE &&
    (message.theme === "brutal" || message.theme === "elegant") &&
    (message.mode === "light" || message.mode === "dark" || message.mode === "system")
  );
}

function isPreviewReadyMessage(value: unknown): value is PlaygroundPreviewReadyMessage {
  if (!value || typeof value !== "object") return false;
  return (value as Partial<PlaygroundPreviewReadyMessage>).type === PREVIEW_READY_MESSAGE;
}
