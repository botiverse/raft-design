import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { PLAYGROUND_SERVER_SLUG, type PlaygroundChannelRecord } from "./mock/index.ts";
import type { PlaygroundChannelSearch } from "./playground-search.ts";

type PlaygroundConversationLinkProps = Omit<ComponentProps<"a">, "href"> & {
  conversation: PlaygroundChannelRecord;
  search?: PlaygroundChannelSearch;
};

export function PlaygroundConversationLink({
  conversation,
  search = {},
  ...props
}: PlaygroundConversationLinkProps) {
  return conversation.kind === "dm" ? (
    <Link
      {...props}
      to="/playground/s/$serverSlug/dm/$dmId"
      params={{ dmId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG }}
      search={search}
    />
  ) : (
    <Link
      {...props}
      to="/playground/s/$serverSlug/channel/$channelId"
      params={{ channelId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG }}
      search={search}
    />
  );
}
