import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Clipboard writes with an honest result.
 *
 * `navigator.clipboard.writeText` rejects when permission is missing or the
 * document isn't focused, and older/embedded environments don't expose it at
 * all. This hook tries the async API first, then a synchronous
 * `document.execCommand("copy")` fallback, and — unlike fire-and-forget
 * helpers — it answers whether the text actually landed: a failed attempt
 * rejects, so callers can surface the failure instead of announcing success.
 */
export interface CopyToClipboardOptions {
  /** How long `copied` stays true after a successful write. Default 1400ms. */
  timeout?: number;
}

export interface CopyToClipboardController {
  /** True for `timeout` after the last successful write. */
  copied: boolean;
  /** Resolves on a real write; rejects when every strategy failed. */
  copyText: (value: string) => Promise<void>;
  /** Clears the success window early (e.g. on unmount or identity change). */
  reset: () => void;
}

function legacyCopy(value: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

async function writeClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the synchronous strategy.
  }
  return legacyCopy(value);
}

export function useCopyToClipboard({
  timeout = 1400,
}: CopyToClipboardOptions = {}): CopyToClipboardController {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    setCopied(false);
  }, [clear]);

  useEffect(() => clear, [clear]);

  const copyText = useCallback(
    async (value: string) => {
      const ok = await writeClipboard(value);
      if (!ok) throw new Error("copy_failed");
      setCopied(true);
      clear();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setCopied(false);
      }, timeout);
    },
    [clear, timeout],
  );

  return { copied, copyText, reset };
}
