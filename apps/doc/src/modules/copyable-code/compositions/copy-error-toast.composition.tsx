import { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  createToastManager,
  ToastProvider,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const COMMAND = "raft login --token $RAFT_TOKEN";

/**
 * The failure path, made clickable: with the switch on, the demo denies the
 * clipboard for the duration so the copy actually fails and `onError` runs.
 */
export function CopyErrorToastCompositionContent() {
  const [toastManager] = useState(() => createToastManager());
  const [copyDenied, setCopyDenied] = useState(false);

  useEffect(() => {
    if (!copyDenied) return;
    const clipboard = navigator.clipboard;
    const originalWrite = clipboard?.writeText?.bind(clipboard);
    const originalExecCommand = document.execCommand.bind(document);
    if (clipboard) {
      clipboard.writeText = () =>
        Promise.reject(new DOMException("Clipboard denied", "NotAllowedError"));
    }
    document.execCommand = () => false;
    return () => {
      if (clipboard && originalWrite) clipboard.writeText = originalWrite;
      document.execCommand = originalExecCommand;
    };
  }, [copyDenied]);

  const handleCopyError = useCallback(() => {
    toastManager.add({
      title: "Couldn't copy the command",
      description: "Copy the text manually, or check the browser's clipboard permission.",
      type: "error",
    });
  }, [toastManager]);

  return (
    <ToastProvider
      toastManager={toastManager}
      timeout={2600}
      limit={2}
      viewportPlacement="top-center"
    >
      <div className="grid w-full gap-3">
        <CopyableCodeRoot size="sm" onError={handleCopyError}>
          <CopyableCode truncate>{COMMAND}</CopyableCode>
          <CopyableCodeAction aria-label="Copy login command" />
        </CopyableCodeRoot>
        <label className="flex items-center gap-2 text-xs text-foreground-muted">
          <Checkbox
            checked={copyDenied}
            onCheckedChange={setCopyDenied}
            aria-label="Simulate a denied clipboard"
          />
          Simulate a denied clipboard, then press copy — the action fails and the toast reports it
        </label>
      </div>
    </ToastProvider>
  );
}

// @docs-source-strip-start
export function CopyErrorToastComposition() {
  return (
    <CompositionPreview>
      <CopyErrorToastCompositionContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
