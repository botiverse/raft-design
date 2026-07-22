import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageSystem } from "./system-message.recipe";
import { dataPresence, isAriaTrue, type SlotElementProps } from "../../lib/data-attributes";

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

export function SystemMessageContent({ className, render, ...props }: SystemMessageContentProps) {
  const theme = useThemeFamily();
  const { systemContent } = messageSystem({ theme });
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
  "aria-expanded": ariaExpanded,
  ...props
}: SystemMessageGroupDisclosureProps) {
  const theme = useThemeFamily();
  const { systemDisclosure } = messageSystem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    className: systemDisclosure({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props, {
      "aria-expanded": ariaExpanded,
      ...(isAriaTrue(ariaExpanded) ? { "data-expanded": dataPresence(true) } : {}),
    }),
    state: { slot: "system-message-group-disclosure" },
  });
}
