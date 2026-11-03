import type { RefObject } from "react";

import type { ScrollAreaGuttersBinding } from "./types";
import type { ScrollRails } from "./use-scrollbars";

/** What `ScrollAreaGuttersBinding` holds: internal, so the wiring can change without a breaking change. */
export type GuttersBinding = {
  /** The container the gutters scroll. */
  containerRef: RefObject<HTMLElement | null>;
  /** The gutters layer. */
  guttersRef: RefObject<HTMLDivElement | null>;
  /** Which axes have a gutter now: one with something to scroll. */
  rails: ScrollRails;
  /** The vertical thumb, which the area sizes and moves. */
  yThumbRef: RefObject<HTMLDivElement | null>;
  /** The horizontal thumb. */
  xThumbRef: RefObject<HTMLDivElement | null>;
  /** Called when a thumb drag starts and ends (and when a gutter unmounts mid-drag). */
  onDraggingChange: (dragging: boolean) => void;
};

export const fromGuttersBinding = (binding: ScrollAreaGuttersBinding) =>
  binding as unknown as GuttersBinding;
