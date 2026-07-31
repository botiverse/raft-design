import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Banner,
  BannerDescription,
  Button,
} from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardContent,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardProperties,
  MessageActionCardPropertyValue,
  MessageActionCardHeader,
  MessageActionCardHint,
  MessageActionCardScope,
  MessageActionCardScopeDescription,
  MessageActionCardScopeList,
  MessageActionCardScopeName,
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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Service</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Linear</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Agent</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>@lumen</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <MessageActionCardScopeList>
                  <div className="text-[13px] leading-5 font-medium text-foreground [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:leading-4 [[data-theme=brutal]_&]:font-normal [[data-theme=brutal]_&]:text-black/55">
                    Scopes:
                  </div>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>openid</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Signs you in with Raft and issues a stable identity token. Authentication
                      only.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>profile</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Reads your basic profile fields. No access to messages, files, or agents.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>agent:event:write</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Sends structured event messages to the agent you authorize.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                </MessageActionCardScopeList>
                <Banner status="warning" size="sm" className="mt-3">
                  <BannerDescription>
                    Cannot send chat as you, speak as the agent, read messages, or take actions.
                  </BannerDescription>
                </Banner>
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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Client key</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>release-notes</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Redirect URL</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>
                      https://notes.example.com/oauth/callback
                    </MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <MessageActionCardScopeList>
                  <div className="text-[13px] leading-5 font-medium text-foreground [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:leading-4 [[data-theme=brutal]_&]:font-normal [[data-theme=brutal]_&]:text-black/55">
                    Scopes:
                  </div>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>openid</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Signs you in with Raft and issues a stable identity token. Authentication
                      only.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>profile</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Reads your basic profile fields. No access to messages, files, or agents.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                </MessageActionCardScopeList>
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
              <MessageActionCardHeader>
                Update app release-notes
                <Badge variant="muted" className="ml-auto">
                  Legacy
                </Badge>
              </MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Client key</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>release-notes</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>App URL</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>
                      https://notes.example.com
                    </MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <MessageActionCardScopeList>
                  <div className="text-[13px] leading-5 font-medium text-foreground [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:leading-4 [[data-theme=brutal]_&]:font-normal [[data-theme=brutal]_&]:text-black/55">
                    Scopes:
                  </div>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>openid</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Signs you in with Raft and issues a stable identity token. Authentication
                      only.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>profile</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Reads your basic profile fields. No access to messages, files, or agents.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                  <MessageActionCardScope>
                    <MessageActionCardScopeName>agent:event:write</MessageActionCardScopeName>
                    <MessageActionCardScopeDescription>
                      Sends structured event messages to the agent you authorize.
                    </MessageActionCardScopeDescription>
                  </MessageActionCardScope>
                </MessageActionCardScopeList>
                <Banner status="warning" size="sm" className="mt-3">
                  <BannerDescription>
                    Cannot send chat as you, speak as the agent, read messages, or take actions.
                  </BannerDescription>
                </Banner>
                <MessageActionCardHint>
                  Historical update cards can still render. New executions use the current
                  registration flow instead.
                </MessageActionCardHint>
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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Client key</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>release-notes</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Recovery owner</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>@lumen</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <Banner status="warning" size="sm" className="mt-3">
                  <BannerDescription>
                    Admin recovery only. Execution is rejected while the app has an active owner.
                  </BannerDescription>
                </Banner>
                <MessageActionCardHint>
                  Real orphaned Connected App; safe to recover locally.
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
