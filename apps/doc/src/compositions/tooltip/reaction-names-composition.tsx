import { Tooltip, TooltipContent, TooltipTrigger } from "raft-ui";
import { useId } from "react";

import { TooltipComparisonPreview } from "./preview.tsx";

export function TooltipReactionNamesComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <TooltipComparisonPreview className={className}>
      {(portalRef) => (
        <Tooltip open triggerId={triggerId}>
          <TooltipTrigger
            id={triggerId}
            render={
              <button
                type="button"
                className="inline-flex h-6 items-center gap-1 rounded bg-layer-muted px-2 text-xs font-medium text-foreground-strong outline-none hover:bg-layer-panel focus-visible:ring-2 focus-visible:ring-line-focus"
                aria-label="Thumbs up reaction from Alex, Cindy, and Marco"
              />
            }
          >
            <span aria-hidden>👍</span>
            <span>3</span>
          </TooltipTrigger>
          <TooltipContent positionMethod="absolute" portalProps={{ container: portalRef }}>
            Alex, Cindy, Marco
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipComparisonPreview>
  );
}
