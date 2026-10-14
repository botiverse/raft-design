import { AppWindow, Bot, Hash, KeyRound, Package, ShieldAlert, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Banner,
  BannerDescription,
  Button,
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardActionsNote,
  MessageActionCardCollapseTrigger,
  MessageActionCardContent,
  MessageActionCardHeader,
  MessageActionCardHeaderIcon,
  MessageActionCardHeaderTitle,
  MessageActionCardHint,
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
  MessageActionCardScope,
  MessageActionCardScopeDescription,
  MessageActionCardScopeList,
  MessageActionCardScopeListLabel,
  MessageActionCardScopeListViewport,
  MessageActionCardScopeName,
  MessageActionCardStatus,
} from "raft-ui";
import type { BadgeProps } from "raft-ui";

import { foldsByDefault } from "./action-card.fixtures.ts";
import type { ActionCardFixture, ActionCardKind, ActionCardState } from "./action-card.fixtures.ts";

const ICONS: Record<ActionCardKind, LucideIcon> = {
  channel: Hash,
  agent: Bot,
  members: UserPlus,
  login: KeyRound,
  install: Package,
  register: AppWindow,
  update: AppWindow,
  recover: ShieldAlert,
};

const STATUS: Partial<Record<ActionCardState, { label: string; variant: BadgeProps["variant"] }>> =
  {
    paused: { label: "Paused", variant: "muted" },
    "confirm-again": { label: "Confirm again", variant: "warning" },
    done: { label: "Done", variant: "success" },
    declined: { label: "Declined", variant: "muted" },
    "view-only": { label: "View only", variant: "muted" },
  };

const NOTE: Partial<Record<ActionCardState, string>> = {
  paused: "Paused while this channel is being converted to a Joint channel.",
  "confirm-again": "This channel became a Joint channel. Confirm again to continue.",
  declined: "Declined by Ada. Nothing was changed.",
  "view-only": "Join this channel to act on this card.",
};

/** One prepared action card in a given state, composed from the rui parts. */
export function ActionCardDemo({
  card,
  state,
}: {
  card: ActionCardFixture;
  state: ActionCardState;
}) {
  const Icon = ICONS[card.kind];
  const status = STATUS[state];
  const resolved = state === "done" || state === "declined";
  const blocked = state === "paused" || state === "view-only";
  const note = state === "done" ? card.result : NOTE[state];

  return (
    <MessageActionCard key={`${card.kind}-${state}`} defaultOpen={!foldsByDefault(state)}>
      <MessageActionCardHeader>
        <MessageActionCardHeaderIcon>
          <Icon />
        </MessageActionCardHeaderIcon>
        <MessageActionCardHeaderTitle>{card.title}</MessageActionCardHeaderTitle>
        {status ? (
          <MessageActionCardStatus variant={status.variant}>{status.label}</MessageActionCardStatus>
        ) : null}
        {status ? <MessageActionCardCollapseTrigger aria-label="Show or hide details" /> : null}
      </MessageActionCardHeader>
      <MessageActionCardContent>
        <MessageActionCardProperties>
          {card.properties.map((property) => (
            <MessageActionCardProperty key={property.label}>
              <MessageActionCardPropertyLabel>{property.label}</MessageActionCardPropertyLabel>
              <MessageActionCardPropertyValue className={property.code ? "font-mono" : undefined}>
                {property.value}
              </MessageActionCardPropertyValue>
            </MessageActionCardProperty>
          ))}
        </MessageActionCardProperties>
        {card.hint ? <MessageActionCardHint>{card.hint}</MessageActionCardHint> : null}
        {card.scopes ? (
          <MessageActionCardScopeList>
            <MessageActionCardScopeListLabel>
              Permissions ({card.scopes.length})
            </MessageActionCardScopeListLabel>
            <MessageActionCardScopeListViewport aria-label="Permissions">
              {card.scopes.map((scope) => (
                <MessageActionCardScope key={scope.name}>
                  <MessageActionCardScopeName>{scope.name}</MessageActionCardScopeName>
                  <MessageActionCardScopeDescription>
                    {scope.description}
                  </MessageActionCardScopeDescription>
                </MessageActionCardScope>
              ))}
            </MessageActionCardScopeListViewport>
          </MessageActionCardScopeList>
        ) : null}
        {card.notice && !resolved ? (
          <Banner status="default" size="sm" className="mt-3">
            <BannerDescription>{card.notice}</BannerDescription>
          </Banner>
        ) : null}
        <MessageActionCardActions>
          {note ? <MessageActionCardActionsNote>{note}</MessageActionCardActionsNote> : null}
          {resolved ? null : (
            <>
              <Button size="sm" variant="ghost" disabled={blocked}>
                Decline
              </Button>
              <Button size="sm" variant="accent" disabled={blocked}>
                {state === "confirm-again"
                  ? "Reconfirm"
                  : card.pattern === "review"
                    ? "Review"
                    : card.verb}
              </Button>
            </>
          )}
        </MessageActionCardActions>
      </MessageActionCardContent>
    </MessageActionCard>
  );
}
