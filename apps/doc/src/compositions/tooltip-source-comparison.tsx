import type { ReactNode } from "react";
import { SmilePlus } from "lucide-react";

import { TooltipIconActionComposition } from "./tooltip/icon-action-composition.tsx";
import { TooltipReactionNamesComposition } from "./tooltip/reaction-names-composition.tsx";
import { TooltipStatusHintComposition } from "./tooltip/status-hint-composition.tsx";
import { TooltipTimestampDetailComposition } from "./tooltip/timestamp-detail-composition.tsx";

export const TOOLTIP_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  IconAction: "apps/doc/src/compositions/tooltip/icon-action-composition.tsx",
  ReactionNames: "apps/doc/src/compositions/tooltip/reaction-names-composition.tsx",
  StatusHint: "apps/doc/src/compositions/tooltip/status-hint-composition.tsx",
  TimestampDetail: "apps/doc/src/compositions/tooltip/timestamp-detail-composition.tsx",
} as const;

export const TOOLTIP_SOURCE_COMPARISON_COMPOSITION = {
  IconAction: TooltipIconActionComposition,
  ReactionNames: TooltipReactionNamesComposition,
  StatusHint: TooltipStatusHintComposition,
  TimestampDetail: TooltipTimestampDetailComposition,
} as const;

type TooltipSourcePreviewProps = {
  children: ReactNode;
  className?: string;
};

function TooltipSourcePreview({ children, className }: TooltipSourcePreviewProps) {
  return (
    <div
      className={["flex h-full min-h-44 w-full items-center justify-center px-3 py-10", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function TooltipIconActionSourcePreview({ className }: { className?: string }) {
  return (
    <TooltipSourcePreview className={className}>
      <div className="relative flex flex-col items-center gap-2">
        <button
          type="button"
          title="Add Reaction"
          aria-label="Add Reaction"
          className="flex size-6 items-center justify-center text-black/30 hover:text-black/70"
        >
          <SmilePlus size={13} strokeWidth={2} />
        </button>
        <div className="border-2 border-black bg-white px-2 py-1.5 text-xs font-bold text-black">
          Add Reaction
        </div>
      </div>
    </TooltipSourcePreview>
  );
}

export function TooltipStatusHintSourcePreview({ className }: { className?: string }) {
  return (
    <TooltipSourcePreview className={className}>
      <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
        <span
          title="Agent is thinking"
          className="inline-block size-2 rounded-full bg-brutal-yellow ring-2 ring-black"
        />
        Thinking
      </span>
    </TooltipSourcePreview>
  );
}

export function TooltipTimestampDetailSourcePreview({ className }: { className?: string }) {
  return (
    <TooltipSourcePreview className={className}>
      <span title="Jun 23, 2026, 09:30" className="font-mono text-xs font-medium text-black/50">
        Today at 09:30
      </span>
    </TooltipSourcePreview>
  );
}

export function TooltipReactionNamesSourcePreview({ className }: { className?: string }) {
  return (
    <TooltipSourcePreview className={className}>
      <div className="relative flex flex-col items-center gap-2">
        <button
          type="button"
          title="Alex, Cindy, Marco"
          aria-label="Thumbs up reaction from Alex, Cindy, and Marco"
          className="inline-flex h-5 items-center gap-1 rounded bg-[#EEEDE6] px-1.5 text-[12px] font-bold text-black"
        >
          <span aria-hidden>👍</span>
          <span>3</span>
        </button>
        <div
          role="tooltip"
          className="border-2 border-black bg-white px-2 py-1.5 text-xs font-bold text-black"
        >
          Alex, Cindy, Marco
        </div>
      </div>
    </TooltipSourcePreview>
  );
}

export const TOOLTIP_SOURCE_COMPARISON_SOURCE = {
  IconAction: TooltipIconActionSourcePreview,
  ReactionNames: TooltipReactionNamesSourcePreview,
  StatusHint: TooltipStatusHintSourcePreview,
  TimestampDetail: TooltipTimestampDetailSourcePreview,
} as const;
