import { PlaygroundConversationPanel } from "./playground-conversation-panel.tsx";
import { PlaygroundChannelPanelHeader } from "./playground-channel-panel-header.tsx";
import type { PlaygroundRoomChannelRecord } from "../mock/index.ts";
import type { PanelEdge } from "raft-ui";

export function PlaygroundChannelPanel({
  channel,
  edge,
  onBack,
  onOpenThread,
}: {
  channel: PlaygroundRoomChannelRecord;
  edge?: PanelEdge;
  onBack?: () => void;
  onOpenThread?: (threadId: string) => void;
}) {
  return (
    <PlaygroundConversationPanel
      channel={channel}
      composerLabel={`Message #${channel.name}`}
      edge={edge}
      header={<PlaygroundChannelPanelHeader channel={channel} onBack={onBack} />}
      onOpenThread={onOpenThread}
    />
  );
}
