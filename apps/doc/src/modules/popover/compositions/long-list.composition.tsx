import {
  Avatar,
  AvatarFallback,
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "@botiverse/raft-ui";
import { PopoverBody } from "@botiverse/raft-ui/wip";
import { X } from "lucide-react";

// @docs-source-strip-start
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CompositionPreview } from "#/components/composition-preview.tsx";
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.popover.long-list" });
// @docs-source-strip-end

const READERS = [
  ["Martin", "2m ago"],
  ["Bugen", "5m ago"],
  ["Wug", "12m ago"],
  ["Atlas", "20m ago"],
  ["Niko", "34m ago"],
  ["Lagoon", "1h ago"],
  ["Artea", "1h ago"],
  ["Scout", "2h ago"],
  ["Hasaki", "3h ago"],
  ["Maple", "3h ago"],
  ["Jasper", "4h ago"],
  ["Pika", "5h ago"],
  ["Ottie", "6h ago"],
  ["Noel", "Yesterday"],
  ["Sprout", "Yesterday"],
  ["Kirby", "2 days ago"],
] as const;

function ReadByParts() {
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>Read by 16</PopoverTitle>
        <PopoverClose aria-label="Close">
          <X />
        </PopoverClose>
      </PopoverHeader>
      <PopoverSeparator />
      <PopoverBody role="region" aria-label="Readers">
        <ul className="m-0 flex flex-col gap-3 p-0">
          {READERS.map(([name, when]) => (
            <li key={name} className="flex items-center gap-2.5 text-callout">
              <Avatar size="xs" type="human">
                <AvatarFallback>{name[0]}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate font-semibold">{name}</span>
              <span className="text-footnote text-foreground-hint">{when}</span>
            </li>
          ))}
        </ul>
      </PopoverBody>
    </>
  );
}

export function LongListContent() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Read by 16</PopoverTrigger>
      <PopoverContent className="w-72" aria-label="Read by">
        <ReadByParts />
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
/**
 * The canvas shows the popover open inside a box 320px tall, its collision
 * boundary: the box is the room it has, so its body scrolls under a header
 * that stays.
 */
export function LongListComposition({ className }: { className?: string }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  return (
    <CompositionPreview className={className}>
      <div ref={setBox} className="relative flex size-80 items-start justify-center pt-4">
        {box ? <OpenReadBy box={box} /> : null}
      </div>
    </CompositionPreview>
  );
}

function OpenReadBy({ box }: { box: HTMLElement }): ReactNode {
  const portalProps = useMemo(() => ({ container: box }), [box]);
  return (
    <Popover open>
      <PopoverTrigger render={<Button variant="outline" />}>Read by 16</PopoverTrigger>
      <PopoverContent
        className="w-72"
        aria-label="Read by"
        collisionBoundary={box}
        collisionPadding={0}
        initialFocus={false}
        finalFocus={false}
        portalProps={portalProps}
      >
        <ReadByParts />
      </PopoverContent>
    </Popover>
  );
}
// @docs-source-strip-end
