import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
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
      "[--progress-light:var(--fill-muted)]",
      "[--progress-indicator:var(--progress-color)]",
      "[--progress-track:var(--fill-muted)]",
    ],
    header: ["flex min-w-0 items-center justify-between gap-3"],
    label: ["min-w-0 truncate"],
    value: ["shrink-0 tabular-nums"],
    track: ["relative w-full overflow-hidden bg-(--progress-track)"],
    indicator: [
      "block h-full bg-(--progress-indicator)",
      "transition-[width,background-color] duration-200 ease-out",
      "data-indeterminate:absolute data-[indeterminate]:inset-y-0 data-indeterminate:w-1/2",
      "data-indeterminate:origin-left data-indeterminate:animate-[raft-progress-indeterminate_1.4s_ease-in-out_infinite]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["font-heading"],
        label: ["text-xs font-bold text-foreground"],
        value: ["font-mono text-xs font-bold text-foreground-strong/70"],
        track: [
          "h-4 group-data-[size=sm]/progress:h-3 group-data-[size=lg]/progress:h-5",
          "border-2 border-line-strong bg-layer-panel",
          "shadow-raft-xs",
          "group-data-complete/progress:shadow-none",
        ],
      },
      elegant: {
        root: [
          "font-sans",
          "[--progress-indicator:color-mix(in_oklab,var(--progress-color)_90%,transparent)]",
          "[--progress-track:color-mix(in_oklab,var(--line-muted)_35%,var(--layer-panel))]",
          "data-indeterminate:[--progress-track:color-mix(in_oklab,var(--line-muted)_65%,var(--layer-panel))]",
          "dark:[--progress-indicator:var(--progress-color)]",
          "[--progress-sweep:color-mix(in_oklab,var(--progress-color)_40%,transparent)]",
          "dark:[--progress-sweep:color-mix(in_oklab,var(--progress-color)_55%,transparent)]",
          "dark:[--progress-track:var(--layer-inset)]",
          "dark:data-indeterminate:[--progress-track:oklch(0.21_0.004_106.42)]",
        ],
        label: ["text-[13px] font-medium leading-5 text-foreground-strong"],
        value: ["font-mono text-[11px] font-medium leading-5 text-foreground-placeholder"],
        track: [
          "h-2 group-data-[size=sm]/progress:h-1.5 group-data-[size=lg]/progress:h-2.5",
          "rounded-full",
          "dark:shadow-[inset_0_1px_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.03)]",
          "dark:not-has-data-indeterminate:overflow-visible",
        ],
        indicator: [
          "rounded-full",
          "data-indeterminate:w-2/5",
          "data-indeterminate:bg-[linear-gradient(90deg,transparent,var(--progress-sweep),transparent)]",
          "data-indeterminate:animate-[raft-progress-sweep_1.6s_ease-in-out_infinite]",
          "dark:data-indeterminate:shadow-none",
          "dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.08),0_1px_1px_color-mix(in_oklab,var(--progress-color)_14%,transparent),0_2px_3px_color-mix(in_oklab,var(--progress-color)_7%,transparent)]",
        ],
      },
      raft: {
        root: ["font-sans", "data-complete:[--progress-indicator:var(--color-success)]"],
        label: ["text-footnote font-semibold text-foreground"],
        value: ["font-mono text-mono-meta text-foreground-hint"],
        track: [
          "h-2 group-data-[size=sm]/progress:h-1.5 group-data-[size=lg]/progress:h-2.5",
          "rounded-sticker",
        ],
        indicator: ["rounded-[inherit] shadow-[inset_0_0_0_1.5px_var(--sticker-ink)]"],
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
          "[--progress-color:var(--color-info)]",
          "[--progress-light:var(--color-info-muted)]",
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
          "[--progress-color:var(--color-success)]",
          "[--progress-light:var(--color-success-muted)]",
        ],
      },
      warning: {
        root: [
          "[--progress-color:var(--color-warning)]",
          "[--progress-light:var(--color-warning-muted)]",
        ],
      },
      danger: {
        root: [
          "[--progress-color:var(--color-danger)]",
          "[--progress-light:var(--color-danger-muted)]",
        ],
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
  compoundVariants: [
    {
      theme: "raft",
      variant: ["primary", "information", "accent"],
      class: {
        root: [
          "[--progress-color:var(--color-info)]",
          "[--progress-light:var(--color-info-muted)]",
        ],
      },
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
