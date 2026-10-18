import {
  AtSign,
  BellOff,
  Bookmark,
  Check,
  Circle,
  Hash,
  MessageSquare,
  Pencil,
  RotateCcw,
} from "lucide-react";
import {
  Badge,
  Checkbox,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemMetadata,
  InboxItemSelection,
  InboxItemSender,
  InboxItemSubtitle,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  PanelAction,
  PanelToggleAction,
} from "@botiverse/raft-ui";
import { useCallback, useState } from "react";

import { ACTIVITY_COMPOSITION_ITEMS } from "../activity.fixtures.ts";
import type { ActivityCompositionItem } from "../activity.fixtures.ts";

const ACTIVE_ITEM_ID = "dm:samira";
const CHECKED_ITEM_ID = "mention:general";
const ACTIVITY_ITEM_STATES: readonly ActivityCompositionItem[] = ACTIVITY_COMPOSITION_ITEMS;

/** Static gallery of Activity inbox item structures and visual states. */
export function ActivityPreviewComposition() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-2">
      {ACTIVITY_ITEM_STATES.map((item) => {
        const Icon =
          item.kind === "thread" ? MessageSquare : item.channelKind === "dm" ? AtSign : Hash;
        const active = item.id === ACTIVE_ITEM_ID;
        const checked = item.id === CHECKED_ITEM_ID;

        return (
          <InboxItem key={item.id} active={active} data-unread={item.unreadCount > 0 || undefined}>
            <InboxItemSelection>
              <Checkbox defaultChecked={checked} aria-label="Toggle activity item selection" />
            </InboxItemSelection>

            <InboxItemContent>
              <InboxItemHeading>
                <InboxItemTitle>
                  <Icon aria-hidden />
                  {item.title}
                </InboxItemTitle>
              </InboxItemHeading>
              {item.kind === "thread" ? (
                <InboxItemSubtitle>Thread in {item.channelLabel}</InboxItemSubtitle>
              ) : null}
              <InboxItemBody>
                <InboxItemSender>{item.sender}: </InboxItemSender>
                {item.preview}
              </InboxItemBody>
              <InboxItemMetadata>
                {item.task ? (
                  <Badge variant="warning">
                    <Circle aria-hidden size={10} />#{item.task.number}
                    {item.task.claimedBy ? ` @${item.task.claimedBy}` : null}
                  </Badge>
                ) : null}
                {item.replyCount === undefined ? null : (
                  <Badge appearance="outline" variant="muted">
                    {item.replyCount} replies
                  </Badge>
                )}
                {item.kind === "thread" && item.following === false ? (
                  <Badge appearance="outline" variant="muted">
                    <BellOff aria-hidden size={10} /> Unfollowed
                  </Badge>
                ) : null}
                {item.hasMention && item.unreadCount > 0 ? (
                  <Badge variant="primary">
                    <AtSign aria-hidden size={10} /> Mention
                  </Badge>
                ) : null}
                {item.unreadCount > 0 ? (
                  <Badge variant="accent">{item.unreadCount} new</Badge>
                ) : null}
                {item.draft ? (
                  <Badge appearance="outline" variant="muted">
                    <Pencil aria-hidden size={10} /> Draft
                  </Badge>
                ) : null}
              </InboxItemMetadata>
            </InboxItemContent>

            <InboxItemTrailing>
              <InboxItemTimestamp>{item.timestamp}</InboxItemTimestamp>
              <InboxItemActions>
                <ActivitySavedAction defaultSaved={Boolean(item.saved)} />
                <ActivityCompletionAction defaultDone={Boolean(item.done)} />
              </InboxItemActions>
            </InboxItemTrailing>
          </InboxItem>
        );
      })}
    </div>
  );
}

function ActivitySavedAction({ defaultSaved }: { defaultSaved: boolean }) {
  const [saved, setSaved] = useState(defaultSaved);

  return (
    <PanelToggleAction
      pressed={saved}
      onPressedChange={setSaved}
      aria-label={saved ? "Remove from Saved" : "Save activity item"}
    >
      <Bookmark aria-hidden fill={saved ? "currentColor" : "none"} />
    </PanelToggleAction>
  );
}

function ActivityCompletionAction({ defaultDone }: { defaultDone: boolean }) {
  const [done, setDone] = useState(defaultDone);

  const handleToggleDone = useCallback(() => {
    setDone((current) => !current);
  }, []);

  return (
    <PanelAction
      onClick={handleToggleDone}
      aria-label={done ? "Restore to Active" : "Mark as done"}
    >
      {done ? <RotateCcw aria-hidden /> : <Check aria-hidden />}
    </PanelAction>
  );
}
