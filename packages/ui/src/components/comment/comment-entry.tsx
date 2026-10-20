import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { comment } from "./comment.recipe";

export type CommentEntryProps = useRender.ComponentProps<"div">;

/** One comment in a discussion: its header, then its text. */
export function CommentEntry({ className, render, ...props }: CommentEntryProps) {
  const { entry } = comment();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-entry",
    className: entry({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CommentEntryHeaderProps = useRender.ComponentProps<"div">;

/** One line: the author's `Avatar` (`size="xs"`), `CommentEntryAuthor`, then `CommentEntryTime`. */
export function CommentEntryHeader({ className, render, ...props }: CommentEntryHeaderProps) {
  const { entryHeader } = comment();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-entry-header",
    className: entryHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CommentEntryAuthorProps = useRender.ComponentProps<"span">;

/** Who wrote the comment, in bold. It truncates; the time after it doesn't. */
export function CommentEntryAuthor({ className, render, ...props }: CommentEntryAuthorProps) {
  const { entryAuthor } = comment();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "comment-entry-author",
    className: entryAuthor({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type CommentEntryTimeProps = useRender.ComponentProps<"time">;

/**
 * When the comment was written, right after the author. A `<time>`: pass the
 * moment in `dateTime` (ISO 8601).
 */
export function CommentEntryTime({ className, render, ...props }: CommentEntryTimeProps) {
  const { entryTime } = comment();
  const defaultProps: SlotElementProps<"time"> = {
    "data-slot": "comment-entry-time",
    className: entryTime({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
  });
}

export type CommentEntryBodyProps = useRender.ComponentProps<"div"> & {
  /** Cuts the text to 2 lines, for a collapsed card. */
  clamp?: boolean;
};

/** What the comment says. */
export function CommentEntryBody({
  className,
  render,
  clamp = false,
  ...props
}: CommentEntryBodyProps) {
  const { entryBody } = comment({ clamp });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-entry-body",
    "data-clamp": clamp ? "" : undefined,
    className: entryBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
