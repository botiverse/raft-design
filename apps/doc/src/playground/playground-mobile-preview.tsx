import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Theme, ThemeMode } from "raft-ui";

const THEME_MESSAGE = "playground-preview-theme";

type PlaygroundThemeMessage = {
  type: typeof THEME_MESSAGE;
  theme: Theme;
  mode: ThemeMode;
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

  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-auto bg-layer-muted px-4 pt-10 pb-4">
      <iframe
        ref={frameRef}
        src={src}
        title="Mobile Playground preview"
        className="h-[min(844px,calc(100dvh-3.5rem))] w-[390px] max-w-full shrink-0 border border-line-strong bg-background"
        onLoad={syncTheme}
      />
    </div>
  );
}

export function usePlaygroundEmbeddedPreview(theme: Theme, mode: ThemeMode) {
  const embedded = useSyncExternalStore(
    subscribeToEmbeddingState,
    readEmbeddingState,
    readServerEmbeddingState,
  );
  const [embeddedTheme, setEmbeddedTheme] = useState({ theme, mode });

  useEffect(() => {
    if (!embedded) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isThemeMessage(event.data)) return;
      setEmbeddedTheme({ theme: event.data.theme, mode: event.data.mode });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedded]);

  return {
    embedded,
    theme: embedded ? embeddedTheme.theme : theme,
    mode: embedded ? embeddedTheme.mode : mode,
  };
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
