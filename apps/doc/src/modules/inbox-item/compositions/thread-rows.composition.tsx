import { Hash, ListTodo, Lock } from "lucide-react";
import {
  ThreadIcon,
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
  InboxItemTrailing,
  InboxItemTrigger,
  SidebarItemCount,
} from "@botiverse/raft-ui";
import { InboxItemLeadingBadge } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

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
          aria-label="Open thread in #launch-week, unread"
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
          </InboxItemHeading>
          <InboxItemBody>
            #launch-week · <InboxItemSender>Mira: </InboxItemSender>
            第二屏的按钮我改成了 Get started，你看下？
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>2m</InboxItemTimestamp>
          <InboxItemMarks>
            <SidebarItemCount>3</SidebarItemCount>
          </InboxItemMarks>
        </InboxItemTrailing>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:launch-room"}>
        <InboxItemTrigger
          value="thread:launch-room"
          aria-current={activeId === "thread:launch-room" || undefined}
          aria-label="Open thread in #launch-room"
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
          </InboxItemHeading>
          <InboxItemBody>
            #launch-room · <InboxItemSender>Volta: </InboxItemSender>
            预览包测过了，等 artin 点头。
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>11m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "task:launch-week-46"}>
        <InboxItemTrigger
          value="task:launch-week-46"
          aria-current={activeId === "task:launch-week-46" || undefined}
          aria-label="Open task #46 in #launch-week"
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
          </InboxItemHeading>
          <InboxItemBody>
            #launch-week:#46 · <InboxItemSender>Lagoon: </InboxItemSender>
            Header bar is in, goldens recorded.
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>14m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:dm-samira"}>
        <InboxItemTrigger
          value="thread:dm-samira"
          aria-current={activeId === "thread:dm-samira" || undefined}
          aria-label="Open thread with Samira Khan"
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
          </InboxItemHeading>
          <InboxItemBody>
            <InboxItemSender>Samira: </InboxItemSender>
            最后一条备注加好了，明天就可以 merge。
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>18m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "thread:dm-lagoon"} data-unread>
        <InboxItemTrigger
          value="thread:dm-lagoon"
          aria-current={activeId === "thread:dm-lagoon" || undefined}
          aria-label="Open thread with Lagoon, unread"
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
          </InboxItemHeading>
          <InboxItemBody>
            <InboxItemSender>Lagoon: </InboxItemSender>
            Summary is ready: 3 warnings, 0 errors. 要我开个 task 跟进吗？
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>31m</InboxItemTimestamp>
          <InboxItemMarks>
            <SidebarItemCount>1</SidebarItemCount>
          </InboxItemMarks>
        </InboxItemTrailing>
      </InboxItem>

      <InboxItem density="compact" active={activeId === "dm:atlas"}>
        <InboxItemTrigger
          value="dm:atlas"
          aria-current={activeId === "dm:atlas" || undefined}
          aria-label="Open Atlas"
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
          </InboxItemHeading>
          <InboxItemBody>The staging deploy is green. 要我发 release 吗？</InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>1h</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>
    </div>
  );
}
