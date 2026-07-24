import { Button as BaseButton } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button";
import { Spinner } from "../spinner";
import { Status, type StatusProps } from "../status";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
import { chatSidebarSection } from "./chat-sidebar-section.recipe";

export type ChatSidebarSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export function ChatSidebarSection({
  className,
  defaultOpen = true,
  render,
  ...props
}: ChatSidebarSectionProps) {
  const theme = useThemeFamily();
  const { sidebarSection } = chatSidebarSection({ theme });
  const defaultProps: ComponentProps<typeof Collapsible.Root> & DataAttributes = {
    "data-slot": "chat-sidebar-section",
    defaultOpen,
    className: sidebarSection({ className }),
  };

  return <Collapsible.Root render={render ?? <section />} {...mergeProps(defaultProps, props)} />;
}

export type ChatSidebarListProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};

export function ChatSidebarList({ className, render, ...props }: ChatSidebarListProps) {
  const { sidebarList } = chatSidebarSection();
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "chat-sidebar-list",
    className: sidebarList({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type ChatSidebarSectionEmptyProps = Omit<
  ComponentProps<typeof Collapsible.Panel>,
  "className"
> & {
  className?: string;
};

export function ChatSidebarSectionEmpty({
  className,
  render,
  ...props
}: ChatSidebarSectionEmptyProps) {
  const theme = useThemeFamily();
  const { sidebarSectionEmpty } = chatSidebarSection({ theme });
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "chat-sidebar-section-empty",
    className: sidebarSectionEmpty({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type ChatSidebarSectionHeaderProps = useRender.ComponentProps<"div">;

export function ChatSidebarSectionHeader({
  className,
  render,
  ...props
}: ChatSidebarSectionHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarSectionHeader } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-section-header",
    className: sidebarSectionHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionDisclosureProps = useRender.ComponentProps<"button">;

export function ChatSidebarSectionDisclosure({
  className,
  render,
  ...props
}: ChatSidebarSectionDisclosureProps) {
  const theme = useThemeFamily();
  const { sidebarSectionDisclosure } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-section-disclosure",
    className: sidebarSectionDisclosure({ className }),
  };

  return useRender({
    render: render ?? <Collapsible.Trigger />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarSectionChevronProps = useRender.ComponentProps<"svg">;

export function ChatSidebarSectionChevron({
  className,
  render,
  ...props
}: ChatSidebarSectionChevronProps) {
  const defaultProps: useRender.ElementProps<"svg"> & DataAttributes = {
    "data-slot": "chat-sidebar-section-chevron",
    className: cn("size-3", className),
  };

  const chevron = useRender({
    render: render ?? <ChevronRight />,
    props: mergeProps<"svg">(defaultProps, props),
  });

  // Match ChatSidebarItemIcon slot width so section chevrons share the item icon axis.
  return (
    <span className="flex size-4.5 shrink-0 items-center justify-center" aria-hidden="true">
      {chevron}
    </span>
  );
}

export type ChatSidebarSectionTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarSectionTitle({
  className,
  render,
  ...props
}: ChatSidebarSectionTitleProps) {
  const { sidebarSectionTitle } = chatSidebarSection();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-section-title",
    className: sidebarSectionTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarSectionCountProps = useRender.ComponentProps<"span">;

export function ChatSidebarSectionCount({
  className,
  render,
  ...props
}: ChatSidebarSectionCountProps) {
  const theme = useThemeFamily();
  const { sidebarSectionCount } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-section-count",
    className: sidebarSectionCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarSectionAttentionProps = StatusProps;

export function ChatSidebarSectionAttention({
  className,
  size = "md",
  variant,
  ...props
}: ChatSidebarSectionAttentionProps) {
  const theme = useThemeFamily();
  const { sidebarSectionAttention } = chatSidebarSection();
  const resolvedVariant = variant ?? (theme === "elegant" ? "primary" : "accent");
  return (
    <span
      aria-hidden
      data-slot="chat-sidebar-section-attention"
      className={sidebarSectionAttention()}
    >
      <Status size={size} variant={resolvedVariant} className={className} {...props} />
    </span>
  );
}

export type ChatSidebarSectionTrailingProps = useRender.ComponentProps<"div">;
export type ChatSidebarSectionControlsProps = useRender.ComponentProps<"div">;

export function ChatSidebarSectionTrailing({
  className,
  render,
  ...props
}: ChatSidebarSectionTrailingProps) {
  const theme = useThemeFamily();
  const { sidebarSectionTrailing } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-section-trailing",
    className: sidebarSectionTrailing({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export function ChatSidebarSectionControls({
  className,
  render,
  ...props
}: ChatSidebarSectionControlsProps) {
  const theme = useThemeFamily();
  const { sidebarSectionControls } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-section-controls",
    className: sidebarSectionControls({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionControlProps = useRender.ComponentProps<"button"> &
  Pick<ButtonProps, "size" | "variant" | "loading" | "loadingLabel">;

export function ChatSidebarSectionControl({
  className,
  render,
  size = "icon-sm",
  variant = "ghost",
  loading = false,
  loadingLabel = "Loading",
  children,
  disabled,
  ...props
}: ChatSidebarSectionControlProps) {
  const theme = useThemeFamily();
  const { sidebarSectionControl } = chatSidebarSection({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-section-control",
    "data-loading": loading ? "true" : undefined,
    disabled: disabled || loading,
    "aria-disabled": loading || undefined,
    className: sidebarSectionControl({ className }),
    children: loading ? <Spinner aria-label={loadingLabel} /> : children,
  };
  const brutalControl = useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });

  if (theme === "elegant") {
    return (
      <Button
        data-slot="chat-sidebar-section-control"
        size={size}
        variant={variant}
        loading={loading}
        loadingLabel={loadingLabel}
        disabled={disabled}
        className={sidebarSectionControl({ className })}
        render={render}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return brutalControl;
}

export type ChatSidebarControlProps = ChatSidebarSectionControlProps;
export const ChatSidebarControl = ChatSidebarSectionControl;
