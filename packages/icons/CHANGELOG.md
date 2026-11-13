## 0.1.1 (2026-11-12)

### Changed

- **`ArtifactIcon`'s page is drawn 2 wider** ([Icons › Anatomy](https://raft-design.botiverse.build/components/icons/)) ([#1210](https://github.com/botiverse/raft-design/pull/1210)). The page now runs from x 3 to 21 of the 24 grid instead of 4 to 20, at the same height; the folded corner moves with it and the `< >` is unchanged. `FollowArtifactIcon` and `UnfollowArtifactIcon` are drawn on the same wider page.
  - Why: Lucide's portrait page is 16 wide where the icons beside it in a rail or a menu (a monitor, people, a speech bubble) are 20, so at the same size it read one size smaller.
  - Affects: every place these icons show, at any size. Nothing to change in an app; an app that drew an Artifact with Lucide's `FileCode` should use `ArtifactIcon` so both show one page.
  - Docs: https://raft-design.botiverse.build/components/icons/

## 0.1.0 (2026-11-11)

### Added

- **`@botiverse/ricons`: the icons Raft draws itself, as a package of their own** ([Icons](https://raft-design.botiverse.build/components/icons/)). It holds the icons raft-ui exported until 0.94.0, with the same names, props types and drawings: `MessageIcon` (and `ChatIcon`, the same icon), `DirectMessageIcon`, `ThreadIcon`, `CommentIcon`, `FeedbackIcon`, `ArtifactIcon`, the twelve action icons (`FollowThreadIcon` to `ReopenTaskIcon`), and `ActionIconProps`, `ConversationIconProps` and `ObjectIconProps`. It depends only on React (`react@^19` as a peer); `ArtifactIcon` is drawn from Lucide's `file-code` and needs no `lucide-react`.
  - Why: the icons are drawings, not components, and an app or a page that uses no raft-ui component should be able to use them without raft-ui.
  - Affects: raft-ui no longer exports these icons; import them from `@botiverse/ricons` (raft-ui's CHANGELOG has the migration). The rule that draws `UnfollowArtifactIcon`'s minus heavier at 16px (`[data-icon-sizes]`) moves here too, as `@botiverse/ricons/styles.css`; raft-ui's `styles.css` imports it. An app that uses ricons without raft-ui imports that stylesheet itself; without it the icon keeps the plain minus at every size.
  - Docs: https://raft-design.botiverse.build/components/icons/
