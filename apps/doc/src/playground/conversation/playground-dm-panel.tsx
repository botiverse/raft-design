import { PlaygroundConversationPanel } from "./playground-conversation-panel.tsx";
import { PlaygroundDmPanelHeader } from "./playground-dm-panel-header.tsx";
import type { PlaygroundDirectMessageRecord } from "../mock/index.ts";

export function PlaygroundDmPanel({ dm }: { dm: PlaygroundDirectMessageRecord }) {
  return (
    <PlaygroundConversationPanel
      channel={dm}
      composerLabel={`Message @${dm.name}`}
      header={<PlaygroundDmPanelHeader dm={dm} />}
    />
  );
}
