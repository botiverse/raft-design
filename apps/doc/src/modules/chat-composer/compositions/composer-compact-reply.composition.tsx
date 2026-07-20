import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { ComposerActions, ComposerMeta, ComposerRoot, ComposerSubmit } from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "failed" };

const SEND_DELAY_MS = 750;

export function ComposerCompactComposition() {
  const [draft, setDraft] = useState("Looks good to me.");
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
    <div className="flex justify-center">
      <ComposerRoot className="max-w-sm" onSubmit={handleSubmit}>
        <Composer>
          <ComposerInput
            aria-label="Add a comment"
            className="min-h-12 md:min-h-12"
            placeholder="Add a comment"
            value={draft}
            disabled={sendState.kind === "sending"}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
          <ComposerToolbar className="pt-0 pb-2">
            <ComposerActions>
              <span
                className={
                  sendState.kind === "failed"
                    ? "text-xs font-medium text-danger-base"
                    : "text-xs text-foreground-muted"
                }
                role={sendState.kind === "failed" ? "alert" : undefined}
              >
                {sendState.kind === "failed" ? "Send failed. Draft restored." : "Adding a comment"}
              </span>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit
                aria-label={sendState.kind === "failed" ? "Retry comment" : "Send comment"}
                aria-busy={sendState.kind === "sending"}
                disabled={!draft.trim() || sendState.kind === "sending"}
                loading={sendState.kind === "sending"}
                size="sm"
              >
                <span>{sendState.kind === "sending" ? "Sending…" : "Comment"}</span>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </div>
  );
}
