import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useSyncExternalStore } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { chatSidebar } from "./chat-sidebar.recipe";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobileViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
}

function useMobileViewport() {
  return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, () => false);
}

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

export function ChatSidebarContent({
  children,
  className,
  render,
  ...props
}: ChatSidebarContentProps) {
  const isMobile = useMobileViewport();
  const theme = useThemeFamily();
  const {
    sidebarContent,
    sidebarContentInner,
    sidebarScrollbar,
    sidebarScrollbarThumb,
    sidebarViewport,
  } = chatSidebar({ theme });

  const nativeViewportProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-content",
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
      <div data-slot="chat-sidebar-native-scroll-area" className={sidebarContent()}>
        {nativeViewport}
      </div>
    );
  }

  return (
    <ScrollArea.Root data-slot="chat-sidebar-scroll-area" className={sidebarContent()}>
      <ScrollArea.Viewport
        {...props}
        render={render}
        data-slot="chat-sidebar-content"
        className={sidebarViewport()}
      >
        <ScrollArea.Content
          className={sidebarContentInner({ className })}
          style={{ minWidth: 0, width: "100%" }}
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className={sidebarScrollbar()}>
        <ScrollArea.Thumb className={sidebarScrollbarThumb()} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export type ChatSidebarLiveActivityProps = useRender.ComponentProps<"div">;

export function ChatSidebarLiveActivity({
  children,
  className,
  render,
  ...props
}: ChatSidebarLiveActivityProps) {
  const theme = useThemeFamily();
  const { sidebarLiveActivity } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-live-activity",
    className: sidebarLiveActivity({ className }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
