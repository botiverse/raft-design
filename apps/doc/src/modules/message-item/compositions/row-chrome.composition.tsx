import { useState } from "react";
import {
  ActiveMessageRow,
  SearchMatchMessageRow,
  SelectedMessageRow,
} from "./row.compositions.tsx";
import { MessageMultiSelectToolbarComposition } from "./selection.compositions.tsx";

function MessageSelectionToolbarShowcase() {
  const [active, setActive] = useState(true);
  const [lastAction, setLastAction] = useState("Select-mode actions are caller-owned.");

  if (!active) {
    return (
      <button
        type="button"
        className="text-xs font-bold underline underline-offset-2"
        onClick={() => setActive(true)}
      >
        Re-enter multi-select mode
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <MessageMultiSelectToolbarComposition
        count={3}
        onCancel={() => setActive(false)}
        onCopyLink={() => setLastAction("Copied links for 3 messages.")}
        onCopyMarkdown={() => setLastAction("Copied Markdown for 3 messages.")}
        onForward={() => setLastAction("Opened forward composer for 3 messages.")}
        onGenerateImage={() => setLastAction("Generated image preview for 3 messages.")}
      />
      <p className="text-xs text-foreground-muted" role="status">
        {lastAction}
      </p>
    </div>
  );
}

export function MessageRowChromeComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-6">
      <div className="flex flex-col gap-3">
        <ActiveMessageRow />
        <SearchMatchMessageRow />
        <SelectedMessageRow />
      </div>
      <MessageSelectionToolbarShowcase />
    </div>
  );
}
