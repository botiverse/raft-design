import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { panel } from "./panel.recipe";

export type PanelProps = useRender.ComponentProps<"section">;

export function Panel({ className, render, ...props }: PanelProps) {
  const theme = useThemeFamily();
  const { root } = panel({ theme });

  return useRender({
    defaultTagName: "section",
    render,
    props: { ...props, className: root({ className }) },
  });
}

export type PanelHeaderProps = useRender.ComponentProps<"div">;

export function PanelHeader({ className, render, ...props }: PanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: header({ className }) },
  });
}

export type PanelBodyProps = useRender.ComponentProps<"div">;

export function PanelBody({ className, render, ...props }: PanelBodyProps) {
  const theme = useThemeFamily();
  const { body } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: body({ className }) },
  });
}

export type PanelScrollViewportProps = useRender.ComponentProps<"div">;

export function PanelScrollViewport({ className, render, ...props }: PanelScrollViewportProps) {
  const theme = useThemeFamily();
  const { scrollViewport } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: scrollViewport({ className }) },
  });
}

export type PanelScrollContentProps = useRender.ComponentProps<"div">;

export function PanelScrollContent({ className, render, ...props }: PanelScrollContentProps) {
  const theme = useThemeFamily();
  const { scrollContent } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: scrollContent({ className }) },
  });
}

export type PanelScrollbarProps = useRender.ComponentProps<"div">;

export function PanelScrollbar({ className, render, ...props }: PanelScrollbarProps) {
  const theme = useThemeFamily();
  const { scrollbar } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: scrollbar({ className }) },
  });
}

export type PanelScrollbarThumbProps = useRender.ComponentProps<"div">;

export function PanelScrollbarThumb({ className, render, ...props }: PanelScrollbarThumbProps) {
  const theme = useThemeFamily();
  const { scrollbarThumb } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: scrollbarThumb({ className }) },
  });
}

export type PanelFooterProps = useRender.ComponentProps<"div">;

export function PanelFooter({ className, render, ...props }: PanelFooterProps) {
  const theme = useThemeFamily();
  const { footer } = panel({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: { ...props, className: footer({ className }) },
  });
}

export type PanelFormFooterProps = useRender.ComponentProps<"form">;

export function PanelFormFooter({ className, render, ...props }: PanelFormFooterProps) {
  const theme = useThemeFamily();
  const { footer } = panel({ theme });

  return useRender({
    defaultTagName: "form",
    render,
    props: { ...props, className: footer({ className }) },
  });
}
