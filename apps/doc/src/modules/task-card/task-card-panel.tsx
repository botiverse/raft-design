import type { ComponentProps } from "react";
import { tv } from "tailwind-variants/lite";

const taskCardPanel = tv({
  slots: {
    root: [
      "w-full max-w-[448px] bg-layer-canvas p-[16px] text-foreground",
      "rounded-container border border-line-hairline",
    ],
    header: ["mb-[16px] pb-[8px]", "border-b border-line-hairline text-headline text-foreground"],
  },
});

export function TaskCardPanel({ className, ...props }: ComponentProps<"section">) {
  const { root } = taskCardPanel();
  return <section data-slot="task-card-panel" className={root({ className })} {...props} />;
}

export function TaskCardPanelHeader({ className, ...props }: ComponentProps<"header">) {
  const { header } = taskCardPanel();
  return <header data-slot="task-card-panel-header" className={header({ className })} {...props} />;
}
