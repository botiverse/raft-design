import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { TaskStatusId } from "../tasks/task-status.recipe";
import "./timeline.css";

export type TimelineSize = "sm" | "md" | "lg";

export type TimelineItemPlacement = "left" | "right";

export type TimelineItemVariant =
  | "default"
  | "information"
  | "success"
  | "warning"
  | "danger"
  | "accent";

export type TimelineLineType = "solid" | "dashed";

export interface TimelineProps extends ComponentPropsWithRef<"ol"> {
  /** Title size: `lg` opens the title to 16/24; `sm` and `md` share the 14/20 scale. */
  size?: TimelineSize;
  /** Which side the markers sit on in a vertical timeline. Ignored when `horizontal`. */
  itemPlacement?: TimelineItemPlacement;
  /** Lays the items out in a row instead of a column. */
  horizontal?: boolean;
  /** Marker size in px. Defaults to 10px for the marker and 14px for an `icon`. */
  iconSize?: number;
}

/** Maps a task status to the shared `--task-status-*` token the marker should
 *  paint with — the SAME token the icon/chip/badge read, so a task status can
 *  never look different on the Timeline than everywhere else. */
function taskStatusMarkerColor(status: TaskStatusId): string {
  return status === "backlog" ? "var(--line-strong)" : `var(--task-status-${status})`;
}

export interface TimelineItemProps extends ComponentPropsWithRef<"li"> {
  /** Marker color role. */
  variant?: TimelineItemVariant;
  /** A custom marker color; overrides `variant`. */
  color?: string;
  /**
   * Render the marker from a task status's colour token instead of a generic
   * `variant`. Takes precedence over `variant`; `color` still wins when both
   * are set. Omit it and the item behaves exactly as before.
   */
  taskStatus?: TaskStatusId;
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
  taskStatus,
  icon,
  lineType = "solid",
  className,
  style,
  children,
  ...props
}: TimelineItemProps) {
  // A task status paints the marker from the shared token; an explicit `color`
  // still wins, and omitting both keeps the variant behaviour unchanged.
  const resolvedColor = color ?? (taskStatus ? taskStatusMarkerColor(taskStatus) : undefined);
  // Backlog has no colour and no token: its marker is the hollow pixel, an
  // empty square with a `line-strong` edge, as TaskStatusIcon draws it. Its
  // item colour is `line-strong`, so an `icon` in place of the pixel shows in
  // it; the marker takes none of it as fill, and its edge takes it instead of
  // the sticker-ink every other pixel's edge is (`.r-timeline` sets that one,
  // so it would win over the item colour).
  const hollow = color === undefined && taskStatus === "backlog";
  const mergedStyle =
    resolvedColor === undefined
      ? style
      : ({
          ...style,
          "--r-timeline-custom-color": resolvedColor,
          ...(hollow && {
            "--r-timeline-marker-fill": "0%",
            "--r-timeline-marker-border-color": "var(--r-timeline-item-color)",
          }),
        } as CSSProperties);

  return (
    <li
      data-slot="timeline-item"
      data-task-status={taskStatus}
      data-icon={icon === undefined ? undefined : ""}
      className={cn(
        "r-timeline-item",
        `r-timeline-item--${variant}`,
        lineType === "dashed" && "r-timeline-item--dashed",
        resolvedColor !== undefined && "r-timeline-item--color",
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
