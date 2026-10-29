import { Hash } from "lucide-react";
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
 * The leading image shows the conversation a thread lives in: a channel's
 * tile, or the other side's avatar in a direct message, each with the thread
 * badge in its corner. A plain direct message keeps its presence light.
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
            <Hash />
          </IconTile>
          <InboxItemLeadingBadge>
            <ThreadIcon />
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
