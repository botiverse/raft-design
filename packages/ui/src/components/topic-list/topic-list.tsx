import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { topicList } from "./topic-list.recipe";

export type TopicListGroupProps = useRender.ComponentProps<"section">;
/** Labelled run of topics, e.g. a date bucket. Wraps a label and a TopicList. */
export function TopicListGroup({ className, render, ...props }: TopicListGroupProps) {
  const theme = useThemeFamily();
  const { group } = topicList({ theme });
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "topic-list-group",
    className: group({ className }),
  };
  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type TopicListGroupLabelProps = useRender.ComponentProps<"h3">;
export function TopicListGroupLabel({ className, render, ...props }: TopicListGroupLabelProps) {
  const theme = useThemeFamily();
  const { groupLabel } = topicList({ theme });
  const defaultProps: SlotElementProps<"h3"> = {
    "data-slot": "topic-list-group-label",
    className: groupLabel({ className }),
  };
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">(defaultProps, props),
  });
}

export type TopicListProps = useRender.ComponentProps<"ul">;
export function TopicList({ className, render, ...props }: TopicListProps) {
  const theme = useThemeFamily();
  const { root } = topicList({ theme });
  const defaultProps: SlotElementProps<"ul"> = {
    "data-slot": "topic-list",
    className: root({ className }),
  };
  return useRender({
    defaultTagName: "ul",
    render,
    props: mergeProps<"ul">(defaultProps, props),
  });
}

export type TopicListItemProps = useRender.ComponentProps<"li"> & {
  /** Emphasizes topics with activity the viewer has not seen. */
  unread?: boolean;
};
/** Highlights as selected when its trigger carries `aria-current`. */
export function TopicListItem({ unread = false, className, render, ...props }: TopicListItemProps) {
  const theme = useThemeFamily();
  const { item } = topicList({ theme });
  const defaultProps: SlotElementProps<"li"> = {
    "data-slot": "topic-list-item",
    "data-unread": unread ? "true" : undefined,
    className: item({ className }),
  };
  return useRender({
    defaultTagName: "li",
    render,
    props: mergeProps<"li">(defaultProps, props),
  });
}

export type TopicListItemTriggerProps = useRender.ComponentProps<"button">;
/** Full-row hit area. Render a link via `render` when opening a topic navigates. */
export function TopicListItemTrigger({ className, render, ...props }: TopicListItemTriggerProps) {
  const theme = useThemeFamily();
  const { itemTrigger } = topicList({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: render ? undefined : "button",
    "data-slot": "topic-list-item-trigger",
    className: itemTrigger({ className }),
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type TopicListItemAvatarProps = useRender.ComponentProps<"div">;
export function TopicListItemAvatar({ className, render, ...props }: TopicListItemAvatarProps) {
  const theme = useThemeFamily();
  const { itemAvatar } = topicList({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "topic-list-item-avatar",
    "aria-hidden": true,
    className: itemAvatar({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TopicListItemContentProps = useRender.ComponentProps<"div">;
export function TopicListItemContent({ className, render, ...props }: TopicListItemContentProps) {
  const theme = useThemeFamily();
  const { itemContent } = topicList({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "topic-list-item-content",
    className: itemContent({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TopicListItemHeadingProps = useRender.ComponentProps<"div">;
/** Title row that keeps trailing badges visible while the title truncates. */
export function TopicListItemHeading({ className, render, ...props }: TopicListItemHeadingProps) {
  const theme = useThemeFamily();
  const { itemHeading } = topicList({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "topic-list-item-heading",
    className: itemHeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TopicListItemTitleProps = useRender.ComponentProps<"span">;
export function TopicListItemTitle({ className, render, ...props }: TopicListItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = topicList({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "topic-list-item-title",
    className: itemTitle({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TopicListItemExcerptProps = useRender.ComponentProps<"span">;
export function TopicListItemExcerpt({ className, render, ...props }: TopicListItemExcerptProps) {
  const theme = useThemeFamily();
  const { itemExcerpt } = topicList({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "topic-list-item-excerpt",
    className: itemExcerpt({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TopicListItemAuthorProps = useRender.ComponentProps<"span">;
export function TopicListItemAuthor({ className, render, ...props }: TopicListItemAuthorProps) {
  const theme = useThemeFamily();
  const { itemAuthor } = topicList({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "topic-list-item-author",
    className: itemAuthor({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TopicListItemAsideProps = useRender.ComponentProps<"div">;
export function TopicListItemAside({ className, render, ...props }: TopicListItemAsideProps) {
  const theme = useThemeFamily();
  const { itemAside } = topicList({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "topic-list-item-aside",
    className: itemAside({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TopicListItemTimeProps = useRender.ComponentProps<"time">;
export function TopicListItemTime({ className, render, ...props }: TopicListItemTimeProps) {
  const theme = useThemeFamily();
  const { itemTime } = topicList({ theme });
  const defaultProps: SlotElementProps<"time"> = {
    "data-slot": "topic-list-item-time",
    className: itemTime({ className }),
  };
  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
  });
}

export type TopicListItemRepliesProps = useRender.ComponentProps<"span">;
export function TopicListItemReplies({ className, render, ...props }: TopicListItemRepliesProps) {
  const theme = useThemeFamily();
  const { itemReplies } = topicList({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "topic-list-item-replies",
    className: itemReplies({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TopicListItemStatsProps = useRender.ComponentProps<"div">;
/** Inline row for participants, reply count and similar figures. */
export function TopicListItemStats({ className, render, ...props }: TopicListItemStatsProps) {
  const theme = useThemeFamily();
  const { itemStats } = topicList({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "topic-list-item-stats",
    className: itemStats({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
