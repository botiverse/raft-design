import {
  Children,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent, ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageImageGallery, MessageImageGalleryItem } from "../message-attachment";
import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedFooter,
  MessageEmbedHeader,
} from "../message-embed";
import {
  messageForwardedBundle,
  messageForwardedBundleGallery,
  messageForwardedBundleItem,
} from "./message-forwarded-bundle.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;
type ArticleProps = useRender.ComponentProps<"article">;

export type MessageForwardedBundleProps = DivProps & { fullWidth?: boolean };

type MessageForwardedBundleFold = {
  collapsed: boolean;
  foldable: boolean;
  /** True while the fold is component-owned (Items rendered without `collapsed`). */
  auto: boolean;
  toggle: () => void;
  reportFold: (foldable: boolean) => void;
};

const MessageForwardedBundleFoldContext = createContext<MessageForwardedBundleFold | null>(null);

/**
 * The card folds when the items' text renders beyond this many lines in
 * total. This is the component's own rule — consumers render the parts and get
 * the fold for free — and it is measured from the rendered content, so
 * wrapping, zoom and language do not need to be modelled anywhere.
 */
const FOLD_LINE_LIMIT = 8;
/** Fallback line height when the computed style reports `normal`. */
const FOLD_LINE_HEIGHT_FALLBACK = 20;

function measureLineHeight(slot: HTMLElement | undefined) {
  if (!slot) return FOLD_LINE_HEIGHT_FALLBACK;
  return Number.parseFloat(getComputedStyle(slot).lineHeight) || FOLD_LINE_HEIGHT_FALLBACK;
}

function exceedsFoldLineLimit(slots: HTMLElement[], lineHeight: number, lineLimit: number) {
  if (slots.length === 0) return false;
  // Fractional heights on purpose: scrollHeight rounds every slot up, and the
  // rounding would accumulate across items (zoom can make line heights
  // fractional too, so a total of exactly the limit must stay under).
  const renderedHeight = slots.reduce(
    (height, slot) => height + slot.getBoundingClientRect().height,
    0,
  );
  // 1px of slack absorbs subpixel noise at the boundary.
  return renderedHeight > lineHeight * lineLimit + 1;
}

export function MessageForwardedBundle({
  className,
  fullWidth = false,
  render,
  ...props
}: MessageForwardedBundleProps) {
  const theme = useThemeFamily();
  const { root } = messageForwardedBundle({ theme, fullWidth });
  const [collapsed, setCollapsed] = useState(false);
  const [foldable, setFoldable] = useState(false);
  const [auto, setAuto] = useState(false);
  // Once the reader expands or collapses by hand the measurement stops moving
  // the state; it keeps reporting so the footer follows `foldable`.
  const touchedRef = useRef(false);

  const toggle = useCallback(() => {
    touchedRef.current = true;
    setCollapsed((current) => !current);
  }, []);

  const reportFold = useCallback((nextFoldable: boolean) => {
    setFoldable(nextFoldable);
    setAuto(true);
    if (!nextFoldable) {
      // Nothing left to fold → open unconditionally, even after a manual
      // collapse: otherwise a reflow that drops the content under the limit
      // leaves the list clipped at the fold height with no way back open.
      setCollapsed(false);
    } else if (!touchedRef.current) {
      setCollapsed(true);
    }
  }, []);

  const fold = useMemo(
    () => ({ collapsed, foldable, auto, toggle, reportFold }),
    [collapsed, foldable, auto, toggle, reportFold],
  );

  return (
    <MessageForwardedBundleFoldContext.Provider value={fold}>
      <MessageEmbed className={root({ className })} render={render} {...props} />
    </MessageForwardedBundleFoldContext.Provider>
  );
}

export type MessageForwardedBundleHeaderProps = DivProps;

export function MessageForwardedBundleHeader({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderProps) {
  const theme = useThemeFamily();
  const { header } = messageForwardedBundle({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export type MessageForwardedBundleHeaderContentProps = DivProps;

export function MessageForwardedBundleHeaderContent({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: headerContent({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-content" },
  });
}

export type MessageForwardedBundleHeaderLabelProps = SpanProps;

export function MessageForwardedBundleHeaderLabel({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderLabelProps) {
  const theme = useThemeFamily();
  const { headerLabel } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerLabel({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-label" },
  });
}

export type MessageForwardedBundleHeaderCountProps = SpanProps;

export function MessageForwardedBundleHeaderCount({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderCountProps) {
  const theme = useThemeFamily();
  const { headerCount } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerCount({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-count" },
  });
}

export type MessageForwardedBundleItemsProps = DivProps & {
  collapsed?: boolean;
  /**
   * How many rendered text lines the default fold allows before folding.
   * Only used in the component-owned mode (`collapsed` omitted).
   */
  foldLineLimit?: number;
};

/**
 * The items surface. Without a `collapsed` prop the fold is component-owned:
 * the surface measures its item-content slots and collapses itself to
 * `foldLineLimit` lines when the text renders beyond that many lines in total
 * (eight by default). Passing `collapsed` switches to the controlled mode
 * (the detail view pins everything open) and skips the measurement.
 */
export function MessageForwardedBundleItems({
  className,
  collapsed,
  foldLineLimit = FOLD_LINE_LIMIT,
  render,
  style,
  ...props
}: MessageForwardedBundleItemsProps) {
  const theme = useThemeFamily();
  const fold = useContext(MessageForwardedBundleFoldContext);
  const controlled = collapsed !== undefined;
  const isCollapsed = controlled ? collapsed : (fold?.collapsed ?? false);
  const { items } = messageForwardedBundle({ theme, collapsed: isCollapsed });
  const containerRef = useRef<HTMLDivElement | null>(null);
  // The folded height folds with the rule: foldLineLimit x line height. Null
  // until the component can measure; the recipe's fallback height applies then.
  const [foldHeight, setFoldHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (controlled || !fold) return;
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const slots = [
        ...container.querySelectorAll('[data-slot="message-forwarded-bundle-item-content"]'),
      ] as HTMLElement[];
      const lineHeight = measureLineHeight(slots[0]);
      fold.reportFold(exceedsFoldLineLimit(slots, lineHeight, foldLineLimit));
      setFoldHeight(slots.length > 0 ? lineHeight * foldLineLimit : null);
    };
    measure();
    // Content arrives after mount (streamed items, markdown, attachment rows)
    // and rewraps on resize; both change the rendered line count.
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(container);
    const mutationObserver =
      typeof MutationObserver === "undefined" ? null : new MutationObserver(measure);
    mutationObserver?.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [controlled, fold, foldLineLimit]);

  // Merge rather than override: a consumer style must not wipe the computed
  // fold height (that would bring back "collapsed with nothing hidden").
  const clampStyle = useMemo(
    () => (isCollapsed && foldHeight !== null ? { maxHeight: `${foldHeight}px` } : undefined),
    [isCollapsed, foldHeight],
  );
  const mergedStyle = useMemo(
    () => (clampStyle || style ? { ...clampStyle, ...style } : undefined),
    [clampStyle, style],
  );
  // A very short fold would otherwise sit entirely under the 40px bottom
  // fade; compress the fade to one line so something stays readable.
  const tightFold = foldHeight !== null && foldHeight < 60;

  return (
    <MessageEmbedContent
      ref={containerRef}
      className={items({ className })}
      data-collapsed={isCollapsed || undefined}
      data-tight-fold={tightFold || undefined}
      style={mergedStyle}
      render={render}
      {...props}
    />
  );
}

export type MessageForwardedBundleItemProps = ArticleProps;

export function MessageForwardedBundleItem({
  className,
  render,
  ...props
}: MessageForwardedBundleItemProps) {
  const theme = useThemeFamily();
  const { root } = messageForwardedBundleItem({ theme });
  return useRender({
    defaultTagName: "article",
    render,
    props: mergeProps<"article">({ className: root({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item" },
  });
}

export type MessageForwardedBundleItemMetaProps = DivProps;

export function MessageForwardedBundleItemMeta({
  className,
  render,
  ...props
}: MessageForwardedBundleItemMetaProps) {
  const theme = useThemeFamily();
  const { meta } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: meta({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item-meta" },
  });
}

export type MessageForwardedBundleItemAuthorProps = SpanProps;

export function MessageForwardedBundleItemAuthor({
  className,
  render,
  ...props
}: MessageForwardedBundleItemAuthorProps) {
  const theme = useThemeFamily();
  const { author } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: author({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item-author" },
  });
}

export type MessageForwardedBundleItemContentProps = DivProps;

/**
 * The item's text body. The component-owned fold measures these slots: when
 * their combined content renders beyond the fold line limit the card folds.
 */
export function MessageForwardedBundleItemContent({
  className,
  render,
  ...props
}: MessageForwardedBundleItemContentProps) {
  const { itemContent } = messageForwardedBundleItem();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: itemContent({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item-content" },
  });
}

export type MessageForwardedBundleAttachmentsProps = DivProps;

export function MessageForwardedBundleAttachments({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentsProps) {
  const theme = useThemeFamily();
  const { attachments } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: attachments({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachments" },
  });
}

export type MessageForwardedBundleAttachmentProps = SpanProps & {
  /**
   * Marks the attachment as actionable (the consumer wires the open action on
   * `render`). Adds the pointer/hover/focus affordance to the chip.
   */
  interactive?: boolean;
};

export function MessageForwardedBundleAttachment({
  className,
  interactive = false,
  render,
  ...props
}: MessageForwardedBundleAttachmentProps) {
  const theme = useThemeFamily();
  const { attachment } = messageForwardedBundleItem({
    theme,
    action: interactive ? "interactive" : "static",
  });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachment({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment" },
  });
}

export type MessageForwardedBundleAttachmentNameProps = SpanProps;

export function MessageForwardedBundleAttachmentName({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentNameProps) {
  const theme = useThemeFamily();
  const { attachmentName } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachmentName({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment-name" },
  });
}

export type MessageForwardedBundleAttachmentMetaProps = SpanProps;

export function MessageForwardedBundleAttachmentMeta({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentMetaProps) {
  const theme = useThemeFamily();
  const { attachmentMeta } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachmentMeta({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment-meta" },
  });
}

export type MessageForwardedBundleFooterProps = DivProps;

export function MessageForwardedBundleFooter({
  className,
  render,
  ...props
}: MessageForwardedBundleFooterProps) {
  const fold = useContext(MessageForwardedBundleFoldContext);
  // With the component-owned fold the footer only exists when the content
  // actually folds; controlled consumers keep rendering it themselves.
  if (fold?.auto && !fold.foldable) return null;
  return <MessageEmbedFooter className={className} render={render} {...props} />;
}

export type MessageForwardedBundleSourceProps = ButtonProps;

export function MessageForwardedBundleSource({
  className,
  render,
  ...props
}: MessageForwardedBundleSourceProps) {
  const theme = useThemeFamily();
  const { source } = messageForwardedBundle({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button", className: source({ className }) }, props),
    state: { slot: "message-forwarded-bundle-source" },
  });
}

export type MessageForwardedBundleSourceLabelProps = SpanProps;

export function MessageForwardedBundleSourceLabel({
  className,
  render,
  ...props
}: MessageForwardedBundleSourceLabelProps) {
  const theme = useThemeFamily();
  const { sourceLabel } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: sourceLabel({ className }) }, props),
    state: { slot: "message-forwarded-bundle-source-label" },
  });
}

export type MessageForwardedBundleFooterActionProps = ButtonProps & {
  /**
   * What the action shows while the component-owned fold is expanded
   * (`children` render while it is folded). Ignored in the controlled mode,
   * where the consumer drives and labels the fold itself.
   */
  expandedContent?: ReactNode;
};

export function MessageForwardedBundleFooterAction({
  className,
  render,
  onClick,
  children,
  expandedContent,
  ...props
}: MessageForwardedBundleFooterActionProps) {
  const theme = useThemeFamily();
  const fold = useContext(MessageForwardedBundleFoldContext);
  const { footerAction } = messageForwardedBundle({ theme });
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      // A consumer that takes over the click (opening the detail view, say)
      // calls preventDefault; otherwise the action toggles the fold.
      if (!event.defaultPrevented) fold?.toggle();
    },
    [fold, onClick],
  );
  const expanded = fold ? fold.auto && !fold.collapsed : false;
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        className: footerAction({ className }),
        onClick: handleClick,
        // The action is a disclosure for the component-owned fold; the a11y
        // state only exists while that fold is active.
        "aria-expanded": fold?.auto ? expanded : undefined,
        children: expanded && expandedContent !== undefined ? expandedContent : children,
      },
      props,
    ),
    state: { slot: "message-forwarded-bundle-footer-action" },
  });
}

export type MessageForwardedBundleGalleryProps = DivProps;

/**
 * Image rows for forwarded attachments. The gallery owns the layout — rows of
 * three (a lone row of exactly four splits two-and-two) at the message gallery
 * row heights — and composes the shared MessageImageGallery surfaces, so
 * forwarded images are the same component family as images in a message.
 * Consumers only place the media (`MessageForwardedBundleGalleryTile`).
 */
export function MessageForwardedBundleGallery({
  className,
  children,
  ...props
}: MessageForwardedBundleGalleryProps) {
  const { root, row } = messageForwardedBundleGallery();
  const items = Children.toArray(children);
  // Mirror the message gallery rowing rule: chunks of three; a lone buffer of
  // exactly four splits into two-and-two.
  const chunkSize = items.length === 4 ? 2 : 3;
  const rows: ReactNode[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    rows.push(items.slice(index, index + chunkSize));
  }

  return (
    <MessageImageGallery className={root({ className })} {...props}>
      {rows.map((rowItems, index) => (
        <div
          key={index}
          className={row({ count: rowItems.length as 1 | 2 | 3 })}
          data-slot="message-forwarded-bundle-gallery-row"
        >
          {rowItems}
        </div>
      ))}
    </MessageImageGallery>
  );
}

export type MessageForwardedBundleGalleryTileProps = DivProps;

/**
 * A media cell in the forwarded gallery rows: the shared message gallery item
 * (its themed surface and rounding come from MessageImageGalleryItem).
 */
export function MessageForwardedBundleGalleryTile({
  className,
  render,
  ...props
}: MessageForwardedBundleGalleryTileProps) {
  const { tile } = messageForwardedBundleGallery();

  return <MessageImageGalleryItem className={tile({ className })} render={render} {...props} />;
}
