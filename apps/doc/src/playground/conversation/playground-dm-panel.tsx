import { PlaygroundConversationPanel } from "./playground-conversation-panel.tsx";
import { PlaygroundDmPanelHeader } from "./playground-dm-panel-header.tsx";
import type { PlaygroundDirectMessageRecord } from "../mock/index.ts";

export function PlaygroundDmPanel({
  dm,
  onBack,
  onOpenThread,
}: {
  dm: PlaygroundDirectMessageRecord;
  onBack?: () => void;
  onOpenThread?: (threadId: string) => void;
}) {
  return (
    <PlaygroundConversationPanel
      channel={dm}
      composerLabel={`Message @${dm.name}`}
      header={<PlaygroundDmPanelHeader dm={dm} onBack={onBack} />}
      onOpenThread={onOpenThread}
    />
  );
}
