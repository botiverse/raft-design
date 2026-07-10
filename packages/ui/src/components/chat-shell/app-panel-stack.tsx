import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const appPanelStack = tv({
  slots: {
    root: ["flex h-full min-h-0 w-full"],
    item: ["relative flex h-full min-h-0 shrink-0 flex-col"],
    content: ["min-h-0 flex-1 overflow-hidden"],
    resizeHandle: [
      "absolute inset-y-0 left-0 z-10 w-2 -translate-x-1 cursor-col-resize select-none",
    ],
  },
  variants: {
    theme: {
      brutal: {
        item: "w-[400px] border-l-2 border-black bg-white first:border-l-0",
        resizeHandle: "hover:bg-black/5",
      },
      elegant: {
        item: "w-[400px] border-l border-line-subtle bg-layer-panel first:border-l-0",
        resizeHandle: "hover:bg-layer-muted",
      },
    },
    resizable: {
      true: {
        root: "relative",
      },
      false: {},
    },
    open: {
      true: {},
      false: {
        item: "hidden",
      },
    },
  },
  defaultVariants: {
    resizable: false,
    open: true,
  },
});

type AppPanelStackVariantProps = Omit<VariantProps<typeof appPanelStack>, "theme">;

export type AppPanelStackRootProps = useRender.ComponentProps<"div"> &
  Pick<AppPanelStackVariantProps, "resizable">;

export function AppPanelStackRoot({
  resizable,
  className,
  render,
  ...props
}: AppPanelStackRootProps) {
  const { root } = appPanelStack({ resizable });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-panel-stack-root",
    "data-resizable": resizable ? "true" : undefined,
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
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-panel-stack-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppPanelResizeHandleProps = useRender.ComponentProps<"div"> & {
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
};

export function AppPanelResizeHandle({
  disabled,
  orientation = "vertical",
  className,
  render,
  ...props
}: AppPanelResizeHandleProps) {
  const theme = useThemeFamily();
  const { resizeHandle } = appPanelStack({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    role: "separator",
    "aria-orientation": orientation,
    "aria-disabled": disabled,
    "data-slot": "app-panel-resize-handle",
    "data-disabled": disabled ? "true" : undefined,
    className: resizeHandle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
