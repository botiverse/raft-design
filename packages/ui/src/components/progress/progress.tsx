import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const PROGRESS_STYLE = `
@keyframes raft-progress-indeterminate {
  0% {
    transform: translateX(-65%) scaleX(0.35);
  }
  50% {
    transform: translateX(70%) scaleX(0.6);
  }
  100% {
    transform: translateX(185%) scaleX(0.35);
  }
}

@keyframes raft-progress-sweep {
  0% {
    transform: translateX(-110%);
  }
  100% {
    transform: translateX(360%);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="progress-indicator"][data-indeterminate] {
    animation-duration: 2400ms;
  }
}
`;

const progress = tv({
  slots: {
    root: [
      "group/progress grid w-full min-w-0 gap-1.5",
      "[--progress-color:var(--foreground)]",
      "[--progress-indicator:var(--progress-color)]",
      "[--progress-track:var(--fill-muted)]",
      "font-sans",
      "data-complete:[--progress-indicator:var(--success)]",
    ],
    header: ["flex min-w-0 items-center justify-between gap-3"],
    label: ["min-w-0 truncate", "text-footnote font-semibold text-foreground"],
    value: ["shrink-0 tabular-nums", "font-mono text-mono-meta text-foreground-hint"],
    track: [
      "relative w-full overflow-hidden bg-(--progress-track)",
      "h-2 group-data-[size=sm]/progress:h-1.5 group-data-[size=lg]/progress:h-2.5",
      "rounded-sticker",
    ],
    indicator: [
      "block h-full bg-(--progress-indicator)",
      "transition-[width,background-color] duration-200 ease-out",
      "data-indeterminate:absolute data-indeterminate:inset-y-0 data-indeterminate:w-1/2",
      "data-indeterminate:origin-left data-indeterminate:animate-[raft-progress-indeterminate_1.4s_ease-in-out_infinite]",
      "rounded-[inherit] inset-ring-[1.5px] inset-ring-sticker-ink",
    ],
  },
  variants: {
    variant: {
      primary: {
        root: ["[--progress-color:var(--info)]"],
      },
      information: {
        root: ["[--progress-color:var(--info)]"],
      },
      accent: {
        root: ["[--progress-color:var(--info)]"],
      },
      success: {
        root: ["[--progress-color:var(--success)]"],
      },
      warning: {
        root: ["[--progress-color:var(--warning)]"],
      },
      danger: {
        root: ["[--progress-color:var(--danger)]"],
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const progressStyle = (
  <style href="raft-ui-progress" precedence="default">
    {PROGRESS_STYLE}
  </style>
);

export type ProgressProps = StyledProps<BaseProgress.Root.Props> & VariantProps<typeof progress>;

export function Progress({ size = "md", variant = "primary", className, ...props }: ProgressProps) {
  const { root } = progress({ size, variant });

  return (
    <BaseProgress.Root
      data-slot="progress"
      data-size={size}
      data-variant={variant}
      className={root({ className })}
      {...props}
    />
  );
}

export type ProgressHeaderProps = ComponentPropsWithRef<"div">;

export function ProgressHeader({ className, ...props }: ProgressHeaderProps) {
  const { header } = progress();
  return <div data-slot="progress-header" className={header({ className })} {...props} />;
}

export type ProgressLabelProps = StyledProps<BaseProgress.Label.Props>;

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  const { label } = progress();
  return (
    <BaseProgress.Label data-slot="progress-label" className={label({ className })} {...props} />
  );
}

export type ProgressValueProps = StyledProps<BaseProgress.Value.Props>;

export function ProgressValue({ className, ...props }: ProgressValueProps) {
  const { value } = progress();
  return (
    <BaseProgress.Value data-slot="progress-value" className={value({ className })} {...props} />
  );
}

export type ProgressTrackProps = StyledProps<BaseProgress.Track.Props>;

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  const { track } = progress();
  return (
    <BaseProgress.Track data-slot="progress-track" className={track({ className })} {...props} />
  );
}

export type ProgressIndicatorProps = StyledProps<BaseProgress.Indicator.Props>;

export function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  const { indicator } = progress();

  return (
    <BaseProgress.Indicator
      data-slot="progress-indicator"
      className={indicator({ className })}
      {...props}
    >
      {progressStyle}
    </BaseProgress.Indicator>
  );
}
