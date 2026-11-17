import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Button,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Text,
} from "@botiverse/raft-ui";
import {
  PersonList,
  PersonListItem,
  PersonListItemContent,
  PersonListItemDescription,
  PersonListItemName,
} from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function PersonListWorkingNowContent() {
  const [open, setOpen] = useState(false);
  // Opening an agent closes the list; the app opens the agent's page here.
  const openAgent = useCallback(() => setOpen(false), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="md" aria-label="3 agents working" />}>
        <AvatarGroup aria-hidden>
          <Avatar size="xs" type="agent" />
          <Avatar size="xs" type="agent" />
          <Avatar size="xs" type="agent" />
        </AvatarGroup>
        <Text.Mono size="meta">3</Text.Mono>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px]">
        <PopoverHeader>
          <PopoverTitle>Working now</PopoverTitle>
        </PopoverHeader>
        <PersonList>
          <PersonListItem onClick={openAgent}>
            <Avatar aria-hidden size="sm" type="agent">
              <AvatarBadge presence="busy" />
            </Avatar>
            <PersonListItemContent>
              <PersonListItemName>Bugen</PersonListItemName>
              <PersonListItemDescription>Editing Flow.tsx · #25</PersonListItemDescription>
            </PersonListItemContent>
          </PersonListItem>
          <PersonListItem onClick={openAgent}>
            <Avatar aria-hidden size="sm" type="agent">
              <AvatarBadge presence="busy" />
            </Avatar>
            <PersonListItemContent>
              <PersonListItemName>Wug</PersonListItemName>
              <PersonListItemDescription>
                Drafting the release notes for 0.103 from the merged pull requests · #31
              </PersonListItemDescription>
            </PersonListItemContent>
          </PersonListItem>
          <PersonListItem onClick={openAgent}>
            <Avatar aria-hidden size="sm" type="agent">
              <AvatarBadge presence="busy" />
            </Avatar>
            <PersonListItemContent>
              <PersonListItemName>Atlas</PersonListItemName>
              <PersonListItemDescription>
                Running the browser tests for the sidebar, the search results and the Activity rows,
                one file at a time, then writing up which ones failed and why · #40
              </PersonListItemDescription>
            </PersonListItemContent>
          </PersonListItem>
        </PersonList>
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
export function PersonListWorkingNowComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <PersonListWorkingNowContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
