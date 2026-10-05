import { Link, useMatch } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "raft-ui";

import { PLAYGROUND_SERVER_SLUG } from "../mock/index.ts";

const SERVER_PARAMS = { serverSlug: PLAYGROUND_SERVER_SLUG };
const EMPTY_SEARCH = {};

export function PlaygroundConversationBackButton({ onBack }: { onBack?: () => void }) {
  const channelMatch = useMatch({
    from: "/playground/s/$serverSlug/channel/$channelId",
    shouldThrow: false,
  });
  const dmMatch = useMatch({
    from: "/playground/s/$serverSlug/dm/$dmId",
    shouldThrow: false,
  });
  if (!onBack && !channelMatch && !dmMatch) return null;

  return (
    <Button
      render={
        onBack ? undefined : (
          <Link to="/playground/s/$serverSlug" params={SERVER_PARAMS} search={EMPTY_SEARCH} />
        )
      }
      nativeButton={!onBack ? false : undefined}
      onClick={onBack}
      variant="outline"
      size="icon-sm"
      className="mr-1 max-md:self-center md:hidden"
      aria-label="Back to conversations"
    >
      <ChevronLeft aria-hidden />
    </Button>
  );
}
