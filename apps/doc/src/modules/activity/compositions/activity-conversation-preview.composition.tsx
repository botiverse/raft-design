import { AtSign, Hash, ListTodo } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  IconTile,
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemHoverTarget,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrigger,
  SidebarItemCount,
  SidebarItemIndicator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import {
  InboxItemLeadingBadge,
  InboxItemListGroup,
  InboxItemListHeading,
  InboxItemLocation,
  InboxItemPreview,
  InboxItemStatus,
} from "@botiverse/raft-ui/wip";
import { ThreadIcon } from "@botiverse/ricons";

/**
 * Activity on a phone: the latest message on up to two lines, its marks at the end of the
 * first. A short message keeps its row one line shorter.
 */
export function ActivityConversationPreviewComposition() {
  return (
    <div className="flex w-full max-w-[390px] flex-col gap-0.5 py-2">
      <InboxItemListGroup>
        <InboxItemListHeading>Today</InboxItemListHeading>
        <InboxItem density="compact" data-unread>
          <InboxItemTrigger aria-label="Open thread in #wg-mobile-sync: The app binary you uploaded is missing required metadata, 9 hours ago" />
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
              <InboxItemTitle>
                The app binary you uploaded is missing required metadata
              </InboxItemTitle>
              <InboxItemTimestamp aria-hidden>9h</InboxItemTimestamp>
            </InboxItemHeading>
            <InboxItemPreview>
              <InboxItemMarks>
                <Tooltip>
                  <TooltipTrigger
                    render={<InboxItemHoverTarget render={<SidebarItemIndicator />} />}
                    aria-label="Mentioned you"
                  >
                    <AtSign aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent>Someone mentioned you here</TooltipContent>
                </Tooltip>
                <SidebarItemCount>2</SidebarItemCount>
              </InboxItemMarks>
              <InboxItemBody>
                <InboxItemLocation>#wg-mobile-sync ·</InboxItemLocation>
                <InboxItemSender>Lagoon: </InboxItemSender>
                It is App Store Connect's automatic email: the camera permission string is missing.
                I added it to Info.plist and will upload the build again tonight.
              </InboxItemBody>
            </InboxItemPreview>
          </InboxItemContent>
        </InboxItem>
        <InboxItem density="compact" data-unread>
          <InboxItemTrigger aria-label="Open task in #proj-mobile: Compare the web and app cases, in progress, 10 hours ago" />
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
              <InboxItemTitle>Compare the web and app cases</InboxItemTitle>
              <InboxItemTimestamp aria-hidden>10h</InboxItemTimestamp>
            </InboxItemHeading>
            <InboxItemPreview>
              <InboxItemMarks>
                <InboxItemStatus status="in-progress">In progress</InboxItemStatus>
                <SidebarItemCount>3</SidebarItemCount>
              </InboxItemMarks>
              <InboxItemBody>
                <InboxItemLocation>#proj-mobile ·</InboxItemLocation>
                <InboxItemSender>Lagoon: </InboxItemSender>
                The second batch of 24 cases ran: the web and the app differ in 5 places, mostly the
                list's row heights and the time format.
              </InboxItemBody>
            </InboxItemPreview>
          </InboxItemContent>
        </InboxItem>
        <InboxItem density="compact" data-unread>
          <InboxItemTrigger aria-label="Open Atlas, 11 hours ago" />
          <InboxItemLeading>
            <Avatar size="md" type="agent">
              <AvatarFallback>A</AvatarFallback>
              <AvatarBadge role="img" aria-label="Online" />
            </Avatar>
          </InboxItemLeading>
          <InboxItemContent>
            <InboxItemHeading>
              <InboxItemTitle>Atlas</InboxItemTitle>
              <InboxItemTimestamp aria-hidden>11h</InboxItemTimestamp>
            </InboxItemHeading>
            <InboxItemPreview>
              <InboxItemMarks>
                <SidebarItemCount>1</SidebarItemCount>
              </InboxItemMarks>
              <InboxItemBody>Merged, thanks.</InboxItemBody>
            </InboxItemPreview>
          </InboxItemContent>
        </InboxItem>
      </InboxItemListGroup>
    </div>
  );
}
