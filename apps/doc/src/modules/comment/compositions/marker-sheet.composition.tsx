import { ArrowUp } from "lucide-react";
import { useCallback, useState } from "react";
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
import { CommentMargin, CommentMarginItem, CommentMarker } from "@botiverse/raft-ui/wip";

import { useCommentAnchors, useCommentHighlights } from "../comment-anchors.ts";
import { ReleaseChecklist } from "../release-checklist.tsx";
import { DISCUSSIONS, QUOTES } from "../release-checklist-comments.ts";
import type { Comment, DiscussionId } from "../release-checklist-comments.ts";
import { DiscussionEntry } from "./margin.composition.tsx";

const TITLES: Record<DiscussionId, string> = {
  document: "On the whole document",
  guard: `“${QUOTES.guard}”`,
  rollout: `“${QUOTES.rollout}”`,
};

const count = (comments: Comment[]) =>
  comments.length === 1 ? "1 comment" : `${comments.length} comments`;

function Marker({
  id,
  open,
  onOpen,
}: {
  id: DiscussionId;
  open: boolean;
  onOpen: (id: DiscussionId) => void;
}) {
  const comments = DISCUSSIONS[id];
  const openThis = useCallback(() => onOpen(id), [id, onOpen]);
  const authors = [...new Map(comments.map((comment) => [comment.author, comment])).values()];
  return (
    <CommentMarker active={open} aria-label={count(comments)} onClick={openThis}>
      <AvatarGroup>
        {authors.slice(0, 3).map((author) => (
          <Avatar key={author.author} size="2xs" type={author.type}>
            <AvatarFallback>{author.author[0]}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      {comments.length}
    </CommentMarker>
  );
}

export function CommentMarkerSheetContent() {
  const [documentElement, setDocumentElement] = useState<HTMLElement | null>(null);
  const [marginElement, setMarginElement] = useState<HTMLElement | null>(null);
  const [openId, setOpenId] = useState<DiscussionId | null>(null);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Partial<Record<DiscussionId, Comment[]>>>({});
  const { ranges, tops } = useCommentAnchors(documentElement, marginElement, QUOTES);
  useCommentHighlights(ranges, openId);

  const comments = openId ? [...DISCUSSIONS[openId], ...(sent[openId] ?? [])] : [];

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
          <Marker id="document" open={openId === "document"} onOpen={setOpenId} />
        </CommentMarginItem>
        {tops.guard !== undefined ? (
          <CommentMarginItem top={tops.guard}>
            <Marker id="guard" open={openId === "guard"} onOpen={setOpenId} />
          </CommentMarginItem>
        ) : null}
        {tops.rollout !== undefined ? (
          <CommentMarginItem top={tops.rollout}>
            <Marker id="rollout" open={openId === "rollout"} onOpen={setOpenId} />
          </CommentMarginItem>
        ) : null}
      </CommentMargin>

      <Drawer open={openId !== null} onOpenChange={changeOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{count(comments)}</DrawerTitle>
            <DrawerDescription>{openId ? TITLES[openId] : null}</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="gap-4 overflow-y-auto">
            {comments.map((comment) => (
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
