import { ScrollArea, ScrollAreaGutters, VirtualList } from "@botiverse/raft-ui";
import type {
  ScrollAreaRenderContainerBinding,
  VirtualListItemRenderProps,
} from "@botiverse/raft-ui";

import { ChannelMessageRow } from "../channel-message-row.tsx";
import { createChannelMessages } from "../virtual-list.fixtures.ts";
import type { ChannelMessage } from "../virtual-list.fixtures.ts";

const MESSAGES = createChannelMessages(0, 10_000);
const getKey = (message: ChannelMessage) => message.id;
const GUTTERS = <ScrollAreaGutters />;

function renderMessage({ item, domRef, style }: VirtualListItemRenderProps<ChannelMessage>) {
  return <ChannelMessageRow key={item.id} message={item} domRef={domRef} style={style} />;
}

/**
 * ScrollArea's overlay scrollbar over the list: the list's own scroller (`domRef`) is ScrollArea's
 * container, and the sticky gutters are its first child, through the list's `header`. The list is
 * unchanged: it still scrolls, measures and anchors itself.
 */
function renderList(container: ScrollAreaRenderContainerBinding) {
  return (
    <VirtualList
      domRef={container.ref}
      className={container.className}
      style={container.style}
      header={GUTTERS}
      items={MESSAGES}
      getKey={getKey}
      itemResizable
      itemEstimatedSize={64}
      itemMinSize={40}
      paddingTop={8}
      paddingBottom={8}
    >
      {renderMessage}
    </VirtualList>
  );
}

export function VirtualListScrollbarContent() {
  return (
    <div className="h-90 w-full max-w-xl overflow-hidden rounded-container border border-line-hairline">
      <ScrollArea overscroll="auto" trigger="scroll" renderContainer={renderList} />
    </div>
  );
}
