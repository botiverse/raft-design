import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { webTopBar } from "./web-top-bar.recipe";

export type WebTopBarRootProps = useRender.ComponentProps<"div">;

/**
 * The web top bar: the frame's row above the rail from 768px on the web, and
 * a desktop app's title bar at every width. Holds `WebTopBarStart`,
 * `WebTopBarCenter` and `WebTopBarEnd`, in that order. It renders at every
 * width; the web app renders it only from 768px.
 */
export function WebTopBarRoot({ className, render, ...props }: WebTopBarRootProps) {
  const { root } = webTopBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "web-top-bar-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type WebTopBarStartProps = useRender.ComponentProps<"div">;

/** The start of the bar, lined up with the rail's items: the workspace button and the workspace strip. */
export function WebTopBarStart({ className, render, ...props }: WebTopBarStartProps) {
  const { start } = webTopBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "web-top-bar-start",
    className: start({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type WebTopBarCenterProps = useRender.ComponentProps<"div">;

/** The center of the bar, centered on the window: the search field. */
export function WebTopBarCenter({ className, render, ...props }: WebTopBarCenterProps) {
  const { center } = webTopBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "web-top-bar-center",
    className: center({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type WebTopBarEndProps = useRender.ComponentProps<"div">;

/** The end of the bar: who is working and the bell. A last icon button's icon box ends on the column margin. */
export function WebTopBarEnd({ className, render, ...props }: WebTopBarEndProps) {
  const { end } = webTopBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "web-top-bar-end",
    className: end({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
