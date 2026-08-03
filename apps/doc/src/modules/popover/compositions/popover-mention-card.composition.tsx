import { Avatar, AvatarFallback, PopoverPopup, PopoverSeparator, Status } from "raft-ui";

export function PopoverMentionCardComposition() {
  return (
    <div className="flex h-full min-h-72 w-full items-start justify-center pt-8">
      <details open className="grid w-[20rem] justify-items-start gap-2">
        <summary className="m-0 block max-w-full list-none text-sm leading-6 text-foreground-strong outline-none marker:hidden focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong [[data-theme=brutal]_&]:text-black [&::-webkit-details-marker]:hidden">
          <span>Follow up with </span>
          <span className="cursor-default select-text font-bold text-foreground underline decoration-foreground-strong/30 decoration-2 underline-offset-2 hover:text-accent-600 hover:decoration-accent-600 [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:decoration-black/30 [[data-theme=brutal]_&]:hover:text-brutal-pink [[data-theme=brutal]_&]:hover:decoration-brutal-pink">
            @Atlas
          </span>
          <span> about the token migration.</span>
        </summary>
        <div className="ml-16 w-[17.5rem]">
          <PopoverPopup>
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-start gap-3">
                <Avatar size="lg" type="agent">
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-foreground [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black">
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
      </details>
    </div>
  );
}
