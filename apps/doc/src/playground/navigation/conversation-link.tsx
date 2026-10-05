import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ComponentProps } from "react";

import { PLAYGROUND_SERVER_SLUG } from "../mock/index.ts";
import type { PlaygroundChannelRecord } from "../mock/index.ts";
import type { PlaygroundChannelSearch } from "./playground-search.ts";

const EMPTY_SEARCH: PlaygroundChannelSearch = {};

type PlaygroundConversationLinkProps = Omit<ComponentProps<"a">, "href"> & {
  conversation: PlaygroundChannelRecord;
  hash?: string;
  search?: PlaygroundChannelSearch;
};

export function PlaygroundConversationLink({
  conversation,
  hash,
  search = EMPTY_SEARCH,
  ...props
}: PlaygroundConversationLinkProps) {
  const dmParams = useMemo(
    () => ({ dmId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG }),
    [conversation.id],
  );
  const channelParams = useMemo(
    () => ({ channelId: conversation.id, serverSlug: PLAYGROUND_SERVER_SLUG }),
    [conversation.id],
  );

  return conversation.kind === "dm" ? (
    <Link
      {...props}
      to="/playground/s/$serverSlug/dm/$dmId"
      params={dmParams}
      search={search}
      hash={hash}
    />
  ) : (
    <Link
      {...props}
      to="/playground/s/$serverSlug/channel/$channelId"
      params={channelParams}
      search={search}
      hash={hash}
    />
  );
}
