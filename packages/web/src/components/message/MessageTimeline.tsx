import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Message } from "../../store/messageStore";

// ── Public contract ─────────────────────────────────────────────────────────
//
// MessageTimeline is the rendering primitive for any chronologically ordered,
// real-time-updated list of messages — channel, DM, and thread surfaces all
// consume it. Per RFC-013, this implementation drops Virtuoso in favor of a
// native-scroll container, an IntersectionObserver lazy-load model, and a JS
// anchor manager that captures `(messageId, offsetWithinScroller)` and
// restores it across prepends, resizes, and visualViewport changes. The
// public contract (props, handle, helpers) is unchanged from the Virtuoso
// implementation so callers stay drop-in.
//
// Invariants this primitive enforces (RFC-012 §First Principles, preserved
// by RFC-013):
//   1. Anchor invariance — `(messageId, offsetWithinScroller)` is the only
//      authoritative scroll reference. scrollTop alone is meaningless because
//      heights mutate (image load, font swap, prepend).
//   2. Measure once, reuse forever — the browser's layout engine owns
//      heights; we never cache them.
//   3. Conditional follow ≠ scroll-to-bottom — `isFollowingBottom` is a
//      single boolean toggled only by user-gesture scroll and explicit
//      `armFollowOnNextAppend()`. Resize / visualViewport / append never
//      flip it on their own.
//   4. Lazy-load via geometric sentinel — IntersectionObserver on top/bottom
//      sentinel divs, not scroll-position callbacks. Survives rapid scroll
//      bursts that coalesce intermediate scroll events.

export type MessageTimelineSource = {
  messages: Message[];
  hasOlder: boolean;
  hasNewer: boolean;
  loading: boolean;
  loadOlder: () => void | Promise<void>;
  loadNewer: () => void | Promise<void>;
  // One-shot focus on mount (permalink / context window). Setting this AFTER
  // mount is a noop — focus is initialization input, not controlled state.
  // Consumers wanting to re-focus call `handle.scrollToMessage(id)` instead.
  initialFocusMessageId?: string | null;
};

export type MessageTimelineHandle = {
  scrollToBottom: (opts?: { smooth?: boolean }) => void;
  scrollToMessage: (id: string, opts?: { smooth?: boolean; align?: "start" | "center" | "end" }) => void;
  isAtBottom: () => boolean;
  isFollowingBottom: () => boolean;
  preserveAnchorOnNextLayoutChange: () => void;
  // For surfaces (ChatPanel send-flow) that want to pin the next append even
  // if the user happens to be slightly off the bottom at the time of click.
  // Single-shot: cleared after the next append-induced follow.
  armFollowOnNextAppend: () => void;
};

export type MessageTimelineProps = {
  source: MessageTimelineSource;
  renderItem: (msg: Message, index: number) => ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  // Notifies the surface chrome (Back-to-bottom button, server unread sync,
  // new-message badge). Fires whenever the at-bottom state actually changes;
  // see invariant 3 — this does NOT imply isFollowingBottom changed.
  onAtBottomChange?: (atBottom: boolean) => void;
  // Reports the visible reading window plus roughly one viewport of lookahead
  // for bounded read-side enrichment such as translation.
  onVisibleMessageWindowChange?: (messageIds: string[]) => void;
  className?: string;
  testId?: string;
  // When set, the primitive remembers the top-visible message id under this
  // key and restores scroll on next mount with the same key. Skipped when
  // the user was at-bottom (re-enter at tail is the expected "live mode"
  // landing).
  persistKey?: string;
  // Where sparse content (fewer messages than fill the viewport) should rest.
  // "top" — content stacks from the top; the empty space is below. Right for
  //   threads, where the "Beginning of replies" divider sits above the first
  //   reply and the visual expectation is replies grow downward from it.
  // "bottom" — content is pushed flush against the bottom edge (input bar).
  //   Right for channels, where the input bar is glued to the scroller and
  //   floating sparse content at the top would leave a confusing dead zone.
  // Defaults to "top".
  sparseAnchor?: "top" | "bottom";
};

// ── Scroll-position memory (sessionStorage with LRU eviction) ───────────────

const SCROLL_MEMORY_PREFIX = "slock.scroll-memory.v1.";
const SCROLL_MEMORY_INDEX = "slock.scroll-memory.v1.__index__";
const SCROLL_MEMORY_MAX = 64;
const scrollMemoryFallback = new Map<string, string>();

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readIndex(storage: Storage): string[] {
  try {
    const raw = storage.getItem(SCROLL_MEMORY_INDEX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeIndex(storage: Storage, index: string[]) {
  try {
    storage.setItem(SCROLL_MEMORY_INDEX, JSON.stringify(index));
  } catch {
    /* quota / disabled */
  }
}

function rememberScroll(key: string, messageId: string) {
  const storage = getStorage();
  if (!storage) {
    scrollMemoryFallback.delete(key);
    scrollMemoryFallback.set(key, messageId);
    if (scrollMemoryFallback.size > SCROLL_MEMORY_MAX) {
      const oldest = scrollMemoryFallback.keys().next().value;
      if (oldest !== undefined) scrollMemoryFallback.delete(oldest);
    }
    return;
  }
  try {
    storage.setItem(SCROLL_MEMORY_PREFIX + key, messageId);
    const index = readIndex(storage).filter((k) => k !== key);
    index.push(key);
    while (index.length > SCROLL_MEMORY_MAX) {
      const oldest = index.shift();
      if (oldest) storage.removeItem(SCROLL_MEMORY_PREFIX + oldest);
    }
    writeIndex(storage, index);
  } catch {
    /* quota / disabled */
  }
}

function recallScroll(key: string): string | undefined {
  const storage = getStorage();
  if (!storage) return scrollMemoryFallback.get(key);
  try {
    const v = storage.getItem(SCROLL_MEMORY_PREFIX + key);
    if (v === null) return undefined;
    const index = readIndex(storage).filter((k) => k !== key);
    index.push(key);
    writeIndex(storage, index);
    return v;
  } catch {
    return undefined;
  }
}

function forgetScroll(key: string) {
  const storage = getStorage();
  if (!storage) {
    scrollMemoryFallback.delete(key);
    return;
  }
  try {
    storage.removeItem(SCROLL_MEMORY_PREFIX + key);
    const index = readIndex(storage).filter((k) => k !== key);
    writeIndex(storage, index);
  } catch {
    /* quota / disabled */
  }
}

// Public helper for consumers to pre-seed `initialFocusMessageId` from the
// remembered scroll position when their data loader needs to know which
// window to fetch. Safe to call before mount.
export function recallPersistedScrollMessageId(key: string | undefined): string | null {
  if (!key) return null;
  return recallScroll(key) ?? null;
}

// ── Anchor manager ──────────────────────────────────────────────────────────
//
// An anchor is the (messageId, offsetWithinScroller) pair that uniquely
// identifies "where the user is reading". Captured continuously during
// scroll (via the topmost partially-visible item) and restored on any
// layout-changing event (prepend, resize, visualViewport).

type ScrollAnchor = { messageId: string; offsetWithinScroller: number };

function captureAnchor(scroller: HTMLElement): ScrollAnchor | null {
  const items = scroller.querySelectorAll<HTMLElement>("[data-message-id]");
  if (items.length === 0) return null;
  const scrollerRect = scroller.getBoundingClientRect();
  const topGuard = scrollerRect.top + 1;
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const rect = item.getBoundingClientRect();
    if (rect.bottom > topGuard) {
      const id = item.dataset.messageId;
      if (!id) continue;
      const offsetWithinScroller = rect.top - scrollerRect.top + scroller.scrollTop;
      return { messageId: id, offsetWithinScroller };
    }
  }
  return null;
}

function restoreAnchor(scroller: HTMLElement, anchor: ScrollAnchor): boolean {
  const item = scroller.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(anchor.messageId)}"]`);
  if (!item) return false;
  const scrollerRect = scroller.getBoundingClientRect();
  const newOffset = item.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;
  const delta = newOffset - anchor.offsetWithinScroller;
  if (Math.abs(delta) > 0.5) {
    scroller.scrollTop += delta;
  }
  return true;
}

// ── Implementation ──────────────────────────────────────────────────────────

const AT_BOTTOM_THRESHOLD = 100;
const SENTINEL_ROOT_MARGIN = "200px";
const PROGRAMMATIC_SCROLL_MAX_FRAMES = 60;
const ANCHOR_PRESERVE_LAYOUT_CHANGE_MS = 1200;

const MessageTimeline = forwardRef<MessageTimelineHandle, MessageTimelineProps>(
  function MessageTimeline(
    {
      source,
      renderItem,
      header,
      footer,
      onAtBottomChange,
      onVisibleMessageWindowChange,
      className,
      testId = "message-scroller",
      persistKey,
      sparseAnchor = "top",
    },
    ref,
  ) {
    const { messages, initialFocusMessageId } = source;

    const scrollerRef = useRef<HTMLDivElement>(null);
    // Inner content column. Observed for in-place content-height changes
    // (translate toggle, message edit, expand/collapse) — these change
    // scrollHeight without resizing the scroller box, so the scroller-only
    // ResizeObserver never fires and the live anchor is never restored,
    // leaving everything above the viewport to jump. (#proj-uiux task #271)
    const contentRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomSentinelRef = useRef<HTMLDivElement>(null);

    // Mutable state refs — these intentionally avoid React state because
    // they're consulted from event handlers that fire faster than re-render.
    const isFollowingBottomRef = useRef(true);
    const armedFollowRef = useRef(false);
    const forceFollowBottomRef = useRef(false);
    // Suppress user-gesture detection during programmatic scrolls so our own
    // scrollTo doesn't flip isFollowingBottom or wipe persisted scroll memory.
    const programmaticScrollRef = useRef(false);
    const programmaticScrollTokenRef = useRef(0);
    const userScrollIntentRef = useRef(false);
    // Tracks whether the user has actually scrolled (vs. mount-time at-bottom
    // signal). Used to gate "forget saved scroll on return-to-bottom" so the
    // initial layout-induced at-bottom doesn't wipe a still-valid restore.
    const userHasScrolledRef = useRef(false);
    // Set when initial mount picked a non-tail anchor (focus or restore), so
    // sentinel-driven loadNewer doesn't yank the view back to live tail.
    const restoredFromMemoryRef = useRef(false);
    // Continuously snapshotted top-visible anchor; consulted by
    // ResizeObserver / visualViewport / prepend handlers.
    const lastAnchorRef = useRef<ScrollAnchor | null>(null);
    const preserveAnchorUntilRef = useRef(0);
    // Snapshot of the data window from the last commit, used to classify
    // the next data mutation as append / prepend / context-jump.
    const prevFirstIdRef = useRef<string | null>(null);
    const prevLastIdRef = useRef<string | null>(null);
    const prevScrollHeightRef = useRef(0);
    // Guards initial-position useLayoutEffect — fires once when messages
    // first becomes non-empty per mount.
    const didInitialPositionRef = useRef(false);

    const persistKeyRef = useRef(persistKey);
    persistKeyRef.current = persistKey;
    const sourceRef = useRef(source);
    sourceRef.current = source;
    const onAtBottomChangeRef = useRef(onAtBottomChange);
    onAtBottomChangeRef.current = onAtBottomChange;
    const onVisibleMessageWindowChangeRef = useRef(onVisibleMessageWindowChange);
    onVisibleMessageWindowChangeRef.current = onVisibleMessageWindowChange;
    const lastVisibleMessageWindowKeyRef = useRef("");

    const [atBottomState, setAtBottomState] = useState(true);

    const reportVisibleMessageWindow = useCallback(() => {
      const callback = onVisibleMessageWindowChangeRef.current;
      if (!callback) return;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const top = scrollerRect.top;
      const bottom = scrollerRect.bottom + scroller.clientHeight;
      const ids: string[] = [];
      scroller.querySelectorAll<HTMLElement>("[data-message-id]").forEach((item) => {
        const id = item.dataset.messageId;
        if (!id) return;
        const rect = item.getBoundingClientRect();
        if (rect.bottom >= top && rect.top <= bottom) ids.push(id);
      });
      const key = ids.join("|");
      if (key === lastVisibleMessageWindowKeyRef.current) return;
      lastVisibleMessageWindowKeyRef.current = key;
      callback(ids);
    }, []);

    // ── Programmatic scroll helpers ───────────────────────────────────────
    const beginProgrammaticScroll = useCallback((releaseWhen?: () => boolean) => {
      const token = programmaticScrollTokenRef.current + 1;
      programmaticScrollTokenRef.current = token;
      programmaticScrollRef.current = true;

      // Two stable frames are enough for ordinary programmatic jumps. Bottom
      // jumps can take longer: if new messages land while the browser is
      // settling the scroll, a stale bottom target would otherwise emit a
      // non-bottom scroll event and incorrectly turn follow mode off.
      let frames = 0;
      let stableFrames = 0;
      const tick = () => {
        if (programmaticScrollTokenRef.current !== token) return;
        frames += 1;
        if (!releaseWhen || releaseWhen()) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
        }

        if (stableFrames >= 2 || frames >= PROGRAMMATIC_SCROLL_MAX_FRAMES) {
          programmaticScrollRef.current = false;
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, []);

    const scrollToBottomImmediate = useCallback(
      (smooth: boolean) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        beginProgrammaticScroll(() => {
          const node = scrollerRef.current;
          if (!node) return true;
          const dist = Math.max(0, node.scrollHeight - node.scrollTop - node.clientHeight);
          return dist <= AT_BOTTOM_THRESHOLD;
        });
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth ? "smooth" : "auto" });
      },
      [beginProgrammaticScroll],
    );

    const preserveAnchorOnNextLayoutChange = useCallback(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const dist = Math.max(0, scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight);
      if (dist <= AT_BOTTOM_THRESHOLD) return;
      const anchor = captureAnchor(scroller);
      if (!anchor) return;
      lastAnchorRef.current = anchor;
      preserveAnchorUntilRef.current = performance.now() + ANCHOR_PRESERVE_LAYOUT_CHANGE_MS;
      isFollowingBottomRef.current = false;
      armedFollowRef.current = false;
      forceFollowBottomRef.current = false;
    }, []);

    const preserveAnchorRequested = useCallback(() => {
      if (preserveAnchorUntilRef.current <= 0) return false;
      if (performance.now() <= preserveAnchorUntilRef.current) return true;
      preserveAnchorUntilRef.current = 0;
      return false;
    }, []);

    const restoreAfterLayoutChange = useCallback((scroller: HTMLElement, forceAnchor: boolean) => {
      // Run scroll adjustment synchronously inside the ResizeObserver /
      // visualViewport callback so the browser commits the layout change
      // AND the compensating scroll change in the same paint frame.
      // Previously these were wrapped in a next-frame scheduler, which
      // pushed scroll compensation to the NEXT frame — users saw a 1-frame
      // intermediate where the layout had shifted but scroll hadn't caught
      // up (#proj-uiux:c0b821dd task #318 — the "first reaction jitter"
      // where a message without any footer items grew +26px and the chat
      // below was visibly pushed down then bounced back).
      //
      // ResizeObserver fires AFTER layout completes and BEFORE the next
      // paint, so reading scrollHeight / setting scrollTop here is safe
      // and atomic with the layout change. The `beginProgrammaticScroll`
      // guard still discriminates these adjustments from user-initiated
      // scrolls, so the follow / anchor invariants are unaffected.
      if (forceAnchor && lastAnchorRef.current) {
        const anchor = lastAnchorRef.current;
        beginProgrammaticScroll();
        restoreAnchor(scroller, anchor);
        return;
      }

      if (isFollowingBottomRef.current) {
        scrollToBottomImmediate(false);
      } else if (lastAnchorRef.current) {
        const anchor = lastAnchorRef.current;
        beginProgrammaticScroll();
        restoreAnchor(scroller, anchor);
      }
    }, [beginProgrammaticScroll, scrollToBottomImmediate]);

    // ── Source-empty reset ────────────────────────────────────────────────
    // Callers usually use `key={channelId}` for hard remount, but a
    // context-window swap reuses the same mount. Reset state so a re-fill
    // doesn't carry stale anchor/follow flags.
    useEffect(() => {
      if (messages.length === 0) {
        prevFirstIdRef.current = null;
        prevLastIdRef.current = null;
        prevScrollHeightRef.current = 0;
        lastAnchorRef.current = null;
        didInitialPositionRef.current = false;
        isFollowingBottomRef.current = true;
        userHasScrolledRef.current = false;
        restoredFromMemoryRef.current = false;
        setAtBottomState(true);
      }
    }, [messages.length]);

    // ── Initial position pick ─────────────────────────────────────────────
    // Fires once per mount when messages first becomes non-empty. Picks
    // explicit focus first, then persisted scroll, then defaults to tail.
    useLayoutEffect(() => {
      if (didInitialPositionRef.current) return;
      if (messages.length === 0) return;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      didInitialPositionRef.current = true;

      let targetId: string | null = null;
      // Alignment must match the save semantic, not the navigation semantic:
      //   - initialFocusMessageId (permalink, transient focus): caller is
      //     SHOWING a specific message — center it for visual emphasis.
      //   - persistKey recall: caller is RESUMING a reading position;
      //     captureAnchor saved the topmost-visible message id, so "start"
      //     is the closest reproduction (drift ≤ one message height).
      //     "center" here would scroll the user UP by ~clientHeight/2 from
      //     where they actually left off — the symptom in #proj-message
      //     task #13 ("点开消息之后会闪到往上一些的位置而不是消息列表底部").
      let targetAlign: "start" | "center" = "center";
      if (initialFocusMessageId && messages.some((m) => m.id === initialFocusMessageId)) {
        targetId = initialFocusMessageId;
        targetAlign = "center";
        restoredFromMemoryRef.current = true;
        isFollowingBottomRef.current = false;
      } else if (persistKey) {
        const saved = recallScroll(persistKey);
        if (saved && messages.some((m) => m.id === saved)) {
          targetId = saved;
          targetAlign = "start";
          restoredFromMemoryRef.current = true;
          isFollowingBottomRef.current = false;
        }
      }

      if (targetId) {
        const item = scroller.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(targetId)}"]`);
        if (item) {
          beginProgrammaticScroll();
          item.scrollIntoView({ block: targetAlign });
          lastAnchorRef.current = captureAnchor(scroller);
          prevFirstIdRef.current = messages[0].id;
          prevLastIdRef.current = messages[messages.length - 1].id;
          prevScrollHeightRef.current = scroller.scrollHeight;
          // Initial at-bottom state derives from where we landed.
          const dist = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
          const atBottom = dist <= AT_BOTTOM_THRESHOLD;
          setAtBottomState(atBottom);
          return;
        }
      }

      // Default: tail.
      beginProgrammaticScroll();
      scroller.scrollTop = scroller.scrollHeight;
      isFollowingBottomRef.current = true;
      lastAnchorRef.current = captureAnchor(scroller);
      prevFirstIdRef.current = messages[0].id;
      prevLastIdRef.current = messages[messages.length - 1].id;
      prevScrollHeightRef.current = scroller.scrollHeight;
      setAtBottomState(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, initialFocusMessageId, persistKey]);

    // ── Data mutation classifier (append vs prepend vs context-jump) ──────
    useLayoutEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      if (messages.length === 0) return;
      // Initial position effect handles the first commit.
      if (!didInitialPositionRef.current) return;

      const firstId = messages[0].id;
      const lastId = messages[messages.length - 1].id;
      const prevFirst = prevFirstIdRef.current;
      const prevLast = prevLastIdRef.current;

      if (prevFirst === firstId && prevLast === lastId) {
        prevScrollHeightRef.current = scroller.scrollHeight;
        return;
      }

      const lastChanged = lastId !== prevLast;
      const firstChanged = firstId !== prevFirst;
      const forceFollowBottom = forceFollowBottomRef.current;
      if (forceFollowBottom && (firstChanged || lastChanged)) {
        armedFollowRef.current = false;
        scrollToBottomImmediate(false);
        prevFirstIdRef.current = firstId;
        prevLastIdRef.current = lastId;
        prevScrollHeightRef.current = scroller.scrollHeight;
        lastAnchorRef.current = captureAnchor(scroller);
        return;
      }

      if (firstChanged && !lastChanged) {
        // Prepend (older messages loaded). Restore via the live anchor —
        // this works whether or not the browser's overflow-anchor fired,
        // because we measure the actual delta of the same DOM element.
        const anchor = lastAnchorRef.current;
        if (anchor) {
          beginProgrammaticScroll();
          restoreAnchor(scroller, anchor);
        }
      } else if (lastChanged && !firstChanged) {
        // Append (new tail). Follow only if user was at bottom OR caller
        // armed via willSend AND there's no truncated forward window.
        if ((isFollowingBottomRef.current || armedFollowRef.current) && !sourceRef.current.hasNewer) {
          armedFollowRef.current = false;
          scrollToBottomImmediate(false);
        }
      } else if (firstChanged && lastChanged) {
        // Full-window swaps are usually context jumps, but they also happen
        // when a realtime seq gap heals by reloading the latest contiguous
        // tail. If the user explicitly asked to follow the bottom, preserve
        // that intent across the replacement instead of leaving them parked
        // at the old window's scrollTop.
        if ((isFollowingBottomRef.current || armedFollowRef.current) && !sourceRef.current.hasNewer) {
          armedFollowRef.current = false;
          scrollToBottomImmediate(false);
        }
      }

      prevFirstIdRef.current = firstId;
      prevLastIdRef.current = lastId;
      prevScrollHeightRef.current = scroller.scrollHeight;
      // After mutation, refresh the live anchor.
      lastAnchorRef.current = captureAnchor(scroller);
    }, [messages, beginProgrammaticScroll, scrollToBottomImmediate]);

    // ── User-gesture scroll listener ──────────────────────────────────────
    // Updates atBottomState, isFollowingBottomRef (user-driven only),
    // captures the live anchor, and persists scroll memory.
    useEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      let rafScheduled = false;
      const onScroll = () => {
        if (rafScheduled) return;
        rafScheduled = true;
        requestAnimationFrame(() => {
          rafScheduled = false;
          const wasProgrammatic = programmaticScrollRef.current;
          const hadUserIntent = userScrollIntentRef.current;
          userScrollIntentRef.current = false;
          const dist = Math.max(0, scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight);
          const atBottom = dist <= AT_BOTTOM_THRESHOLD;

          // Always refresh the live anchor for resize / vv handlers.
          lastAnchorRef.current = captureAnchor(scroller);
          reportVisibleMessageWindow();

          // At-bottom state always reflects current position so the
          // back-to-bottom badge updates regardless of scroll origin.
          setAtBottomState((prev) => {
            if (prev !== atBottom) {
              onAtBottomChangeRef.current?.(atBottom);
              return atBottom;
            }
            return prev;
          });

          if (!wasProgrammatic && hadUserIntent) {
            userHasScrolledRef.current = true;
            // The follow flag is the user's intent; only user-driven
            // scrolls are allowed to flip it.
            isFollowingBottomRef.current = atBottom;
            if (atBottom) {
              // Returning to live tail by user action — drop saved scroll.
              if (persistKeyRef.current) forgetScroll(persistKeyRef.current);
              restoredFromMemoryRef.current = false;
            } else if (persistKeyRef.current && lastAnchorRef.current) {
              rememberScroll(persistKeyRef.current, lastAnchorRef.current.messageId);
            }
            if (!atBottom) {
              forceFollowBottomRef.current = false;
            }
          }
        });
      };
      const markUserScrollIntent = () => {
        userScrollIntentRef.current = true;
      };
      scroller.addEventListener("wheel", markUserScrollIntent, { passive: true });
      scroller.addEventListener("touchstart", markUserScrollIntent, { passive: true });
      scroller.addEventListener("pointerdown", markUserScrollIntent, { passive: true });
      scroller.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        scroller.removeEventListener("wheel", markUserScrollIntent);
        scroller.removeEventListener("touchstart", markUserScrollIntent);
        scroller.removeEventListener("pointerdown", markUserScrollIntent);
        scroller.removeEventListener("scroll", onScroll);
      };
    }, [reportVisibleMessageWindow]);

    useLayoutEffect(() => {
      if (messages.length === 0) {
        if (lastVisibleMessageWindowKeyRef.current) {
          lastVisibleMessageWindowKeyRef.current = "";
          onVisibleMessageWindowChangeRef.current?.([]);
        }
        return;
      }
      requestAnimationFrame(reportVisibleMessageWindow);
    }, [messages, reportVisibleMessageWindow]);

    // ── Lazy-load sentinels ───────────────────────────────────────────────
    useEffect(() => {
      const scroller = scrollerRef.current;
      const top = topSentinelRef.current;
      const bottom = bottomSentinelRef.current;
      if (!scroller || !top || !bottom) return;

      const io = new IntersectionObserver(
        (entries) => {
          // Skip until the initial position pick has run — otherwise the
          // mount-time intersection (empty scroller, both sentinels at
          // origin) fires before we know whether to focus mid-list.
          if (!didInitialPositionRef.current) return;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const s = sourceRef.current;
            if (entry.target === top) {
              if (s.hasOlder && !s.loading) void s.loadOlder();
            } else if (entry.target === bottom) {
              // Suppress mount-time auto-loadNewer when we restored to a
              // non-tail anchor — wait for the user to scroll first.
              if (restoredFromMemoryRef.current && !userHasScrolledRef.current) continue;
              if (s.hasNewer && !s.loading) void s.loadNewer();
            }
          }
        },
        { root: scroller, rootMargin: SENTINEL_ROOT_MARGIN },
      );

      io.observe(top);
      io.observe(bottom);
      return () => io.disconnect();
    }, []);

    // ── Width-change re-anchor ────────────────────────────────────────────
    // Sidebar resize, thread panel open/close, mobile orientation change.
    // If user was at bottom, re-pin; otherwise restore the live anchor so
    // the message they were reading stays in place.
    useEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const ro = new ResizeObserver(() => {
        restoreAfterLayoutChange(scroller, preserveAnchorRequested());
      });
      ro.observe(scroller);
      return () => ro.disconnect();
    }, [preserveAnchorRequested, restoreAfterLayoutChange]);

    // ── Content-height re-anchor ──────────────────────────────────────────
    // In-place message height changes (translate toggle, message edit,
    // expand/collapse) change the inner content column's height — and thus
    // the scroller's scrollHeight — WITHOUT resizing the scroller box, so
    // the scroller-only ResizeObserver above never fires. Without
    // compensation, growing/shrinking a message above the viewport shifts
    // everything the user is reading (the "translate makes the channel
    // jump" report, #proj-uiux task #271).
    //
    // Same policy as the width-change ResizeObserver: if following bottom,
    // re-pin; otherwise restore the live (messageId, offset) anchor so the
    // message the user is reading stays put. restoreAnchor only adjusts by
    // the computed delta, so this is idempotent and coexists safely with
    // the append/prepend classifier (which already updates the anchor).
    useEffect(() => {
      const scroller = scrollerRef.current;
      const content = contentRef.current;
      if (!scroller || !content) return;
      const ro = new ResizeObserver(() => {
        restoreAfterLayoutChange(scroller, preserveAnchorRequested());
      });
      ro.observe(content);
      return () => ro.disconnect();
    }, [preserveAnchorRequested, restoreAfterLayoutChange]);

    // ── visualViewport (mobile keyboard / address bar) ────────────────────
    // Same policy as ResizeObserver: re-pin if following, else restore
    // anchor. NEVER flip isFollowingBottom — invariant 3.
    useEffect(() => {
      if (typeof window === "undefined" || !window.visualViewport) return;
      const vv = window.visualViewport;
      let prevHeight = vv.height;
      const onResize = () => {
        const next = vv.height;
        const delta = Math.abs(next - prevHeight);
        prevHeight = next;
        if (delta < 10) return;
        const scroller = scrollerRef.current;
        if (!scroller) return;
        restoreAfterLayoutChange(scroller, preserveAnchorRequested());
      };
      vv.addEventListener("resize", onResize);
      return () => vv.removeEventListener("resize", onResize);
    }, [preserveAnchorRequested, restoreAfterLayoutChange]);

    // ── Imperative handle ─────────────────────────────────────────────────
    useImperativeHandle(
      ref,
      (): MessageTimelineHandle => ({
        scrollToBottom: ({ smooth = false } = {}) => {
          isFollowingBottomRef.current = true;
          armedFollowRef.current = true;
          forceFollowBottomRef.current = true;
          scrollToBottomImmediate(smooth);
        },
        scrollToMessage: (id, { smooth = false, align = "center" } = {}) => {
          const scroller = scrollerRef.current;
          if (!scroller) return;
          const item = scroller.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
          if (!item) return;
          beginProgrammaticScroll();
          item.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: align });
        },
        isAtBottom: () => atBottomState,
        isFollowingBottom: () => isFollowingBottomRef.current,
        preserveAnchorOnNextLayoutChange,
        armFollowOnNextAppend: () => {
          armedFollowRef.current = true;
          isFollowingBottomRef.current = true;
          forceFollowBottomRef.current = true;
        },
      }),
      [atBottomState, beginProgrammaticScroll, preserveAnchorOnNextLayoutChange, scrollToBottomImmediate],
    );

    // ── Render ────────────────────────────────────────────────────────────
    // Render messages directly (no useMemo). The consumer's `renderItem`
    // closure captures dynamic state (thread summaries, mention map, agent
    // presence) that changes independently of the messages array; memoizing
    // by `[messages]` would freeze that captured state and skip updates the
    // user is supposed to see (e.g., a thread reply count incrementing).
    // Per-item components are already memoized at the call site.
    return (
      <div className={`relative ${className ?? "flex-1 min-h-0"}`}>
        <div
          ref={scrollerRef}
          data-testid={testId}
          className="h-full overflow-y-auto"
          style={{
            overflowAnchor: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Inner column with min-height:100%. When sparseAnchor="bottom",
              a flex-grow spacer above the messages pushes them flush against
              the bottom (input bar) instead of floating at the top of an
              empty scroller. When "top" (default, threads), no spacer — the
              "Beginning of replies" divider sits at the top and replies stack
              downward from it. */}
          <div ref={contentRef} style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            {header}
            <div ref={topSentinelRef} aria-hidden style={{ height: 1 }} />
            {sparseAnchor === "bottom" ? (
              <div style={{ flex: "1 0 auto" }} aria-hidden />
            ) : null}
            {messages.map((msg, index) => (
              <div key={msg.id} data-index={index} data-message-id={msg.id}>
                {renderItem(msg, index)}
              </div>
            ))}
            <div ref={bottomSentinelRef} aria-hidden style={{ height: 1 }} />
            {footer}
          </div>
        </div>
      </div>
    );
  },
);

export default MessageTimeline;
