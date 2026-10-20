import { ArrowUp } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Button,
  Card,
  CardContent,
  Composer,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@botiverse/raft-ui";
import {
  CommentCardMeta,
  CommentCardQuote,
  CommentMargin,
  CommentMarginItem,
  CommentMarker,
} from "@botiverse/raft-ui/wip";

import { useCommentAnchors, useCommentHighlights } from "../comment-anchors.ts";
import { ReleaseChecklist } from "../release-checklist.tsx";
import { ANCHORED, DISCUSSIONS, QUOTES } from "../release-checklist-comments.ts";
import type { Comment, DiscussionId } from "../release-checklist-comments.ts";
import { DiscussionEntry } from "./margin.composition.tsx";

const count = (comments: Comment[]) =>
  comments.length === 1 ? "1 comment" : `${comments.length} comments`;

/** A marker beside a passage, or at the top for the whole document and lost positions. */
function Marker({
  id,
  comments,
  description,
  open,
  onOpen,
}: {
  id: DiscussionId;
  comments: Comment[];
  description: string;
  open: boolean;
  onOpen: (id: DiscussionId) => void;
}) {
  const descriptionId = useId();
  const openThis = useCallback(() => onOpen(id), [id, onOpen]);
  const authors = [...new Map(comments.map((comment) => [comment.author, comment])).values()];
  return (
    <>
      <CommentMarker
        active={open}
        aria-label={count(comments)}
        aria-describedby={descriptionId}
        onClick={openThis}
      >
        <AvatarGroup>
          {authors.slice(0, 3).map((author) => (
            <Avatar key={author.author} size="2xs" type={author.type}>
              <AvatarFallback>{author.author[0]}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        {comments.length}
      </CommentMarker>
      <CommentCardQuote id={descriptionId}>{description}</CommentCardQuote>
    </>
  );
}

export function CommentMarkerSheetContent() {
  const [documentElement, setDocumentElement] = useState<HTMLElement | null>(null);
  const [marginElement, setMarginElement] = useState<HTMLElement | null>(null);
  const [openId, setOpenId] = useState<DiscussionId | null>(null);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Partial<Record<DiscussionId, Comment[]>>>({});
  const { ranges, tops, ready } = useCommentAnchors(documentElement, marginElement, QUOTES);
  useCommentHighlights(ranges, openId);

  const thread = useCallback(
    (id: DiscussionId) => [...DISCUSSIONS[id], ...(sent[id] ?? [])],
    [sent],
  );
  // Discussions whose passage isn't in the document any more go in the top
  // marker's sheet, after the comments on the whole document.
  const lost = useMemo(() => (ready ? ANCHORED.filter((id) => !ranges[id]) : []), [ready, ranges]);
  const found = ANCHORED.filter((id) => ranges[id] && tops[id] !== undefined);
  const top = useMemo(() => [...thread("document"), ...lost.flatMap(thread)], [thread, lost]);
  const comments = openId === "document" ? top : openId ? thread(openId) : [];

  const changeOpen = useCallback((open: boolean) => {
    if (!open) setOpenId(null);
  }, []);

  const changeDraft = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.currentTarget.value);
  }, []);

  const reply = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = draft.trim();
      if (!openId || !text) return;
      const comment: Comment = {
        author: "Martin",
        type: "human",
        time: "11:12",
        dateTime: "2026-10-20T11:12:00+08:00",
        text,
      };
      setSent((current) => ({ ...current, [openId]: [...(current[openId] ?? []), comment] }));
      setDraft("");
    },
    [draft, openId],
  );

  return (
    <div className="flex w-full max-w-[390px] items-start gap-2">
      <Card className="min-w-0 flex-1">
        <CardContent ref={setDocumentElement}>
          <ReleaseChecklist />
        </CardContent>
      </Card>
      <CommentMargin
        ref={setMarginElement}
        render={<aside aria-label="Comments" />}
        className="w-18 shrink-0"
        gap={4}
      >
        <CommentMarginItem top={0}>
          <Marker
            id="document"
            comments={top}
            description={
              lost.length > 0
                ? "On the whole document, and comments whose position was not found"
                : "On the whole document"
            }
            open={openId === "document"}
            onOpen={setOpenId}
          />
        </CommentMarginItem>
        {found.map((id) => (
          <CommentMarginItem key={id} top={tops[id] ?? 0}>
            <Marker
              id={id}
              comments={thread(id)}
              description={`On “${QUOTES[id]}”`}
              open={openId === id}
              onOpen={setOpenId}
            />
          </CommentMarginItem>
        ))}
      </CommentMargin>

      <Drawer open={openId !== null} onOpenChange={changeOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{count(comments)}</DrawerTitle>
            <DrawerDescription>
              {openId === "document"
                ? "On the whole document"
                : openId
                  ? `“${QUOTES[openId as keyof typeof QUOTES]}”`
                  : null}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="gap-4 overflow-y-auto">
            {(openId === "document" ? thread("document") : comments).map((comment) => (
              <DiscussionEntry key={comment.dateTime} comment={comment} />
            ))}
            <ComposerRoot onSubmit={reply}>
              <Composer>
                <ComposerInput
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
            {openId === "document"
              ? lost.map((id) => (
                  <section key={id} className="flex flex-col gap-2" aria-label="Position not found">
                    <CommentCardMeta>Position not found</CommentCardMeta>
                    <CommentCardQuote>{`Was on “${QUOTES[id]}”`}</CommentCardQuote>
                    {thread(id).map((comment) => (
                      <DiscussionEntry key={comment.dateTime} comment={comment} />
                    ))}
                  </section>
                ))
              : null}
          </DrawerBody>
          <DrawerFooter>
            <DrawerActions>
              <DrawerClose render={<Button variant="outline" size="lg" />}>Close</DrawerClose>
            </DrawerActions>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
