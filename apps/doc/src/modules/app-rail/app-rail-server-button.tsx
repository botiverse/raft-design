import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "raft-ui";
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
  ],
  variants: {
    theme: {
      brutal: [
        "rounded-none border-2 border-black bg-black",
        "font-sans text-base font-bold text-primary",
        "shadow-raft-sm hover:shadow-raft-md",
        "transition-all duration-100",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        "[&_img]:rounded-[inherit]",
      ],
      elegant: [
        "size-8 rounded-md border-0 bg-white shadow-none",
        "[@media(max-height:600px)]:size-7",
        "font-heading text-xs font-bold text-primary-400",
        "transition-[background-color,transform] duration-150 active:translate-y-px",
        "[&_img]:rounded-[inherit]",
      ],
    },
  },
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
  const theme = useThemeFamily();
  const defaultProps = {
    type: nativeButton ? ("button" as const) : undefined,
    className: cn(appRailServerButton({ theme }), className),
    "data-slot": "app-rail-server-button",
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps as AppRailServerButtonProps, props),
  });
}
