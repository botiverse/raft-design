import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@raft/ui";
import { SmilePlus } from "lucide-react";
import { useId } from "react";

import { TooltipComparisonPreview } from "./preview.tsx";

export function TooltipIconActionComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <TooltipComparisonPreview className={className}>
      {(portalRef) => (
        <Tooltip open triggerId={triggerId}>
          <TooltipTrigger
            id={triggerId}
            render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
          >
            <SmilePlus />
          </TooltipTrigger>
          <TooltipContent positionMethod="absolute" portalProps={{ container: portalRef }}>
            Add reaction
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipComparisonPreview>
  );
}
