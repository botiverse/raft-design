import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useLayoutEffect, useState } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { messageItem } from "./message-item.recipe";

export type MessageItemToolbarProps = useRender.ComponentProps<"div">;

/**
 * Tells the row how wide the toolbar is (`--mi-toolbar-width` on the row), so
 * the header can fade out its end under the toolbar while it shows: the
 * header keeps no room for the toolbar (message-item.md, "The hover
 * toolbar"), and the toolbar's card only reaches part of the sender line.
 * Measured with a ResizeObserver, so a toolbar with more or fewer actions
 * covers exactly its own width; nothing on the row moves.
 */
function useToolbarWidthOnRow(element: Element | null) {
  useLayoutEffect(() => {
    const row = element?.closest<HTMLElement>("[data-message-item]");
    if (!(element instanceof HTMLElement) || !row) return;
    const write = () => row.style.setProperty("--mi-toolbar-width", `${element.offsetWidth}px`);
    write();
    if (typeof ResizeObserver === "undefined")
      return () => row.style.removeProperty("--mi-toolbar-width");
    const resize = new ResizeObserver(write);
    resize.observe(element);
    return () => {
      resize.disconnect();
      row.style.removeProperty("--mi-toolbar-width");
    };
  }, [element]);
}

export function MessageItemToolbar({ className, render, ref, ...props }: MessageItemToolbarProps) {
  const { toolbar } = messageItem();
  const [element, setElement] = useState<Element | null>(null);
  useToolbarWidthOnRow(element);
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: ref ? [ref, setElement] : setElement,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-toolbar",
    },
  });
}

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

export function MessageItemToolbarButton({
  active = false,
  className,
  render,
  ...props
}: MessageItemToolbarButtonProps) {
  const { toolbarButton } = messageItem();
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-active": active ? "true" : undefined,
    className: toolbarButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-toolbar-button",
    },
  });
}
