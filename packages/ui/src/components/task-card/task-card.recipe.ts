import { tv } from "../../lib/tv";

export const taskCard = tv({
  slots: {
    root: "",
    hit: "",
    row: "",
    body: "",
    meta: "",
    channel: "",
    number: "",
    legacy: "",
    title: "",
    description: "",
    footer: "",
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "w-full border-2 border-line-strong bg-layer-panel px-3 py-2.5 text-left shadow-sm",
          "transition-all duration-100",
          "hover:-translate-y-px hover:shadow-md",
          "active:translate-x-px active:translate-y-px active:shadow-xs",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:transform-none",
          "group-data-[dragging=true]/task-draggable:transform-none group-data-[dragging=true]/task-draggable:shadow-sm",
          "motion-reduce:transform-none motion-reduce:transition-none",
        ],
        hit: [
          "block w-full min-w-0 touch-manipulation text-left outline-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "disabled:pointer-events-none",
        ],
        row: ["flex min-w-0 items-start gap-2"],
        body: ["min-w-0 flex-1"],
        meta: ["mb-1.5 flex min-w-0 flex-wrap items-center gap-2"],
        channel: ["text-xs font-bold text-foreground/60"],
        number: ["shrink-0 font-mono text-[11px] text-foreground/35"],
        legacy: [
          "shrink-0 border border-line-subtle px-1.5 py-0.5",
          "font-heading text-[10px] font-bold text-foreground/50",
        ],
        title: ["line-clamp-3 break-words text-sm leading-5 font-bold text-foreground"],
        description: ["mt-1 line-clamp-2 break-words text-xs text-foreground/70"],
        footer: ["mt-2 flex min-w-0 items-center justify-end gap-2"],
      },
      elegant: {},
    },
  },
});
