import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const appPanelStack = tv({
  slots: {
    root: ["flex h-full min-h-0 w-full"],
    item: ["relative flex h-full min-h-0 shrink-0 flex-col"],
    content: ["min-h-0 flex-1 overflow-hidden"],
  },
  variants: {
    theme: {
      brutal: {
        item: "w-[400px] border-l-2 border-black bg-white first:border-l-0",
      },
      elegant: {
        item: "w-[var(--panel-stack-width,400px)] border-l border-line-subtle bg-layer-panel first:border-l-0",
      },
    },
    open: {
      true: {},
      false: {
        item: "hidden",
      },
    },
  },
  defaultVariants: {
    open: true,
  },
});

type AppPanelStackVariantProps = Omit<VariantProps<typeof appPanelStack>, "theme">;

export type AppPanelStackRootProps = useRender.ComponentProps<"div">;

export function AppPanelStackRoot({ className, render, ...props }: AppPanelStackRootProps) {
  const { root } = appPanelStack();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-panel-stack-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppPanelStackItemProps = useRender.ComponentProps<"section"> &
  Pick<AppPanelStackVariantProps, "open">;

export function AppPanelStackItem({ open, className, render, ...props }: AppPanelStackItemProps) {
  const theme = useThemeFamily();
  const { item } = appPanelStack({ theme, open });
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "app-panel-stack-item",
    "data-open": open === false ? "false" : "true",
    className: item({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type AppPanelStackContentProps = useRender.ComponentProps<"div">;

export function AppPanelStackContent({ className, render, ...props }: AppPanelStackContentProps) {
  const { content } = appPanelStack();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-panel-stack-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
