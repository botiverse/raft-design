import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const switchRecipe = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 touch-manipulation items-center outline-none",
      "transition-[background-color,box-shadow,transform] ease-out",
      "motion-reduce:transition-none",
      "not-data-disabled:cursor-pointer",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
      "focus-visible:ring-line-strong focus-visible:ring-offset-layer-sidebar",
      "h-[30px] w-[50px] rounded-full border-[1.5px] border-line-strong bg-fill-muted p-[2.5px]",
      "duration-150",
      "data-checked:border-sticker-ink data-checked:bg-selected data-checked:ring-[1.5px] data-checked:ring-sticker-edge",
      "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-focus",
      "data-disabled:border-foreground-disabled data-disabled:bg-fill-muted",
      "data-checked:data-disabled:border-foreground-disabled data-checked:data-disabled:bg-fill-muted",
    ],
    thumb: [
      "pointer-events-none block",
      "transition-transform ease-out",
      "motion-reduce:transition-none",
      "size-[22px] rounded-full bg-layer-card shadow-[0_0_0_1.5px_var(--line-strong)] data-checked:translate-x-5",
      "duration-220 ease-slide",
      "data-checked:bg-sticker-paper data-checked:shadow-[0_0_0_1.5px_var(--sticker-ink)]",
      "data-disabled:bg-fill-muted data-disabled:shadow-[0_0_0_1.5px_var(--foreground-disabled)]",
      "data-checked:data-disabled:bg-fill-muted data-checked:data-disabled:shadow-[0_0_0_1.5px_var(--foreground-disabled)]",
    ],
  },
});

export type SwitchProps = StyledProps<BaseSwitch.Root.Props>;

export function Switch({ className, children, ...props }: SwitchProps) {
  const { root } = switchRecipe();

  return (
    <BaseSwitch.Root data-slot="switch" className={root({ className })} {...props}>
      {children ?? <SwitchThumb />}
    </BaseSwitch.Root>
  );
}

export type SwitchThumbProps = StyledProps<BaseSwitch.Thumb.Props>;

export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  const { thumb } = switchRecipe();

  return <BaseSwitch.Thumb data-slot="switch-thumb" className={thumb({ className })} {...props} />;
}
