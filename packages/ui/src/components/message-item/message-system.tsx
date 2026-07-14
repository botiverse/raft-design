import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageSystem } from "./message-system.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type SystemMessageItemProps = useRender.ComponentProps<"div">;

export function SystemMessageItem({ className, render, ...props }: SystemMessageItemProps) {
  const { systemRoot } = messageSystem();
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

export type SystemMessageItemTimeProps = useRender.ComponentProps<"span">;

export function SystemMessageItemTime({ className, render, ...props }: SystemMessageItemTimeProps) {
  const { systemTime } = messageSystem();
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

export type SystemMessageItemContentProps = useRender.ComponentProps<"span">;

export function SystemMessageItemContent({
  className,
  render,
  ...props
}: SystemMessageItemContentProps) {
  const { systemContent } = messageSystem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: systemContent({ className }),
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

export type SystemMessageGroupDisclosureProps = useRender.ComponentProps<"button">;

export function SystemMessageGroupDisclosure({
  className,
  render,
  ...props
}: SystemMessageGroupDisclosureProps) {
  const { systemDisclosure } = messageSystem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: systemDisclosure({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "system-message-group-disclosure" },
  });
}
