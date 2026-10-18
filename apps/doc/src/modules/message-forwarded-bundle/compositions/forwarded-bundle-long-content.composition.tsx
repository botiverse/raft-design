import { Avatar, AvatarFallback, AvatarImage } from "@botiverse/raft-ui";
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
  MessageForwardedBundleItemContent,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleFooterAction,
} from "@botiverse/raft-ui";

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
} from "@botiverse/raft-ui";

function LongForwardedItem() {
  return (
    <MessageForwardedBundleItem>
      <MessageForwardedBundleItemMeta>
        <MessageForwardedBundleItemAuthor>@Nia</MessageForwardedBundleItemAuthor>
        <time dateTime="2026-07-15T06:16:00.000Z">Jul 15, 2:16 PM</time>
      </MessageForwardedBundleItemMeta>
      <MessageForwardedBundleItemContent>
        <Markdown>{`Before we cut over, keep the read model running against both event streams and validate account, workspace, and channel permissions in staging.

The migration needs an explicit rollback checkpoint after the first production cohort, plus a documented handoff for reconciliation and replay.

Review the operational checklist with the owners of notifications, search, and thread state before scheduling the final rollout window.

Also decide the dual-write window up front: how long both writers stay live, who watches the divergence dashboard, and which metrics gate the next cohort.

Finally, write down what "done" means for the old path — read-only, disconnected, or deleted — and add a dated note to the runbook so the next person on call can find the decision.`}</Markdown>
      </MessageForwardedBundleItemContent>
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
            <MessageForwardedBundleItems>
              <LongForwardedItem />
            </MessageForwardedBundleItems>
            <MessageForwardedBundleFooter>
              <MessageForwardedBundleFooterAction
                expandedContent={
                  <>
                    <ChevronUp size={12} />
                    Collapse
                  </>
                }
              >
                <ChevronDown size={12} />
                Show all 1 message
              </MessageForwardedBundleFooterAction>
            </MessageForwardedBundleFooter>
          </MessageForwardedBundle>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
