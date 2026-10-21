import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Button,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "@botiverse/raft-ui";
import { VirtualList } from "@botiverse/raft-ui/wip";
import type {
  VirtualListApi,
  VirtualListItemRenderProps,
  VirtualListScrollAlign,
} from "@botiverse/raft-ui/wip";

import { ChannelMessageRow } from "../channel-message-row.tsx";
import { createChannelMessages } from "../virtual-list.fixtures.ts";
import type { ChannelMessage } from "../virtual-list.fixtures.ts";

const MESSAGES = createChannelMessages(0, 10_000);
const getKey = (message: ChannelMessage) => message.id;

function renderMessage({ item, domRef, style }: VirtualListItemRenderProps<ChannelMessage>) {
  return <ChannelMessageRow key={item.id} message={item} domRef={domRef} style={style} />;
}

export function VirtualListJumpContent() {
  const listRef = useRef<VirtualListApi>(null);
  const [target, setTarget] = useState("7420");
  const [align, setAlign] = useState<VirtualListScrollAlign>("center");
  const n = Math.min(MESSAGES.length - 1, Math.max(0, Math.floor(Number(target)) || 0));

  const jump = useCallback(() => {
    listRef.current?.scrollTo({ key: `message-${n}`, align });
  }, [n, align]);
  const changeTarget = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTarget(event.target.value);
  }, []);
  const changeAlign = useCallback((value: string) => {
    setAlign(value as VirtualListScrollAlign);
  }, []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Message number"
          inputMode="numeric"
          className="w-24"
          value={target}
          onChange={changeTarget}
        />
        <SegmentedControl
          aria-label="Where the message lands"
          value={align}
          onValueChange={changeAlign}
        >
          <SegmentedControlItem value="start">
            <SegmentedControlLabel>Top</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="center">
            <SegmentedControlLabel>Middle</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="end">
            <SegmentedControlLabel>Bottom</SegmentedControlLabel>
          </SegmentedControlItem>
        </SegmentedControl>
        <Button onClick={jump}>Jump</Button>
      </div>
      <div className="h-90 overflow-hidden rounded-container border border-line-hairline">
        <VirtualList
          componentRef={listRef}
          items={MESSAGES}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={64}
          itemMinSize={40}
        >
          {renderMessage}
        </VirtualList>
      </div>
    </div>
  );
}
