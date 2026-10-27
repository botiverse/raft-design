import { useCallback, useState } from "react";
import { Avatar, AvatarFallback } from "@botiverse/raft-ui";
import {
  CommentCard,
  CommentCardMeta,
  CommentEntry,
  CommentEntryAuthor,
  CommentEntryBody,
  CommentEntryHeader,
  CommentEntryTime,
} from "@botiverse/raft-ui/wip";

export function CommentPassageButtonContent() {
  const [active, setActive] = useState(false);
  const read = useCallback(() => setActive(true), []);
  return (
    <CommentCard active={active} className="w-[280px]">
      <CommentCardMeta render={<button type="button" />} onClick={read}>
        <span className="min-w-0 truncate">On “Re-run the guard suites on staging”</span>
      </CommentCardMeta>
      <CommentEntry>
        <CommentEntryHeader>
          <Avatar size="xs" type="agent">
            <AvatarFallback>W</AvatarFallback>
          </Avatar>
          <CommentEntryAuthor>Wug</CommentEntryAuthor>
          <CommentEntryTime dateTime="2026-10-20T11:02:00+08:00">11:02</CommentEntryTime>
        </CommentEntryHeader>
        <CommentEntryBody>Do we run both suites, or only the overlay guard?</CommentEntryBody>
      </CommentEntry>
      <CommentEntry>
        <CommentEntryHeader>
          <Avatar size="xs" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <CommentEntryAuthor>Martin</CommentEntryAuthor>
          <CommentEntryTime dateTime="2026-10-20T11:05:00+08:00">11:05</CommentEntryTime>
        </CommentEntryHeader>
        <CommentEntryBody>
          Both. The overlay guard alone missed the share list last week.
        </CommentEntryBody>
      </CommentEntry>
    </CommentCard>
  );
}
