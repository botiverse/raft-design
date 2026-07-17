import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "failed" };

const SEND_DELAY_MS = 750;

export function ComposerCompactReplyComposition() {
  const [draft, setDraft] = useState("I’ll follow up with the final accessibility pass.");
  const [sendState, setSendState] = useState<SendState>({ kind: "idle" });
  const sendTimerRef = useRef<number | null>(null);
  const shouldFailNextSendRef = useRef(true);

  useEffect(
    () => () => {
      if (sendTimerRef.current !== null) window.clearTimeout(sendTimerRef.current);
    },
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedDraft = draft;
    if (!submittedDraft.trim() || sendState.kind === "sending") return;

    const shouldFail = shouldFailNextSendRef.current;
    shouldFailNextSendRef.current = false;
    setDraft("");
    setSendState({ kind: "sending" });

    if (sendTimerRef.current !== null) window.clearTimeout(sendTimerRef.current);
    sendTimerRef.current = window.setTimeout(() => {
      sendTimerRef.current = null;
      if (shouldFail) {
        setDraft(submittedDraft);
        setSendState({ kind: "failed" });
        return;
      }
      setSendState({ kind: "idle" });
    }, SEND_DELAY_MS);
  };

  return (
    <ComposerRoot onSubmit={handleSubmit}>
      <Composer>
        <ComposerInput
          aria-label="Reply in thread"
          placeholder="Reply in thread"
          value={draft}
          disabled={sendState.kind === "sending"}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <ComposerToolbar>
          <ComposerActions>
            <span
              className={
                sendState.kind === "failed"
                  ? "text-xs font-medium text-danger-base"
                  : "text-xs text-foreground-muted"
              }
              role={sendState.kind === "failed" ? "alert" : undefined}
            >
              {sendState.kind === "failed" ? "Send failed. Draft restored." : "Replying in thread"}
            </span>
          </ComposerActions>
          <ComposerMeta>
            <ComposerSubmit
              aria-label={sendState.kind === "failed" ? "Retry reply" : "Send reply"}
              aria-busy={sendState.kind === "sending"}
              disabled={!draft.trim() || sendState.kind === "sending"}
            >
              <span>{sendState.kind === "sending" ? "Sending…" : "Reply"}</span>
              {sendState.kind === "sending" ? <Spinner size="sm" /> : <Send />}
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
