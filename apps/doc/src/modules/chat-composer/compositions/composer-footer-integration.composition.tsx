import type { FormEvent } from "react";
import { ConversationPanelFooter, ThreadPanelFooter } from "raft-ui/wip";

import { ComposerDefaultComposition } from "./composer-default.composition.tsx";

function preventSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export function ComposerFooterIntegrationComposition({
  host = "main",
}: {
  host?: "main" | "thread";
}) {
  return (
    <div className="flex h-full flex-col justify-end bg-layer-panel">
      {host === "main" ? (
        <ConversationPanelFooter>
          <ComposerDefaultComposition onSubmit={preventSubmit} />
        </ConversationPanelFooter>
      ) : (
        <ThreadPanelFooter>
          <ComposerDefaultComposition onSubmit={preventSubmit} />
        </ThreadPanelFooter>
      )}
    </div>
  );
}
