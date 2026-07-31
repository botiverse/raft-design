import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageSystem } from "./system-message.recipe";

export type SystemMessageProps = useRender.ComponentProps<"div">;

export function SystemMessage({ className, render, ...props }: SystemMessageProps) {
  const theme = useThemeFamily();
  const { systemRoot } = messageSystem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    className: systemRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "system-message-item",
    },
  });
}

export type SystemMessageTimeProps = useRender.ComponentProps<"span">;

export function SystemMessageTime({ className, render, ...props }: SystemMessageTimeProps) {
  const theme = useThemeFamily();
  const { systemTime } = messageSystem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: systemTime({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "system-message-item-time",
    },
  });
}

export type SystemMessageContentProps = useRender.ComponentProps<"span">;

export function SystemMessageContent({
  children,
  className,
  render,
  title,
  ...props
}: SystemMessageContentProps) {
  const theme = useThemeFamily();
  const { systemContent } = messageSystem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: systemContent({ className }),
    children,
    title: title ?? (typeof children === "string" ? children : undefined),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "system-message-item-content",
    },
  });
}

export type SystemMessageGroupProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export function SystemMessageGroup({ className, render, ...props }: SystemMessageGroupProps) {
  const theme = useThemeFamily();
  const { systemGroup } = messageSystem({ theme });
  const defaultProps: ComponentProps<typeof Collapsible.Root> & DataAttributes = {
    "data-slot": "system-message-group",
    className: systemGroup({ className }),
  };

  return <Collapsible.Root render={render} {...mergeProps(defaultProps, props)} />;
}

export type SystemMessageGroupHeaderProps = useRender.ComponentProps<"div">;

export function SystemMessageGroupHeader({
  className,
  render,
  ...props
}: SystemMessageGroupHeaderProps) {
  const theme = useThemeFamily();
  const { systemGroupHeader } = messageSystem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "system-message-group-header",
    className: systemGroupHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SystemMessageGroupDisclosureProps = useRender.ComponentProps<"button">;

export function SystemMessageGroupDisclosure({
  className,
  render,
  ...props
}: SystemMessageGroupDisclosureProps) {
  const theme = useThemeFamily();
  const { systemGroupDisclosure } = messageSystem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "system-message-group-disclosure",
    className: systemGroupDisclosure({ className }),
  };

  return useRender({
    render: render ?? <Collapsible.Trigger />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SystemMessageGroupSummaryProps = useRender.ComponentProps<"span">;

export function SystemMessageGroupSummary({
  className,
  render,
  ...props
}: SystemMessageGroupSummaryProps) {
  const theme = useThemeFamily();
  const { systemGroupSummary } = messageSystem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "system-message-group-summary",
    className: systemGroupSummary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SystemMessageGroupChevronProps = useRender.ComponentProps<"svg">;

export function SystemMessageGroupChevron({
  className,
  render,
  ...props
}: SystemMessageGroupChevronProps) {
  const defaultProps: useRender.ElementProps<"svg"> & DataAttributes = {
    "data-slot": "system-message-group-chevron",
    "aria-hidden": true,
    className: cn(className),
  };

  return useRender({
    render: render ?? <ChevronRight />,
    props: mergeProps<"svg">(defaultProps, props),
  });
}

export type SystemMessageGroupPanelProps = Omit<
  ComponentProps<typeof Collapsible.Panel>,
  "className"
> & {
  className?: string;
};

export function SystemMessageGroupPanel({
  className,
  render,
  ...props
}: SystemMessageGroupPanelProps) {
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "system-message-group-panel",
    className: cn(className),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}
