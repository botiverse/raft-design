import type { ComponentProps } from "react";
import { useThemeFamily } from "raft-ui";
import { tv } from "tailwind-variants/lite";

const taskCardPanel = tv({
  slots: {
    root: ["w-full max-w-[448px] bg-layer-panel p-[16px] text-foreground-strong"],
    header: ["mb-[16px] pb-[8px]"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-line-strong"],
        header: ["border-b-2 border-line-strong font-bold text-foreground-strong"],
      },
      elegant: {
        root: ["rounded-[10px] border border-line-muted shadow-sm"],
        header: ["border-b border-line-muted font-medium text-foreground"],
      },
    },
  },
});

export function TaskCardPanel({ className, ...props }: ComponentProps<"section">) {
  const theme = useThemeFamily();
  const { root } = taskCardPanel({ theme });
  return <section data-slot="task-card-panel" className={root({ className })} {...props} />;
}

export function TaskCardPanelHeader({ className, ...props }: ComponentProps<"header">) {
  const theme = useThemeFamily();
  const { header } = taskCardPanel({ theme });
  return <header data-slot="task-card-panel-header" className={header({ className })} {...props} />;
}
