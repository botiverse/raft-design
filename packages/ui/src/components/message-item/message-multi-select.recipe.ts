import { tv } from "../../lib/tv";

export const messageMultiSelect = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    checkbox: [
      "mt-1.5 self-start rounded-full",
      "data-[checked]:shadow-none data-[indeterminate]:shadow-none",
      "hover:data-[checked]:shadow-none hover:data-[indeterminate]:shadow-none",
    ],
    toolbar: ["flex items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar:
          "border-t-2 border-line-strong bg-primary px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))]",
      },
      elegant: {
        toolbar:
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel px-2.5 py-2.5 shadow-xs",
      },
    },
  },
});
