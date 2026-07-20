import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { scrollArea } from "./scroll-area.recipe";

export type ScrollAreaProps = StyledProps<BaseScrollArea.Root.Props>;

export function ScrollArea({ className, ...props }: ScrollAreaProps) {
  const theme = useThemeFamily();
  const { root } = scrollArea({ theme });

  return <BaseScrollArea.Root data-slot="scroll-area" className={root({ className })} {...props} />;
}

export type ScrollAreaViewportProps = StyledProps<BaseScrollArea.Viewport.Props>;

export function ScrollAreaViewport({ className, ...props }: ScrollAreaViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = scrollArea({ theme });

  return (
    <BaseScrollArea.Viewport
      data-slot="scroll-area-viewport"
      className={viewport({ className })}
      {...props}
    />
  );
}

export type ScrollAreaContentProps = StyledProps<BaseScrollArea.Content.Props>;

export function ScrollAreaContent({ className, ...props }: ScrollAreaContentProps) {
  const theme = useThemeFamily();
  const { content } = scrollArea({ theme });

  return (
    <BaseScrollArea.Content
      data-slot="scroll-area-content"
      className={content({ className })}
      {...props}
    />
  );
}

export type ScrollAreaScrollbarProps = StyledProps<BaseScrollArea.Scrollbar.Props>;

export function ScrollAreaScrollbar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaScrollbarProps) {
  const theme = useThemeFamily();
  const { scrollbar } = scrollArea({ theme });

  return (
    <BaseScrollArea.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={scrollbar({ className })}
      {...props}
    />
  );
}

export type ScrollAreaThumbProps = StyledProps<BaseScrollArea.Thumb.Props>;

export function ScrollAreaThumb({ className, ...props }: ScrollAreaThumbProps) {
  const theme = useThemeFamily();
  const { thumb } = scrollArea({ theme });

  return (
    <BaseScrollArea.Thumb
      data-slot="scroll-area-thumb"
      className={thumb({ className })}
      {...props}
    />
  );
}

export type ScrollAreaCornerProps = StyledProps<BaseScrollArea.Corner.Props>;

export function ScrollAreaCorner({ className, ...props }: ScrollAreaCornerProps) {
  const theme = useThemeFamily();
  const { corner } = scrollArea({ theme });

  return (
    <BaseScrollArea.Corner
      data-slot="scroll-area-corner"
      className={corner({ className })}
      {...props}
    />
  );
}
