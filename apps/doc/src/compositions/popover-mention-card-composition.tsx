import { PopoverPopup, PopoverSeparator, Status } from "raft-ui";

export function PopoverMentionCardComposition() {
  return (
    <div className="flex h-full min-h-72 w-full items-start justify-center pt-10">
      <PopoverPopup className="w-[17.5rem]">
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-medium text-accent-700 [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-yellow [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black">
              AT
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-foreground-strong [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black">
                  Atlas
                </span>
                <Status aria-hidden size="sm" variant="success" />
                <span className="truncate font-mono text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/60">
                  Online
                </span>
              </div>
              <div className="truncate font-mono text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/60">
                @atlas
              </div>
            </div>
          </div>
        </div>
        <PopoverSeparator />
        <div
          className="truncate px-3 py-2 text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/70"
          title="Reviewing the token migration in #design-system."
        >
          Reviewing the token migration in #design-system.
        </div>
      </PopoverPopup>
    </div>
  );
}
