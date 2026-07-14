import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { BorderBeam } from "border-beam";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Avatar, AvatarFallback, type AvatarProps } from "../avatar";
import { Status, type StatusProps } from "../status";

const liveAgentActivityBar = tv({
  slots: {
    root: ["shrink-0 px-3 py-2"],
    row: ["flex min-h-8 items-center gap-2"],
    avatar: ["overflow-hidden"],
    content: ["flex min-w-0 flex-1 items-center gap-1.5"],
    status: [],
    text: ["min-w-0 truncate text-sm"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-t-2 border-black bg-white px-4 md:bg-brutal-cream",
        status: "border-black",
        text: "font-mono text-black/60",
      },
      elegant: {
        root: "mb-2 rounded-lg border border-line-subtle bg-layer-panel shadow-md",
        content: "contents",
        status: "order-first",
        text: "flex-1 font-sans text-[13px] font-normal text-foreground-muted",
      },
    },
  },
});

export type LiveAgentActivity = "thinking" | "working";

type LiveAgentActivityBarDataAttributes = {
  "data-activity"?: LiveAgentActivity;
  "data-slot"?: string;
  "data-testid"?: string;
};

export type LiveAgentActivityBarProps = useRender.ComponentProps<"div"> & {
  activity: LiveAgentActivity;
};

export function LiveAgentActivityBar({
  activity,
  children,
  className,
  render,
  ...props
}: LiveAgentActivityBarProps) {
  const theme = useThemeFamily();
  const { root } = liveAgentActivityBar({ theme });
  const defaultProps: useRender.ElementProps<"div"> & LiveAgentActivityBarDataAttributes = {
    "aria-live": "polite",
    "data-activity": activity,
    "data-slot": "live-agent-activity-bar",
    "data-testid": "live-agent-activity-bar",
    className: root({ className }),
    children,
  };

  const activityBar = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  if (theme !== "elegant") {
    return activityBar;
  }

  return (
    <BorderBeam
      size="pulse-outside"
      colorVariant="colorful"
      strength={0.75}
      saturation={0.85}
      hueRange={12}
    >
      {activityBar}
    </BorderBeam>
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
  const theme = useThemeFamily();
  const { content } = liveAgentActivityBar({ theme });
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
  const theme = useThemeFamily();
  const { status } = liveAgentActivityBar({ theme });

  return (
    <Status
      aria-hidden
      size="md"
      variant="primary"
      pulse
      className={status({ className })}
      {...props}
    />
  );
}

export type LiveAgentActivityBarTextProps = useRender.ComponentProps<"span">;

export function LiveAgentActivityBarText({
  className,
  render,
  ...props
}: LiveAgentActivityBarTextProps) {
  const theme = useThemeFamily();
  const { text } = liveAgentActivityBar({ theme });
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
