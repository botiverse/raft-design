import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from "raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "./message-item.fixtures.ts";

type MessageItemExampleAvatarProps = {
  className?: string;
  fallback?: string;
  size?: AvatarProps["size"];
  type?: AvatarProps["type"];
};

export function MessageItemExampleAvatar({
  className,
  fallback = "AT",
  size = "sm",
  type = "agent",
}: MessageItemExampleAvatarProps) {
  return (
    <Avatar size={size} type={type} className={className}>
      <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
