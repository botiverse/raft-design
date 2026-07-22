import { MessageItemExampleAvatar } from "../message-item-example-avatar.tsx";
import {
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
} from "raft-ui/wip";

export function MessageSearchMatchMarkComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItemSearchMatch>
        <MessageItemAvatarSlot>
          <MessageItemExampleAvatar fallback="SR" />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Search result</MessageItemSender>
            <MessageItemTime>3:20 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageMarkdown>
              <p>
                Jump highlight keeps the cyan row while <mark>migration plan</mark> and{" "}
                <mark>release notes</mark> use the soft-signal mark wash.
              </p>
            </MessageMarkdown>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItemSearchMatch>
    </div>
  );
}
