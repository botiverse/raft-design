import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { comment } from "./comment.recipe";
import { resolveCommentMarginLayout } from "./comment-margin-layout";

type MarginEntry = { top: number; height: number; active: boolean };

type CommentMarginContextValue = {
  tops: Record<string, number>;
  animate: boolean;
  update: (id: string, entry: MarginEntry | null) => void;
};

const CommentMarginContext = createContext<CommentMarginContextValue | null>(null);

function useCommentMargin() {
  const context = use(CommentMarginContext);
  if (!context) throw new Error("CommentMarginItem must be used within CommentMargin.");
  return context;
}

const sameEntry = (a: MarginEntry | undefined, b: MarginEntry) =>
  a !== undefined && a.top === b.top && a.height === b.height && a.active === b.active;

export type CommentMarginProps = useRender.ComponentProps<"div"> & {
  /** Space between two cards that would otherwise touch, in px. Default 8. */
  gap?: number;
};

/**
 * The column beside a document that holds its comment cards, each level with
 * the passage it is about. It measures its `CommentMarginItem`s and resolves
 * their collisions with `resolveCommentMarginLayout`, and takes the height
 * the lowest card needs. Place it beside the document so that its top is the
 * top the items' `top` is measured from.
 */
export function CommentMargin({ className, render, style, gap = 8, ...props }: CommentMarginProps) {
  const { margin } = comment();
  const [entries, setEntries] = useState<ReadonlyMap<string, MarginEntry>>(() => new Map());
  const [animate, setAnimate] = useState(false);

  const update = useCallback((id: string, entry: MarginEntry | null) => {
    setEntries((current) => {
      if (entry === null) {
        if (!current.has(id)) return current;
        const next = new Map(current);
        next.delete(id);
        return next;
      }
      if (sameEntry(current.get(id), entry)) return current;
      const next = new Map(current);
      next.set(id, entry);
      return next;
    });
  }, []);

  const layout = useMemo(() => {
    const items = [...entries].map(([id, { top, height }]) => ({ id, top, height }));
    const activeId = [...entries].find(([, entry]) => entry.active)?.[0];
    return resolveCommentMarginLayout(items, { gap, activeId });
  }, [entries, gap]);

  // Cards move to their places before the first paint; only later changes
  // (a card opening, the active card changing) animate.
  const measured = entries.size > 0;
  useEffect(() => {
    if (!measured) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [measured]);

  const context = useMemo(
    () => ({ tops: layout.tops, animate, update }),
    [layout.tops, animate, update],
  );

  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-margin",
    className: margin({ className }),
    style: { minHeight: layout.height, ...style },
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return <CommentMarginContext value={context}>{element}</CommentMarginContext>;
}

export type CommentMarginItemProps = useRender.ComponentProps<"div"> & {
  /** Where the card's anchor is: its y, in px, from the top of the margin. */
  top: number;
  /** Pins this card to its anchor and moves the others around it. */
  active?: boolean;
};

/**
 * One card's place in a `CommentMargin`. It sits at `top`, or lower when the
 * card above it is in the way; the active one stays at `top` and the others
 * make room. The resolved top is its `style.top` and `data-top`.
 */
export function CommentMarginItem({
  className,
  render,
  style,
  top,
  active = false,
  ...props
}: CommentMarginItemProps) {
  const { marginItem } = comment();
  const { tops, animate, update } = useCommentMargin();
  const id = useId();
  const [element, setElement] = useState<Element | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  useLayoutEffect(() => {
    update(id, { top, height, active });
  }, [update, id, top, height, active]);

  useLayoutEffect(() => () => update(id, null), [update, id]);

  const resolved = tops[id] ?? Math.max(top, 0);
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-margin-item",
    "data-top": String(resolved),
    "data-active": active ? "" : undefined,
    "data-animate": animate ? "" : undefined,
    className: marginItem({ className }),
    style: { ...style, top: resolved },
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: setElement,
    props: mergeProps<"div">(defaultProps, props),
  });
}
