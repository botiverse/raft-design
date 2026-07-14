import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Status } from "../status";

const liveAgentActivityBar = tv({
  slots: {
    root: ["shrink-0 px-3 py-2"],
    row: ["flex min-h-8 items-center gap-2"],
    content: ["flex min-w-0 flex-1 items-center gap-1.5"],
    text: ["min-w-0 truncate text-sm"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-t-2 border-black bg-white px-4 md:bg-brutal-cream",
        text: "font-mono text-black/60",
      },
      elegant: {
        root: "mb-3 rounded-lg border border-line-subtle bg-layer-panel shadow-md",
        content: "contents",
        text: "flex-1 font-sans font-[450] text-foreground",
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

export type LiveAgentActivityBarProps = Omit<useRender.ComponentProps<"div">, "children"> & {
  activity: LiveAgentActivity;
  agentAvatarAlt?: string;
  agentAvatarSrc?: string | null;
  avatar?: ReactNode;
  children: ReactNode;
};

export function LiveAgentActivityBar({
  activity,
  agentAvatarAlt = "",
  agentAvatarSrc,
  avatar,
  children,
  className,
  render,
  ...props
}: LiveAgentActivityBarProps) {
  const theme = useThemeFamily();
  const { root, row, content, text } = liveAgentActivityBar({ theme });
  const title = typeof children === "string" ? children : undefined;
  const defaultProps: useRender.ElementProps<"div"> & LiveAgentActivityBarDataAttributes = {
    "aria-live": "polite",
    "data-activity": activity,
    "data-slot": "live-agent-activity-bar",
    "data-testid": "live-agent-activity-bar",
    className: root({ className }),
    children: (
      <div data-slot="live-agent-activity-bar-row" className={row()}>
        <Avatar render={<div />} size="xs" type="agent" className="overflow-hidden">
          {avatar ??
            (agentAvatarSrc ? (
              <AvatarImage src={agentAvatarSrc} alt={agentAvatarAlt} />
            ) : (
              <AvatarFallback>
                <DefaultAgentPixelAvatar />
              </AvatarFallback>
            ))}
        </Avatar>
        <div data-slot="live-agent-activity-bar-content" className={content()}>
          <Status
            aria-hidden
            size="md"
            variant="primary"
            pulse
            className={theme === "brutal" ? "border-black" : "order-first"}
          />
          <span data-slot="live-agent-activity-bar-text" className={text()} title={title}>
            {children}
          </span>
        </div>
      </div>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

function DefaultAgentPixelAvatar() {
  return (
    <svg viewBox="0 0 8 8" className="!size-full" shapeRendering="crispEdges" aria-hidden="true">
      <path
        fill="var(--color-foreground-strong)"
        d="M1 0h6v1H1zM0 1h1v1H0zM2 1h1v1H2zM5 1h1v1H5zM7 1h1v1H7zM0 2h1v1H0zM2 2h1v1H2zM5 2h1v1H5zM7 2h1v1H7zM0 3h8v1H0zM1 4h1v1H1zM3 4h2v1H3zM6 4h1v1H6zM1 5h6v1H1zM1 6h2v1H1zM5 6h2v1H5zM1 7h2v1H1zM5 7h2v1H5z"
      />
      <path
        fill="var(--color-white)"
        d="M3 1h2v1H3zM1 2h1v1H1zM3 2h2v1H3zM6 2h1v1H6zM2 4h1v1H2zM5 4h1v1H5z"
      />
    </svg>
  );
}
