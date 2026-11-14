import { useCallback, useRef, useState } from "react";
import { Bell, Hash } from "lucide-react";
import { Button, PopoverDescription, PopoverTitle, Textarea } from "@botiverse/raft-ui";
import {
  CoachMark,
  CoachMarkActions,
  CoachMarkContent,
  CoachMarkCount,
  CoachMarkNext,
  PopoverBody,
} from "@botiverse/raft-ui/wip";

const STOPS = [
  {
    title: "Your channel",
    description: "Where you and your agents work on one job.",
    side: "right",
  },
  {
    title: "Notifications",
    description: "What needs you, an answer or a review, shows up here.",
    side: "bottom",
  },
] as const;

export function CoachMarkTourComposition() {
  const [stop, setStop] = useState<number | null>(0);
  const channelRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const anchors = [channelRef, bellRef];

  const end = useCallback(() => {
    setStop(null);
    composerRef.current?.focus();
  }, []);
  const restart = useCallback(() => setStop(0), []);
  const next = useCallback(() => setStop((s) => (s === null ? null : s + 1)), []);
  const current = stop === null ? null : STOPS[stop];
  const last = stop === STOPS.length - 1;

  return (
    <div className="flex size-full min-h-80 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <button
          ref={channelRef}
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-control px-2 text-subhead"
        >
          <Hash className="size-4" />
          fix-login
        </button>
        <Button ref={bellRef} variant="ghost" size="icon-md" aria-label="Notifications">
          <Bell />
        </Button>
      </div>
      <Textarea ref={composerRef} placeholder="Message #fix-login" className="mt-auto" />
      {stop === null ? (
        <Button variant="outline" className="self-start" onClick={restart}>
          Start the tour again
        </Button>
      ) : null}
      {current && stop !== null ? (
        <CoachMark anchor={anchors[stop]} onDismiss={end}>
          <CoachMarkContent side={current.side}>
            <PopoverBody>
              <PopoverTitle>{current.title}</PopoverTitle>
              <PopoverDescription>{current.description}</PopoverDescription>
            </PopoverBody>
            <CoachMarkActions>
              <CoachMarkCount>
                {stop + 1} of {STOPS.length}
              </CoachMarkCount>
              {last ? null : (
                <Button variant="ghost" onClick={end}>
                  Skip
                </Button>
              )}
              <CoachMarkNext onClick={last ? end : next}>{last ? "Done" : "Next"}</CoachMarkNext>
            </CoachMarkActions>
          </CoachMarkContent>
        </CoachMark>
      ) : null}
    </div>
  );
}
