import { ImagePlus, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
} from "raft-ui/wip";

export function ComposerDefaultComposition() {
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<"Image ready" | "File ready" | null>(null);
  const [status, setStatus] = useState("Ready to send");

  return (
    <ComposerRoot
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.trim() && !attachment) return;
        setStatus(draft.trim() ? `Sent: ${draft.trim()}` : "Attachment sent");
        setDraft("");
        setAttachment(null);
      }}
    >
      <Composer>
        <ComposerInput
          aria-label="Message #proj-uiux"
          placeholder="Message #proj-uiux"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton
              aria-label="Attach image"
              onClick={() => {
                setAttachment("Image ready");
                setStatus("Image attached");
              }}
            >
              <ImagePlus />
            </ComposerIconButton>
            <ComposerIconButton
              aria-label="Attach file"
              onClick={() => {
                setAttachment("File ready");
                setStatus("File attached");
              }}
            >
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerToolbarLabel aria-live="polite">{attachment ?? status}</ComposerToolbarLabel>
            <ComposerToolbarLabel>
              <Checkbox size="sm" aria-label="Send as task" />
              As Task
            </ComposerToolbarLabel>
            <ComposerSubmit aria-label="Send" disabled={!draft.trim() && !attachment}>
              <span>Send</span>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
