import type { PlaygroundActorId, PlaygroundMessageReaction } from "../mock/index.ts";

const PLAYGROUND_VIEWER_ACTOR_ID: PlaygroundActorId = "robin";

export function isPlaygroundReactionFromViewer(reaction: PlaygroundMessageReaction) {
  return reaction.reactorIds.includes(PLAYGROUND_VIEWER_ACTOR_ID);
}

export function togglePlaygroundMessageReaction(
  reactions: readonly PlaygroundMessageReaction[],
  emoji: string,
): readonly PlaygroundMessageReaction[] {
  const reaction = reactions.find((candidate) => candidate.emoji === emoji);
  if (!reaction) {
    return [...reactions, { emoji, count: 1, reactorIds: [PLAYGROUND_VIEWER_ACTOR_ID] }];
  }

  const reacted = isPlaygroundReactionFromViewer(reaction);
  if (reacted && reaction.count === 1) {
    return reactions.filter((candidate) => candidate.emoji !== emoji);
  }

  return reactions.map((candidate) =>
    candidate.emoji === emoji
      ? {
          ...candidate,
          count: candidate.count + (reacted ? -1 : 1),
          reactorIds: reacted
            ? candidate.reactorIds.filter((actorId) => actorId !== PLAYGROUND_VIEWER_ACTOR_ID)
            : [...candidate.reactorIds, PLAYGROUND_VIEWER_ACTOR_ID],
        }
      : candidate,
  );
}
