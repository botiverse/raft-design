import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronDown, Info, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";
import type { BadgeProps } from "../badge";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageActionCard } from "./message-action-card.recipe";
import { messageActionCardContent } from "./message-action-card-content.recipe";
/**
 * The card is a disclosure: open by default, and a consumer can fold a
 * resolved or view-only card to its header with `defaultOpen={false}` (or
 * control it with `open` / `onOpenChange`). The fold is offered by placing a
 * MessageActionCardCollapseTrigger in the header; without one the card simply
 * stays open.
 */
export function MessageActionCard({
  className,
  render,
  open,
  defaultOpen = true,
  onOpenChange,
  ...props
}: MessageActionCardProps) {
  const theme = useThemeFamily();
  const { root } = messageActionCard({ theme });

  return (
    <Collapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      render={<MessageEmbed className={root({ className })} render={render} {...props} />}
    />
  );
}

export function MessageActionCardContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { root, panel } = messageActionCardContent({ theme });

  // Panel height animates between 0 and its measured height when the card
  // folds; the content box lives inside so its padding and frame go with it.
  return (
    <Collapsible.Panel className={panel()}>
      <MessageEmbedContent className={root({ className })} render={render} {...props} />
    </Collapsible.Panel>
  );
}

/** The card type's icon. Without children it shows a generic action icon. */
export function MessageActionCardHeaderIcon({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { headerIcon } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      { className: headerIcon({ className }), "aria-hidden": true, children: children ?? <Zap /> },
      props,
    ),
    state: { slot: "message-action-card-header-icon" },
  });
}

export function MessageActionCardHeaderTitle({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { headerTitle } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerTitle({ className }) }, props),
    state: { slot: "message-action-card-header-title" },
  });
}

/**
 * A line under the title: what happened on a resolved card ("Installed by Ada
 * → Lens"), or why you cannot act on a view-only one. Place it inside
 * MessageActionCardHeaderTitle; it stays visible while the card is folded.
 */
export function MessageActionCardHeaderDescription({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { headerDescription } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerDescription({ className }) }, props),
    state: { slot: "message-action-card-header-description" },
  });
}

/**
 * The card's state label in the header. Brutal shows it as a solid,
 * saturated badge; Elegant as the soft tinted badge, so a column of "Done"
 * cards does not shout.
 */
export function MessageActionCardStatus({
  className,
  appearance,
  uppercase,
  ...props
}: BadgeProps) {
  const theme = useThemeFamily();
  const { headerStatus } = messageActionCard({ theme });

  return (
    <Badge
      appearance={appearance ?? (theme === "brutal" ? "solid" : "soft")}
      uppercase={uppercase ?? theme === "brutal"}
      className={headerStatus({ className })}
      {...props}
    />
  );
}

/** Folds the card to its header and back. Needs an accessible `aria-label`. */
export function MessageActionCardCollapseTrigger({
  className,
  ...props
}: MessageActionCardCollapseTriggerProps) {
  const theme = useThemeFamily();
  const { collapseTrigger } = messageActionCard({ theme });

  return (
    <Collapsible.Trigger className={collapseTrigger({ className })} {...props}>
      <ChevronDown aria-hidden />
    </Collapsible.Trigger>
  );
}

export function MessageActionCardHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { header } = messageActionCard({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export function MessageActionCardHeaderStatus({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { headerStatus } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerStatus({ className }) }, props),
    state: { slot: "message-action-card-header-status" },
  });
}

export function MessageActionCardProperties({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dl">) {
  const theme = useThemeFamily();
  const { properties } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dl",
    render,
    props: mergeProps<"dl">({ className: properties({ className }) }, props),
    state: { slot: "message-action-card-properties" },
  });
}

export function MessageActionCardProperty({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { property } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: property({ className }) }, props),
    state: { slot: "message-action-card-property" },
  });
}

export function MessageActionCardPropertyLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dt">) {
  const theme = useThemeFamily();
  const { propertyLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dt",
    render,
    props: mergeProps<"dt">({ className: propertyLabel({ className }) }, props),
    state: { slot: "message-action-card-property-label" },
  });
}

export function MessageActionCardPropertyValue({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dd">) {
  const theme = useThemeFamily();
  const { propertyValue } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dd",
    render,
    props: mergeProps<"dd">({ className: propertyValue({ className }) }, props),
    state: { slot: "message-action-card-property-value" },
  });
}

export function MessageActionCardScopeList({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeList } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeList({ className }) }, props),
    state: { slot: "message-action-card-scope-list" },
  });
}

export function MessageActionCardScopeListLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeListLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeListLabel({ className }) }, props),
    state: { slot: "message-action-card-scope-list-label" },
  });
}

/**
 * Scrolls a long permission list. It is a Tab stop only while it overflows, so
 * keyboard users can scroll it; a short list adds no empty stop.
 */
export function MessageActionCardScopeListViewport({
  className,
  render,
  ...props
}: MessageActionCardScopeListViewportProps) {
  const theme = useThemeFamily();
  const { scopeListViewport } = messageActionCardContent({ theme });
  const [element, setElement] = useState<Element | null>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (element === null) return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [element]);

  return useRender({
    defaultTagName: "div",
    render,
    ref: setElement,
    props: mergeProps<"div">(
      { className: scopeListViewport({ className }), tabIndex: overflows ? 0 : undefined },
      props,
    ),
    state: { slot: "message-action-card-scope-list-viewport" },
  });
}

export function MessageActionCardScope({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scope } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scope({ className }) }, props),
    state: { slot: "message-action-card-scope" },
  });
}

export function MessageActionCardScopeName({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeName } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeName({ className }) }, props),
    state: { slot: "message-action-card-scope-name" },
  });
}

export function MessageActionCardScopeDescription({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeDescription } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeDescription({ className }) }, props),
    state: { slot: "message-action-card-scope-description" },
  });
}

export function MessageActionCardHintLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { hintLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: hintLabel({ className }) }, props),
    state: { slot: "message-action-card-hint-label" },
  });
}

export function MessageActionCardHint({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { hint } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: hint({ className }) }, props),
    state: { slot: "message-action-card-hint" },
  });
}

/** Raft's standing note. Leads with an info icon unless `icon` replaces it. */
export function MessageActionCardNotice({
  className,
  render,
  icon,
  children,
  ...props
}: MessageActionCardNoticeProps) {
  const theme = useThemeFamily();
  const { notice } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: notice({ className }),
        children: (
          <>
            {icon ?? <Info aria-hidden />}
            <span>{children}</span>
          </>
        ),
      },
      props,
    ),
    state: { slot: "message-action-card-notice" },
  });
}

export function MessageActionCardCompletion({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { completion } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: completion({ className }) }, props),
    state: { slot: "message-action-card-completion" },
  });
}

export function MessageActionCardActions({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { actions } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: actions({ className }) }, props),
    state: { slot: "message-action-card-actions" },
  });
}

export function MessageActionCardActionsNote({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { actionsNote } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: actionsNote({ className }) }, props),
    state: { slot: "message-action-card-actions-note" },
  });
}

export type MessageActionCardProps = useRender.ComponentProps<"div"> & {
  /** Controlled open state. Open shows the content; closed folds to the header. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to open. */
  defaultOpen?: boolean;
  onOpenChange?: ComponentProps<typeof Collapsible.Root>["onOpenChange"];
};
export type MessageActionCardHeaderIconProps = useRender.ComponentProps<"span">;
export type MessageActionCardHeaderTitleProps = useRender.ComponentProps<"span">;
export type MessageActionCardHeaderDescriptionProps = useRender.ComponentProps<"span">;
export type MessageActionCardStatusProps = BadgeProps;
export type MessageActionCardCollapseTriggerProps = Omit<
  ComponentProps<typeof Collapsible.Trigger>,
  "className"
> & {
  // A plain string: the recipe merges it, so a state function is not accepted.
  className?: string;
  "aria-label": string;
};
export type MessageActionCardScopeListViewportProps = useRender.ComponentProps<"div"> & {
  /** Names the scroll area for screen readers, e.g. "Permissions". */
  "aria-label": string;
};
export type MessageActionCardActionsNoteProps = useRender.ComponentProps<"div">;
export type MessageActionCardContentProps = useRender.ComponentProps<"div">;
export type MessageActionCardHeaderProps = useRender.ComponentProps<"div">;
export type MessageActionCardHeaderStatusProps = useRender.ComponentProps<"span">;
export type MessageActionCardPropertiesProps = useRender.ComponentProps<"dl">;
export type MessageActionCardPropertyProps = useRender.ComponentProps<"div">;
export type MessageActionCardPropertyLabelProps = useRender.ComponentProps<"dt">;
export type MessageActionCardPropertyValueProps = useRender.ComponentProps<"dd">;
export type MessageActionCardScopeListProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeListLabelProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeNameProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeDescriptionProps = useRender.ComponentProps<"div">;
export type MessageActionCardHintProps = useRender.ComponentProps<"div">;
export type MessageActionCardHintLabelProps = useRender.ComponentProps<"div">;
export interface MessageActionCardNoticeProps extends useRender.ComponentProps<"div"> {
  /** Replaces the default info icon. */
  icon?: ReactNode;
}
export type MessageActionCardCompletionProps = useRender.ComponentProps<"div">;
export type MessageActionCardActionsProps = useRender.ComponentProps<"div">;
