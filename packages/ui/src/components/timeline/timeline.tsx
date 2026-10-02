import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import "./timeline.css";

export type TimelineSize = "md" | "lg";

export type TimelineItemPlacement = "left" | "right";

export type TimelineItemVariant = "default" | "information" | "success" | "warning" | "danger";

export type TimelineLineType = "solid" | "dashed";

export interface TimelineProps extends ComponentPropsWithRef<"ol"> {
  /** Marker and text size. */
  size?: TimelineSize;
  /** Which side the markers sit on in a vertical timeline. Ignored when `horizontal`. */
  itemPlacement?: TimelineItemPlacement;
  /** Lays the items out in a row instead of a column. */
  horizontal?: boolean;
  /** Marker size in px. Defaults to the theme's size for `size`. */
  iconSize?: number;
}

export interface TimelineItemProps extends ComponentPropsWithRef<"li"> {
  /** Marker color role. */
  variant?: TimelineItemVariant;
  /** A custom marker color; overrides `variant`. */
  color?: string;
  /** Replaces the dot marker; takes the variant's color. */
  icon?: ReactNode;
  /** The line from this item to the next. */
  lineType?: TimelineLineType;
}

export type TimelineTitleProps = ComponentPropsWithRef<"div">;

export type TimelineContentProps = ComponentPropsWithRef<"div">;

export type TimelineTimeProps = ComponentPropsWithRef<"div">;

/** An ordered list of events; each `TimelineItem` has a marker and a line to the next. */
export function Timeline({
  size = "md",
  itemPlacement = "left",
  horizontal = false,
  iconSize,
  className,
  style,
  ...props
}: TimelineProps) {
  const theme = useThemeFamily();
  const mergedStyle =
    iconSize === undefined
      ? style
      : ({ ...style, "--r-timeline-custom-icon-size": `${iconSize}px` } as CSSProperties);

  return (
    <ol
      data-slot="timeline"
      className={cn(
        "r-timeline",
        `r-timeline--${size}`,
        horizontal ? "r-timeline--horizontal" : `r-timeline--${itemPlacement}`,
        theme === "elegant" && "r-timeline--elegant",
        className,
      )}
      style={mergedStyle}
      {...props}
    />
  );
}

/** One event: a marker on the axis, then its title, content and time as children. */
export function TimelineItem({
  variant = "default",
  color,
  icon,
  lineType = "solid",
  className,
  style,
  children,
  ...props
}: TimelineItemProps) {
  const mergedStyle =
    color === undefined
      ? style
      : ({ ...style, "--r-timeline-custom-color": color } as CSSProperties);

  return (
    <li
      data-slot="timeline-item"
      className={cn(
        "r-timeline-item",
        `r-timeline-item--${variant}`,
        lineType === "dashed" && "r-timeline-item--dashed",
        color !== undefined && "r-timeline-item--color",
        className,
      )}
      style={mergedStyle}
      {...props}
    >
      <div aria-hidden="true" data-slot="timeline-item-axis" className="r-timeline-item__axis">
        {icon === undefined ? (
          <span data-slot="timeline-item-marker" className="r-timeline-item__marker" />
        ) : (
          <span data-slot="timeline-item-icon" className="r-timeline-item__icon">
            {icon}
          </span>
        )}
        <span data-slot="timeline-item-line" className="r-timeline-item__line" />
      </div>
      <div data-slot="timeline-item-body" className="r-timeline-item__body">
        {children}
      </div>
    </li>
  );
}

export function TimelineTitle({ className, ...props }: TimelineTitleProps) {
  return (
    <div data-slot="timeline-title" className={cn("r-timeline-title", className)} {...props} />
  );
}

export function TimelineContent({ className, ...props }: TimelineContentProps) {
  return (
    <div data-slot="timeline-content" className={cn("r-timeline-content", className)} {...props} />
  );
}

export function TimelineTime({ className, ...props }: TimelineTimeProps) {
  return <div data-slot="timeline-time" className={cn("r-timeline-time", className)} {...props} />;
}
