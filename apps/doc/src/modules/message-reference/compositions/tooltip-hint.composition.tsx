import { MessagesSquare } from "lucide-react";
import { useRef, type RefObject } from "react";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceTooltipHintComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  return (
    <div
      ref={portalRef}
      className="relative flex w-full items-center justify-center text-sm text-foreground-strong"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
              />
            }
          >
            <MessagesSquare ref={iconRef} />
            <MessageReferenceLabel>release-notes</MessageReferenceLabel>
          </TooltipTrigger>
          <TooltipContent
            anchor={iconRef}
            side="top"
            align="center"
            positionMethod="absolute"
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          >
            Thread
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
