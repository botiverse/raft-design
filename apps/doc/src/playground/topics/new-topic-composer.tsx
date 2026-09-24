import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Button,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui";
import { ComposerSubject } from "raft-ui/wip";

import {
  Composer,
  ComposerInput,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";
import type { PlaygroundTopicChannelRecord } from "../mock/index.ts";
import { usePlaygroundTopicState } from "./use-playground-topic-state.ts";

/** The "Search or start a topic" bar expanded in place, like a Discord forum's new post. */
export function PlaygroundNewTopicComposer({
  channel,
  guidelinesOpen,
  initialTitle,
  onClose,
  onToggleGuidelines,
}: {
  channel: PlaygroundTopicChannelRecord;
  guidelinesOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onToggleGuidelines?: () => void;
}) {
  const navigate = useNavigate();
  const { createTopic } = usePlaygroundTopicState();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const canPost = Boolean(title.trim() && content.trim());

  useEffect(() => {
    (initialTitle ? contentRef : titleRef).current?.focus();
  }, [initialTitle]);

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose();
  }

  return (
    <ComposerRoot
      aria-label={`New topic in #${channel.name}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canPost) return;
        const topic = createTopic({
          channelId: channel.id,
          title: title.trim(),
          content: content.trim(),
        });
        onClose();
        void navigate({
          to: "/playground/topics/$channelId",
          params: { channelId: channel.id },
          search: { topic: topic.id },
        });
      }}
    >
      <Composer>
        <ComposerSubject
          ref={titleRef}
          aria-label="Topic title"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          onKeyDown={(event) => {
            closeOnEscape(event);
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              contentRef.current?.focus();
            }
          }}
        />
        <ComposerInput
          ref={contentRef}
          aria-label="Topic message"
          placeholder="Enter a message…"
          rows={4}
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          onKeyDown={closeOnEscape}
        />
        <ComposerToolbar>
          <ComposerActions>
            {onToggleGuidelines ? (
              <ComposerIconButton
                aria-label={guidelinesOpen ? "Hide guidelines" : "Show guidelines"}
                aria-pressed={guidelinesOpen}
                onClick={onToggleGuidelines}
              >
                <ClipboardList />
              </ComposerIconButton>
            ) : null}
          </ComposerActions>
          <ComposerMeta>
            <Button variant="ghost" size="sm" onClick={onClose}>
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
