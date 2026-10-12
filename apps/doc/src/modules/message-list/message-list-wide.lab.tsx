import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedHeader,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemSender,
  MessageList,
  Tabs,
  TabsIndicator,
  TabsLabel,
  TabsList,
  TabsTab,
} from "raft-ui";

const TABS = [
  "Weekly signups chart",
  "Release timeline",
  "Pricing comparison",
  "Latency breakdown",
  "Error budget",
];

function Avatar() {
  return <div className="size-8 rounded-full bg-ink-4" />;
}

/** A 360px message list on a desktop window, with a w-max tab strip in an embed header. */
export function MessageListWideLab() {
  return (
    <div className="h-[420px] w-[360px] border border-line-muted">
      <MessageList>
        <MessageItem>
          <MessageItemGutter>
            <MessageItemAvatarSlot>
              <Avatar />
            </MessageItemAvatarSlot>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Remy</MessageItemSender>
            </MessageItemHeader>
            <MessageItemBody>
              Three widgets in one tabbed frame. This sentence should wrap inside the list.
            </MessageItemBody>
            <MessageItemEmbedded>
              <MessageEmbed className="w-full min-w-0">
                <MessageEmbedHeader className="flex items-center gap-2 py-0">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <Tabs defaultValue={TABS[0]} className="min-w-0">
                      <TabsList
                        variant="underline"
                        className="max-w-full overflow-x-auto [scrollbar-width:none]"
                      >
                        {TABS.map((tab) => (
                          <TabsTab key={tab} value={tab} className="shrink-0">
                            <TabsLabel className="text-xs">{tab}</TabsLabel>
                          </TabsTab>
                        ))}
                        <TabsIndicator />
                      </TabsList>
                    </Tabs>
                  </div>
                </MessageEmbedHeader>
                <MessageEmbedContent>
                  <div className="h-24 bg-ink-4/40" />
                </MessageEmbedContent>
              </MessageEmbed>
            </MessageItemEmbedded>
          </MessageItemContent>
        </MessageItem>
        <MessageItem>
          <MessageItemGutter>
            <MessageItemAvatarSlot>
              <Avatar />
            </MessageItemAvatarSlot>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Kirby</MessageItemSender>
            </MessageItemHeader>
            <MessageItemBody>
              A plain text reply below. It has no wide content, but it is stretched too.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageList>
    </div>
  );
}
