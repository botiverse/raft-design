# Activity source reference

Frozen from `botiverse/slock` staging commit
`6cd65a094b0042612f67e467b0f729a59f3c34d8`.

Primary upstream implementation:

- `packages/web/src/components/thread/ThreadsInbox.tsx`
- `packages/web/src/components/thread/inboxChannelFilter.ts`
- `packages/web/src/components/thread/inboxContextMenuPosition.ts`
- `packages/web/src/store/inboxStore.ts`

`ActivityV2SourcePreview.tsx` is a frozen visual excerpt of Activity v2. It
preserves the represented source class contract for source comparison. Runtime
uses sibling native buttons for the row and its actions instead of retaining
the source's nested interactive markup; that accessibility repair is
pixel-neutral. Runtime code must not import from `packages/ui/source`.

The upstream store, transport, analytics, feature-flag, localStorage, routing,
and server behavior intentionally remain in the source application.
