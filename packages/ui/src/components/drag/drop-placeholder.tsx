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
   * Over live content (a panel, a column of a layout): an opaque
   * `layer-canvas` under the `fill-subtle` wash, so the content under it
   * never shows through.
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

/**
 * Shown while the hand is over a place that refuses the item
 * (design/patterns/drag-and-drop.md#refused-places): the reason, in a HUD
 * chip by the pointer (by the lifted copy in a keyboard drag), and the
 * not-allowed cursor. Render it only while the place is refused, inside the
 * `DndContext`, with no placeholder anywhere. Announce the reason as well:
 * the chip is not read out.
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
    let frame = 0;
    const tick = () => {
      const node = ref.current;
      if (node) {
        let point = dragPointer();
        if (viaKeyboard || !point) {
          const lift = document.querySelector("[data-slot=drag-lift]")?.getBoundingClientRect();
          if (lift) point = { x: lift.right, y: lift.top + lift.height / 2 };
        }
        if (point) {
          node.style.transform = `translate(${Math.round(point.x + 14)}px, ${Math.round(point.y + 16)}px)`;
          node.style.visibility = "visible";
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      root.removeAttribute("data-drag-refused");
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
