import { VirtualList } from "@botiverse/raft-ui/wip";
import type { VirtualListItemRenderProps } from "@botiverse/raft-ui/wip";

import { ChannelMessageRow } from "../channel-message-row.tsx";
import { createChannelMessages } from "../virtual-list.fixtures.ts";
import type { ChannelMessage } from "../virtual-list.fixtures.ts";

const MESSAGES = createChannelMessages(0, 10_000);
const getKey = (message: ChannelMessage) => message.id;

function renderMessage({ item, domRef, style }: VirtualListItemRenderProps<ChannelMessage>) {
  return <ChannelMessageRow key={item.id} message={item} domRef={domRef} style={style} />;
}

export function VirtualListBasicContent() {
  return (
    <div className="h-90 w-full max-w-xl overflow-hidden rounded-container border border-line-hairline">
      <VirtualList
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
    </div>
  );
}
