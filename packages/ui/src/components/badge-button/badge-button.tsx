import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import { badge } from "../badge/badge.tsx";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Extends the Badge recipe with an interaction layer. The press motion / focus
// ring are an addition beyond the original (a bare, feedback-less button).
const badgeButton = tv({
  extend: badge,
  base: [
    "cursor-pointer outline-none transition-transform",
    "focus-visible:ring-2 focus-visible:ring-ring",
  ],
  variants: {
    theme: {
      brutal: ["hover:-translate-y-px active:translate-x-px active:translate-y-px"],
    },
  },
});

export type BadgeButtonProps = StyledProps<BaseButton.Props> &
  Omit<VariantProps<typeof badgeButton>, "theme">;

export function BadgeButton({ tone, uppercase, className, ...props }: BadgeButtonProps) {
  const theme = useTheme();
  return (
    <BaseButton
      data-slot="badge-button"
      className={badgeButton({ theme, tone, uppercase, className })}
      {...props}
    />
  );
}
