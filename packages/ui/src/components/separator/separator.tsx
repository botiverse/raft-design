import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const separator = tv({
  base: [
    "shrink-0",
    "data-[orientation=horizontal]:w-full",
    "data-[orientation=vertical]:self-stretch",
  ],
  variants: {
    theme: {
      brutal: [
        "data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:border-t-2 data-[orientation=horizontal]:border-black",
        "data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:border-black",
      ],
      elegant: [
        "bg-line-muted",
        "data-[orientation=horizontal]:h-px",
        "data-[orientation=vertical]:w-px",
      ],
    },
  },
});

export type SeparatorProps = StyledProps<BaseSeparator.Props>;

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  const theme = useThemeFamily();

  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={separator({ theme, className })}
      {...props}
    />
  );
}
