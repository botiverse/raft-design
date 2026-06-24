import { Status, Tooltip, TooltipContent, TooltipTrigger } from "cuvii-rui";
import { useId } from "react";

import { TooltipComparisonPreview } from "./preview.tsx";

export function TooltipStatusHintComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <TooltipComparisonPreview className={className}>
      {(portalRef) => (
        <Tooltip open triggerId={triggerId}>
          <TooltipTrigger
            id={triggerId}
            render={
              <span
                tabIndex={0}
                aria-label="Agent is thinking"
                className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
              />
            }
          >
            <Status variant="primary" pulse aria-hidden />
            Thinking
          </TooltipTrigger>
          <TooltipContent positionMethod="absolute" portalProps={{ container: portalRef }}>
            Agent is thinking
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipComparisonPreview>
  );
}
