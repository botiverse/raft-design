import { useCallback, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "@botiverse/raft-ui";
import { PullToRefreshIndicator, usePullToRefresh } from "@botiverse/raft-ui/wip";

export function PullToRefreshPreviewContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [savedElsewhere, setSavedElsewhere] = useState(false);
  const onRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSavedElsewhere(true);
  }, []);
  const pull = usePullToRefresh(scrollRef, { onRefresh });

  return (
    <div ref={scrollRef} className="h-80 w-full max-w-sm overflow-y-auto">
      <PullToRefreshIndicator pull={pull} label="Refreshing…" />
      {savedElsewhere && (
        <ListRow interactive={false}>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <ListRowBody>
            <ListRowTop>
              <ListRowTitle>Martin</ListRowTitle>
              <ListRowMeta>10:52</ListRowMeta>
            </ListRowTop>
            <ListRowBottom>
              <ListRowDescription>The #launch-week checklist is final.</ListRowDescription>
            </ListRowBottom>
          </ListRowBody>
        </ListRow>
      )}
      <ListRow interactive={false}>
        <Avatar size="md" type="agent">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Bugen</ListRowTitle>
            <ListRowMeta>10:40</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Release notes for #25 are in the doc.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow interactive={false}>
        <Avatar size="md" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Martin</ListRowTitle>
            <ListRowMeta>09:12</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Launch moves to Thursday.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow interactive={false}>
        <Avatar size="md" type="agent">
          <AvatarFallback>W</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Wug</ListRowTitle>
            <ListRowMeta>Mon</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Benchmarks attached, p95 is down 18%.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
    </div>
  );
}
