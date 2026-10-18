import { PlaygroundConversationPanel } from "./playground-conversation-panel.tsx";
import { PlaygroundDmPanelHeader } from "./playground-dm-panel-header.tsx";
import type { PlaygroundDirectMessageRecord } from "../mock/index.ts";
import type { PanelEdge } from "@botiverse/raft-ui";

export function PlaygroundDmPanel({
  dm,
  edge,
  onBack,
  onOpenThread,
}: {
  dm: PlaygroundDirectMessageRecord;
  edge?: PanelEdge;
  onBack?: () => void;
  onOpenThread?: (threadId: string) => void;
}) {
  return (
    <PlaygroundConversationPanel
      channel={dm}
      composerLabel={`Message @${dm.name}`}
      edge={edge}
      header={<PlaygroundDmPanelHeader dm={dm} onBack={onBack} />}
      onOpenThread={onOpenThread}
    />
  );
}
