import { useCallback, useRef, useState } from "react";
import { Bell, Hash } from "lucide-react";
import {
  Button,
  ListRow,
  ListRowBody,
  ListRowIcon,
  ListRowTitle,
  PopoverDescription,
  PopoverTitle,
  Textarea,
} from "@botiverse/raft-ui";
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
  const [stop, setStop] = useState<number | null>(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const channelRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const anchors = [channelRef, bellRef];

  const end = useCallback(() => {
    setStop(null);
    composerRef.current?.focus();
  }, []);
  const start = useCallback(() => setStop(0), []);
  const openChannel = useCallback(() => setChannelOpen(true), []);
  const check = useCallback(() => setChecked(true), []);
  const next = useCallback(() => setStop((s) => (s === null ? null : s + 1)), []);
  const current = stop === null ? null : STOPS[stop];
  const last = stop === STOPS.length - 1;

  return (
    <div className="flex size-full min-h-96 flex-col gap-4 p-6">
      <Button variant="outline" className="self-start" onClick={start} disabled={stop !== null}>
        Start the tour
      </Button>
      <div className="flex items-start justify-between gap-4">
        <div className="w-56">
          <ListRow
            cell
            ref={channelRef}
            selected={channelOpen}
            aria-current={channelOpen}
            onClick={openChannel}
          >
            <ListRowIcon>
              <Hash />
            </ListRowIcon>
            <ListRowBody>
              <ListRowTitle>fix-login</ListRowTitle>
            </ListRowBody>
          </ListRow>
        </div>
        <div className="flex items-center gap-2">
          {checked ? (
            <span className="text-footnote text-foreground-muted">Nothing needs you</span>
          ) : null}
          <Button
            ref={bellRef}
            variant="ghost"
            size="icon-md"
            aria-label="Notifications"
            onClick={check}
          >
            <Bell />
          </Button>
        </div>
      </div>
      <Textarea ref={composerRef} placeholder="Message #fix-login" className="mt-auto" />
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
