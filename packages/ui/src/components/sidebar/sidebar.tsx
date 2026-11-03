import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import type { SlotElementProps } from "../../lib/data-attributes";
import { ScrollArea } from "../scroll-area";
import { sidebarRecipe } from "./sidebar.recipe";

export type SidebarRootProps = useRender.ComponentProps<"div">;

export function SidebarRoot({ className, render, ...props }: SidebarRootProps) {
  const { sidebarRoot } = sidebarRecipe();
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
  const { sidebarHeader, sidebarHeaderMask, sidebarHeaderMaskLayer } = sidebarRecipe();
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
  const { sidebarHeaderTitle } = sidebarRecipe();
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
  const { sidebarGroupLabel } = sidebarRecipe();
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
  const { sidebarBody } = sidebarRecipe();
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

export type SidebarContentProps = ComponentPropsWithRef<"div">;

const SIDEBAR_CONTENT_INNER_STYLE = { minWidth: 0, width: "100%" };

export function SidebarContent({ children, className, ...props }: SidebarContentProps) {
  const isMobile = useMobileViewport();
  const { sidebarContent, sidebarContentInner, sidebarViewport } = sidebarRecipe();

  if (isMobile) {
    return (
      <div data-slot="sidebar-native-scroll-area" className={sidebarContent()}>
        <div {...props} data-slot="sidebar-content" className={sidebarViewport()}>
          <div className={sidebarContentInner({ className })} style={SIDEBAR_CONTENT_INNER_STYLE}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // The ScrollArea is the scrolling element itself (`sidebar-content`), with
  // its overlay scrollbar showing only while the list scrolls; a scroll that
  // reaches the end stops there instead of carrying on to the page.
  return (
    <div data-slot="sidebar-scroll-area" className={sidebarContent()}>
      <ScrollArea
        {...props}
        data-slot="sidebar-content"
        trigger="scroll"
        overscroll="contain"
        className={sidebarViewport()}
        contentClassName={sidebarContentInner({ className })}
        contentStyle={SIDEBAR_CONTENT_INNER_STYLE}
      >
        {children}
      </ScrollArea>
    </div>
  );
}
