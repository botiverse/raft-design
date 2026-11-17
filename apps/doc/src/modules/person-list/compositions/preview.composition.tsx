import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
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

export function PersonListPreviewContent() {
  const [open, setOpen] = useState(false);
  // Opening a person closes the list; the app opens their profile here.
  const openPerson = useCallback(() => setOpen(false), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <AvatarGroupButton aria-label="Martin viewing, Bugen writing, Wug read an earlier version" />
        }
      >
        <Avatar size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Avatar size="xs" type="agent" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-[300px]">
        <PopoverHeader>
          <PopoverTitle>Who's here</PopoverTitle>
        </PopoverHeader>
        <PersonList>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <PersonListItemName>Martin</PersonListItemName>
            <PersonListItemStatus>Viewing</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Bugen</PersonListItemName>
            <PersonListItemStatus>Writing</PersonListItemStatus>
          </PersonListItem>
          <PersonListItem onClick={openPerson}>
            <Avatar aria-hidden size="xs" type="agent" />
            <PersonListItemName>Wug</PersonListItemName>
            <PersonListItemStatus>Updated since</PersonListItemStatus>
            <PersonListItemStatus>2 hours ago</PersonListItemStatus>
          </PersonListItem>
        </PersonList>
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
export function PersonListPreviewComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <PersonListPreviewContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
