import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "raft-ui/cn";
import { tv } from "tailwind-variants/lite";

// App-owned server switcher chrome for the rail header slot. Lives in the docs
// module (not packages/ui) so AppRailHeader stays a layout-only region while
// composition and Playground share one pixel-identical implementation.
const appRailServerButton = tv({
  base: [
    "relative inline-flex size-10 items-center justify-center",
    "outline-none",
    "disabled:pointer-events-none disabled:opacity-45",
    "[@media(max-height:600px)]:size-9",
    "[&_img]:size-full [&_img]:min-h-0 [&_img]:min-w-0 [&_img]:object-cover",
    "**:data-[slot=app-rail-item-indicator]:z-10",
    "rounded-sticker border-[1.5px] border-sticker-ink bg-sticker-ink",
    "font-sans text-headline text-brand",
    "shadow-[0_0_0_1.5px_var(--sticker-edge)]",
    "transition-colors duration-100",
    "hover:bg-[color-mix(in_srgb,var(--sticker-paper)_15%,var(--sticker-ink))]",
    "active:bg-[color-mix(in_srgb,var(--sticker-paper)_15%,var(--sticker-ink))]",
    "focus-visible:shadow-focus",
    "[&_img]:rounded-[inherit]",
  ],
});

export type AppRailServerButtonProps = useRender.ComponentProps<"button"> & {
  nativeButton?: boolean;
};

export function AppRailServerButton({
  nativeButton = true,
  className,
  render,
  ...props
}: AppRailServerButtonProps) {
  const defaultProps = {
    type: nativeButton ? ("button" as const) : undefined,
    className: cn(appRailServerButton(), className),
    "data-slot": "app-rail-server-button",
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps as AppRailServerButtonProps, props),
  });
}
