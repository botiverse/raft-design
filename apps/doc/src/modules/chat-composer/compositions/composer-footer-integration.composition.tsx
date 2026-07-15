import type { FormEvent } from "react";
import { ChatMainPanelFooter, ChatThreadPanelFooter } from "raft-ui/wip";

import { ComposerDefaultComposition } from "./composer-default.composition.tsx";

export function ComposerFooterIntegrationComposition({
  host = "main",
}: {
  host?: "main" | "thread";
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <div className="flex h-full flex-col justify-end bg-layer-panel">
      {host === "main" ? (
        <ChatMainPanelFooter onSubmit={handleSubmit}>
          <ComposerDefaultComposition />
        </ChatMainPanelFooter>
      ) : (
        <ChatThreadPanelFooter render={<form onSubmit={handleSubmit} />}>
          <ComposerDefaultComposition />
        </ChatThreadPanelFooter>
      )}
    </div>
  );
}
