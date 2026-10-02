import { Send, X } from "lucide-react";
import { useState } from "react";
import { Button, ComposerMeta, ComposerRoot, ComposerSubmit } from "raft-ui";
import { ComposerSubject } from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

export function ComposerSubjectComposition() {
  const [subject, setSubject] = useState("Rate-limit invite link lookups");
  const [message, setMessage] = useState("");
  const canPost = Boolean(subject.trim() && message.trim());

  return (
    <ComposerRoot
      onSubmit={(event) => {
        event.preventDefault();
        if (!canPost) return;
        setSubject("");
        setMessage("");
      }}
    >
      <Composer>
        <ComposerSubject
          aria-label="Topic title"
          placeholder="Title"
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
        />
        <ComposerInput
          aria-label="Topic message"
          placeholder="Enter a message…"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
        />
        <ComposerToolbar>
          <span />
          <ComposerMeta>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubject("");
                setMessage("");
              }}
            >
              <X aria-hidden />
              Discard
            </Button>
            <ComposerSubmit aria-label="Post topic" disabled={!canPost}>
              <span>Post</span>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
