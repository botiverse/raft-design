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
      ],
      elegant: [
        "rounded-md border border-line-subtle bg-layer-panel text-foreground-strong",
        "shadow-xs",
        "hover:bg-layer-muted",
        "focus-visible:ring-2 focus-visible:ring-line-focus",
      ],
    },
  },
});

export type PanelIconButtonProps = Omit<ButtonProps, "variant" | "size" | "type">;

export function PanelIconButton({ className, ...props }: PanelIconButtonProps) {
  const theme = useThemeFamily();

  return (
    <Button
      {...props}
      type="button"
      variant="default"
      size="icon-sm"
      className={panelIconButton({ theme, className })}
    />
  );
}
