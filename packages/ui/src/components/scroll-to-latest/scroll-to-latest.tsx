import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button";
import { scrollToLatest } from "./scroll-to-latest.recipe";

export type ScrollToLatestProps = useRender.ComponentProps<"button"> &
  Pick<ButtonProps, "size" | "loading" | "loadingLabel">;

export function ScrollToLatest({
  className,
  render,
  size = "sm",
  loading,
  loadingLabel,
  ...props
}: ScrollToLatestProps) {
  const theme = useThemeFamily();

  return (
    <Button
      type="button"
      data-slot="scroll-to-latest"
      className={scrollToLatest({ theme, className })}
      variant="outline"
      size={size}
      loading={loading}
      loadingLabel={loadingLabel}
      render={render}
      {...props}
    />
  );
}
