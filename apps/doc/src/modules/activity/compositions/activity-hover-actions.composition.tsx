import { AtSign, Check, Hash, MessageSquare, Pencil } from "lucide-react";
import {
  Badge,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemLabel,
  ContextMenuTrigger,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemHoverTarget,
  InboxItemMetadata,
  InboxItemSender,
  InboxItemSubtitle,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import { useCallback, useState } from "react";

import { ACTIVITY_COMPOSITION_ITEMS } from "../activity.fixtures.ts";
import type { ActivityCompositionItem } from "../activity.fixtures.ts";

const ITEMS: readonly ActivityCompositionItem[] = ACTIVITY_COMPOSITION_ITEMS.slice(0, 4);

/** Mark as Done shows on hover with a mouse; on a touch screen it is in the row's press-and-hold menu. */
export function ActivityHoverActionsComposition() {
  const [activeId, setActiveId] = useState<string>();
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(new Set());
  const items = ITEMS.filter((item) => !doneIds.has(item.id));
  const handleRestore = useCallback(() => setDoneIds(new Set()), []);
  const handleDone = useCallback((id: string) => setDoneIds((ids) => new Set(ids).add(id)), []);

  if (items.length === 0) {
    return (
      <Button variant="outline" onClick={handleRestore}>
        Restore to Active
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col">
      {items.map((item) => (
        <ActivityHoverRow
          key={item.id}
          item={item}
          active={item.id === activeId}
          onOpen={setActiveId}
          onDone={handleDone}
        />
      ))}
    </div>
  );
}

function ActivityHoverRow({
  item,
  active,
  onOpen,
  onDone,
}: {
  item: ActivityCompositionItem;
  active: boolean;
  onOpen: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const Icon = item.kind === "thread" ? MessageSquare : item.channelKind === "dm" ? AtSign : Hash;
  const handleOpen = useCallback(() => onOpen(item.id), [item.id, onOpen]);
  const handleDone = useCallback(() => onDone(item.id), [item.id, onDone]);
  const row = (
    <InboxItem active={active} data-unread={item.unreadCount > 0 || undefined}>
      <InboxItemTrigger
        aria-current={active || undefined}
        aria-label={`Open ${item.title}`}
        onClick={handleOpen}
      />
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
        {item.hasMention || item.draft || item.unreadCount > 0 ? (
          <InboxItemMetadata>
            {item.hasMention && item.unreadCount > 0 ? (
              <Tooltip>
                <TooltipTrigger
                  render={<InboxItemHoverTarget render={<Badge variant="primary" />} />}
                >
                  <AtSign aria-hidden size={10} /> Mention
                </TooltipTrigger>
                <TooltipContent>Someone mentioned you here</TooltipContent>
              </Tooltip>
            ) : null}
            {item.unreadCount > 0 ? <Badge variant="accent">{item.unreadCount} new</Badge> : null}
            {item.draft ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InboxItemHoverTarget render={<Badge appearance="outline" variant="muted" />} />
                  }
                  aria-label="Draft"
                >
                  <Pencil aria-hidden size={10} />
                </TooltipTrigger>
                <TooltipContent>You have an unsent reply here</TooltipContent>
              </Tooltip>
            ) : null}
          </InboxItemMetadata>
        ) : null}
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>{item.timestamp}</InboxItemTimestamp>
        <InboxItemActions reveal="hover">
          <Button variant="outline" size="icon-md" aria-label="Mark as done" onClick={handleDone}>
            <Check aria-hidden />
          </Button>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  );
  return (
    <ContextMenu>
      <ContextMenuTrigger render={row} />
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDone}>
          <Check />
          <ContextMenuItemLabel>Mark as done</ContextMenuItemLabel>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
