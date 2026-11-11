import { Hash, ListTodo, Lock } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  IconTile,
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrigger,
  SidebarItemCount,
} from "@botiverse/raft-ui";
import { InboxItemLeadingBadge, InboxItemLine, InboxItemStatus } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { ThreadIcon } from "@botiverse/ricons";

/**
 * A thread or task in a channel leads with its own mark, `ThreadIcon` or
 * `list-todo`, and the channel's own icon (# or a lock) sits in the badge. A
 * thread in a direct message keeps the other side's avatar, with the thread
 * mark in the badge. A plain direct message keeps its presence light.
 */
export function ThreadRowsContent() {
  const [activeId, setActiveId] = useState<string>();
  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setActiveId(event.currentTarget.value);
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-0.5 py-2">
      <InboxItem density="compact" active={activeId === "thread:launch-week"} data-unread>
        <InboxItemTrigger
          value="thread:launch-week"
          aria-current={activeId === "thread:launch-week" || undefined}
          aria-label="Open thread in #launch-week, unread, 2 minutes ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <IconTile>
            <ThreadIcon />
          </IconTile>
          <InboxItemLeadingBadge>
            <Hash />
          </InboxItemLeadingBadge>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>发布前把 onboarding 文案再过一遍</InboxItemTitle>
            <InboxItemTimestamp>2m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>
              #launch-week · <InboxItemSender>Mira: </InboxItemSender>
              第二屏的按钮我改成了 Get started，你看下？
            </InboxItemBody>
            <InboxItemMarks>
              <SidebarItemCount>3</SidebarItemCount>
            </InboxItemMarks>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:launch-room"}>
        <InboxItemTrigger
          value="thread:launch-room"
          aria-current={activeId === "thread:launch-room" || undefined}
          aria-label="Open thread in #launch-room, 11 minutes ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <IconTile>
            <ThreadIcon />
          </IconTile>
          <InboxItemLeadingBadge>
            <Lock />
          </InboxItemLeadingBadge>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>1.15.3 发版清单</InboxItemTitle>
            <InboxItemTimestamp>11m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>
              #launch-room · <InboxItemSender>Volta: </InboxItemSender>
              预览包测过了，等最后确认。
            </InboxItemBody>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "task:launch-week-46"}>
        <InboxItemTrigger
          value="task:launch-week-46"
          aria-current={activeId === "task:launch-week-46" || undefined}
          aria-label="Open task in #launch-week, in progress, 14 minutes ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <IconTile>
            <ListTodo />
          </IconTile>
          <InboxItemLeadingBadge>
            <Hash />
          </InboxItemLeadingBadge>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>Header bar for task conversations</InboxItemTitle>
            <InboxItemTimestamp>14m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>
              #launch-week · <InboxItemSender>Noor: </InboxItemSender>
              Header bar is in, goldens recorded.
            </InboxItemBody>
            <InboxItemMarks>
              <InboxItemStatus status="in-progress">In progress</InboxItemStatus>
            </InboxItemMarks>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:dm-samira"}>
        <InboxItemTrigger
          value="thread:dm-samira"
          aria-current={activeId === "thread:dm-samira" || undefined}
          aria-label="Open thread with Samira Khan, 18 minutes ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <Avatar size="md" type="human">
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
          <InboxItemLeadingBadge>
            <ThreadIcon />
          </InboxItemLeadingBadge>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>Permissions review: final note</InboxItemTitle>
            <InboxItemTimestamp>18m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>
              <InboxItemSender>Samira: </InboxItemSender>
              最后一条备注加好了，明天就可以 merge。
            </InboxItemBody>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:dm-sample"} data-unread>
        <InboxItemTrigger
          value="thread:dm-sample"
          aria-current={activeId === "thread:dm-sample" || undefined}
          aria-label="Open thread with Noor, unread, 31 minutes ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <Avatar size="md" type="agent">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
          <InboxItemLeadingBadge>
            <ThreadIcon />
          </InboxItemLeadingBadge>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>把 staging 的部署日志整理成摘要</InboxItemTitle>
            <InboxItemTimestamp>31m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>
              <InboxItemSender>Noor: </InboxItemSender>
              Summary is ready: 3 warnings, 0 errors. 要我开个 task 跟进吗？
            </InboxItemBody>
            <InboxItemMarks>
              <SidebarItemCount>1</SidebarItemCount>
            </InboxItemMarks>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "dm:atlas"}>
        <InboxItemTrigger
          value="dm:atlas"
          aria-current={activeId === "dm:atlas" || undefined}
          aria-label="Open Atlas, 1 hour ago"
          onClick={handleOpen}
        />
        <InboxItemLeading>
          <Avatar size="md" type="agent">
            <AvatarFallback>A</AvatarFallback>
            <AvatarBadge role="img" aria-label="Online" />
          </Avatar>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>Atlas</InboxItemTitle>
            <InboxItemTimestamp>1h</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine>
            <InboxItemBody>The staging deploy is green. 要我发 release 吗？</InboxItemBody>
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>
    </div>
  );
}
