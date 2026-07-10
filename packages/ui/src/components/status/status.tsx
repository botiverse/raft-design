import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const STATUS_STYLE = `
@keyframes raft-status-pulse-background {
  0% {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--status-color) 42%, transparent);
  }
  70%,
  100% {
    box-shadow: 0 0 0 8px color-mix(in oklch, var(--status-color) 0%, transparent);
  }
}

/* Pulse + attention: animate a bottom-layer ring; leave attention outline untouched. */
[data-slot="status"][data-attention][data-pulse]:not([data-pulse="false"])::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  animation: raft-status-pulse-background 1.4s ease-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="status"][data-attention][data-pulse]:not([data-pulse="false"])::before {
    animation: none;
  }
}
`;

const dot = tv({
  slots: {
    root: ["relative inline-block shrink-0 rounded-full", "[background-color:var(--status-color)]"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-line-strong",
      },
      elegant: {},
    },
    variant: {
      default: {
        root: "[--status-color:var(--color-gray-400)]",
      },
      primary: {
        root: "[--status-color:var(--color-primary-400)]",
      },
      information: {
        root: "[--status-color:var(--color-info-base)]",
      },
      muted: {
        root: "[--status-color:var(--color-secondary-400)]",
      },
      accent: {
        root: "[--status-color:var(--color-accent-400)]",
      },
      success: {
        root: "[--status-color:var(--color-success-base)]",
      },
      warning: {
        root: "[--status-color:var(--color-warning-base)]",
      },
      danger: {
        root: "[--status-color:var(--color-danger-base)]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const status = tv({
  extend: dot,
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      xs: {
        root: "size-1",
      },
      sm: {
        root: "size-2",
      },
      md: {
        root: "size-2.5",
      },
      lg: {
        root: "size-[11px]",
      },
    },
    pulse: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
    attention: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    pulse: false,
    attention: false,
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "success",
      class: { root: "[--status-color:var(--color-brutal-lime)]" },
    },
    {
      theme: "brutal",
      variant: "warning",
      class: { root: "[--status-color:var(--color-warning-base)]" },
    },
    {
      theme: "brutal",
      pulse: true,
      class: { root: "animate-pulse" },
    },
    {
      theme: "elegant",
      attention: true,
      class: {
        root: [
          "isolate overflow-visible",
          "border border-[color-mix(in_oklch,var(--status-color)_58%,transparent)]",
          "shadow-[inset_0_0.5px_1px_color-mix(in_oklch,oklch(1_0_0)_55%,transparent),0_0_0_1.5px_color-mix(in_oklch,var(--status-color)_38%,transparent),0_1px_1.5px_color-mix(in_oklch,oklch(0_0_0)_18%,transparent)]",
        ],
      },
    },
    {
      theme: "elegant",
      pulse: true,
      attention: false,
      class: {
        root: "[animation:raft-status-pulse-background_1.4s_ease-out_infinite] motion-reduce:animate-none",
      },
    },
  ],
});

const statusStyle = (
  <style href="raft-ui-status" precedence="default">
    {STATUS_STYLE}
  </style>
);

export type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> &
  Omit<VariantProps<typeof status>, "theme">;

function StatusRoot({ size, variant, pulse, attention, className, render, ...props }: StatusProps) {
  const theme = useThemeFamily();
  const resolvedPulse = pulse ?? false;
  const resolvedAttention = attention ?? false;
  const { root } = status({
    theme,
    size,
    variant,
    pulse: resolvedPulse,
    attention: resolvedAttention,
  });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
    children: statusStyle,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status",
      variant,
      pulse: resolvedPulse,
      attention: resolvedAttention,
      size,
    },
  });
}

export const Status = StatusRoot;
