/**
 * Match the source flow: reserve a blank tab so a null result is an honest
 * popup-block signal, then sever its opener before navigating externally.
 * Returns false when the browser blocked or revoked the reserved window.
 */
export function openHtmlPreviewExternalUrl(url: string): boolean {
  const popup = window.open("about:blank", "_blank");
  if (!popup) return false;

  try {
    popup.opener = null;
    const meta = popup.document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    popup.document.head.append(meta);
    const anchor = popup.document.createElement("a");
    anchor.href = url;
    anchor.rel = "noopener noreferrer";
    anchor.referrerPolicy = "no-referrer";
    (popup.document.body ?? popup.document.documentElement).append(anchor);
    anchor.click();
    return true;
  } catch {
    try {
      popup.close();
    } catch {
      // Best effort: browsers may revoke the reserved WindowProxy.
    }
    return false;
  }
}
