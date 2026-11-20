import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroupCount,
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

export function AvatarGroupButtonContent() {
  const [open, setOpen] = useState(false);
  // Opening a person closes the list; the app opens their profile here.
  const openPerson = useCallback(() => setOpen(false), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <AvatarGroupButton aria-label="Martin viewing, Bugen writing, Wug and 2 others read this version" />
        }
      >
        <Avatar size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
        <AvatarGroupCount size="xs">+2</AvatarGroupCount>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-[300px]" aria-label="Who's here">
        <PersonList>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <PersonListItemName>Martin</PersonListItemName>
            <PersonListItemStatus>viewing</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Bugen</PersonListItemName>
            <PersonListItemStatus>writing</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Wug</PersonListItemName>
            <PersonListItemStatus>read this version</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Atlas</PersonListItemName>
            <PersonListItemStatus>read this version</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Niko</PersonListItemName>
            <PersonListItemStatus>read this version</PersonListItemStatus>
          </PersonListItem>
        </PersonList>
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
export function AvatarGroupButtonComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <AvatarGroupButtonContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
