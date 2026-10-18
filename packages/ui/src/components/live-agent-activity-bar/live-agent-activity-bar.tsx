import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { Avatar, AvatarFallback } from "../avatar";
import type { AvatarProps } from "../avatar";
import { Status } from "../status";
import type { StatusProps } from "../status";

const liveAgentActivityBar = tv({
  slots: {
    root: [
      "shrink-0",
      "rounded-container border border-line-muted bg-layer-card px-3 py-2 shadow-none",
    ],
    row: [
      "flex min-h-8 items-center",
      "gap-2",
      "[&>[data-slot=avatar]+[data-slot=avatar]]:ml-[-5px]",
    ],
    avatar: ["shrink-0 overflow-hidden", "size-[19px]"],
    content: ["flex min-w-0 flex-1 items-center", "gap-1.5"],
    status: ["animate-none [--status-color:var(--presence-busy)]"],
    text: ["min-w-0 truncate", "font-sans text-footnote font-semibold text-foreground"],
  },
});

type LiveAgentActivityBarDataAttributes = {
  "data-slot"?: string;
  "data-testid"?: string;
};

export type LiveAgentActivityBarProps = useRender.ComponentProps<"div">;

function LiveAgentActivityBarRoot({
  children,
  className,
  render,
  ...props
}: LiveAgentActivityBarProps) {
  const { root } = liveAgentActivityBar();
  const defaultProps: useRender.ElementProps<"div"> & LiveAgentActivityBarDataAttributes = {
    "aria-live": "polite",
    "data-slot": "live-agent-activity-bar",
    "data-testid": "live-agent-activity-bar",
    className: root({ className }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

// No enter/exit motion: the DS keeps agent lights still and swaps the text in
// place.
export function LiveAgentActivityBar({
  children,
  className,
  render,
  ...props
}: LiveAgentActivityBarProps) {
  return children == null ? null : (
    <LiveAgentActivityBarRoot className={className} render={render} {...props}>
      {children}
    </LiveAgentActivityBarRoot>
  );
}

export type LiveAgentActivityBarRowProps = useRender.ComponentProps<"div">;

export function LiveAgentActivityBarRow({
  className,
  render,
  ...props
}: LiveAgentActivityBarRowProps) {
  const { row } = liveAgentActivityBar();
  const defaultProps: useRender.ElementProps<"div"> & LiveAgentActivityBarDataAttributes = {
    "data-slot": "live-agent-activity-bar-row",
    className: row({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LiveAgentActivityBarAvatarProps = Omit<AvatarProps, "size" | "type">;

export function LiveAgentActivityBarAvatar({
  children,
  className,
  render,
  ...props
}: LiveAgentActivityBarAvatarProps) {
  const { avatar } = liveAgentActivityBar();

  return (
    <Avatar
      render={render ?? <div />}
      size="xs"
      type="agent"
      className={avatar({ className })}
      {...props}
    >
      {children}
      <AvatarFallback />
    </Avatar>
  );
}

export type LiveAgentActivityBarContentProps = useRender.ComponentProps<"div">;

export function LiveAgentActivityBarContent({
  className,
  render,
  ...props
}: LiveAgentActivityBarContentProps) {
  const { content } = liveAgentActivityBar();
  const defaultProps: useRender.ElementProps<"div"> & LiveAgentActivityBarDataAttributes = {
    "data-slot": "live-agent-activity-bar-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LiveAgentActivityBarStatusProps = Omit<
  StatusProps,
  "attention" | "pulse" | "size" | "variant"
>;

export function LiveAgentActivityBarStatus({
  className,
  ...props
}: LiveAgentActivityBarStatusProps) {
  const { status } = liveAgentActivityBar();

  return (
    <Status aria-hidden size="md" variant="primary" className={status({ className })} {...props} />
  );
}

export type LiveAgentActivityBarTextProps = useRender.ComponentProps<"span">;

export function LiveAgentActivityBarText({
  className,
  render,
  ...props
}: LiveAgentActivityBarTextProps) {
  const { text } = liveAgentActivityBar();
  const defaultProps: useRender.ElementProps<"span"> & LiveAgentActivityBarDataAttributes = {
    "data-slot": "live-agent-activity-bar-text",
    className: text({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
