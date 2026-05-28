import type { Message } from "../store/messageStore";

export type SelectableMessage = Message & { isThreadChild?: boolean };

/**
 * Render the selected messages as a markdown block suitable for pasting
 * elsewhere (Linear, GitHub, Notion, …).
 *
 * Format (locked with @huxijin in #proj-mobile:fd343bd8, 2026-04-28):
 *   **Sender**: message content
 *   <blank line>
 *   **Sender**: next message content
 *
 * v1.4 (2026-04-29): when a message is a thread child its block is
 * indented two spaces and prefixed with `↳ ` so it visually nests under
 * its parent in the rendered markdown. Plain prefix; no `>` blockquote
 * (would convert children into a different markdown construct than the
 * parent — we want them to read as the same kind of message, just nested).
 *
 * - Messages are sorted by `seq` (or `createdAt` fallback) so the output
 *   reads top-to-bottom in chat order regardless of click order.
 * - Inline markdown inside `content` (code spans, bold, links) is preserved
 *   verbatim — this is "copy markdown", not "copy plain text".
 * - No timestamps in v0; revisit when users ask.
 */
export function selectionToMarkdown(messages: SelectableMessage[]): string {
  const sorted = [...messages].sort((a, b) => {
    if (a.seq != null && b.seq != null) return a.seq - b.seq;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  return sorted
    .map((m) => {
      const line = `**${m.senderName ?? "Unknown"}**: ${m.content.trim()}`;
      return m.isThreadChild ? `  ↳ ${line}` : line;
    })
    .join("\n\n");
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older WebKit / non-secure contexts. Insert a hidden
  // textarea, select its contents, run document.execCommand("copy"). This
  // is intentionally minimal — Slock targets modern browsers.
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
}

/**
 * Open Twitter's web intent in a new tab, prefilled with the watermark
 * tagline + slock URL. The browser cannot attach an image into the intent
 * URL — the caller is expected to also download or clipboard the rendered
 * PNG so the user can attach it manually inside Twitter's compose UI.
 */
export function openShareToXIntent(): Window | null {
  const text = "via slock.ai";
  const url = "https://slock.ai";
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(url)}`;
  return window.open(intent, "_blank", "noopener,noreferrer");
}
