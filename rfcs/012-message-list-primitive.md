# RFC-012: Unified MessageList Primitive

**Status:** Draft
**Date:** 2026-04-21
**Author:** Bugen
**Track:** #proj-message-list task #2

---

## Problem

Three product surfaces show "a chronologically ordered, virtualized, real-time-updated list of messages":

| Surface | Today's component | Backing state |
|---------|-------------------|---------------|
| Channel | `ChatPanel.tsx` (824 LoC) | Zustand `messageStore` (centralized cache, multi-channel) |
| DM | `ChatPanel.tsx` (same) | Zustand `messageStore` (same) |
| Thread | `ThreadPanel.tsx` (752 LoC) | Local `useState<Message[]>` inside the component |

Channel and DM share `ChatPanel`. Thread is a re-implementation of the same contract with different state, different Virtuoso configuration, different lazy-load logic, and a different `followOutput` heuristic.

Symptoms reported in the parent task:

1. **Mobile flicker** during continuous scroll
2. **Snap-back-to-bottom** when the soft keyboard / address bar collapses the visual viewport
3. **Lazy-load drops** — `startReached` sometimes doesn't fire under fast scroll

These are symptoms of an architectural problem, not three independent bugs. Bug fixes that ship to `ChatPanel` (e.g., the recent `alignToBottom` fix in PR #961, the `firstItemIndex` shift on prepend, the `prevFirstId / prevLastId` follow-output guard) are not picked up by `ThreadPanel`. The reverse is also true. Each surface accumulates fixes the other doesn't have, and the bugs differ subtly between them.

The right fix is a single primitive that owns the contract.

---

## First Principles

The four invariants the message-list contract must satisfy. These are derived from how chat-style anchored lists work in iMessage / Telegram / Discord / Slack / Linear, not from what we currently do.

### 1. Anchor invariance

The user's perceived position is a **(message, offset-within-message)** tuple, not `scrollTop=N`. Any mutation — append, prepend, resize, height re-measure, virtualization window shift, channel switch — must preserve the anchor's pixel position relative to the viewport.

`scrollTop` is derived from the anchor, not the other way around. Today's implementation derives the anchor from `scrollTop`, which is why every height-changing event causes drift.

### 2. Measure once, reuse forever

A message's rendered height should be measured exactly once during its lifetime in the list, and reused across virtualization in/out, re-render, and prepend events. Today, when the virtualization window slides past an item it unmounts and re-measures on re-entry, and the estimate-vs-actual swap is the visible flicker.

A message-id-keyed `heightCache` is sufficient. The same cache can be persisted to IndexedDB to survive cross-session reloads (this fits naturally with the client-side caching question already on the table).

### 3. Conditional follow ≠ scroll-to-bottom

"User is at the bottom and a new message arrives → keep them at the bottom" is a different operation from "force the scroll position to the bottom". The first is conditional on a single boolean (`isFollowingBottom`). The second is an imperative action.

`isFollowingBottom` should be **toggled only by user gesture** (scrolling up sets it `false`; scrolling back to bottom sets it `true`). Resize, append, prepend, focus-jump, channel-switch must NOT toggle it. Today, `followOutput` re-evaluates on every data change, including resize-induced ones, which is what causes the mobile keyboard pop to snap back to bottom.

`visualViewport` (mobile keyboard, address bar) should be subscribed separately from the layout-viewport resize handler, and should only trigger an anchor recomputation, never a follow-state change.

### 3a. Server `message:new` arrival order ≠ `seq` order

A finding from the API stress pass (Eric, 2026-04-21): under concurrent
writes (e.g. 30 parallel `POST /api/messages`), `BIGSERIAL` allocates `seq`
strictly monotonically, but `messageService.broadcastAndDeliver` has two
`await`s between `createMessage` and `emitPersistedMessageToFrontend`, so
two in-flight invocations can interleave their microtasks and emit out of
seq order. 30-way burst showed 7 inversions (e.g. seq 248 emitted before
seq 239).

Today's `messageStore.addMessage` consumes safely because it
`sortBySeq([...bucket, message])` on every insert (`messageStore.ts:632`),
and ThreadPanel's local state does the same via `mergeThreadMessages`
(`ThreadPanel.tsx:23,250`). The new primitive's source must keep this
invariant: **consumers must sort by `seq`; socket arrival order is not
authoritative.** This is also a load-bearing reason the RFC's
`MessageTimelineSource.messages` array is described as "chronologically
ordered" rather than "in arrival order".

### 3b. Sync protocol must be commit-order, not seq-order

A more dangerous variant of 3a, surfaced by Eric in the parallel API stress
pass (msg 38929462, 2026-04-21). `BIGSERIAL` allocates `seq` at INSERT
time, but the row only becomes visible to other transactions at COMMIT.
The sync endpoint (`messageService.ts:684`) selects with
`gt(messages.seq, sinceSeq)` against currently-visible rows. The race:

1. Tx-A inserts message, gets `seq=101`, has not yet committed.
2. Tx-B inserts message, gets `seq=102`, commits immediately.
3. A reconnecting client calls `sync?since=100`, sees row 102 only (101
   is still invisible to its snapshot).
4. Tx-A commits. Server emits `message:new` for `seq=101` over socket.
5. The client has already advanced its sync cursor to 102 because that's
   the highest seq returned in step 3. If it later treats `seq=101 <
   cursor` as "already have", **`seq=101` is silently dropped on the
   floor**.

Unlike 3a (broadcast reorder, fixable by client-side sort) this is a
**permanent message loss** path, because the consumer protocol uses
"highest seq seen" as the cursor and never revisits gaps below it.

The window is small in single-replica local dev (microseconds between
commit and visibility), but on Fly multi-replica with cross-replica
commit order non-determinism, the window is observably wider. Eric's
round-2 will produce a `pg_advisory_lock`-driven minimal repro locally.

**Implication for the primitive.** This is NOT a property the rendering
primitive can fix — it's a server-side data contract problem. But the
primitive's source (`useMessageTimelineSource`) must:

- Treat reconnect / gap-sync as the explicit re-sync path, distinct from
  socket arrival.
- Track a "sync cursor" separate from "highest seq seen" — the cursor
  should only advance to a value the server confirms is gap-free.
- Reconcile against a server-side authoritative ordering that is **not**
  `messages.seq`. Two candidate fixes (to be detailed in a follow-up RFC
  by the API track):
  - **`mutation_log` table** written in the same transaction as the
    message INSERT, indexed by commit-order LSN or a strictly-monotonic
    counter assigned at COMMIT (not at INSERT). Sync reads this table.
  - **Snapshot-aware filter** like `xmin < pg_snapshot_xmin()` to skip
    rows that may still be invisible to concurrent snapshots. Hacky and
    relies on Postgres MVCC internals; mentioned for completeness.

This RFC takes the position that `mutation_log` is the cleaner long-term
fix and the primitive's source should be designed assuming it exists,
even if the migration ships in a later iteration.

**Acceptance criterion.** Eric's `scripts/stress-gap-sync.ts` produces a
deterministic two-Postgres-client repro of the race (msg d189b5af,
2026-04-21). It exits 1 while the bug exists and exits 0 when fixed.
The unify work in this RFC must, at completion, leave the gap-sync
script exiting 0 — either via the server-side `mutation_log` fix landing
in parallel, or via the primitive's source treating the gap-sync window
as a re-fetch cue that revisits the unsafe seq range.

### 4. Lazy-load via geometric sentinel, not scroll callback

`startReached` / `endReached` are scroll-event-derived. Under fast scroll bursts the browser coalesces intermediate positions, and the trigger threshold may be crossed without a `scroll` event firing inside the threshold band.

`IntersectionObserver` on a sentinel `<div>` at the top/bottom of the rendered window is a **geometric fact** — the browser fires the callback whenever the sentinel intersects the viewport, regardless of how the intersection happened. This is the standard pattern for reliable infinite scroll and is what every modern messenger uses.

---

## Current Divergence

A literal diff of the two Virtuoso configurations + state stacks:

| Aspect | ChatPanel | ThreadPanel |
|--------|-----------|-------------|
| State location | Zustand `messageStore` | Local `useState` inside the panel |
| Multi-instance cache | yes (per channelId) | no (only one open thread at a time) |
| `firstItemIndex` | `useState`, decremented in `useLayoutEffect` on prepend | Inline expression `1_000_000 - messages.length`, recomputed every render |
| `alignToBottom` | yes (PR #961) | no |
| `computeItemKey` | `(_, msg) => msg.id` | default (virtual index) — items remount on prepend |
| Overscan | `increaseViewportBy={200}` | `overscan={200}` (legacy prop) |
| `followOutput` | tracks `prevFirstId` + `prevLastId` to distinguish append vs prepend vs context-jump | `(isAtBottom) => isAtBottom \|\| isNearBottomRef \|\| willSendRef ? "auto" : false` |
| Channel/thread switch reset | 6+ refs reset in `useEffect` | local state cleared, refs reset in cleanup |
| Lazy load up | `startReached` → `loadOlderMessages` (store) | `startReached` → local `loadOlderMessages` (`api.get` directly) |
| Lazy load down | `endReached` → `loadNewerMessages` (store) | `endReached` → local `loadNewerMessages` |
| Context-window load | `loadMessageContext` (store) | inline `api.get('/messages/context/...')` |
| Bottom-button flow | `pendingBottomScrollRef` + `useEffect` waits for store data swap | `scrollToBottom` direct call |
| Quote-card permalink | yes (`focusMessageId` from query) | no (focus from store `focusedMessageId`) |
| `historyLimited` plan banner | yes | no |
| Unread / new-message counter | reads from `messageStore.unreadCounts` | local `newMessageCount` state |
| Server unread sync | yes (`setNearBottom` updates server unread) | no |
| By-seq sort on insert | `sortBySeq` in `messageStore.ts:632` | `sortThreadMessages` + `mergeThreadMessages` in `ThreadPanel.tsx:23,50` (local copy) |

Items in the right column of the table are **places where the bug fixes / features that landed in ChatPanel never made it to ThreadPanel**, and vice versa. The reverse is also true: the simpler `followOutput` in ThreadPanel may turn out to be the correct one and ChatPanel's elaborate prevId tracking may be working around the wrong thing — we'd never know without unifying.

---

## Proposal

### A. Primitive: `<MessageTimeline>`

A single, framework-agnostic component that owns the rendering, virtualization, anchor management, follow-state, and lazy-load triggers. It does NOT own the data — it consumes a `source`.

```tsx
type MessageTimelineSource = {
  messages: Message[];
  hasOlder: boolean;
  hasNewer: boolean;
  loading: boolean;
  loadOlder: () => Promise<void>;
  loadNewer: () => Promise<void>;
  // Optional: focus a specific message on mount, used by permalinks /
  // context windows. Setting this AFTER mount is a noop — focus is a one-shot
  // initialization input, not a controlled state.
  initialFocusMessageId?: string;
};

type MessageTimelineHandle = {
  scrollToBottom: (opts?: { smooth?: boolean }) => void;
  scrollToMessage: (id: string, opts?: { smooth?: boolean }) => void;
  // Read-only state surfaced for the surrounding chrome (Back-to-bottom button,
  // unread counter, etc.). These derive from the timeline's internal state and
  // never round-trip through the consumer.
  isAtBottom: boolean;
  isFollowingBottom: boolean;
};

<MessageTimeline
  source={source}
  renderItem={(msg) => <MessageItem message={msg} ... />}
  header={<HistoryTopState ... />}
  footer={<div className="h-3" />}
  onAtBottomChange={(atBottom) => { /* persist to unread store */ }}
  handleRef={timelineRef}
/>
```

The primitive encapsulates:

- Virtuoso wiring (or a hand-rolled bottom-up virtualized list — see "Open question 1")
- `firstItemIndex` shift on prepend
- `computeItemKey` by `msg.id`
- `alignToBottom`
- `followOutput` evaluation that respects principle 3
- `IntersectionObserver` sentinels at top/bottom for principle 4
- `visualViewport` subscription separate from layout resize for principle 3
- `heightCache` keyed by `msg.id` for principle 2

### B. Source: `useMessageTimelineSource(channelId)`

A single hook that returns a `MessageTimelineSource` for any channel-shaped resource. Channels, DMs, and threads are all "channels" to the data layer (a thread is a channel with a parent message). The hook backs onto a unified Zustand store that today's `messageStore` becomes after we delete the inline duplication in `ThreadPanel`.

```ts
function useMessageTimelineSource(channelId: string): MessageTimelineSource;
```

Today's flows that use `messageStore` directly (`ChatPanel`) remain unchanged behind this hook. ThreadPanel's local-state implementation gets deleted and replaced with `useMessageTimelineSource(threadChannelId)`.

This naturally accommodates the IndexedDB caching layer (the other open question on this thread): the cache becomes a layer inside the source hook, transparent to consumers.

### C. Surface = chrome only

`ChatPanel` and `ThreadPanel` shrink dramatically. They become surface chrome (header, members panel, message input, task board toggle for ChatPanel; parent-message rendering, resize handle, follow-thread for ThreadPanel) wrapped around `<MessageTimeline source={source} ... />`. All Virtuoso config, all anchor logic, all follow-state logic moves into the primitive.

Estimated size after migration: ChatPanel ≈ 400 LoC (down from 824), ThreadPanel ≈ 350 LoC (down from 752), `MessageTimeline.tsx` ≈ 350 LoC, `useMessageTimelineSource.ts` ≈ 150 LoC. Net: roughly the same total LoC, but the contract lives in one place instead of two-and-divergent.

---

## Migration

1. **Build the primitive in isolation.** New files, no callers yet. Cover with the e2e harness from this branch (`message-list-stability.spec.ts`) plus new tests for the four invariants — including a CDP-touch-injection test for momentum-scroll flicker, since synthetic `setViewportSize` is too clean to repro the real failure mode.
2. **Migrate ThreadPanel first.** Smaller surface, simpler state coupling, fewer feature interactions. Validates the source hook against a non-channel channelId.
3. **Migrate ChatPanel.** Carefully port the quote-card permalink, transient focus, context-window, and back-to-bottom flows. These are the highest-risk surface.
4. **Delete the divergent code paths.** `ThreadPanel` no longer reads/writes its local message state; `messageStore` becomes the single source of truth.

Each step is a separate PR. The harness gates regressions across migrations.

---

## Open Questions

1. **Virtuoso vs hand-rolled.** Virtuoso is a generic list library; we are patching its abstractions to fit chat-shaped requirements (anchored bottom-up, bidirectional pagination, mobile viewport coupling, persistent height cache). The patches have grown to the point where it's worth asking whether a small purpose-built virtualizer would be less code and less surprising. Cost estimate: ~600 LoC for a minimal bottom-up virtualizer with the four invariants baked in. Recommend: build the primitive against Virtuoso first, switch the implementation later if the patch surface keeps growing.

2. **Lazy-load mechanism.** `IntersectionObserver` sentinels are theoretically more reliable than `startReached`. But Virtuoso's `startReached` is well-tuned and may be sufficient if we can prove it doesn't drop under fast scroll. Recommend: instrument both, A/B in the harness.

3. **`visualViewport` handling.** Where in the React tree should the `visualViewport` subscription live? Two options: (a) inside `MessageTimeline` (couples viewport to the list — fine if only the list cares); (b) at app root in a context (other surfaces — input bar, modals — also need to react). Recommend: app-level context, list subscribes via the context.

4. **Persistence of `heightCache`.** In-memory only is enough for principle 2. IndexedDB-persisted (the open caching question from this thread) saves cold-start measure-cost on second visit. Recommend: ship in-memory first, layer IndexedDB in a follow-up keyed by the same `(channelId, msgId)` tuple as the message cache.

---

## Out of scope

- Server-side message API changes
- Search results list (different shape — not chronological-anchored)
- Saved messages list (different shape — flat, no virtualization needed)
- Sidebar message previews (one-line cards, not a timeline)
