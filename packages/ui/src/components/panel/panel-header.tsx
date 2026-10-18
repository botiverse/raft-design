import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { PanelHeaderRoot } from "./panel";
import { panelHeader } from "./panel-header.recipe";

export type PanelHeaderProps = useRender.ComponentProps<"div">;

export function PanelHeader({ children, className, render, ...props }: PanelHeaderProps) {
  const { header } = panelHeader();
  return (
    <PanelHeaderRoot
      {...props}
      render={render}
      data-panel-frame-header=""
      data-slot="panel-header"
      className={header({ className })}
    >
      {children}
    </PanelHeaderRoot>
  );
}

export type PanelSectionHeaderProps = useRender.ComponentProps<"div">;

export function PanelSectionHeader({
  children,
  className,
  render,
  ...props
}: PanelSectionHeaderProps) {
  const { sectionHeader } = panelHeader();

  return (
    <PanelHeaderRoot
      {...props}
      render={render}
      data-slot="panel-section-header"
      className={sectionHeader({ className })}
    >
      {children}
    </PanelHeaderRoot>
  );
}

export type PanelHeaderIconProps = useRender.ComponentProps<"div">;

export function PanelHeaderIcon({ className, render, ...props }: PanelHeaderIconProps) {
  const { headerIcon } = panelHeader();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-header-icon",
    className: headerIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelHeaderContentProps = useRender.ComponentProps<"div">;

export function PanelHeaderContent({ className, render, ...props }: PanelHeaderContentProps) {
  const { headerContent } = panelHeader();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-header-content",
    className: headerContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelHeadingProps = useRender.ComponentProps<"div">;

export function PanelHeading({ className, render, ...props }: PanelHeadingProps) {
  const { heading } = panelHeader();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-heading",
    className: heading({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelTitleProps = useRender.ComponentProps<"div">;

export function PanelTitle({ className, render, ...props }: PanelTitleProps) {
  const { title } = panelHeader();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelMetaProps = useRender.ComponentProps<"div"> & {
  size?: "sm" | "md";
};

export function PanelMeta({ className, render, size = "sm", ...props }: PanelMetaProps) {
  const { meta } = panelHeader({ size });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelStatusProps = useRender.ComponentProps<"span">;

/**
 * Attribute badge in a panel header, such as a muted or archived marker.
 * Use `PanelActivity` for a live status readout wrapping a `Status`.
 */
export function PanelStatus({ className, render, ...props }: PanelStatusProps) {
  const { status } = panelHeader();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "panel-status",
    className: status({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelActivityProps = useRender.ComponentProps<"span">;

/**
 * Live status readout in a panel header, such as agent activity or presence.
 * Wraps a `Status` and supplies header-appropriate spacing and typography;
 * use `PanelStatus` for a standalone attribute badge.
 */
export function PanelActivity({ className, render, ...props }: PanelActivityProps) {
  const { activity } = panelHeader();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "panel-activity",
    className: activity({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelActionsProps = useRender.ComponentProps<"div">;

export function PanelActions({ className, render, ...props }: PanelActionsProps) {
  const { actions } = panelHeader();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
