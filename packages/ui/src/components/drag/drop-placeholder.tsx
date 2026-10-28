"use client";

import { useEffect, useRef } from "react";
import type { ComponentPropsWithRef } from "react";
import { createPortal } from "react-dom";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { useDndContext } from "@dnd-kit/core";
import { drag } from "./drag.recipe";
import { dragPointer } from "./drag-lift";

export type DropPlaceholderProps = useRender.ComponentProps<"div"> & {
  /**
   * In a layout (the gap a column makes, a new column's strip): an opaque
   * `layer-canvas` under the `fill-subtle` wash, so the column behind the gap
   * doesn't show through while its sections reflow. Nothing is drawn over
   * live content (design/patterns/drag-and-drop.md#where-it-will-land).
   */
  opaque?: boolean;
};

/**
 * Where a dragged item will land (design/patterns/drag-and-drop.md#where-it-will-land):
 * a 1.5px dashed `line-strong` outline on `fill-subtle`, with the item's
 * radius and size. One look for every place. The control radius is the
 * default; pass the item's own (`rounded-container` for a card). Hidden from
 * assistive technology: the announcements say where the item is.
 */
export function DropPlaceholder({
  opaque = false,
  className,
  render,
  ...props
}: DropPlaceholderProps) {
  const { placeholder } = drag({ opaque });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "aria-hidden": true,
        className: placeholder({ className }),
      },
      props,
      { "data-slot": "drop-placeholder" } as ComponentPropsWithRef<"div">,
    ),
  });
}

export type DragRefusalHintProps = Omit<ComponentPropsWithRef<"div">, "children" | "ref"> & {
  /** Why the place under the hand won't take the item, such as "Can't move from Todo to Done". */
  children: string;
  /** Render the hint in another element; by default it renders in `document.body`. */
  container?: Element | DocumentFragment | null;
};

/** The chip sits this far right of and below the pointer. */
const HINT_OFFSET = { x: 14, y: 16 } as const;
/** It stays at least this far inside the window on every side. */
const HINT_INSET = 8;
/** Pushed off the lifted copy, it keeps this far from it. */
const HINT_GAP = 6;

type Box = { left: number; top: number; right: number; bottom: number };
type Size = { width: number; height: number };

function overlaps(a: Box, b: Box) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Where the refusal chip goes (design/patterns/drag-and-drop.md#refused-places):
 * right of and below the pointer; left of it (and of the copy) where the
 * window's right edge would cut it, above it where the bottom edge would; off
 * the lifted copy, which is drawn over it; and always at least 8px inside the
 * window.
 */
export function placeRefusalHint(
  point: { x: number; y: number },
  size: Size,
  lift: Box | null,
  viewport: Size,
): { x: number; y: number } {
  const { width, height } = size;
  const maxX = viewport.width - HINT_INSET - width;
  const maxY = viewport.height - HINT_INSET - height;
  const fitsX = (x: number) => x >= HINT_INSET && x <= maxX;
  const fitsY = (y: number) => y >= HINT_INSET && y <= maxY;

  const right = point.x + HINT_OFFSET.x;
  const onRight = right <= maxX;
  let x = onRight ? right : Math.min(point.x, lift?.left ?? point.x) - HINT_OFFSET.x - width;
  const below = point.y + HINT_OFFSET.y;
  const onBelow = below <= maxY;
  let y = onBelow ? below : point.y - HINT_OFFSET.y - height;

  const box = (bx: number, by: number) => ({
    left: bx,
    top: by,
    right: bx + width,
    bottom: by + height,
  });
  if (lift && overlaps(box(x, y), lift)) {
    // Off the copy: above or below it on the side the chip is on, else beside it.
    const clearBelow = lift.bottom + HINT_GAP;
    const clearAbove = lift.top - HINT_GAP - height;
    const vertical = (onBelow ? [clearBelow, clearAbove] : [clearAbove, clearBelow]).find(fitsY);
    if (vertical !== undefined) {
      y = vertical;
    } else {
      const besideRight = lift.right + HINT_OFFSET.x;
      const besideLeft = lift.left - HINT_OFFSET.x - width;
      const beside = (onRight ? [besideRight, besideLeft] : [besideLeft, besideRight]).find(fitsX);
      if (beside !== undefined) x = beside;
    }
  }
  return { x: Math.round(clamp(x, HINT_INSET, maxX)), y: Math.round(clamp(y, HINT_INSET, maxY)) };
}

/**
 * Shown while the hand is over a place that refuses the item
 * (design/patterns/drag-and-drop.md#refused-places): the reason, in a HUD
 * chip by the pointer (by the lifted copy in a keyboard drag), and the
 * not-allowed cursor. Render it only while the place is refused, inside the
 * `DndContext`, with no placeholder anywhere. Announce the reason as well:
 * the chip is not read out.
 *
 * The chip sits right of and below the pointer. Near the window's right edge
 * it goes left of the pointer and of the lifted copy, near the bottom edge
 * above the pointer; it never sits under the copy, and always stays 8px inside
 * the window. Its size is measured when its content changes, not every frame.
 */
export function DragRefusalHint({
  children,
  container,
  className,
  style,
  ...props
}: DragRefusalHintProps) {
  const { hint } = drag();
  const ref = useRef<HTMLDivElement>(null);
  const { active, activatorEvent } = useDndContext();
  const dragging = active != null;
  const viaKeyboard =
    typeof KeyboardEvent !== "undefined" && activatorEvent instanceof KeyboardEvent;

  useEffect(() => {
    if (!dragging) return;
    const root = document.documentElement;
    root.setAttribute("data-drag-refused", "");
    const node = ref.current;
    // The chip's size, read once and again only when its content resizes it.
    const size = { width: node?.offsetWidth ?? 0, height: node?.offsetHeight ?? 0 };
    const observer =
      node && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            size.width = node.offsetWidth;
            size.height = node.offsetHeight;
          })
        : null;
    if (node) observer?.observe(node);
    let frame = 0;
    const tick = () => {
      if (node) {
        const lift = document.querySelector("[data-slot=drag-lift]")?.getBoundingClientRect();
        let point = dragPointer();
        if ((viaKeyboard || !point) && lift)
          point = { x: lift.right, y: lift.top + lift.height / 2 };
        if (point) {
          const at = placeRefusalHint(point, size, lift ?? null, {
            width: window.innerWidth,
            height: window.innerHeight,
          });
          node.style.transform = `translate(${at.x}px, ${at.y}px)`;
          node.style.visibility = "visible";
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      root.removeAttribute("data-drag-refused");
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [dragging, viaKeyboard]);

  if (!dragging || typeof document === "undefined") return null;
  return createPortal(
    <div
      {...props}
      ref={ref}
      data-slot="drag-refusal-hint"
      aria-hidden
      className={hint({ className })}
      style={{ visibility: "hidden", ...style }}
    >
      {children}
    </div>,
    container ?? document.body,
  );
}
