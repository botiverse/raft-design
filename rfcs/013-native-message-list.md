# RFC-013: Native-Scroll Message List

**Status:** Draft
**Date:** 2026-04-22
**Author:** Bugen
**Track:** #proj-message-list task #4 (supersedes the original Phase 2 plan)
**Supersedes:** RFC-012 §A "Primitive: `<MessageTimeline>`" implementation choice. RFC-012's *contract* (the four invariants in §First Principles) is preserved verbatim — only the implementation strategy changes.

---

## Problem Recap

Mobile message lists "几乎无法使用" once the scrollback grows past a screenful. Symptoms (RFC-012 §Problem):

1. Continuous-scroll flicker
2. Snap-back-to-bottom on `visualViewport` resize (keyboard / address bar)
3. Lazy-load drops under fast scroll

RFC-012 framed these as one architectural problem and proposed a JS primitive wrapping Virtuoso to enforce the four invariants. Three weeks of patching Virtuoso for the chat shape (PR #961's `alignToBottom`, the `firstItemIndex` shift on prepend, the `prevFirstId / prevLastId` follow-output guard, the per-surface divergence catalogued in RFC-012 §Current Divergence) have produced a clearer picture:

> **We are using JavaScript to re-implement scroll-anchoring and offscreen-paint-skipping that the browser engines now do natively.**

Every patch fights `scrollTop` — itself a derived value that the browser is also trying to manage via its own anchoring heuristics. On mobile WebKit / Blink, the layout engine wins these fights more often than our JS does, especially under `visualViewport` mutations. The flicker is the *visible record of a fight between two coordinate systems*.

This RFC proposes the 2026 first-principles answer: **stop running a parallel layout engine.** Render plain DOM, let the browser's own scroll-anchoring + paint-culling APIs do what Virtuoso has been re-implementing.

---

## First Principles, Re-derived

The four invariants in RFC-012 §First Principles still hold. Re-mapped onto the platform:

| RFC-012 invariant | Browser-native primitive that satisfies it |
|---|---|
| 1. Anchor invariance — anchor is `(messageId, offsetWithinMessage)`, not `scrollTop` | **CSS Scroll Anchoring** (`overflow-anchor: auto`) on Chromium + Firefox; JS fallback (read `getBoundingClientRect` before mutation, restore after) on Safari |
| 2. Measure once, reuse forever | **`content-visibility: auto` + `contain-intrinsic-size`** — offscreen items skip paint *and* layout; intrinsic-size hint preserves their stable footprint without re-measuring |
| 3. Conditional follow ≠ scroll-to-bottom (`isFollowingBottom` user-gesture only; `visualViewport` independent of layout resize) | Unchanged from RFC-012 — this is policy, not implementation. The native stack does NOT relitigate this. |
| 4. Lazy-load via geometric sentinel, not scroll callback | **`IntersectionObserver`** on top/bottom sentinel `<div>`s — same as RFC-012, but now trivially integrated since we own the scroll container directly |

The invariants survive. What dies is the JS virtualization stack that was implementing them by hand.

---

## Why Now

Three browser-platform changes since the original message list shipped make the native approach viable:

| API | Purpose | Status (2026-04) |
|---|---|---|
| `content-visibility: auto` | Skip paint+layout for offscreen subtrees | Chromium since 85 (2020), **Safari 18 (Sep 2024)** — newly cross-browser |
| `contain-intrinsic-size` | Reserve stable space for `content-visibility` placeholders | Chromium since 85, **Safari 18 (Sep 2024)** |
| `overflow-anchor: auto` | Browser-native scroll anchoring on DOM mutation | Chromium since 56, Firefox since 66, **Safari: still not shipped** ← see §iOS Caveat |
| `IntersectionObserver` v2 + `ResizeObserver` | Geometric / size events without scroll-event coupling | Universal |
| `visualViewport` API | Subscribe to keyboard / address-bar viewport changes independent of layout viewport | Universal |
| IndexedDB + structured clone | Persist message pages across sessions | Universal |

The Safari 18 ship of `content-visibility` is the unlock — before that, the only cross-browser way to keep a 10k-message DOM from being slow was virtualization. As of 2026, plain DOM + `content-visibility: auto` performs equivalently on the rendering side, without the anchor-drift class of bug.

---

## Proposal

### A. Container

Plain scroll container. No virtualization. No `<Virtuoso>`.

```tsx
<div
  ref={scrollerRef}
  className="message-scroller"
  style={{
    overflowY: "auto",
    overflowAnchor: "auto",            // browser-native anchoring (Chromium/FF)
    overscrollBehavior: "contain",     // no rubber-band-into-page-scroll
  }}
>
  <div ref={topSentinelRef} aria-hidden />        {/* IntersectionObserver lazy-load */}
  {messages.map((m) => (
    <MessageItem
      key={m.id}
      message={m}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 80px",   // stable placeholder
      }}
    />
  ))}
  <div ref={bottomSentinelRef} aria-hidden />
</div>
```

### B. Anchor Manager (JS, only the parts the browser doesn't do)

```ts
interface ScrollAnchor {
  messageId: string;
  offsetWithinMessage: number;  // px from top of the message element
}

function captureAnchor(scroller: HTMLElement): ScrollAnchor | null {
  // Find topmost message whose top-edge is ≤ scroller.scrollTop and bottom-edge > scrollTop
  // Return (id, scrollTop − messageElement.offsetTop)
}

function restoreAnchor(scroller: HTMLElement, anchor: ScrollAnchor): void {
  const el = scroller.querySelector(`[data-message-id="${anchor.messageId}"]`);
  if (!el) return;
  scroller.scrollTop = (el as HTMLElement).offsetTop + anchor.offsetWithinMessage;
}
```

Used:

1. **Around prepend** — capture before `setMessages`, restore after layout commit (`useLayoutEffect`)
2. **Around `visualViewport` resize** — capture on `resize` start, restore on end. Layout viewport resize: ignore (the browser re-anchors via `overflow-anchor` on Chromium/FF; for Safari, see §iOS Caveat)
3. **Never** — on append (handled by §C follow-state policy)
4. **Never** — on every scroll event (we are not running a parallel scroll engine)

### C. Follow State (unchanged from RFC-012 §First Principles 3)

```ts
const [isFollowingBottom, setIsFollowingBottom] = useState(true);

// Toggled ONLY by user gesture
useEffect(() => {
  const onScroll = (e: Event) => {
    const isAtBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 4;
    if (e.isTrusted) setIsFollowingBottom(isAtBottom);
  };
  scroller.addEventListener("scroll", onScroll, { passive: true });
  return () => scroller.removeEventListener("scroll", onScroll);
}, []);

// On new message append: if following, jump to bottom; otherwise leave alone
useLayoutEffect(() => {
  if (isFollowingBottom && newMessageAppended) {
    scroller.scrollTop = scroller.scrollHeight;
  }
}, [messages.length]);
```

`visualViewport` subscription is separate, independent of layout-resize, and never touches `isFollowingBottom`.

### D. Lazy Load (IntersectionObserver)

```ts
useEffect(() => {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === topSentinelRef.current) source.loadOlder();
        if (entry.target === bottomSentinelRef.current) source.loadNewer();
      }
    },
    { root: scrollerRef.current, rootMargin: "200px 0px" },  // 200px pre-trigger
  );
  if (topSentinelRef.current) io.observe(topSentinelRef.current);
  if (bottomSentinelRef.current) io.observe(bottomSentinelRef.current);
  return () => io.disconnect();
}, [source]);
```

Geometric, scroll-event-independent, will-not-drop-under-momentum.

### E. DOM Cap + IndexedDB Hydrate

`content-visibility: auto` makes offscreen items free to *render*, but the DOM nodes themselves still cost memory and parse time. Cap the in-DOM window.

```ts
const DOM_CAP = 1000;  // configurable, 500 above + 500 below current viewport

// When loading older: append to top, drop from bottom past cap (and vice versa)
// Dropped messages stay in the IndexedDB-backed source; re-hydrated on scroll back
```

Cold start hydrates the most-recent N messages from IndexedDB into the DOM *before* the network sync completes. First paint is content, not white. The "white → reflow cascade" half of the mobile flicker root cause goes away.

### F. Source: `useMessageTimelineSource(channelId)`

Identical to RFC-012 §B. The source layer doesn't change; only the rendering primitive does. Channels, DMs, and threads still all consume the same hook. ThreadPanel still gets to delete its local-state implementation.

---

## iOS Caveat (`overflow-anchor`)

Safari has not shipped `overflow-anchor` (still missing as of 2026-04). On iOS Safari and any iOS PWA running through WKWebView, the browser will NOT auto-anchor on prepend.

**Mitigation:** the JS anchor manager (§B) runs unconditionally — its work is a no-op on Chromium/Firefox (since the browser does the same thing first and our restore would write the same value the browser already wrote), and it does the actual work on Safari. Cost is one `getBoundingClientRect` + one `scrollTop` write per prepend, both cheap.

This is the *only* place the JS layer does what the browser would do for free. Everywhere else in this proposal, JS does only what no browser API exists for (anchor capture for `visualViewport`, follow-state policy, DOM cap, IndexedDB hydration).

If/when Safari ships `overflow-anchor`, the JS anchor manager becomes redundant on every browser and can be deleted. The contract is forward-compatible.

---

## What Goes Away

| Today | After |
|---|---|
| `<Virtuoso>` + `firstItemIndex` shift on prepend | Plain `<div>` scroller |
| `computeItemKey={(_, msg) => msg.id}` | React `key={msg.id}` (already what we'd write) |
| `alignToBottom` (PR #961) | Native scroll behavior + `isFollowingBottom` policy |
| `followOutput` with `prevFirstId / prevLastId` heuristic | §C follow policy (one boolean, gesture-only toggle) |
| `startReached` / `endReached` | `IntersectionObserver` on sentinels |
| `increaseViewportBy={200}` | `IntersectionObserver` `rootMargin: "200px 0px"` |
| Item height measurement on virtualization in/out | `contain-intrinsic-size` + browser layout cache (one measure when item enters DOM, retained until DOM eviction at the cap boundary) |
| `pendingBottomScrollRef` + multi-`useEffect` data-swap dance | Direct `scrollTop = scrollHeight` in §C, atomic with the data update |
| ChatPanel-vs-ThreadPanel divergence (RFC-012 §Current Divergence — 14-row table) | Single primitive renders both |

The Virtuoso dependency itself can be removed from `package.json`.

---

## Migration

Same shape as RFC-012, different cost profile:

1. **Build the primitive.** New `<MessageTimeline>` against the native stack. Cover with the e2e harness from `message-list-stability.spec.ts` plus the four-invariant tests RFC-012 §Migration listed. Add a CDP-touch-injection mobile-flicker test on iOS Safari emulation specifically.
2. **Migrate ThreadPanel first.** (Same as RFC-012.) Smaller surface, validates the source hook.
3. **Migrate ChatPanel.** (Same as RFC-012.) Quote-card permalink, transient focus, context-window, back-to-bottom flows are the highest-risk surface.
4. **Delete divergent code paths + drop Virtuoso.**

Each step is a separate PR. The harness gates regressions across migrations.

Cost-vs-RFC-012:

- **Less code to write** — no firstItemIndex / followOutput / alignToBottom / measurement-cache code (the browser does it). Estimated `MessageTimeline.tsx` ≈ 200 LoC (RFC-012 estimated 350) plus ~80 LoC anchor-manager utility.
- **More cross-browser care** — must verify behavior on iOS Safari, Android Chrome, desktop Safari/Firefox/Chrome. RFC-012's all-JS approach was uniform across browsers; this one leans on different native primitives per platform.
- **Mobile-first test harness needed** — must add real-device iOS Safari + Android Chrome runs to CI. This was nice-to-have for RFC-012; for RFC-013 it's load-bearing.

---

## Open Questions

1. **DOM cap value.** 500 above + 500 below is a guess. Real bound depends on average message height and target memory. Recommend: instrument in the harness with synthetic 10k-message channels, find the knee of the perf curve on a low-end Android device.

2. **`content-visibility: auto` interaction with focus.** When a user clicks a quote-card permalink that links to a message currently in `content-visibility: hidden` state, does the browser correctly bring it visible before scrolling? Behavior was inconsistent in early implementations; needs verification on current Chrome/Safari.

3. **DOM eviction strategy.** When dropping items past the cap on the side opposite scroll direction, do we drop one-by-one or in chunks? Chunks are cheaper but cause visible re-anchoring; one-by-one is smoother but more `useLayoutEffect` work. Recommend: drop in pages aligned with the source's pagination unit (e.g., 50-message pages).

4. **`overflow-anchor` Safari ship date.** If WebKit ships `overflow-anchor` mid-migration, the JS anchor manager (§B) becomes dead code on Safari too. Worth tracking; not a blocker.

5. **IndexedDB schema sharing with image cache (PR #1045 / task #3).** ApplePI just landed IndexedDB caching for lightbox attachment URLs. The message-list IndexedDB layer should share the same Dexie / idb-keyval foundation if possible — opens the door to one cache-eviction policy across both. Recommend: spike with ApplePI before locking in our schema.

---

## Out of Scope

Same as RFC-012:

- Server-side message API changes (the `mutation_log` / sync-cursor work in RFC-012 §3a/3b stays a separate track owned by Eric)
- Search results list
- Saved messages list
- Sidebar message previews

---

## Decision Requested

Approval to:

1. Repurpose task #4 (was: "Phase 2 — rewrite Virtuoso internals against four invariants") to "Phase 2 — replace Virtuoso with native-scroll primitive per RFC-013".
2. Treat #5 (lazy-load IO sentinel) and #7 (IndexedDB hydration) as integral parts of #4 rather than separate phases — the native-scroll primitive subsumes both.
3. Keep #6 (MessageItem unification) as-is; orthogonal.
