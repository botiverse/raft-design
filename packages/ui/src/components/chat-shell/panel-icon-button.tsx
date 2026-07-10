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
        "size-8 rounded-md border-0 bg-transparent shadow-none",
        "text-[color-mix(in_oklch,var(--foreground-muted)_68%,transparent)] [&_svg]:size-4",
        "hover:bg-[color-mix(in_oklch,#EEEEED_80%,transparent)] hover:text-foreground",
        "active:translate-x-0 active:translate-y-0 active:bg-[color-mix(in_oklch,#EEEEED_80%,transparent)] active:text-foreground",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
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
