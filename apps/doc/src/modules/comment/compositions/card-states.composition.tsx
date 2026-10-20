import { MessageSquare, TextSearch } from "lucide-react";
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

export function CommentCardStatesContent() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-6">
      <CommentCard className="w-[280px]">
        <CommentEntry>
          <CommentEntryHeader>
            <Avatar size="xs" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <CommentEntryAuthor>Martin</CommentEntryAuthor>
            <CommentEntryTime dateTime="2026-10-20T10:53:00+08:00">10:53</CommentEntryTime>
          </CommentEntryHeader>
          <CommentEntryBody clamp>
            Can we link the rollback runbook from this step? Whoever runs it will want it open, and
            the old wiki page is out of date.
          </CommentEntryBody>
        </CommentEntry>
        <CommentCardMeta>
          <MessageSquare aria-hidden />2 replies
        </CommentCardMeta>
      </CommentCard>

      <CommentCard active className="w-[280px]">
        <CommentEntry>
          <CommentEntryHeader>
            <Avatar size="xs" type="agent">
              <AvatarFallback>W</AvatarFallback>
            </Avatar>
            <CommentEntryAuthor>Wug</CommentEntryAuthor>
            <CommentEntryTime dateTime="2026-10-20T11:02:00+08:00">11:02</CommentEntryTime>
          </CommentEntryHeader>
          <CommentEntryBody>
            An hour feels short for the error rate. Can we watch it until the next morning?
          </CommentEntryBody>
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
            Agreed, overnight with the dashboard pinned in #launch-week.
          </CommentEntryBody>
        </CommentEntry>
      </CommentCard>

      <CommentCard className="w-[280px]">
        <CommentCardMeta>
          <TextSearch aria-hidden />
          Position not found
        </CommentCardMeta>
        <CommentEntry>
          <CommentEntryHeader>
            <Avatar size="xs" type="agent">
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <CommentEntryAuthor>Bugen</CommentEntryAuthor>
            <CommentEntryTime dateTime="2026-10-19T17:20:00+08:00">
              Yesterday 17:20
            </CommentEntryTime>
          </CommentEntryHeader>
          <CommentEntryBody clamp>
            The staging smoke test needs the new fixtures before this step can run.
          </CommentEntryBody>
        </CommentEntry>
      </CommentCard>
    </div>
  );
}
