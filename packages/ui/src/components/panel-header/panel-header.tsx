import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const panelHeader = tv({
  slots: {
    root: ["flex h-[62px] items-center gap-3 px-5", "[@media(max-height:600px)]:h-12"],
    icon: [
      "hidden size-9 shrink-0 items-center justify-center border-2 md:flex",
      "[&_svg]:size-[18px]",
    ],
    visual: ["hidden shrink-0 md:flex"],
    content: ["min-w-0 flex-1"],
    titleRow: ["flex min-w-0 items-center gap-2"],
    title: ["truncate text-base font-bold leading-tight"],
    suffix: ["shrink-0"],
    subtitle: ["truncate font-mono text-xs"],
    actions: ["flex shrink-0 items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-b-2 border-black bg-white",
        icon: "border-black",
        title: "text-foreground",
        subtitle: "text-foreground/50",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type PanelHeaderProps = useRender.ComponentProps<"div">;

export function PanelHeader({ className, render, ...props }: PanelHeaderProps) {
  const theme = useThemeFamily();
  const { root } = panelHeader({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header",
    },
  });
}

export type PanelHeaderIconProps = useRender.ComponentProps<"div">;

export function PanelHeaderIcon({ className, render, ...props }: PanelHeaderIconProps) {
  const theme = useThemeFamily();
  const { icon } = panelHeader({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-icon",
    },
  });
}

export type PanelHeaderVisualProps = useRender.ComponentProps<"div">;

export function PanelHeaderVisual({ className, render, ...props }: PanelHeaderVisualProps) {
  const { visual } = panelHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: visual({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-visual",
    },
  });
}

export type PanelHeaderContentProps = useRender.ComponentProps<"div">;

export function PanelHeaderContent({ className, render, ...props }: PanelHeaderContentProps) {
  const { content } = panelHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-content",
    },
  });
}

export type PanelHeaderTitleRowProps = useRender.ComponentProps<"div">;

export function PanelHeaderTitleRow({ className, render, ...props }: PanelHeaderTitleRowProps) {
  const { titleRow } = panelHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: titleRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-title-row",
    },
  });
}

export type PanelHeaderTitleProps = useRender.ComponentProps<"h2">;

export function PanelHeaderTitle({ className, render, ...props }: PanelHeaderTitleProps) {
  const theme = useThemeFamily();
  const { title } = panelHeader({ theme });
  const defaultProps: useRender.ElementProps<"h2"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "h2",
    render,
    props: mergeProps<"h2">(defaultProps, props),
    state: {
      slot: "panel-header-title",
    },
  });
}

export type PanelHeaderSuffixProps = useRender.ComponentProps<"div">;

export function PanelHeaderSuffix({ className, render, ...props }: PanelHeaderSuffixProps) {
  const { suffix } = panelHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: suffix({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-suffix",
    },
  });
}

export type PanelHeaderSubtitleProps = useRender.ComponentProps<"p">;

export function PanelHeaderSubtitle({ className, render, ...props }: PanelHeaderSubtitleProps) {
  const theme = useThemeFamily();
  const { subtitle } = panelHeader({ theme });
  const defaultProps: useRender.ElementProps<"p"> = {
    className: subtitle({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
    state: {
      slot: "panel-header-subtitle",
    },
  });
}

export type PanelHeaderActionsProps = useRender.ComponentProps<"div">;

export function PanelHeaderActions({ className, render, ...props }: PanelHeaderActionsProps) {
  const { actions } = panelHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "panel-header-actions",
    },
  });
}
