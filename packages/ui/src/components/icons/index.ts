// raft-ui's own icons live in @botiverse/ricons (packages/icons). raft-ui
// re-exports every one under the same name and type, in the same order, so an
// app that imports them from raft-ui keeps working; import them from
// @botiverse/ricons in new code. The re-exports go in a later breaking release.
export {
  AddCommentIcon,
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
} from "@botiverse/ricons";
export type { ActionIconProps } from "@botiverse/ricons";
export {
  ChatIcon,
  CommentIcon,
  DirectMessageIcon,
  FeedbackIcon,
  MessageIcon,
  ThreadIcon,
} from "@botiverse/ricons";
export type { ConversationIconProps } from "@botiverse/ricons";
export { ArtifactIcon } from "@botiverse/ricons";
export type { ObjectIconProps } from "@botiverse/ricons";
