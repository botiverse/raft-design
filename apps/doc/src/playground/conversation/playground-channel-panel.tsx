import { PlaygroundConversationPanel } from "./playground-conversation-panel.tsx";
import { PlaygroundChannelPanelHeader } from "./playground-channel-panel-header.tsx";
import type { PlaygroundRoomChannelRecord } from "../mock/index.ts";

export function PlaygroundChannelPanel({
  channel,
  onBack,
  onOpenThread,
}: {
  channel: PlaygroundRoomChannelRecord;
  onBack?: () => void;
  onOpenThread?: (threadId: string) => void;
}) {
  return (
    <PlaygroundConversationPanel
      channel={channel}
      composerLabel={`Message #${channel.name}`}
      header={<PlaygroundChannelPanelHeader channel={channel} onBack={onBack} />}
      onOpenThread={onOpenThread}
    />
  );
}
