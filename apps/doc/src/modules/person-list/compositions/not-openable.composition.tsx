import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@botiverse/raft-ui";
import {
  AvatarGroupButton,
  PersonList,
  PersonListItem,
  PersonListItemName,
  PersonListItemStatus,
} from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function PersonListNotOpenableContent() {
  const [open, setOpen] = useState(false);
  // Opening a person closes the list; the app opens their profile here.
  const openPerson = useCallback(() => setOpen(false), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<AvatarGroupButton aria-label="Martin viewing, Atlas read it yesterday" />}
      >
        <Avatar size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-[300px]" aria-label="Who's here">
        <PersonList>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <PersonListItemName>Martin</PersonListItemName>
            <PersonListItemStatus>Viewing</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem interactive={false}>
            <Avatar aria-hidden size="xs" type="agent" className="opacity-dimmed grayscale" />
            <PersonListItemName>Atlas</PersonListItemName>
            <PersonListItemStatus>Deleted</PersonListItemStatus>
            <PersonListItemStatus>Yesterday</PersonListItemStatus>
          </PersonListItem>
        </PersonList>
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
export function PersonListNotOpenableComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <PersonListNotOpenableContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
