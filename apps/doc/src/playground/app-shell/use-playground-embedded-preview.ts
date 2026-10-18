import { useEffect, useSyncExternalStore } from "react";
import type { ThemeMode } from "raft-ui";

const THEME_MESSAGE = "playground-preview-theme";
const PREVIEW_READY_MESSAGE = "playground-preview-ready";

type PlaygroundThemeMessage = {
  type: typeof THEME_MESSAGE;
  mode: ThemeMode;
};

type PlaygroundPreviewReadyMessage = {
  type: typeof PREVIEW_READY_MESSAGE;
};

const subscribeToEmbeddingState = () => () => undefined;
const readEmbeddingState = () => window.self !== window.top;
const readServerEmbeddingState = () => false;

export function usePlaygroundEmbeddedPreview(setMode: (mode: ThemeMode) => void) {
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

      setMode(event.data.mode);
    };

    window.addEventListener("message", handleMessage);
    const readyMessage: PlaygroundPreviewReadyMessage = { type: PREVIEW_READY_MESSAGE };
    window.parent.postMessage(readyMessage, window.location.origin);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedded, setMode]);

  return embedded;
}

function isThemeMessage(value: unknown): value is PlaygroundThemeMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<PlaygroundThemeMessage>;
  return (
    message.type === THEME_MESSAGE &&
    (message.mode === "light" || message.mode === "dark" || message.mode === "system")
  );
}
