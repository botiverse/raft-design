import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const switchRecipe = tv({
  slots: {
    root: [
      "group/switch relative inline-flex shrink-0 touch-manipulation items-center outline-none",
      "transition-[background-color,box-shadow,transform] duration-180 ease-out",
      "motion-reduce:transition-none",
      "not-data-[disabled]:cursor-pointer",
      "data-[disabled]:cursor-not-allowed data-[disabled]:active:scale-100",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    ],
    thumb: [
      "pointer-events-none block",
      "transition-transform duration-180 ease-out",
      "motion-reduce:transition-none",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "rounded-none border-[2.5px] border-line-strong bg-layer-panel",
          "hover:bg-layer-panel data-[checked]:bg-primary-400",
          "data-[checked]:hover:bg-primary-400",
          "data-[disabled]:border-line-hairline data-[disabled]:bg-layer-panel data-[disabled]:opacity-50 data-[disabled]:hover:bg-layer-panel",
          "data-[checked]:data-[disabled]:border-line-hairline data-[checked]:data-[disabled]:bg-primary-400",
          "focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "active:scale-[0.98] motion-reduce:active:scale-100",
        ],
        thumb: [
          "rounded-none bg-line-strong shadow-none",
          "data-[checked]:bg-line-strong",
          "data-[disabled]:bg-line-hairline",
          "data-[checked]:data-[disabled]:bg-line-muted",
        ],
      },
      elegant: {
        root: [
          "rounded-full bg-foreground-strong/[0.12]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.08)]",
          "dark:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.3)]",
          "hover:bg-foreground-strong/[0.16]",
          "data-[checked]:bg-foreground data-[checked]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_1px_1.5px_-1px_oklch(0_0_0_/_0.12)]",
          "dark:data-[checked]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_1px_1.5px_-1px_oklch(0_0_0_/_0.4)]",
          "data-[checked]:hover:bg-foreground",
          "data-[disabled]:bg-layer-panel data-[disabled]:shadow-[inset_0_0_0_1px_var(--line-muted)]",
          "data-[checked]:data-[disabled]:bg-layer-panel data-[checked]:data-[disabled]:shadow-[inset_0_0_0_1px_var(--line-muted)]",
          "focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "active:scale-[0.96] motion-reduce:active:scale-100",
        ],
        thumb: [
          "rounded-full bg-layer-popover",
          "dark:bg-[oklch(0.985_0_0)] dark:data-[checked]:bg-[oklch(0.205_0_0)]",
          "shadow-[0_1px_1.5px_-0.5px_oklch(0_0_0_/_0.18),0_0_0_1px_oklch(0_0_0_/_0.04)]",
          "data-[disabled]:bg-[oklch(0.88_0.004_106.42)] data-[disabled]:shadow-none",
          "dark:data-[disabled]:bg-[oklch(0.37_0.006_286)]",
          "data-[checked]:data-[disabled]:bg-[oklch(0.88_0.004_106.42)]",
          "dark:data-[checked]:data-[disabled]:bg-[oklch(0.37_0.006_286)]",
        ],
      },
    },
    size: {
      sm: {
        root: "h-4 w-7 p-0.5",
        thumb: "size-3 data-[checked]:translate-x-3",
      },
      md: {
        root: "h-5 w-9 p-0.5",
        thumb: "size-4 data-[checked]:translate-x-4",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      size: "sm",
      class: {
        root: "h-5 w-9 p-0",
        thumb: "size-3.5 translate-x-px data-[checked]:translate-x-4",
      },
    },
    {
      theme: "brutal",
      size: "md",
      class: {
        root: "h-6 w-11 p-0",
        thumb: "size-4.5 translate-x-px data-[checked]:translate-x-5",
      },
    },
  ],
  defaultVariants: {
    size: "sm",
  },
});

export type SwitchProps = StyledProps<BaseSwitch.Root.Props> &
  Omit<VariantProps<typeof switchRecipe>, "theme">;

export function Switch({ size, className, children, ...props }: SwitchProps) {
  const theme = useThemeFamily();
  const { root } = switchRecipe({ theme, size });

  return (
    <BaseSwitch.Root data-slot="switch" className={root({ className })} {...props}>
      {children ?? <SwitchThumb size={size} />}
    </BaseSwitch.Root>
  );
}

export type SwitchThumbProps = StyledProps<BaseSwitch.Thumb.Props> &
  Omit<VariantProps<typeof switchRecipe>, "theme">;

export function SwitchThumb({ size, className, ...props }: SwitchThumbProps) {
  const theme = useThemeFamily();
  const { thumb } = switchRecipe({ theme, size });

  return <BaseSwitch.Thumb data-slot="switch-thumb" className={thumb({ className })} {...props} />;
}
