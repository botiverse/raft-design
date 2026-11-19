import { useCallback, useRef } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";
import { BASE_COLLISION_PADDING, usePopupCollision } from "../../lib/frame-insets";
import { ownerWindow } from "../../lib/owner-window";
import { PopoverPortal } from "../popover/popover";
import type { PopoverPortalProps } from "../popover/popover";
import { ScrollArea } from "../scroll-area/scroll-area";
import type { ScrollAreaProps } from "../scroll-area/types";

const composerSuggestionList = tv({
  slots: {
    positioner: [
      "isolate z-popup w-(--anchor-width) outline-none",
      "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
    ],
    popup: ["outline-none"],
    root: [
      "w-full",
      "max-h-[min(15rem,var(--available-height))] overflow-x-hidden rounded-container p-1",
      "bg-layer-popover text-foreground ring-1 ring-line-seam shadow-float",
    ],
    group: ["flex flex-col"],
    groupLabel: [
      "py-1.5",
      "px-2.5 pt-2 pb-1 font-sans text-caption font-bold text-foreground-hint",
    ],
    item: [
      "flex w-full items-center text-left",
      "min-h-option cursor-pointer gap-2.5 rounded-chip px-2.5 py-1",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-[highlighted=true]:bg-brand-soft",
      "data-[disabled=true]:cursor-default data-[disabled=true]:text-foreground-disabled",
      "data-[disabled=true]:hover:bg-transparent",
    ],
    // Every row is one line with the same height. Space goes to the name first:
    // text metadata (descriptions) starts from zero width and only takes what the
    // name leaves, so it truncates (or disappears) before the name does. The name
    // truncates only when it alone cannot fit (pass `title` for the full name).
    content: ["flex min-w-0 flex-1 items-center gap-1.5 text-left"],
    icon: ["shrink-0"],
    title: ["min-w-0 truncate"],
    // Priority: name, then handle, then description. The handle shows in full up
    // to a third of the row and truncates beyond that; the name gets the rest.
    aside: ["ml-auto flex max-w-[33%] min-w-0 shrink-0 items-center justify-end"],
    meta: ["text-caption text-foreground-hint"],
  },
  variants: {
    separated: {
      true: { group: ["-mx-1 mt-1 border-t border-line-hairline px-1 pt-1"] },
      false: {},
    },
    iconVariant: {
      avatar: {},
      framed: {
        icon: [
          "flex size-[19px] items-center justify-center rounded-sticker",
          "bg-fill-muted text-foreground-muted [&_svg]:size-[11px]",
        ],
      },
      auxiliary: { icon: ["-ml-1 size-3", "text-foreground-hint"] },
      // A small glyph inside the row content (e.g. human vs agent), sized to the
      // text and never shrunk away. Pass an accessible label on the svg.
      inline: {
        icon: [
          "flex size-3.5 items-center justify-center [&_svg]:size-3.5",
          "text-foreground-hint",
        ],
      },
    },
    metaVariant: {
      text: { meta: "min-w-0 flex-1 basis-0 truncate" },
      code: { meta: ["min-w-0 truncate font-mono", "text-mono-meta text-foreground-hint"] },
    },
  },
  defaultVariants: {
    separated: false,
    iconVariant: "avatar",
    metaVariant: "text",
  },
});

type ComposerSuggestionAnchor = BasePopover.Positioner.Props["anchor"];

export type ComposerSuggestionListProps = ScrollAreaProps & {
  /**
   * What the list is placed against: as wide as it, 8px above it, or below it
   * when there isn't room above.
   * @default The nearest positioned ancestor of where the list is rendered (`ComposerRoot`, or the box around the composer).
   */
  anchor?: ComposerSuggestionAnchor;
  /**
   * Where the list is rendered: the body, or the overlay it is opened in, as other popups.
   */
  container?: PopoverPortalProps["container"];
};

// The element an absolutely positioned list would have been placed against.
function positionedAncestor(marker: Element | null): Element | null {
  for (let node = marker?.parentElement ?? null; node; node = node.parentElement) {
    if (ownerWindow(node).getComputedStyle(node).position !== "static") return node;
  }
  return marker?.parentElement ?? null;
}

const keepOpen = () => {};

/**
 * The suggestions' popup. It renders in a portal, like other popups, so a
 * scrolling region around the composer doesn't cut it off; it is as wide as
 * its anchor and 8px above it, and goes below it when there isn't room above.
 * Mount it while it is open: it has no open state of its own, and focus stays
 * in the composer. It hides while the composer is scrolled out of its region.
 * Where it is rendered it leaves a `hidden` span, which counts for its
 * siblings' `:last-child` and `space-y-*`. The list is a ScrollArea: `ref`, `className`, `render` and
 * the native props (the listbox's role and id) are the scrolling element's.
 */
export function ComposerSuggestionList({
  anchor,
  container,
  className,
  ...props
}: ComposerSuggestionListProps) {
  const { positioner, popup, root } = composerSuggestionList();
  const marker = useRef<HTMLSpanElement>(null);
  // Found once, when the list is first placed: it is placed on every scroll frame.
  const found = useRef<Element | null>(null);
  const nearestPositioned = useCallback(() => {
    if (!found.current?.isConnected) found.current = positionedAncestor(marker.current);
    return found.current;
  }, []);
  return (
    <>
      <span ref={marker} hidden data-slot="composer-suggestion-anchor" />
      <BasePopover.Root open modal={false} onOpenChange={keepOpen}>
        <PopoverPortal container={container}>
          <ComposerSuggestionPositioner
            anchor={anchor ?? nearestPositioned}
            container={container}
            className={positioner()}
          >
            <BasePopover.Popup
              role="presentation"
              initialFocus={false}
              finalFocus={false}
              className={popup()}
            >
              <ScrollArea
                data-slot="composer-suggestion-list"
                overscroll="contain"
                // No Tab stop of its own: focus stays in the composer, which
                // moves the highlight and keeps it in view.
                tabIndex={-1}
                {...props}
                className={root({ className })}
              />
            </BasePopover.Popup>
          </ComposerSuggestionPositioner>
        </PopoverPortal>
      </BasePopover.Root>
    </>
  );
}

// Inside the portal, so it reads the frame insets each time the list opens,
// as every raft-ui popup does.
function ComposerSuggestionPositioner({
  container,
  ...props
}: BasePopover.Positioner.Props & { container?: PopoverPortalProps["container"] }) {
  const collision = usePopupCollision(
    undefined,
    undefined,
    BASE_COLLISION_PADDING,
    container,
    undefined,
    props.anchor,
  );
  return (
    <BasePopover.Positioner
      {...collision}
      positionMethod="fixed"
      side="top"
      align="start"
      sideOffset={8}
      {...props}
    />
  );
}

type ComposerSuggestionListVariantProps = VariantProps<typeof composerSuggestionList>;

export type ComposerSuggestionGroupProps = useRender.ComponentProps<"div"> &
  Pick<ComposerSuggestionListVariantProps, "separated">;

export function ComposerSuggestionGroup({
  separated,
  className,
  render,
  ...props
}: ComposerSuggestionGroupProps) {
  const { group } = composerSuggestionList({ separated });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-group",
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionGroupLabelProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionGroupLabel({
  className,
  render,
  ...props
}: ComposerSuggestionGroupLabelProps) {
  const { groupLabel } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-group-label",
    className: groupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionOptionProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionOption({
  className,
  render,
  ...props
}: ComposerSuggestionOptionProps) {
  const { item } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-option",
    className: item({ className }),
    role: "option",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionContentProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionContent({
  className,
  render,
  ...props
}: ComposerSuggestionContentProps) {
  const { content } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionIconProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["iconVariant"];
};

export function ComposerSuggestionIcon({
  variant = "avatar",
  className,
  render,
  ...props
}: ComposerSuggestionIconProps) {
  const { icon } = composerSuggestionList({ iconVariant: variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-icon",
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionTitleProps = useRender.ComponentProps<"span">;

export function ComposerSuggestionTitle({
  className,
  render,
  ...props
}: ComposerSuggestionTitleProps) {
  const { title } = composerSuggestionList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionAsideProps = useRender.ComponentProps<"span">;

export function ComposerSuggestionAside({
  className,
  render,
  ...props
}: ComposerSuggestionAsideProps) {
  const { aside } = composerSuggestionList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-aside",
    className: aside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionMetaProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["metaVariant"];
};

export function ComposerSuggestionMeta({
  variant = "text",
  className,
  render,
  ...props
}: ComposerSuggestionMetaProps) {
  const { meta } = composerSuggestionList({ metaVariant: variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
