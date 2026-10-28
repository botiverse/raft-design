import { FollowArtifactIcon, UnfollowArtifactIcon } from "@botiverse/raft-ui";

export function UnfollowArtifactSizesComposition() {
  return (
    <div className="grid grid-cols-[auto_repeat(3,3rem)] items-center gap-x-6 gap-y-4 text-foreground">
      {/* @docs-source-strip-start */}
      <span />
      <span className="text-center text-xs font-medium text-foreground-hint">16</span>
      <span className="text-center text-xs font-medium text-foreground-hint">20</span>
      <span className="text-center text-xs font-medium text-foreground-hint">24</span>
      <span className="text-xs font-medium text-foreground-hint">Follow Artifact</span>
      {/* @docs-source-strip-end */}
      <FollowArtifactIcon className="size-4 justify-self-center" />
      <FollowArtifactIcon className="size-5 justify-self-center" />
      <FollowArtifactIcon className="size-6 justify-self-center" />
      {/* @docs-source-strip-start */}
      <span className="text-xs font-medium text-foreground-hint">Unfollow Artifact</span>
      {/* @docs-source-strip-end */}
      <UnfollowArtifactIcon className="size-4 justify-self-center" />
      <UnfollowArtifactIcon className="size-5 justify-self-center" />
      <UnfollowArtifactIcon className="size-6 justify-self-center" />
    </div>
  );
}
