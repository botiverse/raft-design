import { useState } from "react";
import { CheckCircle2, MessageSquare, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, Badge } from "raft-ui";
import {
  TopicList,
  TopicListGroup,
  TopicListGroupLabel,
  TopicListItem,
  TopicListItemAside,
  TopicListItemAuthor,
  TopicListItemAvatar,
  TopicListItemContent,
  TopicListItemExcerpt,
  TopicListItemHeading,
  TopicListItemReplies,
  TopicListItemStats,
  TopicListItemTime,
  TopicListItemTitle,
  TopicListItemTrigger,
} from "raft-ui/wip";

export function TopicListComposition() {
  const [openTopicId, setOpenTopicId] = useState("select-values");

  return (
    <div className="flex flex-col gap-5">
      <TopicListGroup>
        <TopicListGroupLabel id="topic-list-pinned">Pinned</TopicListGroupLabel>
        <TopicList aria-labelledby="topic-list-pinned">
          <TopicListItem>
            <TopicListItemTrigger
              aria-label="Pinned topic: How to ask a good question, 0 replies"
              aria-current={openTopicId === "guidelines" ? "true" : undefined}
              onClick={() => setOpenTopicId("guidelines")}
            />
            <TopicListItemAvatar>
              <Avatar size="sm" type="human">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            </TopicListItemAvatar>
            <TopicListItemContent>
              <TopicListItemTitle>
                <Pin aria-hidden />
                How to ask a good question
              </TopicListItemTitle>
              <TopicListItemExcerpt>
                <TopicListItemAuthor>Cindy</TopicListItemAuthor> · Say which theme, which component
                and what you expected.
              </TopicListItemExcerpt>
            </TopicListItemContent>
            <TopicListItemAside>
              <TopicListItemTime dateTime="2026-08-04">Aug 4</TopicListItemTime>
              <TopicListItemStats>
                <TopicListItemReplies>
                  <MessageSquare aria-hidden />0
                </TopicListItemReplies>
              </TopicListItemStats>
            </TopicListItemAside>
          </TopicListItem>
        </TopicList>
      </TopicListGroup>

      <TopicListGroup>
        <TopicListGroupLabel id="topic-list-today">Today</TopicListGroupLabel>
        <TopicList aria-labelledby="topic-list-today">
          <TopicListItem unread>
            <TopicListItemTrigger
              aria-label="Topic: Controlled Select with object values, 1 new reply, 3 replies"
              aria-current={openTopicId === "select-values" ? "true" : undefined}
              onClick={() => setOpenTopicId("select-values")}
            />
            <TopicListItemAvatar>
              <Avatar size="sm" type="human">
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
            </TopicListItemAvatar>
            <TopicListItemContent>
              <TopicListItemTitle>Controlled Select with object values</TopicListItemTitle>
              <TopicListItemExcerpt>
                <TopicListItemAuthor>Mx. Chen</TopicListItemAuthor> · My Select value is an object
                and the trigger shows [object Object].
              </TopicListItemExcerpt>
            </TopicListItemContent>
            <TopicListItemAside>
              <TopicListItemTime dateTime="2026-09-23T10:05">1h</TopicListItemTime>
              <TopicListItemStats>
                <AvatarGroup>
                  <Avatar size="xs" type="agent">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
                <Badge variant="information">1 new</Badge>
                <TopicListItemReplies>
                  <MessageSquare aria-hidden />3
                </TopicListItemReplies>
              </TopicListItemStats>
            </TopicListItemAside>
          </TopicListItem>

          <TopicListItem>
            <TopicListItemTrigger
              aria-label="Topic: New neutral token ramp, Approved, 12 replies"
              aria-current={openTopicId === "token-ramp" ? "true" : undefined}
              onClick={() => setOpenTopicId("token-ramp")}
            />
            <TopicListItemAvatar>
              <Avatar size="sm" type="human">
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            </TopicListItemAvatar>
            <TopicListItemContent>
              <TopicListItemHeading>
                <TopicListItemTitle>New neutral token ramp</TopicListItemTitle>
                <Badge variant="success" appearance="soft">
                  <CheckCircle2 aria-hidden />
                  Approved
                </Badge>
              </TopicListItemHeading>
              <TopicListItemExcerpt>
                <TopicListItemAuthor>Noah</TopicListItemAuthor> · Replace the remaining opaque grays
                with ink overlays so hover fills composite on any surface.
              </TopicListItemExcerpt>
            </TopicListItemContent>
            <TopicListItemAside>
              <TopicListItemTime dateTime="2026-09-23T10:55">45m</TopicListItemTime>
              <TopicListItemStats>
                <AvatarGroup>
                  <Avatar size="xs" type="human">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Avatar size="xs" type="human">
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <Avatar size="xs" type="agent">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount size="xs">+2</AvatarGroupCount>
                </AvatarGroup>
                <TopicListItemReplies>
                  <MessageSquare aria-hidden />
                  12
                </TopicListItemReplies>
              </TopicListItemStats>
            </TopicListItemAside>
          </TopicListItem>
        </TopicList>
      </TopicListGroup>
    </div>
  );
}
