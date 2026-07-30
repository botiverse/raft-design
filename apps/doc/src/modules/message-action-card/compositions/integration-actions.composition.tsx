import { Avatar, AvatarFallback, AvatarImage, Button } from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardContent,
  MessageActionCardDetails,
  MessageActionCardHeader,
  MessageActionCardHint,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function ActionCardIntegrationComposition() {
  return (
    <div className="grid gap-5">
      <MessageItem className="w-full max-w-4xl">
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
            <MessageItemTime>2:42 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Approve Linear for @lumen</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Service:</span> Linear
                  </div>
                  <div>
                    <span className="text-foreground-muted">Agent:</span> @lumen
                  </div>
                  <div>
                    <span className="text-foreground-muted">Scopes:</span> issues:read,
                    comments:write
                  </div>
                </MessageActionCardDetails>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Approve Login
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem className="w-full max-w-4xl">
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
            <MessageItemTime>2:46 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Register app Release Notes</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Client key:</span> release-notes
                  </div>
                  <div>
                    <span className="text-foreground-muted">Redirect URL:</span>{" "}
                    https://notes.example.com/oauth/callback
                  </div>
                  <div>
                    <span className="text-foreground-muted">Scopes:</span> messages:read,
                    messages:write
                  </div>
                </MessageActionCardDetails>
                <MessageActionCardHint>
                  The requesting agent becomes this app&apos;s owner after commit.
                </MessageActionCardHint>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Register App
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem className="w-full max-w-4xl">
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
            <MessageItemTime>2:49 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Update app release-notes</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Client key:</span> release-notes
                  </div>
                  <div>
                    <span className="text-foreground-muted">App URL:</span>{" "}
                    https://notes.example.com
                  </div>
                  <div>
                    <span className="text-foreground-muted">Scopes:</span> messages:read
                  </div>
                </MessageActionCardDetails>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Update App
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem className="w-full max-w-4xl">
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
            <MessageItemTime>2:53 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Recover release-notes for @lumen</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Client key:</span> release-notes
                  </div>
                  <div>
                    <span className="text-foreground-muted">Recovery owner:</span> @lumen
                  </div>
                </MessageActionCardDetails>
                <MessageActionCardHint>
                  Admin recovery only. Execution is rejected while the app has an active owner.
                </MessageActionCardHint>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Recover Owner
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
