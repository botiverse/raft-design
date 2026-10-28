import type { ReactNode } from "react";
import {
  AddCommentIcon,
  CreateTaskIcon,
  FollowArtifactIcon,
  FollowThreadIcon,
  JoinChannelIcon,
  JoinJointChannelIcon,
  JoinPrivateChannelIcon,
  LeaveChannelIcon,
  LeaveJointChannelIcon,
  LeavePrivateChannelIcon,
  ReopenTaskIcon,
  UnfollowArtifactIcon,
  UnfollowThreadIcon,
} from "@botiverse/raft-ui";

function IconGridItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-36 place-items-center border-r border-b border-line-hairline bg-layer-canvas px-3 py-10">
      {children}
      <span className="absolute inset-x-2 bottom-4 text-center text-xs font-medium text-foreground-hint">
        {label}
      </span>
    </div>
  );
}

export function ActionIconsComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-2 border-t border-l border-line-hairline sm:grid-flow-col sm:grid-cols-5 sm:grid-rows-2">
        <IconGridItem label="Follow thread">
          <FollowThreadIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Unfollow thread">
          <UnfollowThreadIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Follow Artifact">
          <FollowArtifactIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Unfollow Artifact">
          <UnfollowArtifactIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Join channel">
          <JoinChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Leave channel">
          <LeaveChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Join private channel">
          <JoinPrivateChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Leave private channel">
          <LeavePrivateChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Join joint channel">
          <JoinJointChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Leave joint channel">
          <LeaveJointChannelIcon className="size-4 text-foreground" />
        </IconGridItem>
      </div>
      <div className="grid grid-cols-3 border-t border-l border-line-hairline">
        <IconGridItem label="Add comment">
          <AddCommentIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Create task">
          <CreateTaskIcon className="size-4 text-foreground" />
        </IconGridItem>
        <IconGridItem label="Reopen task">
          <ReopenTaskIcon className="size-4 text-foreground" />
        </IconGridItem>
      </div>
    </div>
  );
}
