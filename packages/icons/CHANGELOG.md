## Unreleased

### Added

- **`@botiverse/ricons`: the icons Raft draws itself, as a package of their own** ([Icons](https://raft-design.botiverse.build/components/icons/)). It holds the icons raft-ui exported until now, with the same names, props types and drawings: `MessageIcon` (and `ChatIcon`, the same icon), `DirectMessageIcon`, `ThreadIcon`, `CommentIcon`, `FeedbackIcon`, `ArtifactIcon`, the twelve action icons (`FollowThreadIcon` to `ReopenTaskIcon`), and `ActionIconProps`, `ConversationIconProps` and `ObjectIconProps`. It depends only on React (`react@^19` as a peer); `ArtifactIcon` is drawn from Lucide's `file-code` and needs no `lucide-react`.
  - Why: the icons are drawings, not components, and an app or a page that uses no raft-ui component should be able to use them without raft-ui (Artea, #proj-raft-ui:#236).
  - Affects: nothing changes for an app that imports the icons from `@botiverse/raft-ui`, which re-exports them. `UnfollowArtifactIcon` now carries its 16px minus rule in a `<style>` of its own, so it swaps at 16px without raft-ui's stylesheet; where a Content-Security-Policy blocks inline styles it keeps the plain minus.
  - Docs: https://raft-design.botiverse.build/components/icons/
