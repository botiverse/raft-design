import { useState } from "react";
import { Check } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Banner,
  BannerDescription,
  Button,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCompletion,
  MessageActionCardContent,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardProperties,
  MessageActionCardPropertyValue,
  MessageActionCardHeader,
  MessageActionCardHeaderStatus,
  MessageActionCardHint,
} from "raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export type ActionCardCompositionResolution =
  | { kind: "ready"; actionLabel: string }
  | { kind: "completed"; label: string; detail: string }
  | { kind: "failed"; reason: string };

export type ActionCardCompositionProps = {
  title?: string;
  properties?: readonly { label: string; value: string }[];
  hint?: string;
  resolution?: ActionCardCompositionResolution;
  onAction?: () => void;
};

const DEFAULT_ACTION_PROPERTIES = [
  { label: "Description", value: "Coordinate the final release review." },
  { label: "Humans", value: "Ada, Will" },
  { label: "Agents", value: "Atlas" },
] as const;

export function ActionCardComposition({
  title = "Create private channel #release-review",
  properties = DEFAULT_ACTION_PROPERTIES,
  hint = "Suggested after the launch checklist was approved.",
  resolution = { kind: "ready", actionLabel: "Create Channel" },
  onAction,
}: ActionCardCompositionProps = {}) {
  return (
    <div className="grid gap-2">
      <MessageActionCard>
        <MessageActionCardHeader>
          <span>{title}</span>
          {resolution.kind === "completed" ? (
            <MessageActionCardHeaderStatus render={<Badge variant="success" />}>
              <Check aria-hidden className="size-3" />
              {resolution.label}
            </MessageActionCardHeaderStatus>
          ) : null}
        </MessageActionCardHeader>
        <MessageActionCardContent>
          <MessageActionCardProperties>
            {properties.map((property) => (
              <MessageActionCardProperty key={property.label}>
                <MessageActionCardPropertyLabel>{property.label}</MessageActionCardPropertyLabel>
                <MessageActionCardPropertyValue>{property.value}</MessageActionCardPropertyValue>
              </MessageActionCardProperty>
            ))}
          </MessageActionCardProperties>
          {resolution.kind === "ready" && hint ? (
            <MessageActionCardHint>{hint}</MessageActionCardHint>
          ) : null}
          {resolution.kind === "ready" ? (
            <MessageActionCardActions>
              <Button size="sm" variant="accent" disabled={!onAction} onClick={onAction}>
                {resolution.actionLabel}
              </Button>
            </MessageActionCardActions>
          ) : resolution.kind === "completed" ? (
            <MessageActionCardCompletion>{resolution.detail}</MessageActionCardCompletion>
          ) : (
            <Banner status="warning" size="sm">
              <BannerDescription>{resolution.reason}</BannerDescription>
            </Banner>
          )}
        </MessageActionCardContent>
      </MessageActionCard>
    </div>
  );
}

export function ActionCardMessageComposition() {
  const [resolution, setResolution] = useState<ActionCardCompositionResolution>({
    kind: "ready",
    actionLabel: "Create Channel",
  });

  return (
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
          <MessageItemTime>2:27 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <ActionCardComposition
            resolution={resolution}
            onAction={() =>
              setResolution({
                kind: "completed",
                label: "Created",
                detail: "Created by Ada → #release-review",
              })
            }
          />
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
