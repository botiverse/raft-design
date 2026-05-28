import { useState, useCallback, type RefObject } from "react";
import { useSelectionStore } from "../../store/selectionStore";
import { useMessageStore, type Message } from "../../store/messageStore";
import { captureSelectedMessages } from "../../utils/selectScreenshot";
import {
  selectionToMarkdown,
  copyTextToClipboard,
  openShareToXIntent,
} from "../../utils/selectMarkdown";

/**
 * Resolve the messages currently selected, regardless of selection mode.
 *
 * Channel mode: just look in the channel's own bucket. (Thread descendants
 * already had their ids stuffed into selectedIds at enter time.)
 *
 * Thread mode: the parent lives in `messageStore.channelMessages[
 * threadRootChannelId]` — easy to find. Replies live in **ThreadPanel's
 * local state**, NOT `messageStore.channelMessages[threadId]`, because
 * ThreadPanel maintains its own merge-on-realtime list (see PR #1190 v1.4
 * "Replaced global messageStore.channelMessages thread-bucket dependency
 * with new threadReplyMessages prop fed by ThreadPanel's local state —
 * source of truth aligns with what's on screen").
 *
 * Therefore the caller (`ThreadPanel`) MUST pass its local replies via
 * the `threadReplyMessages` opt or the children won't be found and the
 * export degrades to "parent only" — exactly the regression huxijin
 * caught at #proj-mobile a8748fc2 2026-05-02.
 *
 * Each result is annotated with `isThreadChild` so the renderer can indent
 * replies one step under their parent in the export.
 */
function gatherSelected(opts?: {
  threadReplyMessages?: readonly Message[];
  threadParentMessageRef?: RefObject<Message | null>;
}): Array<Message & { isThreadChild: boolean }> {
  const sel = useSelectionStore.getState();
  if (!sel.isActive || sel.selectedIds.size === 0) return [];
  const ms = useMessageStore.getState();
  const seen = new Map<string, Message>();
  const pushFrom = (bucket: readonly Message[] | undefined) => {
    if (!bucket) return;
    for (const m of bucket) if (sel.selectedIds.has(m.id) && !seen.has(m.id)) seen.set(m.id, m);
  };
  if (sel.channelId) pushFrom(ms.channelMessages[sel.channelId]);
  if (sel.threadRootChannelId) pushFrom(ms.channelMessages[sel.threadRootChannelId]);
  const threadParentMessage = opts?.threadParentMessageRef?.current ?? null;
  if (
    sel.threadRootId &&
    threadParentMessage &&
    sel.selectedIds.has(threadParentMessage.id) &&
    !seen.has(threadParentMessage.id)
  ) {
    seen.set(threadParentMessage.id, threadParentMessage);
  }
  // For channel-mode parents that have replies, the replies live in the
  // parent's `threadId` bucket — pick those up too.
  if (!sel.threadRootId && sel.channelId) {
    const channelBucket = ms.channelMessages[sel.channelId] ?? [];
    for (const m of channelBucket) {
      if (sel.selectedIds.has(m.id) && m.threadId) pushFrom(ms.channelMessages[m.threadId]);
    }
  }
  // Thread mode: prefer the caller-supplied ThreadPanel local replies
  // because messageStore doesn't keep a bucket for the thread channel.
  // (Falling back to messageStore.channelMessages[channelId] is harmless
  // — it's almost always empty in thread mode — but exists for callers
  // that don't pass threadReplyMessages.)
  if (sel.threadRootId && opts?.threadReplyMessages) {
    pushFrom(opts.threadReplyMessages);
  }

  // Tag thread-children. In thread mode any non-root selected id is a child.
  // In channel mode, a child is anything whose id appears in some selected
  // parent's thread bucket.
  const childIds = new Set<string>();
  if (sel.threadRootId) {
    for (const id of seen.keys()) if (id !== sel.threadRootId) childIds.add(id);
  } else if (sel.channelId) {
    const channelBucket = ms.channelMessages[sel.channelId] ?? [];
    for (const m of channelBucket) {
      if (sel.selectedIds.has(m.id) && m.threadId) {
        const replies = ms.channelMessages[m.threadId] ?? [];
        for (const r of replies) if (sel.selectedIds.has(r.id)) childIds.add(r.id);
      }
    }
  }
  return Array.from(seen.values())
    .map((m) => Object.assign({ isThreadChild: childIds.has(m.id) }, m))
    .sort((a, b) => {
      // Sort by seq when available so output reads top-to-bottom in chat
      // order, regardless of click order. Thread children are kept right
      // after their parent in the rendered list — see selectionToMarkdown
      // / captureSelectedMessages for child-after-parent ordering.
      if (a.seq != null && b.seq != null) return a.seq - b.seq;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

export interface SelectionShareHandlers {
  picCapturing: boolean;
  picPreview: string | null;
  setPicPreview: (v: string | null) => void;
  picError: string | null;
  setPicError: (v: string | null) => void;
  copiedMd: boolean;
  onSavePic: () => Promise<void>;
  onShareX: () => Promise<void>;
  onCopyMd: () => Promise<void>;
}

/**
 * Shared share-action handlers used by both ChatPanel (channel mode) and
 * ThreadPanel (thread mode). Centralizes the rasterize / intent-window /
 * clipboard plumbing so the two surfaces don't drift.
 *
 * Filename choice for the PNG download lives in the lightbox caller —
 * this hook no longer owns the surface-name-derived filename.
 *
 * @param opts.threadReplyMessages — Required from ThreadPanel callers
 *   so thread-mode children can be resolved (`messageStore` does not
 *   bucket replies under the thread channel; ThreadPanel keeps them
 *   in local state). ChatPanel (channel mode) leaves this undefined
 *   and falls back to `messageStore.channelMessages[channelId]`.
 */
export interface UseSelectionShareHandlersOptions {
  threadReplyMessages?: readonly Message[];
  threadParentMessageRef?: RefObject<Message | null>;
}

export function useSelectionShareHandlers(
  opts: UseSelectionShareHandlersOptions = {},
): SelectionShareHandlers {
  const [picCapturing, setPicCapturing] = useState(false);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [picError, setPicError] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const threadReplyMessages = opts.threadReplyMessages;
  const threadParentMessageRef = opts.threadParentMessageRef;

  const onSavePic = useCallback(async () => {
    if (picCapturing) return;
    const messages = gatherSelected({ threadReplyMessages, threadParentMessageRef });
    if (messages.length === 0) return;
    setPicError(null);
    setPicCapturing(true);
    try {
      const dataUrl = await captureSelectedMessages(messages.map((m) => m.id), {
        // Match the live main-panel bg per the post-#1272 layout color
        // contract (sidebar=cream, main=white). Prior cream bg was the
        // pre-contract value; export now reads as a white surface like
        // the actual chat. stdrc 2026-05-02 #proj-message:787397b0
        // 14135081: "share message 的截图的背景色，没对上最新的".
        backgroundColor: "#FFFFFF",
        threadChildIds: new Set(messages.filter((m) => m.isThreadChild).map((m) => m.id)),
      });
      setPicPreview(dataUrl);
    } catch (err) {
      // html-to-image rejects with the raw `<img onerror>` Event when a
      // cloned <img> fails to load — `String(err)` on an Event yields
      // "[object Event]" which is useless for triage. Pull useful fields
      // out so the user (and the bug report) gets the failing src URL.
      // huxijin 2026-05-02 #proj-mobile:fd343bd8 3e1aa57a.
      console.error("captureSelectedMessages failed:", err);
      let msg: string;
      if (err instanceof Error) {
        msg = err.message;
      } else if (err instanceof Event) {
        const target = err.target as HTMLImageElement | null;
        const src = target?.src ?? "(unknown src)";
        const truncated = src.length > 80 ? `${src.slice(0, 77)}...` : src;
        msg = `image load failed (${err.type}): ${truncated}`;
      } else {
        msg = String(err);
      }
      setPicError(msg);
    } finally {
      setPicCapturing(false);
    }
  }, [picCapturing, threadParentMessageRef, threadReplyMessages]);

  const onShareX = useCallback(async () => {
    // Share-to-X opens Twitter's web intent with the watermark tagline +
    // slock.ai URL only. It no longer auto-captures / downloads the PNG —
    // per @huxijin's 2026-05-01 review, "Save as Pic" is the separate path
    // for users who actually want an image. Keeping them orthogonal means
    // the user isn't surprised by a forced download when all they wanted
    // was to post a "via slock.ai" teaser.
    const messages = gatherSelected({ threadReplyMessages, threadParentMessageRef });
    if (messages.length === 0) return;
    openShareToXIntent();
    useSelectionStore.getState().exit();
  }, [threadParentMessageRef, threadReplyMessages]);

  const onCopyMd = useCallback(async () => {
    const messages = gatherSelected({ threadReplyMessages, threadParentMessageRef });
    if (messages.length === 0) return;
    const md = selectionToMarkdown(messages);
    try {
      await copyTextToClipboard(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 1500);
    } catch (err) {
      console.error("copyTextToClipboard failed:", err);
      setPicError(err instanceof Error ? err.message : "Clipboard write blocked");
    }
  }, [threadParentMessageRef, threadReplyMessages]);

  return {
    picCapturing,
    picPreview,
    setPicPreview,
    picError,
    setPicError,
    copiedMd,
    onSavePic,
    onShareX,
    onCopyMd,
  };
}
