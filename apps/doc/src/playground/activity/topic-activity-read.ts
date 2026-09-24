import type { PlaygroundTopic, PlaygroundTopicActivity } from "../mock/index.ts";

/** A topic activity is unread while the reply it points at is among the topic's unread replies. */
export function isTopicActivityUnread(
  activity: PlaygroundTopicActivity,
  topic: PlaygroundTopic | undefined,
) {
  if (!topic) return false;
  if (topic.unread) return true;
  if (activity.kind === "resolved") return false;
  const index = topic.replies.findIndex((reply) => reply.id === activity.replyId);
  return index >= 0 && index >= topic.replies.length - topic.unreadReplyCount;
}
