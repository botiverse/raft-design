import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

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
      "[--progress-color:var(--foreground-strong)]",
      "[--progress-light:var(--layer-muted)]",
      "[--progress-indicator:var(--progress-color)]",
      "[--progress-track:var(--layer-muted)]",
    ],
    header: ["flex min-w-0 items-center justify-between gap-3"],
    label: ["min-w-0 truncate"],
    value: ["shrink-0 tabular-nums"],
    track: ["relative w-full overflow-hidden bg-[var(--progress-track)]"],
    indicator: [
      "block h-full bg-[var(--progress-indicator)]",
      "transition-[width,background-color] duration-200 ease-out",
      "data-[indeterminate]:absolute data-[indeterminate]:inset-y-0 data-[indeterminate]:w-1/2",
      "data-[indeterminate]:origin-left data-[indeterminate]:[animation:raft-progress-indeterminate_1.4s_ease-in-out_infinite]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["font-heading"],
        label: ["text-xs font-bold text-foreground-strong"],
        value: ["font-mono text-xs font-bold text-foreground/70"],
        track: [
          "border-2 border-line-strong bg-layer-panel",
          "shadow-xs",
          "group-data-[complete]/progress:shadow-none",
        ],
      },
      elegant: {
        root: [
          "font-sans",
          "[--progress-indicator:color-mix(in_oklab,var(--progress-color)_90%,transparent)]",
          "[--progress-track:color-mix(in_oklab,var(--line-subtle)_35%,var(--layer-panel))]",
          "data-[indeterminate]:[--progress-track:color-mix(in_oklab,var(--line-subtle)_65%,var(--layer-panel))]",
        ],
        label: ["text-[13px] font-medium leading-5 text-foreground"],
        value: ["font-mono text-[11px] font-medium leading-5 text-foreground-placeholder"],
        track: ["rounded-full"],
        indicator: ["rounded-full"],
      },
    },
    variant: {
      primary: {
        root: [
          "[--progress-color:var(--color-primary-400)]",
          "[--progress-light:var(--color-primary-200)]",
        ],
      },
      information: {
        root: [
          "[--progress-color:var(--color-info-base)]",
          "[--progress-light:var(--color-info-light)]",
        ],
      },
      accent: {
        root: [
          "[--progress-color:var(--color-accent-400)]",
          "[--progress-light:var(--color-accent-200)]",
        ],
      },
      success: {
        root: [
          "[--progress-color:var(--color-success-base)]",
          "[--progress-light:var(--color-success-light)]",
        ],
      },
      warning: {
        root: [
          "[--progress-color:var(--color-warning-base)]",
          "[--progress-light:var(--color-warning-light)]",
        ],
      },
      danger: {
        root: [
          "[--progress-color:var(--color-danger-base)]",
          "[--progress-light:var(--color-danger-light)]",
        ],
      },
    },
    size: {
      sm: {
        track: ["h-1.5"],
      },
      md: {
        track: ["h-2"],
      },
      lg: {
        track: ["h-2.5"],
      },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
  compoundVariants: [
    {
      theme: "brutal",
      size: "sm",
      class: { track: "h-3" },
    },
    {
      theme: "brutal",
      size: "md",
      class: { track: "h-4" },
    },
    {
      theme: "brutal",
      size: "lg",
      class: { track: "h-5" },
    },
  ],
});

const progressStyle = (
  <style href="raft-ui-progress" precedence="default">
    {PROGRESS_STYLE}
  </style>
);

export type ProgressProps = StyledProps<BaseProgress.Root.Props> &
  Omit<VariantProps<typeof progress>, "theme">;

export function Progress({ size = "md", variant = "primary", className, ...props }: ProgressProps) {
  const theme = useThemeFamily();
  const { root } = progress({ theme, size, variant });

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
  const theme = useThemeFamily();
  const { header } = progress({ theme });
  return <div data-slot="progress-header" className={header({ className })} {...props} />;
}

export type ProgressLabelProps = StyledProps<BaseProgress.Label.Props>;

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  const theme = useThemeFamily();
  const { label } = progress({ theme });
  return (
    <BaseProgress.Label data-slot="progress-label" className={label({ className })} {...props} />
  );
}

export type ProgressValueProps = StyledProps<BaseProgress.Value.Props>;

export function ProgressValue({ className, ...props }: ProgressValueProps) {
  const theme = useThemeFamily();
  const { value } = progress({ theme });
  return (
    <BaseProgress.Value data-slot="progress-value" className={value({ className })} {...props} />
  );
}

export type ProgressTrackProps = StyledProps<BaseProgress.Track.Props>;

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  const theme = useThemeFamily();
  const { track } = progress({ theme });
  return (
    <BaseProgress.Track data-slot="progress-track" className={track({ className })} {...props} />
  );
}

export type ProgressIndicatorProps = StyledProps<BaseProgress.Indicator.Props>;

export function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  const theme = useThemeFamily();
  const { indicator } = progress({ theme });

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
