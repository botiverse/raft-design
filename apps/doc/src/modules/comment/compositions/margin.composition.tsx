import { ArrowUp, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  Composer,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "@botiverse/raft-ui";
import {
  CommentCard,
  CommentCardMeta,
  CommentCardTrigger,
  CommentEntry,
  CommentEntryAuthor,
  CommentEntryBody,
  CommentEntryHeader,
  CommentEntryTime,
  CommentMargin,
  CommentMarginItem,
} from "@botiverse/raft-ui/wip";

import { useCommentAnchors, useCommentHighlights } from "../comment-anchors.ts";
import { ReleaseChecklist } from "../release-checklist.tsx";
import { DISCUSSIONS, QUOTES } from "../release-checklist-comments.ts";
import type { Comment, DiscussionId } from "../release-checklist-comments.ts";

export function DiscussionEntry({ comment, clamp }: { comment: Comment; clamp?: boolean }) {
  return (
    <CommentEntry>
      <CommentEntryHeader>
        <Avatar size="xs" type={comment.type}>
          <AvatarFallback>{comment.author[0]}</AvatarFallback>
        </Avatar>
        <CommentEntryAuthor>{comment.author}</CommentEntryAuthor>
        <CommentEntryTime dateTime={comment.dateTime}>{comment.time}</CommentEntryTime>
      </CommentEntryHeader>
      <CommentEntryBody clamp={clamp}>{comment.text}</CommentEntryBody>
    </CommentEntry>
  );
}

/**
 * One discussion. Collapsed, it shows its first comment cut to 2 lines and
 * the number of replies, and the whole card opens it. Open, it shows every
 * comment and the reply box; Esc closes it again.
 */
function Discussion({
  id,
  meta,
  active,
  onActiveChange,
}: {
  id: DiscussionId;
  meta?: ReactNode;
  active: boolean;
  onActiveChange: (id: DiscussionId | null) => void;
}) {
  const [comments, setComments] = useState(DISCUSSIONS[id]);
  const [draft, setDraft] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const focusNext = useRef<"input" | "trigger" | null>(null);
  const [first, ...replies] = comments;

  useEffect(() => {
    if (focusNext.current === "input") input.current?.focus();
    if (focusNext.current === "trigger") trigger.current?.focus();
    focusNext.current = null;
  }, [active]);

  const open = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // A click from Enter or Space has no pointer detail: move into the reply box.
      if (event.detail === 0) focusNext.current = "input";
      onActiveChange(id);
    },
    [id, onActiveChange],
  );

  const close = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") return;
      focusNext.current = "trigger";
      onActiveChange(null);
    },
    [onActiveChange],
  );

  const changeDraft = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.currentTarget.value);
  }, []);

  const reply = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) return;
      setComments((current) => [
        ...current,
        {
          author: "Martin",
          type: "human",
          time: "11:12",
          dateTime: "2026-10-20T11:12:00+08:00",
          text,
        },
      ]);
      setDraft("");
    },
    [draft],
  );

  if (!active || !first) {
    return (
      <CommentCard>
        {meta}
        {first ? <DiscussionEntry comment={first} clamp /> : null}
        {replies.length > 0 ? (
          <CommentCardMeta>
            <MessageSquare aria-hidden />
            {replies.length === 1 ? "1 reply" : `${replies.length} replies`}
          </CommentCardMeta>
        ) : null}
        <CommentCardTrigger
          ref={trigger}
          aria-label={`Comment from ${first?.author}`}
          onClick={open}
        />
      </CommentCard>
    );
  }

  return (
    <CommentCard active onKeyDown={close}>
      {meta}
      {comments.map((comment) => (
        <DiscussionEntry key={comment.dateTime} comment={comment} />
      ))}
      <ComposerRoot onSubmit={reply}>
        <Composer>
          <ComposerInput
            ref={input}
            aria-label="Reply"
            placeholder="Reply"
            value={draft}
            onChange={changeDraft}
          />
          <ComposerToolbar>
            <ComposerMeta className="ms-auto">
              <ComposerSubmit size="icon-sm" aria-label="Send" disabled={!draft.trim()}>
                <ArrowUp />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </CommentCard>
  );
}

const WHOLE_DOCUMENT = <CommentCardMeta>On the whole document</CommentCardMeta>;

export function CommentMarginContent() {
  const [documentElement, setDocumentElement] = useState<HTMLElement | null>(null);
  const [marginElement, setMarginElement] = useState<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<DiscussionId | null>("rollout");
  const { ranges, tops } = useCommentAnchors(documentElement, marginElement, QUOTES);
  useCommentHighlights(ranges, activeId);

  return (
    <div className="flex w-full max-w-[920px] items-start gap-6">
      <Card className="min-w-0 flex-1">
        <CardContent ref={setDocumentElement}>
          <ReleaseChecklist />
        </CardContent>
      </Card>
      <CommentMargin
        ref={setMarginElement}
        render={<aside aria-label="Comments" />}
        className="w-[280px] shrink-0"
      >
        <CommentMarginItem top={0} active={activeId === "document"}>
          <Discussion
            id="document"
            meta={WHOLE_DOCUMENT}
            active={activeId === "document"}
            onActiveChange={setActiveId}
          />
        </CommentMarginItem>
        {tops.guard !== undefined ? (
          <CommentMarginItem top={tops.guard} active={activeId === "guard"}>
            <Discussion id="guard" active={activeId === "guard"} onActiveChange={setActiveId} />
          </CommentMarginItem>
        ) : null}
        {tops.rollout !== undefined ? (
          <CommentMarginItem top={tops.rollout} active={activeId === "rollout"}>
            <Discussion id="rollout" active={activeId === "rollout"} onActiveChange={setActiveId} />
          </CommentMarginItem>
        ) : null}
      </CommentMargin>
    </div>
  );
}
