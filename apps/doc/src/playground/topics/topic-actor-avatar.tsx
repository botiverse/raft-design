import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import type { AvatarProps } from "raft-ui";

import { getPlaygroundActor } from "../mock/index.ts";
import type { PlaygroundActorId } from "../mock/index.ts";

export function PlaygroundTopicActorAvatar({
  actorId,
  size,
}: {
  actorId: PlaygroundActorId;
  size: NonNullable<AvatarProps["size"]>;
}) {
  const actor = getPlaygroundActor(actorId);
  return (
    <Avatar size={size} type={actor.type === "agent" ? "agent" : "human"}>
      {actor.avatarSrc ? <AvatarImage alt="" src={actor.avatarSrc} /> : null}
      <AvatarFallback>{actor.fallback ?? actor.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
