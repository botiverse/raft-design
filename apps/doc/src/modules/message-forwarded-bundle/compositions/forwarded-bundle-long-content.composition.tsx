import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleFooter,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderContent,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleToggle,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { ChevronDown, ChevronUp, FileText, Forward } from "lucide-react";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

function LongForwardedItem() {
  return (
    <MessageForwardedBundleItem>
      <MessageForwardedBundleItemMeta>
        <MessageForwardedBundleItemAuthor>@Nia</MessageForwardedBundleItemAuthor>
        <time dateTime="2026-07-15T06:16:00.000Z">Jul 15, 2:16 PM</time>
      </MessageForwardedBundleItemMeta>
      <Markdown>{`Before we cut over, keep the read model running against both event streams and validate account, workspace, and channel permissions in staging.

The migration needs an explicit rollback checkpoint after the first production cohort, plus a documented handoff for reconciliation and replay.

Review the operational checklist with the owners of notifications, search, and thread state before scheduling the final rollout window.`}</Markdown>
      <MessageForwardedBundleAttachments>
        <MessageForwardedBundleAttachment>
          <FileText size={12} />
          <MessageForwardedBundleAttachmentName>
            migration-checklist.md
          </MessageForwardedBundleAttachmentName>
          <MessageForwardedBundleAttachmentMeta>· markdown</MessageForwardedBundleAttachmentMeta>
        </MessageForwardedBundleAttachment>
        <MessageForwardedBundleAttachment>
          <FileText size={12} />
          <MessageForwardedBundleAttachmentName>
            webhook-cutover-plan.pdf
          </MessageForwardedBundleAttachmentName>
          <MessageForwardedBundleAttachmentMeta>· pdf</MessageForwardedBundleAttachmentMeta>
        </MessageForwardedBundleAttachment>
      </MessageForwardedBundleAttachments>
    </MessageForwardedBundleItem>
  );
}

export function ForwardedBundleLongContentComposition() {
  const [expanded, setExpanded] = useState(false);

  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:27 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Forwarded 1 message</MessageItemBody>
        <MessageItemEmbedded>
          <MessageForwardedBundle>
            <MessageForwardedBundleHeader>
              <MessageForwardedBundleHeaderContent>
                <MessageForwardedBundleHeaderLabel>
                  <Forward size={12} />
                  Forwarded
                </MessageForwardedBundleHeaderLabel>
                <MessageForwardedBundleHeaderCount>message</MessageForwardedBundleHeaderCount>
              </MessageForwardedBundleHeaderContent>
            </MessageForwardedBundleHeader>
            <MessageForwardedBundleItems collapsed={!expanded}>
              <LongForwardedItem />
            </MessageForwardedBundleItems>
            <MessageForwardedBundleFooter>
              <MessageForwardedBundleToggle onClick={() => setExpanded((current) => !current)}>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? "Collapse" : "Show all 1 message"}
              </MessageForwardedBundleToggle>
            </MessageForwardedBundleFooter>
          </MessageForwardedBundle>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
