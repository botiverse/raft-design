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
  useRef,
  useState,
} from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { comment } from "./comment.recipe";
import { resolveCommentMarginLayout } from "./comment-margin-layout";

type MarginEntry = { top: number; height: number; active: boolean };

type CommentMarginContextValue = {
  tops: Record<string, number>;
  animate: boolean;
  place: (id: string, place: { top: number; active: boolean } | null) => void;
  observe: (id: string, element: Element) => () => void;
};

const CommentMarginContext = createContext<CommentMarginContextValue | null>(null);

function useCommentMargin() {
  const context = use(CommentMarginContext);
  if (!context) throw new Error("CommentMarginItem must be used within CommentMargin.");
  return context;
}

const heightOf = (element: Element) => element.getBoundingClientRect().height;

export type CommentMarginProps = useRender.ComponentProps<"div"> & {
  /** Space between two cards that would otherwise touch, in px. Default 8. */
  gap?: number;
};

/**
 * The column beside a document that holds its comment cards, each level with
 * the passage it is about. It measures its `CommentMarginItem`s with one
 * `ResizeObserver`, resolves their collisions with
 * `resolveCommentMarginLayout`, and takes the height the lowest card needs.
 * Place it beside the document so that its top is the top the items' `top`
 * is measured from.
 */
export function CommentMargin({ className, render, style, gap = 8, ...props }: CommentMarginProps) {
  const { margin } = comment();
  const [entries, setEntries] = useState<ReadonlyMap<string, MarginEntry>>(() => new Map());
  const [animate, setAnimate] = useState(false);
  const observer = useRef<ResizeObserver | null>(null);
  const observed = useRef(new Map<Element, string>());

  const patch = useCallback((id: string, next: Partial<MarginEntry> | null) => {
    setEntries((current) => {
      const previous = current.get(id);
      if (next === null) {
        if (!previous) return current;
        const without = new Map(current);
        without.delete(id);
        return without;
      }
      // A height measured after the item left, or before it was placed.
      if (!previous && next.top === undefined) return current;
      const merged = { top: 0, height: 0, active: false, ...previous, ...next };
      if (
        previous &&
        previous.top === merged.top &&
        previous.height === merged.height &&
        previous.active === merged.active
      ) {
        return current;
      }
      const updated = new Map(current);
      updated.set(id, merged);
      return updated;
    });
  }, []);

  const place = useCallback<CommentMarginContextValue["place"]>(
    (id, placement) => patch(id, placement),
    [patch],
  );

  const observe = useCallback<CommentMarginContextValue["observe"]>(
    (id, element) => {
      observer.current ??= new ResizeObserver((records) => {
        for (const record of records) {
          const target = observed.current.get(record.target);
          if (target) patch(target, { height: heightOf(record.target) });
        }
      });
      observed.current.set(element, id);
      patch(id, { height: heightOf(element) });
      observer.current.observe(element);
      return () => {
        observer.current?.unobserve(element);
        observed.current.delete(element);
      };
    },
    [patch],
  );

  useEffect(() => () => observer.current?.disconnect(), []);

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
    () => ({ tops: layout.tops, animate, place, observe }),
    [layout.tops, animate, place, observe],
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
 * make room. Items with the same `top` keep the order they were first
 * rendered in. The resolved top is `data-top`, applied as a `translateY`.
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
  const { tops, animate, place, observe } = useCommentMargin();
  const id = useId();
  const [element, setElement] = useState<Element | null>(null);

  useLayoutEffect(() => {
    place(id, { top, active });
  }, [place, id, top, active]);

  useLayoutEffect(() => (element ? observe(id, element) : undefined), [observe, id, element]);

  useLayoutEffect(() => () => place(id, null), [place, id]);

  const resolved = tops[id] ?? Math.max(top, 0);
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "comment-margin-item",
    "data-top": String(resolved),
    "data-active": active ? "" : undefined,
    "data-animate": animate ? "" : undefined,
    className: marginItem({ className }),
    style: { ...style, transform: `translateY(${resolved}px)` },
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: setElement,
    props: mergeProps<"div">(defaultProps, props),
  });
}
