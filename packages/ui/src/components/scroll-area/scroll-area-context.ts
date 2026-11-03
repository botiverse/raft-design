import { createContext, useContext } from "react";
import type { RefObject } from "react";

import type { ScrollAreaContainerBinding } from "./types";
import type { ScrollRails } from "./use-scrollbars";

/** What ScrollArea hands its parts: the container binding, and what the gutters draw from. */
export type ScrollAreaContextValue = {
  binding: ScrollAreaContainerBinding;
  guttersRef: RefObject<HTMLDivElement | null>;
  xThumbRef: RefObject<HTMLDivElement | null>;
  yThumbRef: RefObject<HTMLDivElement | null>;
  rails: ScrollRails;
  setDragging: (dragging: boolean) => void;
};

export const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);

export function useScrollAreaContext(part: string): ScrollAreaContextValue {
  const context = useContext(ScrollAreaContext);
  if (!context) throw new Error(`${part} must be inside a ScrollArea.`);
  return context;
}

/**
 * The binding `renderContainer` gets, for a component rendered inside it that renders the
 * container itself: put `ref`, `className`, `style` and `tabIndex` on the element that scrolls.
 */
export function useScrollAreaContainer<
  E extends HTMLElement = HTMLElement,
>(): ScrollAreaContainerBinding<E> {
  return useScrollAreaContext("useScrollAreaContainer").binding as ScrollAreaContainerBinding<E>;
}
