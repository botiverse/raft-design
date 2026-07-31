import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import type { SlotElementProps } from "../../lib/data-attributes";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "../scroll-area";
import { sidebarRecipe } from "./sidebar.recipe";

export type SidebarRootProps = useRender.ComponentProps<"div">;

export function SidebarRoot({ className, render, ...props }: SidebarRootProps) {
  const theme = useThemeFamily();
  const { sidebarRoot } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-root",
    className: sidebarRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarHeaderProps = useRender.ComponentProps<"div">;

export function SidebarHeader({ children, className, render, ...props }: SidebarHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarHeader, sidebarHeaderMask, sidebarHeaderMaskLayer } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-header",
    className: sidebarHeader({ className }),
    children: (
      <>
        <div aria-hidden data-slot="sidebar-header-mask" className={sidebarHeaderMask()}>
          <div
            data-slot="sidebar-header-mask-layer"
            data-layer="solid"
            className={sidebarHeaderMaskLayer()}
          />
          <div
            data-slot="sidebar-header-mask-layer"
            data-layer="soft"
            className={sidebarHeaderMaskLayer()}
          />
          <div
            data-slot="sidebar-header-mask-layer"
            data-layer="blur"
            className={sidebarHeaderMaskLayer()}
          />
        </div>
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarHeaderTitleProps = useRender.ComponentProps<"div">;

export function SidebarHeaderTitle({ className, render, ...props }: SidebarHeaderTitleProps) {
  const theme = useThemeFamily();
  const { sidebarHeaderTitle } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-header-title",
    className: sidebarHeaderTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarGroupLabelProps = useRender.ComponentProps<"div">;

export function SidebarGroupLabel({ className, render, ...props }: SidebarGroupLabelProps) {
  const theme = useThemeFamily();
  const { sidebarGroupLabel } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-group-label",
    className: sidebarGroupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarBodyProps = useRender.ComponentProps<"div">;

export function SidebarBody({ className, render, ...props }: SidebarBodyProps) {
  const theme = useThemeFamily();
  const { sidebarBody } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-body",
    className: sidebarBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarContentProps = useRender.ComponentProps<"div">;

export function SidebarContent({ children, className, render, ...props }: SidebarContentProps) {
  const isMobile = useMobileViewport();
  const theme = useThemeFamily();
  const { sidebarContent, sidebarContentInner, sidebarScrollbar, sidebarViewport } = sidebarRecipe({
    theme,
  });

  const nativeViewportProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-content",
    className: sidebarViewport(),
    children: (
      <div className={sidebarContentInner({ className })} style={{ minWidth: 0, width: "100%" }}>
        {children}
      </div>
    ),
  };
  const nativeViewport = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(nativeViewportProps, props),
  });

  if (isMobile) {
    return (
      <div data-slot="sidebar-native-scroll-area" className={sidebarContent()}>
        {nativeViewport}
      </div>
    );
  }

  return (
    <ScrollArea data-slot="sidebar-scroll-area" className={sidebarContent()}>
      <ScrollAreaViewport
        {...props}
        render={render}
        data-slot="sidebar-content"
        className={sidebarViewport()}
      >
        <ScrollAreaContent
          className={sidebarContentInner({ className })}
          style={{ minWidth: 0, width: "100%" }}
        >
          {children}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar className={sidebarScrollbar()}>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}

export type SidebarLiveActivityProps = useRender.ComponentProps<"div">;

export function SidebarLiveActivity({
  children,
  className,
  render,
  ...props
}: SidebarLiveActivityProps) {
  const theme = useThemeFamily();
  const { sidebarLiveActivity } = sidebarRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-live-activity",
    className: sidebarLiveActivity({ className }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
