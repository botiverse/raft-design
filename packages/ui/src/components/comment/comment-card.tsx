import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { comment } from "./comment.recipe";

export type CommentCardProps = useRender.ComponentProps<"div"> & {
  /** The discussion people are reading or replying to: an ink border, lifted. */
  active?: boolean;
};

/**
 * The card of one discussion: its comments, a line such as "2 replies", and
 * the reply box when it is open. A `div`; which parts it holds (collapsed or
 * open) is the caller's choice. To open it with a click, add
 * `CommentCardTrigger`.
 */
export function CommentCard({ className, render, active = false, ...props }: CommentCardProps) {
  const { card } = comment();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-card",
    "data-active": active ? "" : undefined,
    "aria-current": active ? "true" : undefined,
    className: card({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CommentCardTriggerProps = useRender.ComponentProps<"button">;

/**
 * A button laid over the whole card, for a collapsed card that opens when it
 * is clicked or chosen with the keyboard. It has no text of its own: give it
 * an `aria-label` ("Comment from Martin").
 */
export function CommentCardTrigger({ className, render, ...props }: CommentCardTriggerProps) {
  const { cardTrigger } = comment();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "comment-card-trigger",
    type: "button",
    className: cardTrigger({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type CommentCardMetaProps = useRender.ComponentProps<"div">;

/**
 * A short line about the discussion, in the caller's words: how many replies
 * it has, that it is about the whole document, or that the passage it was on
 * can no longer be found.
 */
export function CommentCardMeta({ className, render, ...props }: CommentCardMetaProps) {
  const { cardMeta } = comment();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-card-meta",
    className: cardMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CommentCardQuoteProps = useRender.ComponentProps<"span">;

/**
 * The passage the discussion is about, in the caller's words (usually the
 * quoted text). Hidden on screen, where the card's place beside the
 * highlighted passage says it; give it an `id` and point the
 * `aria-describedby` of `CommentCardTrigger` or `CommentMarker` at it, so a
 * screen reader says which passage a card is about.
 */
export function CommentCardQuote({ className, render, ...props }: CommentCardQuoteProps) {
  const { cardQuote } = comment();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "comment-card-quote",
    className: cardQuote({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
