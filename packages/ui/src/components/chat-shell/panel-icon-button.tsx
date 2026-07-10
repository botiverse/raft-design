import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const panelIconButton = tv({
  base: [
    "size-7 p-0",
    "overflow-visible font-sans font-bold leading-none outline-none before:hidden",
    "active:not-aria-[haspopup]:scale-100 active:translate-x-px active:translate-y-px",
    "disabled:transform-none",
    "[&_svg]:size-3.5 [&_svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: [
        "rounded-none border-2 border-black bg-white text-black",
        "shadow-brutal-sm",
        "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
        "active:shadow-xs",
        "disabled:shadow-brutal-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        "aria-pressed:bg-primary-400 aria-pressed:text-foreground-strong",
        "aria-pressed:hover:bg-primary-400 aria-pressed:hover:text-foreground-strong",
      ],
      elegant: [
        "size-8 rounded-md border-0 bg-transparent shadow-none",
        "text-foreground-muted/68 [&_svg]:size-4",
        "hover:bg-layer-strong/80 hover:text-foreground",
        "active:translate-x-0 active:translate-y-0 active:bg-layer-strong/80 active:text-foreground",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        "aria-pressed:bg-[#EEEEED] aria-pressed:text-foreground",
        "aria-pressed:hover:bg-[#EEEEED] aria-pressed:hover:text-foreground",
      ],
    },
  },
});

export type PanelIconButtonProps = Omit<ButtonProps, "variant" | "size" | "type"> & {
  pressed?: boolean;
};

export function PanelIconButton({ className, pressed, ...props }: PanelIconButtonProps) {
  const theme = useThemeFamily();

  return (
    <Button
      {...props}
      type="button"
      variant="default"
      size="icon-sm"
      aria-pressed={pressed}
      className={panelIconButton({ theme, className })}
    />
  );
}
