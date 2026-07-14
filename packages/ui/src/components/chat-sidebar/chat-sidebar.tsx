import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { chatSidebar } from "./chat-sidebar.recipe";

export type ChatSidebarRootProps = useRender.ComponentProps<"div">;

export function ChatSidebarRoot({ className, render, ...props }: ChatSidebarRootProps) {
  const theme = useThemeFamily();
  const { sidebarRoot } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-root",
    className: sidebarRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarHeaderProps = useRender.ComponentProps<"div">;

export function ChatSidebarHeader({
  children,
  className,
  render,
  ...props
}: ChatSidebarHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarHeader, sidebarHeaderMask, sidebarHeaderMaskLayer } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-header",
    className: sidebarHeader({ className }),
    children: (
      <>
        <div aria-hidden data-slot="chat-sidebar-header-mask" className={sidebarHeaderMask()}>
          <div
            data-slot="chat-sidebar-header-mask-layer"
            data-layer="solid"
            className={sidebarHeaderMaskLayer()}
          />
          <div
            data-slot="chat-sidebar-header-mask-layer"
            data-layer="soft"
            className={sidebarHeaderMaskLayer()}
          />
          <div
            data-slot="chat-sidebar-header-mask-layer"
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

export type ChatSidebarHeaderTitleProps = useRender.ComponentProps<"div">;

export function ChatSidebarHeaderTitle({
  className,
  render,
  ...props
}: ChatSidebarHeaderTitleProps) {
  const theme = useThemeFamily();
  const { sidebarHeaderTitle } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-header-title",
    className: sidebarHeaderTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarGroupLabelProps = useRender.ComponentProps<"div">;

export function ChatSidebarGroupLabel({ className, render, ...props }: ChatSidebarGroupLabelProps) {
  const theme = useThemeFamily();
  const { sidebarGroupLabel } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-group-label",
    className: sidebarGroupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarBodyProps = useRender.ComponentProps<"div">;

export function ChatSidebarBody({ className, render, ...props }: ChatSidebarBodyProps) {
  const theme = useThemeFamily();
  const { sidebarBody } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-body",
    className: sidebarBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarContentProps = useRender.ComponentProps<"div">;

export function ChatSidebarContent({ className, render, ...props }: ChatSidebarContentProps) {
  const theme = useThemeFamily();
  const { sidebarContent } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-content",
    className: sidebarContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarFooterProps = useRender.ComponentProps<"div">;

export function ChatSidebarFooter({ className, render, ...props }: ChatSidebarFooterProps) {
  const theme = useThemeFamily();
  const { sidebarFooter } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-footer",
    className: sidebarFooter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
