import { ArrowUp, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent } from "react";
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
  CommentCardQuote,
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
import { ANCHORED, DISCUSSIONS, QUOTES } from "../release-checklist-comments.ts";
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
 * comment and the reply box, and takes focus: the reply box when it was
 * opened from the keyboard, the card itself after a click. Esc closes it and
 * puts focus back on the collapsed card.
 */
export function Discussion({
  id,
  note,
  quote,
  active,
  onActiveChange,
}: {
  id: DiscussionId;
  /** A line about where it belongs: the whole document, or a lost position. */
  note?: string;
  /** The passage it is about, for screen readers. */
  quote?: string;
  active: boolean;
  onActiveChange: (id: DiscussionId | null) => void;
}) {
  const [comments, setComments] = useState(DISCUSSIONS[id]);
  const [draft, setDraft] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const focusNext = useRef<"input" | "card" | "trigger" | null>(null);
  const noteId = useId();
  const quoteId = useId();
  const [first, ...replies] = comments;

  useEffect(() => {
    const next = focusNext.current;
    focusNext.current = null;
    if (next === "input") input.current?.focus({ preventScroll: true });
    if (next === "card") card.current?.focus({ preventScroll: true });
    if (next === "trigger") trigger.current?.focus({ preventScroll: true });
  }, [active]);

  const open = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // A click from Enter or Space has no pointer detail: go to the reply box.
      focusNext.current = event.detail === 0 ? "input" : "card";
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

  const where = (
    <>
      {note ? <CommentCardMeta id={noteId}>{note}</CommentCardMeta> : null}
      {quote ? <CommentCardQuote id={quoteId}>{`On “${quote}”`}</CommentCardQuote> : null}
    </>
  );

  if (!active || !first) {
    return (
      <CommentCard>
        {where}
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
          aria-describedby={
            [note ? noteId : "", quote ? quoteId : ""].join(" ").trim() || undefined
          }
          onClick={open}
        />
      </CommentCard>
    );
  }

  return (
    <CommentCard active ref={card} tabIndex={-1} onKeyDown={close}>
      {where}
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
              <ComposerSubmit size="icon-md" aria-label="Send" disabled={!draft.trim()}>
                <ArrowUp />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </CommentCard>
  );
}

export function CommentMarginContent() {
  const [documentElement, setDocumentElement] = useState<HTMLElement | null>(null);
  const [marginElement, setMarginElement] = useState<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<DiscussionId | null>("rollout");
  const { ranges, tops, ready } = useCommentAnchors(documentElement, marginElement, QUOTES);
  useCommentHighlights(ranges, activeId);
  // A discussion whose passage isn't in the document any more goes to the
  // top, after the comments on the whole document; the rest follow the text.
  const anchored = ready ? [...ANCHORED].sort((a, b) => (tops[a] ?? 0) - (tops[b] ?? 0)) : [];

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
            note="On the whole document"
            active={activeId === "document"}
            onActiveChange={setActiveId}
          />
        </CommentMarginItem>
        {anchored.map((id) => (
          <CommentMarginItem key={id} top={tops[id] ?? 0} active={activeId === id}>
            <Discussion
              id={id}
              note={ranges[id] ? undefined : "Position not found"}
              quote={QUOTES[id]}
              active={activeId === id}
              onActiveChange={setActiveId}
            />
          </CommentMarginItem>
        ))}
      </CommentMargin>
    </div>
  );
}
