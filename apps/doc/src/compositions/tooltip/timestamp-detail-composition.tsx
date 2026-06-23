import { Tooltip, TooltipContent, TooltipTrigger } from "@raft/ui";
import { useId } from "react";

import { TooltipComparisonPreview } from "./preview.tsx";

export function TooltipTimestampDetailComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <TooltipComparisonPreview className={className}>
      {(portalRef) => (
        <Tooltip open triggerId={triggerId}>
          <TooltipTrigger
            id={triggerId}
            render={
              <time
                dateTime="2026-06-23T09:30:00+08:00"
                tabIndex={0}
                className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
              />
            }
          >
            Today at 09:30
          </TooltipTrigger>
          <TooltipContent positionMethod="absolute" portalProps={{ container: portalRef }}>
            Jun 23, 2026, 09:30
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipComparisonPreview>
  );
}
