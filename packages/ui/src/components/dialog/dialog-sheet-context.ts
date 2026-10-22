import { createContext, createElement, useContext } from "react";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";

/**
 * Whether the dialog's parts are drawn as a phone sheet now, and where its
 * head keeps the commit button. Set by `DialogSheetContent` below 768px; every
 * other dialog (and that one on a desktop) has no sheet, so the parts render
 * exactly as they always have.
 */
export type DialogSheetState = {
  sheet: boolean;
  commitSlot: HTMLElement | null;
  setCommitSlot: (element: HTMLElement | null) => void;
};

export const NO_SHEET: DialogSheetState = {
  sheet: false,
  commitSlot: null,
  setCommitSlot: () => undefined,
};

export const DialogSheetContext = createContext<DialogSheetState>(NO_SHEET);

export function useDialogSheet() {
  return useContext(DialogSheetContext);
}

/** Inside the sheet's head: its × is a pushed page's leading action. */
export const DialogSheetHeadContext = createContext(false);

export function useInDialogSheetHead() {
  return useContext(DialogSheetHeadContext);
}

/**
 * Every overlay surface starts outside any sheet: a confirm, a dialog or a
 * drawer opened from inside a sheet keeps its own head, footer and commit
 * button instead of taking the sheet's.
 */
export function DialogSheetReset({ children }: { children?: ReactNode }) {
  return createElement(
    DialogSheetContext.Provider,
    { value: NO_SHEET },
    createElement(DialogSheetHeadContext.Provider, { value: false }, children),
  );
}

/**
 * A dialog drawn as a phone sheet (design: dialog.md "On a phone"). The
 * surface is DialogContent's frame docked to the bottom, 90% of the screen
 * tall, rounded on its top corners, sliding up as a bottom sheet does; its
 * head is a pushed page's head (× at the start, the title, the commit button
 * at the end); its body keeps the phone's 16px margin and the home indicator's
 * inset. Merged over DialogContent's classes, so these win.
 */
export const dialogSheet = tv({
  slots: {
    content: [
      "fixed inset-x-0 top-auto bottom-0 left-0 h-[90dvh] max-h-none w-full max-w-none translate-none",
      "rounded-none rounded-t-dialog",
      "pr-[env(safe-area-inset-right,0px)] pl-[env(safe-area-inset-left,0px)]",
      "transition-transform duration-240 ease-slide data-ending-style:duration-180",
      "data-starting-style:translate-y-full data-ending-style:translate-y-full",
      "motion-reduce:transition-none",
    ],
    overlay: [
      "transition-opacity duration-240 ease-slide data-ending-style:duration-180",
      "data-starting-style:opacity-0 data-ending-style:opacity-0",
      "motion-reduce:transition-none",
    ],
    header: ["flex h-14 shrink-0 items-center gap-2 px-4 pt-0", "border-b border-line-seam"],
    title: ["min-w-0 flex-1 truncate"],
    commitSlot: ["flex shrink-0 items-center empty:hidden"],
    body: [
      "min-h-0 content-start",
      "px-4 pt-4 first:pt-4 pb-[max(16px,env(safe-area-inset-bottom,0px))]",
    ],
    barBody: ["block overflow-y-auto"],
  },
});
